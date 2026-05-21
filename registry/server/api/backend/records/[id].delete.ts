// DELETE /api/backend/records/:id — delete one record
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = await getDb()
  await db.collection('records').deleteOne({ _id: new ObjectId(id) })
  return { ok: true }
})
