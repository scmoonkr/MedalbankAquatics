// POST /api/backend/competitions/:id/times-parse
// Multipart times Excel upload → parse (in memory) → preview rows with dup/flag info.
import { ObjectId } from 'mongodb'
import { readMultipartFormData } from 'h3'
import { extname } from 'node:path'
import { parseTimesWorkbook, buildCtx, type ParsedRow } from '~/server/utils/importTimes'
import { buildPreview, type PreviewRow } from '~/server/utils/timesPreview'

const ALLOWED_EXT = new Set(['.xlsx', '.xls'])
const MAX_BYTES   = 30 * 1024 * 1024  // 30 MB

export type { PreviewRow }

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  let oid: ObjectId
  try { oid = new ObjectId(id) } catch { throw createError({ statusCode: 400, statusMessage: '잘못된 id' }) }

  const db   = await getDb()
  const comp = await db.collection('competitions').findOne({ _id: oid })
  if (!comp) throw createError({ statusCode: 404, statusMessage: '대회를 찾을 수 없습니다.' })

  const parts = await readMultipartFormData(event)
  const part  = parts?.find(p => p.name === 'file')
  if (!part?.filename) throw createError({ statusCode: 400, statusMessage: '파일이 없습니다.' })

  const ext = extname(part.filename).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) throw createError({ statusCode: 400, statusMessage: '허용되지 않는 파일 형식입니다. (.xlsx, .xls)' })
  if (part.data.byteLength > MAX_BYTES) throw createError({ statusCode: 400, statusMessage: '파일 크기는 30MB 이하여야 합니다.' })

  const ctx = buildCtx(comp)

  let parsed: ParsedRow[]
  try {
    parsed = parseTimesWorkbook(Buffer.from(part.data), ctx)
  } catch (e: any) {
    throw createError({ statusCode: 422, statusMessage: `엑셀 파싱 실패: ${e?.message ?? e}` })
  }

  const { rows, summary } = await buildPreview(db, ctx, parsed)

  return { ok: true, competition: ctx, rows, summary }
})
