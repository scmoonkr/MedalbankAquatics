// GET /api/user/contrib — 로그인된 사용자의 기여 데이터 반환
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = (session.user as any).id || (session.user as any).email
  const db = await getDb()
  const doc = await db.collection('userContrib').findOne({ userId })
  return doc?.contrib ?? {}
})
