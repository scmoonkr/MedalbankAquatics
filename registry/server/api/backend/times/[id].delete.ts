// DELETE /api/backend/times/:id — delete one mergedTimes doc
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = await getDb()
  await db.collection('mergedTimes').deleteOne({ _id: new ObjectId(id) })
  return { ok: true }
})
