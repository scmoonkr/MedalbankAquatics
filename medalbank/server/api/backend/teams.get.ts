// GET /api/backend/teams
// filter: name (regex — name/nameKor/names/indexes 대상)
export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = { teamID: { $ne: 0 } }
  if (q.name) {
    const safe = safeRegex(q.name)
    match.$or = [
      { name:    { $regex: safe, $options: 'i' } },
      { nameKor: { $regex: safe, $options: 'i' } },
      { names:   { $regex: safe, $options: 'i' } },
      { indexes: { $regex: safe, $options: 'i' } },
    ]
  }

  const docs = await db
    .collection('teams')
    .find(match)
    .sort({ name: 1 })
    .limit(500)
    .toArray()

  return docs.map(d => ({
    id:       String(d._id),
    teamID:   d.teamID ?? 0,
    name:     d.name     || '',
    nameKor:  d.nameKor  || '',
    teamCode: d.teamCode || '',
    names:    Array.isArray(d.names) ? d.names : [],
    sido:     d.sido     || '',
  }))
})
