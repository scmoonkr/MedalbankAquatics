// GET /api/backend/pools
// filter: name (regex — pool/names 대상), sido, course
export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {}
  if (q.name) {
    const safe = safeRegex(q.name)
    match.$or = [
      { pool:  { $regex: safe, $options: 'i' } },
      { name:  { $regex: safe, $options: 'i' } },
      { names: { $regex: safe, $options: 'i' } },
    ]
  }
  if (q.sido)   match.sido   = String(q.sido)
  if (q.course) match.course = String(q.course)

  const docs = await db
    .collection('pools')
    .find(match)
    .sort({ pool: 1 })
    .limit(500)
    .toArray()

  return docs.map(d => ({
    id:           String(d._id),
    poolID:       d.poolID ?? 0,
    // 이 컬렉션의 수영장명 필드는 pool 이다. name 이 있는 문서도 있어 둘 다 받는다.
    pool:         d.pool || d.name || '',
    names:        Array.isArray(d.names) ? d.names : [],
    sido:         d.sido         || '',
    course:       d.course       || '',
    lane:         d.lane         || '',
    depthDeepEnd: d.depthDeepEnd || '',
  }))
})
