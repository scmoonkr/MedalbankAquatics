// GET /api/search?name=문성태  또는  ?name=문성태,문성중
export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const param  = String(q.name || '').trim()
  if (!param) return []

  const names = [...new Set(param.split(',').map(n => n.trim()).filter(Boolean))]
  if (!names.length) return []

  const db   = await getDb()
  const docs = await db.collection('mergedTimes')
    .find({ name: { $in: names } })
    .sort({ timeStamp: 1 })
    .toArray()

  return docs.map(d => ({
    id:              String(d._id),
    name:            d.name            ?? '',
    gender:          d.gender          ?? '',
    discipline:      d.discipline      ?? '',
    distance:        d.distance        ?? '',
    course:          d.course          ?? 'LCM',
    time:            d.time            ?? '',
    timeStamp:       d.timeStamp       ?? null,
    rank:            d.rank            ?? null,
    sido:            d.sido            ?? '',
    team:            d.team            ?? '',
    datetime:        d.datetime        ?? '',
    competitionName: d.competitionName ?? '',
    pool:            d.pool            ?? '',
  }))
})
