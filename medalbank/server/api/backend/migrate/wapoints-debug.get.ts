// GET /api/backend/migrate/wapoints-debug
// waPoints 없는 레코드 샘플 5건 반환 — 스킵 원인 파악용 임시 진단 엔드포인트

export default defineEventHandler(async (event) => {
  const db = await getDb()
  const docs = await db
    .collection('mergedTimes')
    .find({ waPoints: { $exists: false } })
    .limit(5)
    .toArray()

  return docs.map(d => ({
    _id:        String(d._id),
    course:     d.course,
    gender:     d.gender,
    discipline: d.discipline,
    distance:   d.distance,
    time:       d.time,
    timeStamp:  d.timeStamp,
  }))
})
