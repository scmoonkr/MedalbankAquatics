// PUT /api/backend/records/:id — update record
import { ObjectId } from 'mongodb'
import { timeToSeconds } from '~/server/utils/importTimes'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')!
  const body = await readBody(event)
  // createdAt is insert-only — never let an update overwrite it.
  const { id: _id2, _id: _id3, createdAt: _c, ...doc } = body

  // timeStamp is a fractional day derived from time (timeStamp * 86400 = seconds).
  // The canon → mergedTimes sync reads records.timeStamp, so it must never go stale
  // when time is edited.
  if ('time' in doc) {
    const sec = timeToSeconds(String(doc.time ?? ''))
    doc.timeStamp = sec ? sec / 86400 : 0
  }
  doc.updatedAt = new Date()

  const db = await getDb()
  await db.collection('records').updateOne(
    { _id: new ObjectId(id) },
    { $set: doc }
  )
  return { ok: true, timeStamp: doc.timeStamp }
})
