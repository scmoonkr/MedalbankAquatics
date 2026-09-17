// POST /api/backend/teams/merge
// body: { teamID, teamIDs[] } — teamIDs 의 별칭을 teamID 팀으로 흡수하고,
// mergedTimes 의 teamID/team 을 대상 팀으로 갱신한 뒤 흡수된 팀 문서를 지운다.
export default defineEventHandler(async (event) => {
  const body     = await readBody<{ teamID?: number; teamIDs?: number[] }>(event)
  const targetID = Number(body?.teamID)
  const sourceIDs = (body?.teamIDs ?? []).map(Number).filter(n => Number.isFinite(n) && n !== targetID)

  if (!Number.isFinite(targetID) || targetID === 0) throw createError({ statusCode: 400, statusMessage: '대상 teamID 가 필요합니다.' })
  if (!sourceIDs.length) throw createError({ statusCode: 400, statusMessage: '병합할 팀을 2개 이상 선택하세요.' })

  const db     = await getDb()
  const teams  = db.collection('teams')
  const target = await teams.findOne({ teamID: targetID })
  if (!target) throw createError({ statusCode: 404, statusMessage: '대상 팀을 찾을 수 없습니다.' })

  const sources = await teams.find({ teamID: { $in: sourceIDs } }).toArray()
  if (!sources.length) throw createError({ statusCode: 404, statusMessage: '병합할 팀을 찾을 수 없습니다.' })

  // 별칭 합치기 (중복 제거)
  const names = new Set<string>([
    ...(Array.isArray(target.names) ? target.names : []),
    String(target.name || ''),
  ])
  for (const s of sources) {
    names.add(String(s.name || ''))
    for (const n of (Array.isArray(s.names) ? s.names : [])) names.add(String(n))
  }
  names.delete('')
  const merged = [...names]

  await teams.updateOne(
    { _id: target._id },
    { $set: { names: merged, indexes: merged, updatedAt: new Date() } },
  )

  const times = await db.collection('mergedTimes').updateMany(
    { teamID: { $in: sourceIDs } },
    { $set: { teamID: targetID, team: target.name || '' } },
  )

  await teams.deleteMany({ teamID: { $in: sourceIDs } })

  return { ok: true, mergedTeams: sources.length, updatedTimes: times.modifiedCount, names: merged }
})
