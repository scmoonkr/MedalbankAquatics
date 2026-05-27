function parseTimeSec(str: string): number {
  if (!str) return Infinity
  const s = str.replace(/^0+:/, '')
  if (s.includes(':')) {
    const [m, sec] = s.split(':')
    return parseInt(m) * 60 + parseFloat(sec)
  }
  return parseFloat(s) || Infinity
}

// GET /api/canon — records 컬렉션에서 canon matrix용 데이터 반환
// key: "{G}-{stroke}-{distance}-{type}" (G=M|W, stroke=FR|BK|..., distance=숫자)
export default defineEventHandler(async () => {
  const db = await getDb()

  const [nonMasters, kmrRecords, wmrRecords] = await Promise.all([
    db.collection('records').find({ course: 'LCM', isMasters: false }).toArray(),
    db.collection('records').find({ course: 'LCM', type: 'KMR' }).toArray(),
    db.collection('records').find({ course: 'LCM', type: 'WMR' }).toArray(),
  ])

  const GENDER: Record<string, string> = { men: 'M', women: 'W' }

  type RecEntry = { time: string; athlete: string; nation: string; year: string | number; venue: string }
  const result: Record<string, RecEntry> = {}

  for (const d of nonMasters) {
    if (!d.type || !d.gender || !d.distance) continue

    const g        = GENDER[d.gender]
    const stroke   = d.discipline || ''
    const distance = parseInt(String(d.distance))
    const year     = d.datetime ? String(d.datetime).slice(0, 4) : (d.year ?? '')

    if (!g || !stroke || !distance) continue

    const key = `${g}-${stroke}-${distance}-${d.type}`
    result[key] = {
      time:    d.time     || '',
      athlete: d.name     || '',
      nation:  d.team     || '',
      year,
      venue:   d.location || '',
    }
  }

  // KMR: 종목별 전 연령부 중 가장 빠른 기록 하나만 선택
  for (const d of kmrRecords) {
    if (!d.gender || !d.distance) continue

    const g        = GENDER[d.gender]
    const stroke   = d.discipline || ''
    const distance = parseInt(String(d.distance))
    const year     = d.datetime ? String(d.datetime).slice(0, 4) : (d.year ?? '')

    if (!g || !stroke || !distance) continue

    const key  = `${g}-${stroke}-${distance}-KMR`
    const time = parseTimeSec(String(d.time || ''))

    const existing = result[key]
    const existingTime = existing ? parseTimeSec(String(existing.time || '')) : Infinity

    if (time < existingTime) {
      result[key] = {
        time:    d.time     || '',
        athlete: d.name     || '',
        nation:  d.team     || '',
        year,
        venue:   d.location || '',
      }
    }
  }

  // WMR: 종목별 전 연령부 중 가장 빠른 기록 하나만 선택
  for (const d of wmrRecords) {
    if (!d.gender || !d.distance) continue

    const g        = GENDER[d.gender]
    const stroke   = d.discipline || ''
    const distance = parseInt(String(d.distance))
    const year     = d.datetime ? String(d.datetime).slice(0, 4) : (d.year ?? '')

    if (!g || !stroke || !distance) continue

    const key  = `${g}-${stroke}-${distance}-WMR`
    const time = parseTimeSec(String(d.time || ''))

    const existing     = result[key]
    const existingTime = existing ? parseTimeSec(String(existing.time || '')) : Infinity

    if (time < existingTime) {
      result[key] = {
        time:    d.time     || '',
        athlete: d.name     || '',
        nation:  d.team     || '',
        year,
        venue:   d.location || '',
      }
    }
  }

  return result
})
