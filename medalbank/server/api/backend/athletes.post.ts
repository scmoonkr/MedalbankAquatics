// POST /api/backend/athletes — athleteID 는 max+1 채번
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id: _1, _id: _2, athleteID: _3, ...doc } = body
  if (!String(doc.name ?? '').trim()) throw createError({ statusCode: 400, statusMessage: '선수명은 필수입니다.' })

  const db = await getDb()
  const athleteID = await nextSeq(db, 'athletes', 'athleteID')
  await db.collection('athletes').insertOne({ ...doc, athleteID, createdAt: new Date() })
  return { ok: true, athleteID }
})
