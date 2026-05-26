export default defineEventHandler(async (event) => {
  const { code, state, error } = getQuery(event)

  if (error) {
    return sendRedirect(event, `/login?error=${error}`)
  }

  const session = await getUserSession(event) as any
  if (!state || state !== session.oauth_state) {
    throw createError({ statusCode: 400, message: 'Invalid OAuth state' })
  }

  const config = useRuntimeConfig()
  const origin = config.siteUrl || getRequestURL(event).origin

  // code → token 교환
  const tokenRes = await $fetch<{
    access_token: string
    token_type: string
    error?: string
    error_description?: string
  }>('https://nid.naver.com/oauth2.0/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.naverClientId,
      client_secret: config.naverClientSecret,
      redirect_uri: `${origin}/auth/naver/callback`,
      code: String(code),
      state: String(state),
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).catch(() => null)

  if (!tokenRes?.access_token) {
    return sendRedirect(event, '/login?error=token_failed')
  }

  // 사용자 정보 조회
  const profileRes = await $fetch<{
    resultcode: string
    message: string
    response: {
      id: string
      name: string
      email: string
      nickname: string
      profile_image: string
      gender?: string
      age?: string
      birthday?: string
      birthyear?: string
      mobile?: string
    }
  }>('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${tokenRes.access_token}` },
  }).catch(() => null)

  if (profileRes?.resultcode !== '00') {
    return sendRedirect(event, '/login?error=profile_failed')
  }

  const { id, name, email, nickname, profile_image, gender, birthyear, birthday, mobile } = profileRes.response

  // 개발 중: 허용된 아이디만 로그인 가능 (ALLOWED_NAVER_IDS 미설정 시 제한 없음)
  const config2 = useRuntimeConfig()
  const allowedIds = (config2.allowedNaverIds as string || '').split(',').map(s => s.trim()).filter(Boolean)
  if (allowedIds.length > 0 && !allowedIds.includes(id)) {
    return sendRedirect(event, '/login?error=not_allowed')
  }

  const db = await getDb()
  const now = new Date()
  await db.collection('users').updateOne(
    { naverId: id },
    {
      $set: {
        name, email,
        ...(gender === 'M' ? { gender: 'men' } : gender === 'F' ? { gender: 'women' } : {}),
        ...(nickname   && { nickname }),
        ...(profile_image && { avatar: profile_image }),
        ...(birthyear && birthday && { dob: new Date(`${birthyear}-${birthday}`) }),
        ...(mobile    && { mobile }),
        updatedAt: now,
      },
      $setOnInsert: { naverId: id, createdAt: now },
    },
    { upsert: true },
  )

  await setUserSession(event, {
    user: { id, name, email, nickname, avatar: profile_image, gender, birthyear, birthday, provider: 'naver' },
  })

  await writeLog('login', { userId: id, name, email })

  return sendRedirect(event, '/user')
})
