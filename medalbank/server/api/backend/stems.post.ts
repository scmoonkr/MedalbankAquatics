// POST /api/backend/stems — stemID 는 max+1 채번
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id: _1, _id: _2, stemID: _3, competitions: _4, ...doc } = body
  if (!String(doc.stem ?? '').trim()) throw createError({ statusCode: 400, statusMessage: 'stem 은 필수입니다.' })

  const db = await getDb()
  const stemID = await nextSeq(db, 'stems', 'stemID')
  await db.collection('stems').insertOne({ ...doc, stemID, createdAt: new Date() })
  return { ok: true, stemID }
})
