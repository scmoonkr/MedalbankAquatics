// GET /api/backend/competitions/:id/times
// 이미 mergedTimes 에 등재된 이 대회의 기록을 times-parse 미리보기와 같은 모양으로 돌려준다.
// timesImport 화면의 "load from DB" 가 같은 테이블로 렌더하기 위한 것이라 읽기 전용이다.
import { ObjectId } from 'mongodb'
import { buildCtx } from '~/server/utils/importTimes'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  let oid: ObjectId
  try { oid = new ObjectId(id) } catch { throw createError({ statusCode: 400, statusMessage: '잘못된 id' }) }

  const db   = await getDb()
  const comp = await db.collection('competitions').findOne({ _id: oid })
  if (!comp) throw createError({ statusCode: 404, statusMessage: '대회를 찾을 수 없습니다.' })

  const ctx = buildCtx(comp)

  const docs = await db
    .collection('mergedTimes')
    .find({ competitionID: ctx.competitionID })
    .sort({ discipline: 1, distance: 1, rank: 1 })
    .limit(20000)
    .toArray()

  const rows = docs.map((d, i) => ({
    rowKey:     `db:${String(d._id)}`,
    timeID:     d.timeID ?? null,
    name:       d.name       || '',
    names:      Array.isArray(d.names) ? d.names : [],
    gender:     d.gender     || '',
    discipline: d.discipline || '',
    distance:   d.distance   || '',
    course:     d.course     || ctx.course,
    time:       d.time       || '',
    timeStamp:  d.timeStamp  ?? 0,
    waPoints:   d.waPoints   ?? 0,
    status:     d.status     || '',
    rank:       d.rank       ?? null,
    ageGroup:   d.ageGroup   || '',
    group:      d.group      || '',
    isMasters:  d.isMasters  ?? ctx.isMasters,
    isAdult:    d.isAdult    ?? true,
    team:       d.team       || '',
    round:      d.round      || '',
    heat:       d.heat       || '',
    sheet:      'DB',
    flags:      [] as string[],
    dup:        'db' as const,   // 이미 DB 에 있으므로 다시 등재 대상이 아니다
    insertable: false,
  }))

  return {
    ok: true,
    competition: ctx,
    rows,
    summary: {
      total:           rows.length,
      insertable:      0,
      duplicateInDb:   rows.length,
      duplicateInFile: 0,
      flagged:         0,
      sheets:          ['DB'],
    },
  }
})
