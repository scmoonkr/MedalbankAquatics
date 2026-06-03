// POST /api/backend/users — insert new user (manual)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, _id, ...rest } = body
  const db  = await getDb()
  const now = new Date()
  const doc = { ...rest, createdAt: now, updatedAt: now }
  const result = await db.collection('users').insertOne(doc)
  return { ok: true, id: String(result.insertedId) }
})
