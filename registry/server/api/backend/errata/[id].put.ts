// PUT /api/backend/errata/:id — update one errata doc
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { id: _id1, _id: _id2, ...doc } = body
  const db = await getDb()
  await db.collection('errata').updateOne(
    { _id: new ObjectId(id) },
    { $set: doc }
  )
  return { ok: true }
})
