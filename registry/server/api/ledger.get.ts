// GET /api/ledger — ledger collection, sorted by report_date desc
const DISCIPLINE_MAP: Record<string, string> = {
  BR: '평영', FR: '자유형', BK: '배영', FL: '접영', IM: '개인혼영',
}
const GENDER_MAP: Record<string, string> = { men: '남자', women: '여자' }

export default defineCachedEventHandler(async () => {
  const db   = await getDb()
  const docs = await db
    .collection('ledger')
    .find({})
    .sort({ report_date: -1, _id: -1 })
    .toArray()

  return docs.map(d => {
    const gender   = GENDER_MAP[d.gender as string] ?? d.gender ?? '—'
    const stroke   = DISCIPLINE_MAP[d.discipline as string] ?? d.discipline ?? '—'
    const distance = d.distance ? String(d.distance).replace(/m$/i, '') + 'm' : '—'
    const course   = d.course ? String(d.course).toUpperCase() : ''

    const eventParts = [gender, stroke, distance, course].filter(Boolean)
    const event      = eventParts.join(' ')

    // modal용 raw 필드
    const rawGender   = d.gender === 'men' ? 'M' : d.gender === 'women' ? 'W' : ''
    const rawStroke   = d.discipline ?? ''
    const rawDistance = d.distance ? parseInt(String(d.distance)) : 0
    const rawCourse   = d.course ? String(d.course).toUpperCase() : ''

    return {
      event:       event,
      group:       d.group        || '—',
      name:        d.name         || '—',
      city:        d.sido         || '—',
      team:        d.team         || '—',
      time:        d.time         || '—',
      date:        d.datetime     ? String(d.datetime).slice(0, 10) : '—',
      meet:        d.competitionName || '—',
      report_date: d.report_date  ? String(d.report_date).slice(0, 10) : null,
      // modal trigger용
      rawGender,
      rawStroke,
      rawDistance,
      rawCourse,
    }
  })
}, {
  maxAge: 60,
  name:   'ksr-ledger',
  getKey: () => 'all',
})
