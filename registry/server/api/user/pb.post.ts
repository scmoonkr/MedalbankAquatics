// POST /api/user/pb — 로그인된 사용자의 PB 저장
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { pbs } = body

  if (!pbs || typeof pbs !== 'object') {
    throw createError({ statusCode: 400, statusMessage: '잘못된 요청입니다.' })
  }

  const userId = (session.user as any).id || (session.user as any).email
  const db = await getDb()

  await db.collection('userPbs').updateOne(
    { userId },
    { $set: { pbs, userId, updatedAt: new Date() } },
    { upsert: true }
  )

  return { ok: true }
})
