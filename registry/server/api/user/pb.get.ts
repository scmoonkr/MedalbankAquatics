// GET /api/user/pb — 로그인된 사용자의 PB 목록 반환
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = (session.user as any).id || (session.user as any).email
  const db = await getDb()
  const doc = await db.collection('userPbs').findOne({ userId })
  return doc?.pbs ?? {}
})
