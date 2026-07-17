// GET /api/backend/times — mergedTimes collection, newest first, limit 2000.
// Accepts filter query params (tier/gender/group/discipline/course/distance)
// so the 2000-row window reflects the currently selected slice.
export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const match: Record<string, unknown> = {}
  if (q.tier === 'masters') match.isMasters = true
  else if (q.tier === 'elite') match.isMasters = false
  if (q.gender)     match.gender     = String(q.gender)
  if (q.group)      match.group      = String(q.group)
  if (q.discipline) match.discipline = String(q.discipline)
  if (q.course)     match.course     = String(q.course)
  if (q.distance)   match.distance   = String(q.distance)

  // free-text search on name / competitionName so matches outside the latest-2000
  // window are still found (client list filter only sees the returned slice).
  const term = String(q.q ?? '').trim()
  if (term) {
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const rx = new RegExp(safe, 'i')
    match.$or = [{ name: rx }, { competitionName: rx }]
  }

  const db = await getDb()
  const docs = await db
    .collection('mergedTimes')
    .find(match)
    .sort({ _id: -1 })
    .limit(2000)
    .toArray()

  return docs.map(d => ({
    id:              String(d._id),
    tid:             d.tid             ?? null,
    gender:          d.gender          || '—',
    discipline:      d.discipline      || '—',
    distance:        d.distance        || '—',
    course:          d.course          || '—',
    group:           d.group           || '—',
    isMasters:       !!d.isMasters,
    isAdult:         !!d.isAdult,
    round:           d.round           || '—',
    heat:            d.heat            || '',
    name:            d.name            || '—',
    sido:            d.sido            || '—',
    team:            d.team            || '—',
    pool:            d.pool            || '',
    time:            d.time            || '—',
    datetime:        d.datetime        ? String(d.datetime).slice(0, 10) : '—',
    competitionName: d.competitionName || '—',
    rank:            d.rank ?? null,
    ageGroup:        d.ageGroup        || '',
    status:          d.status          || '',
  }))
})
