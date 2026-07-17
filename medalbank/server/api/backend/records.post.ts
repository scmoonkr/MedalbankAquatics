// POST /api/backend/records — insert new record
import { timeToSeconds } from '~/server/utils/importTimes'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, _id, ...doc } = body

  // timeStamp is a fractional day derived from time (timeStamp * 86400 = seconds);
  // the canon → mergedTimes sync depends on it.
  const sec = timeToSeconds(String(doc.time ?? ''))
  doc.timeStamp = sec ? sec / 86400 : 0
  doc.createdAt = new Date()

  const db = await getDb()
  const result = await db.collection('records').insertOne(doc)
  return { ok: true, id: String(result.insertedId), timeStamp: doc.timeStamp }
})
