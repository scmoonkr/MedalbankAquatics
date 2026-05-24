// GET /api/similar — mergedTimes에서 WA 포인트 기준 유사 기록 조회
// params: gender(M|W), stroke(FR|BK|BR|FL|IM), distance(number), course(LCM|SCM), pts(number)
// waPoints 필드를 직접 사용 (timeStamp 범위 계산 불필요)

import { getBasetime, calcWAPoints, BASE_TIMES } from '~/server/utils/wapoints'

// ±150 pts 이내 유사 기록 조회
const SAME_MARGIN  = 150
const OTHER_MARGIN = 150

export default defineEventHandler(async (event) => {
  const q        = getQuery(event)
  const gender   = String(q.gender   || 'M')   // 'M' | 'W'
  const stroke   = String(q.stroke   || 'FR')
  const distance = Number(q.distance || 50)
  const course   = String(q.course   || 'LCM')
  const pts      = Number(q.pts      || 0)

  if (!pts) return { same: [], other: [] }

  const dbGender = gender === 'M' ? 'men' : 'women'
  const distStr  = `${distance}M`
  const db       = await getDb()

  // ── 같은 종목 ─────────────────────────────────────────────
  const sameDocs = await db.collection('mergedTimes').aggregate([
    { $match: {
      gender:     dbGender,
      discipline: stroke,
      distance:   distStr,
      course,
      waPoints:   { $gte: pts - SAME_MARGIN, $lte: pts + SAME_MARGIN },
    }},
    { $addFields: { diff: { $abs: { $subtract: ['$waPoints', pts] } } } },
    { $sort: { diff: 1 } },
    { $limit: 200 },
    // 이름 중복 제거 — diff 오름차순 정렬 후 $first 이므로 가장 가까운 기록 유지
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { diff: 1 } },
    { $limit: 10 },
  ]).toArray()

  // ── 타 영법/거리 ─────────────────────────────────────────
  // 같은 course 내 모든 종목을 waPoints 범위로 한 번에 조회 후 종목별 집계
  const otherDocs = await db.collection('mergedTimes').aggregate([
    { $match: {
      gender:   dbGender,
      course,
      waPoints: { $gte: pts - OTHER_MARGIN, $lte: pts + OTHER_MARGIN },
      $nor: [{ discipline: stroke, distance: distStr }],  // 현재 종목 제외
    }},
    { $addFields: { diff: { $abs: { $subtract: ['$waPoints', pts] } } } },
    { $sort: { diff: 1 } },
    { $limit: 500 },
    // 종목+이름 기준 중복 제거
    {
      $group: {
        _id: { discipline: '$discipline', distance: '$distance', name: '$name' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { diff: 1 } },
    { $limit: 50 },
  ]).toArray()

  // ── 포맷 ──────────────────────────────────────────────────
  const fmt = (d: any, s: string, dist: number) => ({
    gender,
    stroke:   s,
    distance: dist,
    course,
    time:     d.time     || '',
    athlete:  d.name     || '',
    date:     d.datetime ? String(d.datetime).slice(0, 4) : '',
    points:   d.waPoints ?? 0,
  })

  const same = sameDocs.map(d => fmt(d, stroke, distance))

  // 타 종목: 종목별 최대 5건, 전체 상위 10건
  const otherByEvent: Map<string, ReturnType<typeof fmt>[]> = new Map()
  for (const d of otherDocs) {
    const key  = `${d.discipline}-${d.distance}`
    const dist = parseInt(d.distance || '0')
    const arr  = otherByEvent.get(key) ?? []
    if (arr.length < 5) {
      arr.push(fmt(d, d.discipline, dist))
      otherByEvent.set(key, arr)
    }
  }

  const otherAll = [...otherByEvent.values()].flat()
  otherAll.sort((a, b) => Math.abs(a.points - pts) - Math.abs(b.points - pts))
  const other = otherAll.slice(0, 10)

  return { same, other }
})
