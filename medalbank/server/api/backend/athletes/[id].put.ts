// PUT /api/backend/athletes/:id
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { id: _1, _id: _2, athleteID: _3, ...doc } = body
  const db = await getDb()
  await db.collection('athletes').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...doc, updatedAt: new Date() } },
  )
  return { ok: true }
})
