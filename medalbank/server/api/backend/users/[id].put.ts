// PUT /api/backend/users/:id
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { id: _1, _id: _2, createdAt: _3, ...doc } = body
  const db = await getDb()
  await db.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...doc, updatedAt: new Date() } },
  )
  return { ok: true }
})
