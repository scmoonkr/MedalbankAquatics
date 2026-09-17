// 엑셀 파싱 결과에 중복/플래그 판정을 붙여 미리보기 행을 만든다.
// times-parse(업로드한 파일)와 times-read(서버에 저장된 파일)가 같은 규칙을 쓰도록 여기로 모았다.
import type { Db } from 'mongodb'
import { dedupKey, isDedupable, type CompetitionCtx, type ParsedRow } from '~/server/utils/importTimes'

const DISTANCES = new Set(['25M', '50M', '100M', '200M', '400M', '800M', '1500M'])

export type RowFlag = 'unmapped-style' | 'unmapped-distance' | 'no-basetime' | 'no-name'

export interface PreviewRow extends ParsedRow {
  rowKey:     string
  flags:      RowFlag[]
  dup:        'none' | 'file' | 'db'
  insertable: boolean
}

export interface PreviewSummary {
  total: number; insertable: number; duplicateInDb: number
  duplicateInFile: number; flagged: number; sheets: string[]
}

export async function buildPreview(
  db: Db,
  ctx: CompetitionCtx,
  parsed: ParsedRow[],
): Promise<{ rows: PreviewRow[]; summary: PreviewSummary }> {
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
}
