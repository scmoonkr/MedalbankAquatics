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

  type RecEntry = { time: string; athlete: string; nation: string; year: string | number; datetime: string; venue: string }
  const result: Record<string, RecEntry> = {}

  function toEntry(d: any): RecEntry {
    const datetimeRaw = d.datetime ? String(d.datetime) : ''
    return {
      time:     d.time     || '',
      athlete:  d.name     || '',
      nation:   d.team     || '',
      year:     datetimeRaw ? datetimeRaw.slice(0, 4) : (d.year ?? ''),
      datetime: datetimeRaw.slice(0, 10),
      venue:    d.location || '',
    }
  }

  for (const d of nonMasters) {
    if (!d.type || !d.gender || !d.distance) continue

    const g        = GENDER[d.gender]
    const stroke   = d.discipline || ''
    const distance = parseInt(String(d.distance))

    if (!g || !stroke || !distance) continue

    result[`${g}-${stroke}-${distance}-${d.type}`] = toEntry(d)
  }

  // KMR: 종목별 전 연령부 중 가장 빠른 기록 하나만 선택
  for (const d of kmrRecords) {
    if (!d.gender || !d.distance) continue

    const g        = GENDER[d.gender]
    const stroke   = d.discipline || ''
    const distance = parseInt(String(d.distance))

    if (!g || !stroke || !distance) continue

    const key          = `${g}-${stroke}-${distance}-KMR`
    const time         = parseTimeSec(String(d.time || ''))
    const existingTime = result[key] ? parseTimeSec(String(result[key].time || '')) : Infinity

    if (time < existingTime) result[key] = toEntry(d)
  }

  // WMR: 종목별 전 연령부 중 가장 빠른 기록 하나만 선택
  for (const d of wmrRecords) {
    if (!d.gender || !d.distance) continue

    const g        = GENDER[d.gender]
    const stroke   = d.discipline || ''
    const distance = parseInt(String(d.distance))

    if (!g || !stroke || !distance) continue

    const key          = `${g}-${stroke}-${distance}-WMR`
    const time         = parseTimeSec(String(d.time || ''))
    const existingTime = result[key] ? parseTimeSec(String(result[key].time || '')) : Infinity

    if (time < existingTime) result[key] = toEntry(d)
  }

  return result
})
