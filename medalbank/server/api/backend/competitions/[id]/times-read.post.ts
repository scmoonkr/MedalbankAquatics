// POST /api/backend/competitions/:id/times-read
// 서버에 이미 올라가 있는 기록지 엑셀을 읽어 미리보기를 만든다 (원본 timesImport 의 Read).
// mediaServer 컬렉션에서 { category:'times', type:'times', id:<competitionID> } 를 찾아
// <timesDir><path>/<id>.<ext> 파일을 연다.
import { ObjectId } from 'mongodb'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseTimesWorkbook, buildCtx, type ParsedRow } from '~/server/utils/importTimes'
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
  const cid = String(ctx.competitionID)

  const media = await db.collection('mediaServer').findOne({ category: 'times', type: 'times', id: cid })
  if (!media?.path || !media?.ext) {
    throw createError({
      statusCode: 404,
      statusMessage: `cid ${cid} 로 업로드된 기록지가 없습니다. Upload.xls 로 먼저 올리세요.`,
    })
  }

  const baseDir  = useRuntimeConfig().timesDir as string
  const filename = join(baseDir, media.path, `${media.id}.${media.ext}`)

  let buf: Buffer
  try {
    buf = await readFile(filename)
  } catch {
    throw createError({ statusCode: 404, statusMessage: `기록지 파일을 찾을 수 없습니다: ${filename}` })
  }

  let parsed: ParsedRow[]
  try {
    parsed = parseTimesWorkbook(buf, ctx)
  } catch (e: any) {
    throw createError({ statusCode: 422, statusMessage: `엑셀 파싱 실패: ${e?.message ?? e}` })
  }

  const { rows, summary } = await buildPreview(db, ctx, parsed)

  return { ok: true, competition: ctx, rows, summary, file: media.name || `${media.id}.${media.ext}` }
})
