// POST /api/backend/errata — insert a new errata doc (used by CSV import / single create)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, _id, ...doc } = body
  const db = await getDb()
  const result = await db.collection('errata').insertOne(doc)
  return { ok: true, id: String(result.insertedId) }
})
