// POST /api/backend/images — ImgBB 업로드 결과 메타를 imagesAiden 에 등록
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const competitionID = Number(body?.competitionID)
  if (!Number.isFinite(competitionID) || competitionID <= 0)
    throw createError({ statusCode: 400, statusMessage: '대회를 선택하세요.' })
  if (!body?.url) throw createError({ statusCode: 400, statusMessage: '이미지 url 이 없습니다.' })

  const db = await getDb()
  const imageID = await nextSeq(db, 'imagesAiden', 'imageID')

  await db.collection('imagesAiden').insertOne({
    imageID,
    competitionID,
    competitionName: String(body.competitionName || ''),
    style:           String(body.style   || ''),
    name:            String(body.name    || ''),
    imgbbID:         String(body.imgbbID || ''),
    hash:            String(body.hash    || ''),
    url:             String(body.url),
    medium:          String(body.medium  || body.url),
    thumb:           String(body.thumb   || body.url),
    width:           Number(body.width)  || 0,
    height:          Number(body.height) || 0,
    size:            Number(body.size)   || 0,
    created:         new Date(),
  })

  return { ok: true, imageID }
})
