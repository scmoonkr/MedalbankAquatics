// GET /api/backend/pools
// filter: name (regex — pool/names 대상), sido, course
export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {}
  if (q.name) {
    const safe = safeRegex(q.name)
    match.$or = [
      { pool:     { $regex: safe, $options: 'i' } },
      { poolname: { $regex: safe, $options: 'i' } },
      { fullname: { $regex: safe, $options: 'i' } },
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

  return docs.map(d => {
    const pi = d.poolInfo || {}
    return {
      id:         String(d._id),
      poolD:      d.poolD ?? 0,
      pool:       d.pool || d.fullname || '',
      poolname:   d.poolname   || '',
      fullname:   d.fullname   || '',
      sido:       d.sido       || '',
      course:     d.course     || '',
      addressDRM: d.addressDRM || '',
      phone:      d.phone      || '',
      website:    d.website    || '',
      notes:      d.notes      || '',
      poolInfo: {
        lengths:         pi.lengths         ?? '',
        lengthUnit:      pi.lengthUnit      ?? '',
        lanes:           pi.lanes           ?? '',
        depthShallowEnd: pi.depthShallowEnd ?? '',
        depthDeepEnd:    pi.depthDeepEnd    ?? '',
        depthUnit:       pi.depthUnit       ?? '',
      },
    }
  })
})
