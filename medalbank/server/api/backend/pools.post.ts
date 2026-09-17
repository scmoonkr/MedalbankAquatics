// POST /api/backend/pools — poolID 는 max+1 채번
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id: _1, _id: _2, poolID: _3, ...doc } = body
  if (!String(doc.pool ?? '').trim()) throw createError({ statusCode: 400, statusMessage: '수영장명은 필수입니다.' })

  const db = await getDb()
  const poolID = await nextSeq(db, 'pools', 'poolID')
  await db.collection('pools').insertOne({ ...doc, poolID, createdAt: new Date() })
  return { ok: true, poolID }
})
