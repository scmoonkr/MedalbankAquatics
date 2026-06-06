// GET /api/time/lookup?athlete=&time=&discipline=&distance=&course=
// 선수명+기록으로 mergedTimes에서 tid/timeID 역조회
export default defineEventHandler(async (event) => {
  const q          = getQuery(event)
  const athlete    = String(q.athlete    || '').trim()
  const time       = String(q.time       || '').trim()
  const discipline = String(q.discipline || '').trim()
  const distance   = String(q.distance   || '').trim()
  const course     = String(q.course     || '').trim()

  if (!athlete || !time) return { id: null }

  const db  = await getDb()
  const filter: Record<string, unknown> = { name: athlete, time }
  if (discipline) filter.discipline = discipline
  if (distance)   filter.distance   = distance
  if (course)     filter.course     = course

  const doc = await db.collection('mergedTimes').findOne(filter, {
    projection: { timeID: 1, tid: 1 },
  })

  return { id: doc?.timeID ?? doc?.tid ?? null }
})
