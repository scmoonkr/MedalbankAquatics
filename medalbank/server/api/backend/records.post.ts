// POST /api/backend/records — insert new record
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, _id, ...doc } = body
  const db = await getDb()
  const result = await db.collection('records').insertOne(doc)
  return { ok: true, id: String(result.insertedId) }
})
