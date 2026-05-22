// DELETE /api/backend/errata/:id — delete one errata doc
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = await getDb()
  await db.collection('errata').deleteOne({ _id: new ObjectId(id) })
  return { ok: true }
})
