// GET /api/similar — 선수별 PB 기준 WA 포인트 유사 기록 조회
// 같은 종목: 동일 성별·영법·거리·코스에서 선수별 PB → waPoints 유사 순 10개
// 타 영법:  성별 무관, 현재 종목 제외 전 종목에서 선수별 PB → waPoints 유사 순 10개

import { BASE_TIMES } from '~/server/utils/wapoints'

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
  const coll     = db.collection('mergedTimes')

  // ── 같은 종목: 선수별 PB(min timeStamp) → waPoints diff 순 10개 ──
  const sameDocs = await coll.aggregate([
    { $match: { gender: dbGender, discipline: stroke, distance: distStr, course } },
    { $sort: { timeStamp: 1 } },                          // 빠른 기록 먼저 (PB first)
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } }, // 선수별 PB
    { $replaceRoot: { newRoot: '$doc' } },
    { $addFields: { diff: { $abs: { $subtract: ['$waPoints', pts] } } } },
    { $sort: { diff: 1 } },
    { $limit: 10 },
  ]).toArray()

  // ── 타 영법: 성별 무관, BASE_TIMES 전 종목(현재 제외) 병렬 조회 ──
  type EventKey = { genderDb: string; s: string; dist: number; distStr: string }
  const events: EventKey[] = []

  for (const [g, strokes] of Object.entries(BASE_TIMES[course] ?? {})) {
    const gDb = g === 'M' ? 'men' : 'women'
    for (const [s, dists] of Object.entries(strokes)) {
      for (const d of Object.keys(dists)) {
        const dist = Number(d)
        const ds   = `${dist}M`
        // 현재 종목(성별+영법+거리) 제외
        if (gDb === dbGender && s === stroke && ds === distStr) continue
        events.push({ genderDb: gDb, s, dist, distStr: ds })
      }
    }
  }

  // 종목별 선수 PB 병렬 조회
  const otherResults = await Promise.all(
    events.map(({ genderDb, s, distStr: ds }) =>
      coll.aggregate([
        { $match: { gender: genderDb, discipline: s, distance: ds, course } },
        { $sort: { timeStamp: 1 } },
        { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $addFields: { diff: { $abs: { $subtract: ['$waPoints', pts] } } } },
        { $sort: { diff: 1 } },
        { $limit: 20 },
      ]).toArray(),
    ),
  )

  // 전체 합산 후 diff 순 상위 10개
  const otherAll: any[] = []
  for (const docs of otherResults) otherAll.push(...docs)
  otherAll.sort((a, b) => a.diff - b.diff)
  const otherDocs = otherAll.slice(0, 10)

  // ── 포맷 ──────────────────────────────────────────────────
  const fmtGender = (g: string) => (g === 'men' || g === 'M') ? 'M' : 'W'

  const fmt = (d: any, s: string, dist: number) => ({
    gender:   fmtGender(d.gender),
    stroke:   s,
    distance: dist,
    course,
    time:     d.time     || '',
    athlete:  d.name     || '',
    date:     d.datetime ? String(d.datetime).slice(0, 4) : '',
    points:   d.waPoints ?? 0,
  })

  const same  = sameDocs.map(d => fmt(d, stroke, distance))
  const other = otherDocs.map(d => fmt(d, d.discipline, parseInt(d.distance || '0')))

  return { same, other }
})
