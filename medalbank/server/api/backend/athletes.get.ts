// GET /api/backend/athletes
// filter: name (regex, "가%" 형태는 초성 범위), gender
export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {}
  if (q.name) {
    const raw = String(q.name)
    if (raw.endsWith('%')) {
      // 초성 버튼: "가%" → 가 이상 나 미만 (각·간·깋 까지 포함)
      const range = initialRange(raw.slice(0, -1))
      if (range) match.name = range
    } else {
      match.name = { $regex: safeRegex(raw), $options: 'i' }
    }
  }
  if (q.gender) match.gender = String(q.gender)

  const docs = await db
    .collection('athletes')
    .find(match)
    .sort({ name: 1 })
    .limit(500)
    .toArray()

  return docs.map(d => ({
    id:        String(d._id),
    athleteID: d.athleteID ?? 0,
    name:      d.name      || '',
    gender:    d.gender    || '',
    status:    d.status    || '',
    record:    d.record    || '',
    yearBirth: d.yearBirth || '',
    dateBirth: d.dateBirth || '',
    featured:  d.featured  || '',
    thumbnail: d.thumbnail || '',
  }))
})
