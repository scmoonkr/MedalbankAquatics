// POST /api/backend/competitions/:id/times-parse
// Multipart times Excel upload → parse (in memory) → preview rows with dup/flag info.
import { ObjectId } from 'mongodb'
import { readMultipartFormData } from 'h3'
import { extname } from 'node:path'
import { parseTimesWorkbook, buildCtx, dedupKey, isDedupable, type ParsedRow } from '~/server/utils/importTimes'

const ALLOWED_EXT = new Set(['.xlsx', '.xls'])
const MAX_BYTES   = 30 * 1024 * 1024  // 30 MB
const DISTANCES   = new Set(['25M', '50M', '100M', '200M', '400M', '800M', '1500M'])

type RowFlag =
  | 'unmapped-style' | 'unmapped-distance' | 'no-basetime' | 'no-name'

export interface PreviewRow extends ParsedRow {
  rowKey:     string
  flags:      RowFlag[]
  dup:        'none' | 'file' | 'db'
  insertable: boolean
}

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

  // ── DB duplicate lookup — scoped to THIS competition ─────────
  const names = [...new Set(parsed.map(r => r.name).filter(Boolean))]
  const dbKeys = new Set<string>()
  if (names.length) {
    const existing = await db.collection('mergedTimes')
      .find(
        { competitionID: ctx.competitionID, name: { $in: names } },
        { projection: { _id: 0, competitionID: 1, name: 1, gender: 1, isMasters: 1, discipline: 1, course: 1, distance: 1, time: 1, heat: 1, round: 1, rank: 1 } },
      )
      .toArray()
    for (const d of existing) if (isDedupable(d as any)) dbKeys.add(dedupKey(d as any))
  }

  // ── per-row flags / dup / insertable ─────────────────────────
  const fileKeys = new Set<string>()
  const sheets = new Set<string>()
  const rows: PreviewRow[] = parsed.map((r, i) => {
    sheets.add(r.sheet)
    const hasEvent = !!r.name && !!r.discipline && DISTANCES.has(r.distance)
    const flags: RowFlag[] = []
    if (!r.name) flags.push('no-name')
    if (!r.discipline) flags.push('unmapped-style')
    if (!DISTANCES.has(r.distance)) flags.push('unmapped-distance')
    // no-basetime only matters for a scored individual time — not DNS/DQ rows or relays (FRR/MR never score)
    if (!r.status && r.discipline && r.time && DISTANCES.has(r.distance) && r.waPoints === 0 && !['FRR', 'MR'].includes(r.discipline))
      flags.push('no-basetime')

    const key = dedupKey({ competitionID: ctx.competitionID, ...r })
    let dup: PreviewRow['dup'] = 'none'
    // dedup only when heat/round/rank are all present (empty = distinct, always kept).
    // empty time = DNS placeholder → never a file-duplicate (multiple DNS rows are kept, saved as DNS)
    if (isDedupable(r)) {
      if (dbKeys.has(key)) dup = 'db'
      else if (r.time && fileKeys.has(key)) dup = 'file'
      else if (r.time) fileKeys.add(key)
    }

    // DNS/status rows are recorded too (empty time + status); only need a valid event + no dup
    const insertable = hasEvent && dup === 'none'

    return { ...r, rowKey: `${r.sheet}:${i}`, flags, dup, insertable }
  })

  return {
    ok: true,
    competition: ctx,
    rows,
    summary: {
      total:           rows.length,
      insertable:      rows.filter(r => r.insertable).length,
      duplicateInDb:   rows.filter(r => r.dup === 'db').length,
      duplicateInFile: rows.filter(r => r.dup === 'file').length,
      flagged:         rows.filter(r => !r.insertable && r.dup === 'none').length,
      sheets:          [...sheets],
    },
  }
})
