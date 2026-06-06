// GET /api/time/:id  — timeID(순번)로 mergedTimes 레코드 한 건 조회
const GENDER_MAP: Record<string, string> = { men: 'M', women: 'W' }

export default defineEventHandler(async (event) => {
  const id  = parseInt(getRouterParam(event, 'id') ?? '')
  if (!id) throw createError({ statusCode: 400, message: 'invalid id' })

  const db  = await getDb()
  const doc = await db.collection('mergedTimes').findOne({ $or: [{ timeID: id }, { tid: id }] })
  if (!doc) throw createError({ statusCode: 404, message: 'not found' })

  return {
    timeID:   doc.timeID,
    gender:   GENDER_MAP[doc.gender] ?? doc.gender ?? 'M',
    stroke:   doc.discipline ?? '',
    distance: parseInt(String(doc.distance ?? '0')) || 0,
    course:   doc.course ?? 'LCM',
    time:     doc.time ?? '',
    athlete:  doc.name ?? '',
    datetime: doc.datetime ? String(doc.datetime).slice(0, 10) : '',
    meet:     doc.competitionName ?? '',
  }
})
