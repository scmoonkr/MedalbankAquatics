// POST /api/backend/teams — teamID 는 max+1 채번
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id: _1, _id: _2, teamID: _3, ...doc } = body
  const name = String(doc.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: '팀명은 필수입니다.' })

  const db = await getDb()
  const teamID = await nextSeq(db, 'teams', 'teamID')
  const names  = Array.isArray(doc.names) && doc.names.length ? doc.names : [name]
  await db.collection('teams').insertOne({ ...doc, teamID, names, indexes: names, createdAt: new Date() })
  return { ok: true, teamID }
})
