// PUT /api/backend/competitions/:id
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { id: _1, _id: _2, ...doc } = body
  const db = await getDb()
  await db.collection('competitions').updateOne(
    { _id: new ObjectId(id) },
    { $set: doc },
  )
  return { ok: true }
})
