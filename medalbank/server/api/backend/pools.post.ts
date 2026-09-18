// POST /api/backend/pools — poolD 는 max+1 채번
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id: _1, _id: _2, poolD: _3, ...doc } = body
  if (!String(doc.pool ?? '').trim()) throw createError({ statusCode: 400, statusMessage: '수영장명은 필수입니다.' })

  const db = await getDb()
  const poolD = await nextSeq(db, 'pools', 'poolD')
  await db.collection('pools').insertOne({ ...doc, poolD, createdAt: new Date() })
  return { ok: true, poolD }
})
