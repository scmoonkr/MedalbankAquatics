// POST /api/backend/competitions/:id/times-read
// Upload.xls 로 timesImport 스테이징 컬렉션에 저장해 둔 이 대회의 파싱 결과를 다시 읽어
// 미리보기를 만든다 (원본 timesImport 의 Read). 파일시스템을 읽지 않는다.
import { ObjectId } from 'mongodb'
import { buildCtx, type ParsedRow } from '~/server/utils/importTimes'
import { buildPreview } from '~/server/utils/timesPreview'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  let oid: ObjectId
  try { oid = new ObjectId(id) } catch { throw createError({ statusCode: 400, statusMessage: '잘못된 id' }) }

  const db   = await getDb()
  const comp = await db.collection('competitions').findOne({ _id: oid })
  if (!comp) throw createError({ statusCode: 404, statusMessage: '대회를 찾을 수 없습니다.' })

  const ctx = buildCtx(comp)
  const cid = ctx.competitionID

  const docs = await db.collection('timesImport')
    .find({ competitionID: cid })
    .sort({ _id: 1 })   // 업로드(insertMany) 순서 유지
    .toArray()

  if (!docs.length) {
    throw createError({
      statusCode: 404,
      statusMessage: `cid ${cid} 로 저장된 기록지가 없습니다. Upload.xls 로 먼저 올리세요.`,
    })
  }

  // 저장 시 붙였던 _id / competitionID 를 떼어내 ParsedRow 형태로 되돌린다.
  const parsed: ParsedRow[] = docs.map(({ _id, competitionID, ...row }) => row as ParsedRow)

  const { rows, summary } = await buildPreview(db, ctx, parsed)

  return { ok: true, competition: ctx, rows, summary, file: `timesImport · ${docs.length}건` }
})
