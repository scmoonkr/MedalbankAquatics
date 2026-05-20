// PUT /api/backend/records/:id — update record
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { id: _id2, ...doc } = body
  const db = await getDb()
  await db.collection('records').updateOne(
    { _id: new ObjectId(id) },
    { $set: doc }
  )
  return { ok: true }
})
