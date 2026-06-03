// DELETE /api/backend/users/:id
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = await getDb()
  await db.collection('users').deleteOne({ _id: new ObjectId(id) })
  return { ok: true }
})
