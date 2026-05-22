// GET /api/backend/errata — errata list for admin, newest first.
// Accepts filter query params (category, gender, discipline, name) so the
// page can re-query when filters change.
export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const match: Record<string, unknown> = {}
  if (q.category)   match.category            = String(q.category)
  if (q.gender)     match['time.gender']      = String(q.gender)
  if (q.discipline) match['time.discipline']  = String(q.discipline)
  if (q.name) {
    const safe = String(q.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    match['time.name'] = { $regex: safe, $options: 'i' }
  }

  const db   = await getDb()
  const docs = await db.collection('errata').find(match).sort({ no: -1 }).toArray()

  return docs.map(d => ({
    id:          String(d._id),
    no:          d.no ?? null,
    category:    d.category    || '',
    time:        d.time        || {},
    reporter:    d.reporter    || '',
    report_date: d.report_date || '',
    magazine:    d.magazine    || '',
  }))
})
