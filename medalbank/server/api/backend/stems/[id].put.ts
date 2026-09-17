// PUT /api/backend/stems/:id
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  // competitions 는 lookup 결과라 저장하지 않는다.
  const { id: _1, _id: _2, stemID: _3, competitions: _4, ...doc } = body
  const db = await getDb()
  await db.collection('stems').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...doc, updatedAt: new Date() } },
  )
  return { ok: true }
})
