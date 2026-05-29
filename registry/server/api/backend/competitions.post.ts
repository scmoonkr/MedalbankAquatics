// POST /api/backend/competitions — insert new competition
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDb()

  // competitionID 자동 채번 (입력 없는 경우)
  let competitionID = body.competitionID ? Number(body.competitionID) : null
  if (!competitionID) {
    const maxDoc = await db
      .collection('competitions')
      .findOne({}, { sort: { competitionID: -1 }, projection: { competitionID: 1 } })
    competitionID = ((maxDoc?.competitionID as number) ?? 0) + 1
  }

  const { id, _id, ...rest } = body
  const doc = { ...rest, competitionID }
  const result = await db.collection('competitions').insertOne(doc)
  return { ok: true, id: String(result.insertedId), competitionID }
})
