// GET /api/backend/times-all — mergedTimes collection, no limit (for CSV export)
export default defineEventHandler(async () => {
  const db   = await getDb()
  const docs = await db
    .collection('mergedTimes')
    .find({})
    .toArray()
  return docs.map(d => ({
    id:              String(d._id),
    gender:          d.gender          || '—',
    discipline:      d.discipline      || '—',
    distance:        d.distance        || '—',
    course:          d.course          || '—',
    group:           d.group           || '—',
    isMasters:       !!d.isMasters,
    name:            d.name            || '—',
    sido:            d.sido            || '—',
    team:            d.team            || '—',
    time:            d.time            || '—',
    datetime:        d.datetime        ? String(d.datetime).slice(0, 10) : '—',
    competitionName: d.competitionName || '—',
  }))
})
