// PUT /api/backend/times/:id — update one mergedTimes doc
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  // Strip id-like fields the client may have sent back.
  const { id: _id1, _id: _id2, ...doc } = body
  const db = await getDb()
  await db.collection('mergedTimes').updateOne(
    { _id: new ObjectId(id) },
    { $set: doc }
  )
  return { ok: true }
})
