// GET /api/backend/recalc/wapoints-count
// 재계산 대상 mergedTimes 레코드 수 반환

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const gender     = String(q.gender     || '')
  const discipline = String(q.discipline || '')
  const distance   = String(q.distance   || '')
  const course     = String(q.course     || '')

  if (!gender || !discipline || !distance || !course) {
    throw createError({ statusCode: 400, message: 'gender, discipline, distance, course 필수' })
  }

  const db    = await getDb()
  const count = await db.collection('mergedTimes').countDocuments(
    { gender, discipline, distance, course, timeStamp: { $gt: 0 } }
  )

  return { count }
})
