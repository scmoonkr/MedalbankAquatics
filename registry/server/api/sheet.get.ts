// GET /api/sheet — single event, paginated. 100 ranks per page.
//
// Query:
//   division : 'all' | 'elite' | 'masters'        (default 'all')
//   group    : 'all' | 'adult' | 'high' | 'mid' | 'elem' | 'youth'  (default 'all')
//   gender   : 'm' | 'f'                          (default 'm')
//   stroke   : 'free' | 'back' | 'breast' | 'fly' | 'im'            (default 'breast')
//   distance : 50 | 100 | 200 | 400 | 800 | 1500  (default 100)
//   course   : 'lcm' | 'scm'                      (default 'lcm')
//   page     : 1, 2, …                            (default 1)
//
// Response: { page, pageSize, total, ranks: [{ rank, name, city, team, date, time, meet, meet_full }] }

const DISCIPLINE_REV: Record<string, string>  = { breast: 'BR', free: 'FR', back: 'BK', fly: 'FL', im: 'IM' }
// 'adult' covers both 일반부 (legacy elite) and 성인부 (masters / current naming).
const GROUP_REV:      Record<string, unknown> = {
  adult: { $in: ['일반부', '성인부'] },
  high:  '고등부',
  mid:   '중등부',
  elem:  '초등부',
  youth: '유년부',
}
const GENDER_REV:     Record<string, string>  = { m: 'men', f: 'women' }

function meetShort(name: unknown): string {
  if (!name) return '—'
  let s = String(name).trim()
  s = s.replace(/^제(\d+)회\s*/, '$1회 ')
  s = s.replace(/^(20)(\d{2})\s*/, '$2 ')
  if (s.length > 16) s = s.slice(0, 15).trimEnd() + '…'
  return s.trim()
}

type Row = {
  _id?: unknown
  name?: string
  sido?: string
  team?: string
  datetime?: string
  time?: string
  competitionName?: string
  gender?: string
  group?: string
  discipline?: string
  distance?: string
  course?: string
  isMasters?: boolean
  round?: string
}

// Competition ranking (1224): ties share the lower rank, next rank skips slots consumed by the tie.
function shapeRanks(rows: Row[], offset: number) {
  const out = []
  let rank = offset + 1
  let prevTime: string | null = null
  for (let i = 0; i < rows.length; i++) {
    if (prevTime !== null && rows[i].time !== prevTime) rank = offset + i + 1
    prevTime = rows[i].time ?? null
    const r = rows[i]
    out.push({
      rank,
      // Source doc id (for backend edit/delete).
      id:        r._id ? String(r._id) : '',
      name:      r.name || '—',
      city:      r.sido || '—',
      team:      r.team || '—',
      date:      r.datetime ? String(r.datetime).slice(0, 10) : '—',
      time:      r.time || '—',
      meet:      meetShort(r.competitionName),
      meet_full: r.competitionName || '—',
      // Full structural fields for editing.
      gender:     r.gender     || '',
      group:      r.group      || '',
      discipline: r.discipline || '',
      distance:   r.distance   || '',
      course:     r.course     || '',
      isMasters:  !!r.isMasters,
      round:      r.round      || '',
    })
  }
  return out
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const gender   = String(q.gender   ?? 'm')
  const stroke   = String(q.stroke   ?? 'breast')
  const distance = parseInt(String(q.distance ?? '100'), 10)
  const course   = String(q.course   ?? 'lcm').toUpperCase()
  const division = String(q.division ?? 'all')
  const group    = String(q.group    ?? 'all')
  const page     = Math.max(1, parseInt(String(q.page ?? '1'), 10))
  const pageSize = 100

  const match: Record<string, unknown> = {
    gender:     GENDER_REV[gender] ?? gender,
    discipline: DISCIPLINE_REV[stroke] ?? stroke,
    distance:   `${distance}M`,
    course,
    // Exclude rows with missing/malformed time. Accept "mm:ss.dd" or "hh:mm:ss.dd".
    time: { $regex: /^\d{1,2}:\d{2}(:\d{2})?\.\d{1,3}$/ },
    // Exclude DNS/DQ/DNF/NS etc. Only rows without a status are valid swims.
    status: { $in: [null, ''] },
  }
  if (division !== 'all') match.isMasters = (division === 'masters')
  if (group    !== 'all') match.group     = GROUP_REV[group] ?? group

  const db = await getDb()
  const cursor = db.collection('mergedTimes').aggregate([
    { $match: match },
    // Sort ASC by time so $first per athlete = best time
    { $sort: { time: 1 } },
    // Dedupe by (name, gender, group). Division intentionally NOT in key — see agent.md.
    // Normalize null/missing/whitespace so docs with absent vs empty fields collapse together.
    { $group: {
        _id: {
          name:   { $trim: { input: { $ifNull: ['$name', ''] } } },
          gender: { $ifNull: ['$gender', ''] },
          group:  { $ifNull: ['$group', ''] },
        },
        best: { $first: '$$ROOT' },
    }},
    { $replaceRoot: { newRoot: '$best' } },
    // Re-sort: $group breaks ordering
    { $sort: { time: 1 } },
    // Page slice + total in one round-trip
    { $facet: {
        page:  [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
        total: [{ $count: 'n' }],
    }},
  ])
  const result = await cursor.next() as { page: Row[], total: { n: number }[] } | null

  return {
    page,
    pageSize,
    total: result?.total[0]?.n ?? 0,
    ranks: shapeRanks(result?.page ?? [], (page - 1) * pageSize),
  }
})
