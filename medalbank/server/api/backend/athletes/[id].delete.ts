// DELETE /api/backend/athletes/:id
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = await getDb()
  await db.collection('athletes').deleteOne({ _id: new ObjectId(id) })
  return { ok: true }
})
