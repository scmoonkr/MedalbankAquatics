// GET /api/backend/logs?type=pageview&page=1
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event) as any
  if (!session?.user) throw createError({ statusCode: 401 })

  const q = getQuery(event)
  const type  = String(q.type  || '')
  const page  = Math.max(1, Number(q.page) || 1)
  const limit = 100

  const db = await getDb()
  const filter = type ? { type } : {}

  const [rows, total] = await Promise.all([
    db.collection('logs')
      .find(filter)
      .sort({ time: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection('logs').countDocuments(filter),
  ])

  return {
    rows: rows.map(r => ({
      id:     String(r._id),
      type:   r.type   ?? '',
      time:   r.time   ? (r.time as Date).toISOString() : '',
      path:   r.path   ?? null,
      query:  r.query  ?? null,
      userId: r.userId ?? null,
      name:   r.name   ?? null,
      email:  r.email  ?? null,
      category:   r.category   ?? null,
      discipline: r.discipline ?? null,
      distance:   r.distance   ?? null,
      course:     r.course     ?? null,
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
})
