// server/utils/importTimes.ts
// Times Excel parser/normalizer — ported from the legacy Express service
//   c:\develop\node\medalbank\routes\MSKR\Services\importTimes\
//   (readDAO.read → excelDAO.readTimesFromExcelORG → customizingTimesORG)
// Pure functions (no DB / no fs). Maps parsed rows to the mergedTimes schema.
import * as XLSX from 'xlsx'
import { getBasetime, calcWAPoints } from '~/server/utils/wapoints'

// ─────────────────────────────────────────────────────────────
// constants (ported from utilTimes.js)
// ─────────────────────────────────────────────────────────────
// Korean style label → legacy English style name
const STYLE_TABLE: { label: string; style: string }[] = [
  { label: '자유형',      style: 'freestyle' },
  { label: '배영',        style: 'backstroke' },
  { label: '평영',        style: 'breaststroke' },
  { label: '접영',        style: 'butterfly' },
  { label: '개인혼영',    style: 'individualMedley' },
  { label: '혼성계영',    style: 'freestyleRelay' },
  { label: '혼성혼계영',  style: 'medleyRelay' },
  { label: '혼계영',      style: 'medleyRelay' },
  { label: '계영',        style: 'freestyleRelay' },
]
// mergedTimes discipline codes ('' = unmapped). FRR=계영, MR=혼계영.
export type Discipline = '' | 'FR' | 'BA' | 'BR' | 'FL' | 'IM' | 'FRR' | 'MR'

// legacy English style name → new mergedTimes discipline code
const STYLE_TO_DISCIPLINE: Record<string, Discipline> = {
  freestyle:        'FR',
  backstroke:       'BA',
  breaststroke:     'BR',
  butterfly:        'FL',
  individualMedley: 'IM',
  freestyleRelay:   'FRR',  // 계영
  medleyRelay:      'MR',   // 혼계영
}

const STYLES    = ['접영', '배영', '평영', '자유형', '개인혼영', '혼성혼계영', '혼성계영', '혼계영', '계영']
const DISTANCES = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M']
const ROUNDS    = ['준결승', '결승', '예선', '기록회', '타임레이스']
const JUNIORS   = ['유아', '유치', '유년', '초등', '남초', '여초', '저학년', '고학년', '어린이', '중등', '중학', '중고등', '고등', '학생']
const DNS_TOKENS = ['DQ', 'DSQ', 'DNS', 'NT', '불참', '실격', '포기', '번외']
// canonical status values: DNS | DQ | 번외 (everything else maps into these)
const STATUS_MAP: Record<string, string> = {
  DNS: 'DNS', NT: 'DNS', '불참': 'DNS', '포기': 'DNS',
  DQ: 'DQ', DSQ: 'DQ', '실격': 'DQ',
  '번외': '번외',
}

// generic-sheet header alias → canonical field (ported from utilTimes.headers)
const HEADER_ALIASES: { aliases: string[]; name: string }[] = [
  { aliases: ['No', 'NO', 'no', '번호', '순서', '#'],                 name: 'no' },
  { aliases: ['Name', 'NAME', 'name', '이름', '성명', '선수명', '선수'], name: 'name' },
  { aliases: ['Lane', 'LANE', 'lane', '레인', '게임'],               name: 'lane' },
  { aliases: ['age', '나이', '연령대', '종별'],                      name: 'age' },
  { aliases: ['시도', '시군구', '시·도', '장소'],                    name: 'province' },
  { aliases: ['Team', 'TEAM', 'team', '팀명', '소속', '소속팀', '클럽명'], name: 'team' },
  { aliases: ['Rank', 'RANK', 'rank', '순위', '등위'],               name: 'rank' },
  { aliases: ['Times', 'TIMES', 'times', '기록', 'M. LAP'],          name: 'times' },
  { aliases: ['Remarks', 'REMARKS', 'remarks', '비고', '사유'],       name: 'remarks' },
  { aliases: ['라운드'],                                             name: 'round' },
  { aliases: ['구분'],                                               name: 'category' },
  { aliases: ['종목', '영법'],                                       name: 'style' },
  { aliases: ['그룹'],                                               name: 'ageGroup' },
  { aliases: ['성별'],                                               name: 'gender' },
  { aliases: ['거리'],                                               name: 'distance' },
  { aliases: ['경기번호', '조'],                                     name: 'heat' },
  { aliases: ['학교', '학교명'],                                     name: 'school' },
  { aliases: ['날짜'],                                               name: 'datetime' },
]
// "완성" format header → field (ported from _completeTimesHeaders)
const COMPLETE_HEADERS: Record<string, string> = {
  '순서': 'no', 'heatCode': 'heatCode', 'category': 'category', 'school': 'school',
  '연령대': 'ageGroup', '성별': 'gender', '영법': 'style', '거리': 'distance',
  '라운드': 'round', '날짜': 'datetime', '조': 'heat', '레인': 'lane', '선수': 'name',
  '나이': 'age', '출생연도': 'dob', '시도': 'province', '소속': 'team', '순위': 'rank',
  '기록': 'times', '비고': 'remarks', '단체': 'team',
  '선수_1': 'name1', '나이_1': 'age1', '선수_2': 'name2', '나이_2': 'age2',
  '선수_3': 'name3', '나이_3': 'age3',
}

export interface CompetitionCtx {
  competitionID:   number | null
  competitionName: string
  datetime:        string
  pool:            string
  poolID:          number | null
  sido:            string
  course:          'LCM' | 'SCM'
  isMasters:       boolean
}

// Build the injected competition context from a competitions doc.
export function buildCtx(comp: Record<string, any>): CompetitionCtx {
  return {
    competitionID:   comp.competitionID ?? null,
    competitionName: comp.competitionName || '',
    datetime:        comp.datetime ? String(comp.datetime).slice(0, 10) : '',
    pool:            comp.pool || '',
    poolID:          comp.poolID ?? null,
    sido:            comp.sido || '',
    course:          (comp.course === 'SCM' ? 'SCM' : 'LCM'),
    isMasters:       !!comp.isMasters,
  }
}

// mergedTimes dedup key — scoped to the SAME competition (re-importing the same
// meet is a duplicate; the same swimmer's same time at a DIFFERENT meet is not).
export function dedupKey(r: {
  competitionID: number | null; name: string; gender: string; isMasters: boolean
  discipline: string; course: string; distance: string; time: string
}): string {
  return `${r.competitionID}|${r.name}|${r.gender}|${r.isMasters}|${r.discipline}|${r.course}|${r.distance}|${r.time}`
}

export interface ParsedRow {
  sheet:         string
  name:          string
  names:         string[]
  gender:        'men' | 'women' | 'mixed' | ''
  discipline:    Discipline
  styleRaw:      string   // legacy English style (freestyle / medleyRelay …) for review
  disciplineRaw: string   // raw discipline header string, if any
  distance:      string   // '50M'
  course:        'LCM' | 'SCM'
  time:          string   // '00:26.99' | '' (DNS)
  timeSec:       number | null
  timeStamp:     number
  waPoints:      number
  rank:          number | null
  ageGroup:      string
  isMasters:     boolean
  isAdult:       boolean
  team:          string
  round:         string
  status:        string
}

// ─────────────────────────────────────────────────────────────
// time helpers
// ─────────────────────────────────────────────────────────────
// seconds → 'MM:SS.tt' (matches medalbank stored format, e.g. '00:26.99')
function secToTimeStr(sec: number): string {
  if (!sec || sec <= 0 || !isFinite(sec)) return ''
  const h  = Math.round(sec * 100)
  const mm = Math.floor(h / 6000)
  const ss = Math.floor((h % 6000) / 100)
  const tt = h % 100
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(tt).padStart(2, '0')}`
}

// string → 'MM:SS.tt' (ported from legacy customTimes — digit-extraction).
// Handles odd separators robustly: "0:27'83" → "00:27.83", "1:23.45" → "01:23.45",
// "3268" → "00:32.68", "26.9" → "00:26.90". The last 6 digits are read as mmsstt.
function normalizeTimeStr(raw: string): string {
  let s = String(raw).trim()
  if (!s) return ''
  // pad a single fractional part to 2 digits so "23.4" → "23.40" (not "23.04")
  const parts = s.split('.')
  if (parts.length > 1) { parts[1] = (parts[1] + '00').slice(0, 2); s = parts.join('.') }
  let digits = (s.match(/\d/g) || []).join('')
  if (!digits) return ''
  if (digits.length < 4) digits = (digits + '0000').slice(0, 4)  // short value → seconds.hundredths
  const str = '000000' + digits
  return `${str.slice(-6, -4)}:${str.slice(-4, -2)}.${str.slice(-2)}`
}

// raw cell (string or Excel number) → normalized time string
export function normalizeTime(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined || raw === '') return ''
  if (typeof raw === 'number') {
    if (!isFinite(raw)) return ''
    if (raw > 0 && raw < 1) return secToTimeStr(raw * 86400)  // Excel fractional-day time cell
    return normalizeTimeStr(String(raw))                       // seconds (26.99) or concat digits (4919)
  }
  return normalizeTimeStr(raw)
}

export function timeToSeconds(t: string): number | null {
  if (!t) return null
  const m = t.match(/^(?:(\d+):)?(\d{1,2})\.(\d{1,2})$/)
  if (!m) return null
  const mm = parseInt(m[1] || '0', 10)
  const ss = parseInt(m[2], 10)
  const tt = parseInt((m[3] + '0').slice(0, 2), 10)
  return mm * 60 + ss + tt / 100
}

// ─────────────────────────────────────────────────────────────
// field helpers
// ─────────────────────────────────────────────────────────────
export function checkGender(raw: unknown): 'men' | 'women' | 'mixed' | '' {
  if (raw === null || raw === undefined) return ''
  const s = String(raw).trim()
  if (!s) return ''
  const lower = s.toLowerCase()
  if (lower === 'men' || lower === 'women' || lower === 'mixed') return lower as any
  if (s.includes('혼성') || lower.includes('mixed')) return 'mixed'
  if (s.includes('남')) return 'men'
  if (s.includes('여')) return 'women'
  return ''
}

// Korean/English style → mergedTimes discipline code
export function styleToDiscipline(styleRaw: unknown): { discipline: Discipline; styleName: string } {
  if (!styleRaw) return { discipline: '', styleName: '' }
  let s = String(styleRaw).replace(/\s/g, '').replace(/핀|fin/gi, '')
  if (s in STYLE_TO_DISCIPLINE) return { discipline: STYLE_TO_DISCIPLINE[s], styleName: s }
  const ck = STYLE_TABLE.find(st => s.includes(st.label))
  if (ck) return { discipline: STYLE_TO_DISCIPLINE[ck.style], styleName: ck.style }
  return { discipline: '', styleName: '' }
}

function isJunior(ageGroup: string): boolean {
  const a = (ageGroup || '').replace(/\s/g, '')
  return JUNIORS.some(j => a.includes(j))
}

// parse a discipline header string ("남자 자유형 50M 결승") → parts (ported splitDiscipline)
export function splitDiscipline(input: string): {
  discipline: string; gender?: string; style?: string; distance?: string; round?: string; ageGroup?: string
} {
  const out: any = { discipline: String(input).replace(/\s{2,}/g, ' ').trim() }
  let s = String(input).replace('혼성', ' 혼성 ').replace(/\s{2,}/g, ' ').trim().toUpperCase()
  const tokens = s.split(/[\s,/]+/).filter(Boolean)
  const leftover: string[] = []
  for (const key of tokens) {
    const style = STYLES.find(el => key.includes(el))
    const dist  = DISTANCES.find(el => key.includes(el))
    const round = ROUNDS.find(el => key.includes(el))
    if (style)                                              out.style = style
    else if (dist)                                         out.distance = dist
    else if (round)                                        out.round = round
    else if (key.includes('혼성'))                          out.gender = '혼성'
    else if (key.includes('남') || key.includes('여'))      out.gender = key
    else                                                    leftover.push(key)
  }
  if (leftover.length) out.ageGroup = leftover.join(' ').trim()
  return out
}

// ─────────────────────────────────────────────────────────────
// workbook reading + per-sheet format expansion
// ─────────────────────────────────────────────────────────────
type RawRow = Record<string, any>

export function readWorkbook(buf: Buffer): Record<string, RawRow[]> {
  const wb = XLSX.read(buf, { type: 'buffer' })
  const out: Record<string, RawRow[]> = {}
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    if (!ws) continue
    const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { raw: true, defval: '' })
    for (const r of rows) r.sheet = name
    out[name] = rows
  }
  return out
}

function remapKeys(row: RawRow, headerMap: (key: string) => string | null): RawRow {
  const out: RawRow = { sheet: row.sheet }
  for (const [k, v] of Object.entries(row)) {
    if (k === 'sheet') continue
    const mapped = headerMap(k)
    out[mapped ?? k] = v
  }
  return out
}

function genericHeaderMap(key: string): string | null {
  const k = String(key).trim()
  for (const h of HEADER_ALIASES) {
    if (h.aliases.some(a => a.replace(/\s/g, '') === k.replace(/\s/g, ''))) return h.name
  }
  // relay columns name1/team1/times1 … pass through
  return null
}

// "완성" format (선수 column): inherit blank discipline fields from previous row
function expandComplete(rows: RawRow[]): RawRow[] {
  const mapped = rows.map(r => remapKeys(r, k => COMPLETE_HEADERS[String(k).trim()] ?? null))
  const out: RawRow[] = []
  const carry: RawRow = {}
  const INHERIT = ['no', 'ageGroup', 'gender', 'style', 'distance', 'round', 'datetime', 'heat']
  for (const row of mapped) {
    for (const f of INHERIT) row[f] = row[f] || carry[f] || ''
    // join relay athletes
    const names: string[] = []
    if (row.name)  names.push(String(row.name))
    if (row.name1) { names.push(String(row.name1)); delete row.name1 }
    if (row.name2) { names.push(String(row.name2)); delete row.name2 }
    if (row.name3) { names.push(String(row.name3)); delete row.name3 }
    row.name = names.join(',')
    for (const f of INHERIT) carry[f] = row[f]
    out.push(row)
  }
  return out
}

// generic format: remap headers, expand name1..name8 relay blocks, else one row each
function expandGeneric(rows: RawRow[]): RawRow[] {
  const out: RawRow[] = []
  for (const raw of rows) {
    const row = remapKeys(raw, genericHeaderMap)
    if (row.name1) {
      const head = String(row.name1).replace(/\s/g, '')
      if (['1위', '성명', '이름'].includes(head)) continue   // header row
      for (let no = 1; no <= 8; no++) {
        if (!row[`name${no}`]) continue
        const tm: RawRow = {
          sheet: row.sheet,
          name:  row[`name${no}`],
          team:  row[`team${no}`] ?? '',
          times: row[`times${no}`] ?? '',
          rank:  no,
        }
        for (const f of ['style', 'distance', 'gender', 'ageGroup', 'round', 'heat', 'status', 'province'])
          if (row[f]) tm[f] = row[f]
        out.push(tm)
      }
    } else {
      out.push(row)
    }
  }
  return out
}

function expandSheet(rows: RawRow[]): RawRow[] {
  if (!rows.length) return []
  if (rows[0]['선수'] !== undefined && rows[0]['선수'] !== '') return expandComplete(rows)
  return expandGeneric(rows)
}

// ─────────────────────────────────────────────────────────────
// status / header-row detection
// ─────────────────────────────────────────────────────────────
const HEADER_NAME_TOKENS = ['Name', 'NAME', 'name', '이름', '성명', '선수명', '선수']
const HEADER_TIME_TOKENS = ['Times', 'TIMES', 'times', '기록', 'M.LAP']

function isHeaderish(row: RawRow): boolean {
  const nm = String(row.name ?? '').replace(/\s/g, '')
  const tm = String(row.time ?? row.times ?? '').replace(/\s/g, '')
  if (nm && HEADER_NAME_TOKENS.map(t => t.replace(/\s/g, '')).includes(nm)) return true
  if (tm && HEADER_TIME_TOKENS.includes(tm)) return true
  return false
}

// detect a discipline section-header row (e.g. a merged cell "남자 자유형 50M")
function asDisciplineHeader(row: RawRow): ReturnType<typeof splitDiscipline> | null {
  for (const f of ['discipline', 'lane', 'style', 'name', 'ageGroup']) {
    const v = String(row[f] ?? '').trim()
    if (v.length < 5) continue
    const dsp = splitDiscipline(v)
    if (dsp.style && (dsp.distance || dsp.gender)) return dsp
  }
  return null
}

function applyStatus(row: RawRow): { status: string; rank: number | null } {
  let status = ''
  let rankRaw: any = row.rank
  const timeRaw = row.time ?? row.times
  const up = (v: any) => String(v ?? '').toUpperCase().trim()
  if (DNS_TOKENS.includes(up(timeRaw))) { status = up(timeRaw); row.time = ''; row.times = '' }
  else if (DNS_TOKENS.includes(up(rankRaw))) { status = up(rankRaw); rankRaw = '' }
  const remarks = up(row.remarks)
  if (!status && remarks) {
    const hit = DNS_TOKENS.find(t => remarks.includes(t))
    if (hit) status = hit
  }
  // normalize to canonical DNS | DQ | 번외
  status = STATUS_MAP[status] ?? status
  const rank = rankRaw !== '' && rankRaw != null && !isNaN(Number(rankRaw)) ? Number(rankRaw) : null
  return { status, rank }
}

// ─────────────────────────────────────────────────────────────
// derived fields (time / timeStamp / waPoints) — recomputed at confirm too
// ─────────────────────────────────────────────────────────────
export function computeDerived(opts: {
  time: string; gender: string; discipline: string; distance: string; course: string
}): { time: string; timeSec: number | null; timeStamp: number; waPoints: number } {
  const time    = opts.time || ''
  const timeSec = timeToSeconds(time)
  const timeStamp = timeSec ? timeSec / 86400 : 0
  let waPoints = 0
  if (timeSec && opts.discipline) {
    const basetime = getBasetime(opts.course, opts.gender, opts.discipline, opts.distance)
    if (basetime) waPoints = calcWAPoints(basetime, timeStamp)
  }
  return { time, timeSec, timeStamp, waPoints }
}

// ─────────────────────────────────────────────────────────────
// top-level pipeline
// ─────────────────────────────────────────────────────────────
export function parseTimesWorkbook(buf: Buffer, ctx: CompetitionCtx): ParsedRow[] {
  const sheets = readWorkbook(buf)
  const out: ParsedRow[] = []

  for (const sheetRows of Object.values(sheets)) {
    const expanded = expandSheet(sheetRows)
    const context: { gender?: string; style?: string; distance?: string; ageGroup?: string; round?: string; disciplineRaw?: string } = {}

    for (const row of expanded) {
      // section-header row → update inheritance context, skip
      const hdr = asDisciplineHeader(row)
      if (hdr) {
        if (hdr.gender)   context.gender   = hdr.gender
        if (hdr.style)    context.style    = hdr.style
        if (hdr.distance) context.distance = hdr.distance
        if (hdr.round)    context.round    = hdr.round
        if (hdr.ageGroup) context.ageGroup = hdr.ageGroup
        context.disciplineRaw = hdr.discipline
        continue
      }
      if (isHeaderish(row)) continue

      // discipline string in its own cell (e.g. "자유형 50M")
      if (row.style && typeof row.style === 'string' && (row.style.includes(' ') || !styleToDiscipline(row.style).discipline)) {
        const dsp = splitDiscipline(String(row.style))
        if (dsp.style) row.style = dsp.style
        if (dsp.distance && !row.distance) row.distance = dsp.distance
        if (dsp.gender && !row.gender) row.gender = dsp.gender
      }

      // inherit from context
      const gRaw  = row.gender   || context.gender   || ''
      const sRaw  = row.style    || context.style    || ''
      const dRaw  = row.distance || context.distance || ''
      const ageGroup = String(row.ageGroup || context.ageGroup || '').trim()
      const round    = String(row.round || context.round || '').trim()

      const { status: statusRaw, rank } = applyStatus(row)
      const time = normalizeTime(row.time ?? row.times)
      // no record → DNS (legacy checkTimes behavior); time stays empty, still recorded
      const status = (!time && !statusRaw) ? 'DNS' : statusRaw

      const team = String(row.team ?? '').trim()
      // relay names: split on space / comma / line-feed → one entry per athlete
      let names = String(row.name ?? '').split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
      if (!names.length && team) names = [team]   // relay without names → use team
      const name = names.join(',')
      if (!name && !team) continue   // empty row

      const { discipline, styleName } = styleToDiscipline(sRaw)

      // distance → 'NNNM'
      let distance = String(dRaw).trim().toUpperCase()
      if (distance && /^\d+$/.test(distance)) distance += 'M'
      if (distance && !distance.endsWith('M')) distance = distance.replace(/[^0-9]/g, '') ? distance.replace(/[^0-9]/g, '') + 'M' : ''

      const gender = checkGender(gRaw)

      // isMasters: parsed value wins, else competition fallback (decision #3)
      let isMasters = ctx.isMasters
      const mastersRaw = row.masters ?? row.isMasters
      if (mastersRaw !== undefined && mastersRaw !== '') {
        const m = String(mastersRaw)
        if (m === '비등록' || m.toLowerCase() === 'true') isMasters = true
        else if (m === '등록' || m.toLowerCase() === 'false' || m === 'elite') isMasters = false
      } else if (ageGroup && (ageGroup.includes('기록회') || (!ageGroup.includes('비등록') && ageGroup.includes('등록선수')))) {
        isMasters = false
      }

      const derived = computeDerived({ time, gender, discipline, distance, course: ctx.course })

      out.push({
        sheet:         String(row.sheet ?? ''),
        name:          name || team,
        names:         names.length ? names : (team ? [team] : []),
        gender,
        discipline,
        styleRaw:      styleName,
        disciplineRaw: context.disciplineRaw || '',
        distance,
        course:        ctx.course,
        time:          derived.time,
        timeSec:       derived.timeSec,
        timeStamp:     derived.timeStamp,
        waPoints:      derived.waPoints,
        rank,
        ageGroup,
        isMasters,
        isAdult:       !isJunior(ageGroup),
        team,
        round,
        status,
      })
    }
  }

  return out
}
