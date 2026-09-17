// PUT /api/backend/teams/:id — names 를 바꾸면 조회용 indexes 도 같이 맞춘다.
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { id: _1, _id: _2, teamID: _3, ...doc } = body
  if (Array.isArray(doc.names)) doc.indexes = doc.names

  const db = await getDb()
  await db.collection('teams').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...doc, updatedAt: new Date() } },
  )
  return { ok: true }
})
