// GET /api/backend/competitions
// filter: name (regex), course, isMasters
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {}
  if (q.name) {
    const safe = String(q.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    match.competitionName = { $regex: safe, $options: 'i' }
  }
  if (q.course)     match.course     = String(q.course)
  if (q.isMasters !== undefined && q.isMasters !== '')
    match.isMasters = q.isMasters === 'true'

  const docs = await db
    .collection('competitions')
    .find(match)
    .sort({ datetime: -1, competitionID: -1 })
    .limit(500)
    .toArray()

  return docs.map(d => ({
    id:              String(d._id),
    competitionID:   d.competitionID   ?? null,
    competitionName: d.competitionName || '',
    datetime:        d.datetime        ? String(d.datetime).slice(0, 10) : '',
    pool:            d.pool            || '',
    sido:            d.sido            || '',
    course:          d.course          || '',
    isMasters:       d.isMasters       ?? false,
  }))
})
