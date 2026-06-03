// POST /api/user/contrib — 로그인된 사용자의 기여 데이터 저장
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { height, weight, footSize, bloodType, mbti } = body ?? {}

  const contrib: Record<string, unknown> = {}
  if (height   != null) contrib.height   = Number(height)
  if (weight   != null) contrib.weight   = Number(weight)
  if (footSize != null) contrib.footSize = Number(footSize)
  if (bloodType)        contrib.bloodType = String(bloodType)
  if (mbti)             contrib.mbti      = String(mbti)

  const userId = (session.user as any).id || (session.user as any).email
  const db = await getDb()
  await db.collection('userContrib').updateOne(
    { userId },
    { $set: { userId, contrib, updatedAt: new Date() } },
    { upsert: true }
  )
  return { ok: true }
})
