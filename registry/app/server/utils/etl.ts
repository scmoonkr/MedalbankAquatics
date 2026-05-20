// ETL: MongoDB mergedTimes documents → KSR_DATA sheets

const DISCIPLINE_MAP: Record<string, string> = {
  BR: 'breast', FR: 'free', BK: 'back', FL: 'fly', IM: 'im',
}
const GROUP_MAP: Record<string, string> = {
  '일반부': 'adult', '고등부': 'high', '중등부': 'mid',
  '초등부': 'elem',  '유년부': 'youth',
}
const GENDER_MAP: Record<string, string> = { men: 'm', women: 'f' }

const STROKE_LABEL: Record<string, string> = {
  breast: '평영', free: '자유형', back: '배영', fly: '접영', im: '개인혼영',
}
const GENDER_LABEL: Record<string, string> = { m: '남자', f: '여자' }

function timeToMs(t: unknown): number {
  if (!t || typeof t !== 'string') return Infinity
  const parts = t.trim().split(':')
  try {
    if (parts.length === 2) {
      const [ss, dd = '00'] = parts[1].split('.')
      return (parseInt(parts[0]) * 60 + parseInt(ss)) * 1000
           + parseInt(dd.padEnd(2, '0').slice(0, 2)) * 10
    }
    if (parts.length === 3) {
      const [ss, dd = '00'] = parts[2].split('.')
      return (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(ss)) * 1000
           + parseInt(dd.padEnd(2, '0').slice(0, 2)) * 10
    }
  } catch { /* fall through */ }
  return Infinity
}

function meetShort(name: unknown): string {
  if (!name) return '—'
  let s = String(name).trim()
  s = s.replace(/^제(\d+)회\s*/, '$1회 ')
  s = s.replace(/^(20)(\d{2})\s*/, '$2 ')
  if (s.length > 16) s = s.slice(0, 15).trimEnd() + '…'
  return s.trim()
}

function eventId(g: string, s: string, d: number, c: string) {
  return `${g}-${s}-${d}-${c}`
}
function eventLabel(g: string, s: string, d: number, c: string) {
  return `${GENDER_LABEL[g]} ${STROKE_LABEL[s]} ${d}M ${c.toUpperCase()}`
}

function assignRanks(entries: any[]) {
  let rank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].time_ms !== entries[i - 1].time_ms) rank = i + 1
    entries[i].rank = rank
  }
}

function buildEvent(gender: string, stroke: string, distance: number, course: string, records: any[]) {
  const best = new Map<string, any>()
  for (const r of records) {
    const key = `${r.name}||${r.gender}||${r.group}`
    if (!best.has(key) || r.time_ms < best.get(key)!.time_ms) best.set(key, r)
  }
  const sorted = [...best.values()]
    .filter(r => r.time_ms !== Infinity)
    .sort((a, b) => a.time_ms - b.time_ms)
    .slice(0, 100)
  assignRanks(sorted)
  return {
    label:  eventLabel(gender, stroke, distance, course),
    id:     eventId(gender, stroke, distance, course),
    gender, stroke, distance, course,
    ranks: sorted.map(r => ({
      rank:      r.rank,
      name:      r.name    || '—',
      city:      r.sido    || '—',
      team:      r.team    || '—',
      date:      r.datetime ? String(r.datetime).slice(0, 10) : '—',
      time:      r.time    || '—',
      meet:      meetShort(r.competitionName),
      meet_full: r.competitionName || '—',
    })),
  }
}

export function buildSheets(docs: any[]) {
  const records = docs
    .map(d => ({
      ...d,
      division: d.isMasters ? 'masters' : 'elite',
      group:    GROUP_MAP[d.group]           || 'adult',
      gender:   GENDER_MAP[d.gender]         || d.gender,
      stroke:   DISCIPLINE_MAP[d.discipline] || null,
      distance: parseInt(d.distance, 10),
      course:   (d.course || '').toLowerCase(),
      time_ms:  timeToMs(d.time),
    }))
    .filter(r => r.stroke && r.gender && r.distance && r.course && r.time_ms !== Infinity)

  const buckets: Record<string, any[]> = {}
  const add = (key: string, r: any) => { (buckets[key] = buckets[key] || []).push(r) }

  for (const r of records) {
    add('all',                      r)
    add(r.division,                 r)
    add(r.group,                    r)
    add(`${r.division}-${r.group}`, r)
  }

  const sheets: Record<string, any[]> = {}
  for (const [sheetKey, recs] of Object.entries(buckets)) {
    const evMap = new Map<string, any>()
    for (const r of recs) {
      const eid = eventId(r.gender, r.stroke, r.distance, r.course)
      if (!evMap.has(eid)) evMap.set(eid, { gender: r.gender, stroke: r.stroke, distance: r.distance, course: r.course, recs: [] })
      evMap.get(eid)!.recs.push(r)
    }
    sheets[sheetKey] = [...evMap.values()]
      .map(e => buildEvent(e.gender, e.stroke, e.distance, e.course, e.recs))
      .sort((a, b) => a.label.localeCompare(b.label, 'ko'))
  }
  return sheets
}
