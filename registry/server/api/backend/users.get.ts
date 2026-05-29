// GET /api/backend/users
// filter: name (regex), role
export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {}
  if (q.name) {
    const safe = String(q.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    match.$or = [
      { name:     { $regex: safe, $options: 'i' } },
      { nickname: { $regex: safe, $options: 'i' } },
      { email:    { $regex: safe, $options: 'i' } },
    ]
  }
  if (q.role) match.role = String(q.role)

  const docs = await db
    .collection('users')
    .find(match)
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray()

  return docs.map(d => ({
    id:        String(d._id),
    naverId:   d.naverId   || '',
    name:      d.name      || '',
    nickname:  d.nickname  || '',
    email:     d.email     || '',
    mobile:    d.mobile    || '',
    gender:    d.gender    || '',
    role:      d.role      || 'member',
    avatar:    d.avatar    || '',
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString().slice(0, 10) : '',
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString().slice(0, 10) : '',
  }))
})
