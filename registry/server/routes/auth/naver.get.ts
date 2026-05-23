export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const state = Math.random().toString(36).slice(2, 18)

  // NUXT_SITE_URL 설정 시 우선 사용, 없으면 요청 origin 사용
  const origin = config.siteUrl || getRequestURL(event).origin

  await setUserSession(event, { oauth_state: state } as any)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.naverClientId,
    redirect_uri: `${origin}/auth/naver/callback`,
    state,
  })

  return sendRedirect(event, `https://nid.naver.com/oauth2.0/authorize?${params}`)
})
