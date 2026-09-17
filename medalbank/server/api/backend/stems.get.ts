// GET /api/backend/stems
// filter: stem (regex). competitions 는 stemID 로 묶인 대회명 목록.
export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {}
  if (q.stem) match.stem = { $regex: safeRegex(q.stem), $options: 'i' }

  const docs = await db
    .collection('stems')
    .aggregate([
      { $match: match },
      { $sort: { stem: 1 } },
      { $limit: 500 },
      { $lookup: {
          from:         'competitions',
          localField:   'stemID',
          foreignField: 'stemID',
          as:           'comps',
          pipeline:     [{ $project: { _id: 0, competitionName: 1 } }],
      } },
    ])
    .toArray()

  return docs.map(d => ({
    id:           String(d._id),
    stemID:       d.stemID ?? 0,
    stem:         d.stem   || '',
    competitions: (d.comps ?? []).map((c: any) => c.competitionName).filter(Boolean),
  }))
})
