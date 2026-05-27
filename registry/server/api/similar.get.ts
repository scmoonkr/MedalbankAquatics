// GET /api/similar — 선수별 PB 기준 WA 포인트 유사 기록 조회
// oldest:   diff 순, 동률 시 가장 오래된 기록
// recent:   diff 순, 동률 시 가장 최근 기록
// sameYear: year 파라미터 기준 동일 연도 기록 (미제공 시 빈 배열)

import { BASE_TIMES } from '~/server/utils/wapoints'

export default defineEventHandler(async (event) => {
  const q        = getQuery(event)
  const gender   = String(q.gender   || 'M')
  const stroke   = String(q.stroke   || 'FR')
  const distance = Number(q.distance || 50)
  const course   = String(q.course   || 'LCM')
  const pts      = Number(q.pts      || 0)
  const athlete  = String(q.athlete  || '')
  const year     = String(q.year     || '')   // e.g. "2023"

  const EMPTY = {
    oldest:   { same: [] as any[], other: [] as any[] },
    recent:   { same: [] as any[], other: [] as any[] },
    sameYear: { same: [] as any[], other: [] as any[] },
  }
  if (!pts) return EMPTY

  const dbGender = gender === 'M' ? 'men' : 'women'
  const distStr  = `${distance}M`
  const db       = await getDb()
  const coll     = db.collection('mergedTimes')

  const sameMatchBase: Record<string, any> = {
    gender: dbGender, discipline: stroke, distance: distStr, course, waPoints: { $gt: 0 },
  }
  if (athlete) sameMatchBase.name = { $ne: athlete }

  // ── 같은 종목: 선수별 PB top 30 취득 → oldest/recent 분기 ──
  const sameCandidates = await coll.aggregate([
    { $match: sameMatchBase },
    { $sort: { timeStamp: 1 } },
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $addFields: { diff: { $abs: { $subtract: ['$waPoints', pts] } } } },
    { $sort: { diff: 1 } },
    { $limit: 30 },
  ]).toArray()

  const sameOldest = [...sameCandidates]
    .sort((a, b) => a.diff - b.diff || (a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : 0))
    .slice(0, 10)

  const sameRecent = [...sameCandidates]
    .sort((a, b) => a.diff - b.diff || (a.datetime > b.datetime ? -1 : a.datetime < b.datetime ? 1 : 0))
    .slice(0, 10)

  // 같은 종목, 동일 연도: 별도 쿼리 (해당 연도 기록 중 선수별 PB)
  const sameSameYear = year ? await coll.aggregate([
    { $match: { ...sameMatchBase, datetime: { $regex: `^${year}` } } },
    { $sort: { timeStamp: 1 } },
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $addFields: { diff: { $abs: { $subtract: ['$waPoints', pts] } } } },
    { $sort: { diff: 1, datetime: 1 } },
    { $limit: 10 },
  ]).toArray() : []

  // ── 타 영법: BASE_TIMES 전 종목(현재 제외) 병렬 조회 ──
  type EventKey = { genderDb: string; s: string; dist: number; distStr: string }
  const events: EventKey[] = []
  for (const [g, strokes] of Object.entries(BASE_TIMES[course] ?? {})) {
    const gDb = g === 'M' ? 'men' : 'women'
    for (const [s, dists] of Object.entries(strokes)) {
      for (const d of Object.keys(dists)) {
        const dist = Number(d)
        const ds   = `${dist}M`
        if (gDb === dbGender && s === stroke && ds === distStr) continue
        events.push({ genderDb: gDb, s, dist, distStr: ds })
      }
    }
  }

  const otherResults = await Promise.all(
    events.map(({ genderDb, s, distStr: ds }) =>
      coll.aggregate([
        { $match: { gender: genderDb, discipline: s, distance: ds, course, waPoints: { $gt: 0 } } },
        { $sort: { timeStamp: 1 } },
        { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $addFields: { diff: { $abs: { $subtract: ['$waPoints', pts] } } } },
        { $sort: { diff: 1 } },
        { $limit: 20 },
      ]).toArray(),
    ),
  )

  const otherAll: any[] = []
  for (const docs of otherResults) otherAll.push(...docs)

  const otherOldest = [...otherAll]
    .sort((a, b) => a.diff - b.diff || (a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : 0))
    .slice(0, 10)

  const otherRecent = [...otherAll]
    .sort((a, b) => a.diff - b.diff || (a.datetime > b.datetime ? -1 : a.datetime < b.datetime ? 1 : 0))
    .slice(0, 10)

  // 타 영법, 동일 연도: otherAll(선수별 PB 풀)에서 연도 필터 후 상위 10개
  const otherSameYear = year
    ? [...otherAll]
        .filter(d => String(d.datetime || '').startsWith(year))
        .sort((a, b) => a.diff - b.diff || (a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : 0))
        .slice(0, 10)
    : []

  // ── 포맷 ──────────────────────────────────────────────────
  const fmtGender = (g: string) => (g === 'men' || g === 'M') ? 'M' : 'W'
  const fmt = (d: any, s: string, dist: number) => ({
    gender:   fmtGender(d.gender),
    stroke:   s,
    distance: dist,
    course,
    time:     d.time     || '',
    athlete:  d.name     || '',
    date:     d.datetime ? String(d.datetime).slice(0, 10) : '',
    points:   d.waPoints ?? 0,
  })

  const fmtSame  = (d: any) => fmt(d, stroke, distance)
  const fmtOther = (d: any) => fmt(d, d.discipline, parseInt(d.distance || '0'))

  return {
    oldest:   { same: sameOldest.map(fmtSame),   other: otherOldest.map(fmtOther)   },
    recent:   { same: sameRecent.map(fmtSame),   other: otherRecent.map(fmtOther)   },
    sameYear: { same: sameSameYear.map(fmtSame), other: otherSameYear.map(fmtOther) },
  }
})
