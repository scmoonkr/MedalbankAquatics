// GET /api/backend/times — mergedTimes collection, newest first, limit 2000
export default defineEventHandler(async () => {
  const db   = await getDb()
  const docs = await db
    .collection('mergedTimes')
    .find({})
    .sort({ _id: -1 })
    .limit(2000)
    .toArray()
  return docs.map(d => ({
    id:              String(d._id),
    gender:          d.gender          || '—',
    discipline:      d.discipline      || '—',
    distance:        d.distance        || '—',
    course:          d.course          || '—',
    group:           d.group           || '—',
    isMasters:       !!d.isMasters,
    round:           d.round           || '—',
    name:            d.name            || '—',
    sido:            d.sido            || '—',
    team:            d.team            || '—',
    time:            d.time            || '—',
    datetime:        d.datetime        ? String(d.datetime).slice(0, 10) : '—',
    competitionName: d.competitionName || '—',
  }))
})
