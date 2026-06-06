// GET /api/backend/records — all records collection docs
export default defineEventHandler(async () => {
  const db   = await getDb()
  const docs = await db.collection('records').find({}).sort({ type: 1, gender: 1, style: 1, distance: 1 }).toArray()
  return docs.map(d => ({
    id:              String(d._id),
    type:            d.type            || '—',
    gender:          d.gender          || '—',
    distance:        d.distance        || '—',
    course:          d.course          || '—',
    time:            d.time            || '—',
    name:            d.name            || '—',
    nationality:     d.nationality     || '—',
    nation_code:     d.nation_code     || '',
    year:            d.year            ?? '—',
    datetime:        d.datetime        ? String(d.datetime).slice(0, 10) : '—',
    age:             d.age             || '—',
    sido:            d.sido            || '—',
    competitionName: d.competitionName || '—',
    pool:            d.pool            || '—',
    // 추가 필드 (records 원본 스키마 + canon 동기화용)
    team:            d.team            || d.nationality || '',
    location:        d.location        || d.pool        || '',
    isMasters:       d.isMasters       ?? false,
    discipline:      d.discipline      || d.style       || '',
    updateTimes:     d.updateTimes     ? String(d.updateTimes).slice(0, 10) : null,
  }))
})
