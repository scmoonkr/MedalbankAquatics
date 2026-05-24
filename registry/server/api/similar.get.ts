// GET /api/similar — mergedTimes에서 WA 포인트 기준 유사 기록 조회
// params: gender(M|W), stroke(FR|BK|BR|FL|IM), distance(number), course(LCM), pts(number)

const BASE_TIMES: Record<string, Record<string, Record<number, number>>> = {
  M: {
    FR: {  50: 20.91, 100: 46.40, 200: 102.00, 400: 219.96, 800: 452.12, 1500: 870.67 },
    BK: {  50: 23.55, 100: 51.60, 200: 111.92 },
    BR: {  50: 25.95, 100: 56.88, 200: 125.48 },
    FL: {  50: 22.27, 100: 49.45, 200: 110.34 },
    IM: { 200: 114.00, 400: 243.84 },
  },
  W: {
    FR: {  50: 23.61, 100: 51.71, 200: 112.23, 400: 235.38, 800: 484.79, 1500: 920.48 },
    BK: {  50: 26.86, 100: 57.13, 200: 123.14 },
    BR: {  50: 28.56, 100: 64.13, 200: 137.55 },
    FL: {  50: 24.43, 100: 55.48, 200: 121.81 },
    IM: { 200: 126.12, 400: 265.87 },
  },
}

function calcPts(basetime: number, timeSec: number): number {
  return Math.floor(1000 * Math.pow(basetime / timeSec, 3))
}

// WA points → 해당 종목에서 기대되는 timeStamp (fractional day)
function expectedTS(basetime: number, pts: number): number {
  return (basetime * Math.pow(1000 / pts, 1 / 3)) / 86400
}

export default defineEventHandler(async (event) => {
  const q        = getQuery(event)
  const gender   = String(q.gender   || 'M')   // 'M' | 'W'
  const stroke   = String(q.stroke   || 'FR')
  const distance = Number(q.distance || 50)
  const course   = String(q.course   || 'LCM')
  const pts      = Number(q.pts      || 0)

  if (!pts || !BASE_TIMES[gender]?.[stroke]?.[distance]) {
    return { same: [], other: [] }
  }

  const dbGender = gender === 'M' ? 'men' : 'women'
  const distStr  = `${distance}M`
  const basetime = BASE_TIMES[gender][stroke][distance]
  const targetTS = expectedTS(basetime, pts)
  const db       = await getDb()

  // ── 같은 종목 ─────────────────────────────────────────────
  // ±60초 margin, timeStamp 인덱스 탐
  const sameMargin = 60 / 86400
  const sameDocs = await db.collection('mergedTimes').aggregate([
    { $match: {
      gender:     dbGender,
      discipline: stroke,
      distance:   distStr,
      course,
      timeStamp:  { $gte: targetTS - sameMargin, $lte: targetTS + sameMargin },
    }},
    { $addFields: { diff: { $abs: { $subtract: ['$timeStamp', targetTS] } } } },
    { $sort: { diff: 1 } },
    { $limit: 200 },
    // 이름 중복 제거 — diff 오름차순 정렬 후 $first 이므로 가장 가까운 기록 유지
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { diff: 1 } },
    { $limit: 10 },
  ]).toArray()

  // ── 타 영법 ───────────────────────────────────────────────
  // 각 종목의 기대 timeStamp ±3% 범위, 종목별 병렬 쿼리
  type EventMeta = { stroke: string; distance: number; basetime: number }
  const otherQueries: Promise<any[]>[] = []
  const otherMeta:    EventMeta[]      = []

  for (const [s, dists] of Object.entries(BASE_TIMES[gender])) {
    for (const [d, bt] of Object.entries(dists)) {
      const dist = Number(d)
      if (s === stroke && dist === distance) continue  // 현재 종목 제외

      const expTS  = expectedTS(bt, pts)
      const margin = expTS * 0.03  // ±3%

      otherQueries.push(
        db.collection('mergedTimes').aggregate([
          { $match: {
            gender:     dbGender,
            discipline: s,
            distance:   `${dist}M`,
            course,
            timeStamp:  { $gte: expTS - margin, $lte: expTS + margin },
          }},
          { $addFields: { diff: { $abs: { $subtract: ['$timeStamp', expTS] } } } },
          { $sort: { diff: 1 } },
          { $limit: 100 },
          // 이름 중복 제거
          { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
          { $replaceRoot: { newRoot: '$doc' } },
          { $sort: { diff: 1 } },
          { $limit: 5 },  // 종목별 후보 5건 → 합산 후 상위 10건
        ]).toArray(),
      )
      otherMeta.push({ stroke: s, distance: dist, basetime: bt })
    }
  }

  const otherResults = await Promise.all(otherQueries)

  // ── 포맷 ──────────────────────────────────────────────────
  const fmt = (d: any, bt: number, s: string, dist: number) => {
    const timeSec = (d.timeStamp || 0) * 86400
    return {
      gender,
      stroke:   s,
      distance: dist,
      course,
      time:     d.time     || '',
      athlete:  d.name     || '',
      date:     d.datetime ? String(d.datetime).slice(0, 4) : '',
      points:   bt && timeSec ? calcPts(bt, timeSec) : 0,
    }
  }

  const same  = sameDocs.map(d => fmt(d, basetime, stroke, distance))

  const otherAll: ReturnType<typeof fmt>[] = []
  otherResults.forEach((docs, i) => {
    const { stroke: s, distance: dist, basetime: bt } = otherMeta[i]
    docs.forEach(d => otherAll.push(fmt(d, bt, s, dist)))
  })
  otherAll.sort((a, b) => Math.abs(a.points - pts) - Math.abs(b.points - pts))
  const other = otherAll.slice(0, 10)

  return { same, other }
})
