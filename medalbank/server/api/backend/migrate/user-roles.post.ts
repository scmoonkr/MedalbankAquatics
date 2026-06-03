// POST /api/backend/migrate/user-roles
// users.role이 배열인 문서를 첫 번째 요소(string)로 변환
// e.g. role: ['admin'] → role: 'admin'
export default defineEventHandler(async () => {
  const db = await getDb()

  const result = await db.collection('users').updateMany(
    { role: { $type: 'array' } },
    [{ $set: { role: { $arrayElemAt: ['$role', 0] } } }],
  )

  return { ok: true, updated: result.modifiedCount }
})
