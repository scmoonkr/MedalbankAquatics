// GET /api/backend/images — imagesAiden 목록
// filter: competitionID, style, name
export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {}
  const competitionID = Number(q.competitionID)
  if (Number.isFinite(competitionID) && competitionID > 0) match.competitionID = competitionID
  if (q.style) match.style = String(q.style)
  if (q.name)  match.name  = { $regex: safeRegex(q.name), $options: 'i' }

  const docs = await db
    .collection('imagesAiden')
    .find(match)
    .sort({ imageID: 1 })
    .limit(2000)
    .toArray()

  return docs.map(d => ({
    id:              String(d._id),
    imageID:         d.imageID ?? 0,
    competitionID:   d.competitionID   ?? 0,
    competitionName: d.competitionName || '',
    style:           d.style   || '',
    name:            d.name    || '',
    url:             d.url     || '',
    medium:          d.medium  || d.url || '',
    thumb:           d.thumb   || d.url || '',
    width:           d.width   ?? 0,
    height:          d.height  ?? 0,
    size:            d.size    ?? 0,
  }))
})
