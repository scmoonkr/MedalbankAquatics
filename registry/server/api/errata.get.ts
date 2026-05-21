// GET /api/errata  — errata list, cached 30 seconds
export default defineCachedEventHandler(async () => {
  const db   = await getDb()
  const docs = await db.collection('errata').find({}).sort({ no: 1 }).toArray()
  return docs.map(d => ({
    no:          d.no,
    category:    d.category    || '',
    time:        d.time        || {},
    reporter:    d.reporter    || '—',
    report_date: d.report_date || '—',
    magazine:    d.magazine    || '—',
  }))
}, {
  maxAge: 30,
  name:   'ksr-errata',
  getKey: () => 'all',
})
