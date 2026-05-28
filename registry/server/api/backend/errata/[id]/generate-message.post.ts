// POST /api/backend/errata/[id]/generate-message
// 임시: errata 기록 기반으로 NVIDIA LLM 축하 메시지 생성
import { ObjectId } from 'mongodb'
import { getDb } from '~/server/utils/mongo'
import { BASE_TIMES, calcWAPoints, getBasetime } from '~/server/utils/wapoints'

// ── 상수 ────────────────────────────────────────────────────────────
const GENDER_KO: Record<string, string>  = { men: '남자', women: '여자', M: '남자', W: '여자' }
const STROKE_KO: Record<string, string>  = { FR: '자유형', BK: '배영', BR: '평영', FL: '접영', IM: '개인혼영' }
const STROKE_SHORT: Record<string, string> = { FR: 'FR', BK: 'BK', BR: 'BR', FL: 'FL', IM: 'IM' }

// ── 시간 파싱 ────────────────────────────────────────────────────────
function parseTimeSeconds(t: string): number | null {
  const m = t.trim().match(/^(?:(\d+):)?(\d{1,2})\.(\d{2})$/)
  if (!m) return null
  return (parseInt(m[1] || '0')) * 60 + parseInt(m[2]) + parseInt(m[3]) / 100
}

function secondsToTimeStr(sec: number): string {
  const m  = Math.floor(sec / 60)
  const s  = sec - m * 60
  const ss = Math.floor(s)
  const hh = Math.round((s - ss) * 100)
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${String(hh).padStart(2,'0')}`
}

function dateToKorean(d: string): string {
  // "2026-05-27" → "2026년 5월 27일"
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return d
  return `${m[1]}년 ${parseInt(m[2])}월 ${parseInt(m[3])}일`
}

// ── System Prompt ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `당신은 수영 기록 기념문을 작성하는 전문 편집자입니다.
아래 [규칙]을 엄격히 따라 facts JSON을 바탕으로 한국어 기념문을 작성하세요.

===== 규칙 =====

## 톤
- 기념관·기념비에 새기는 격식체
- 문장 종결: ~입니다, ~합니다, ~나타냅니다, ~됩니다
- 감탄사("와!", "정말"), 이모지, 느낌표 금지
- "대단한", "엄청난", "훌륭한", "놀라운" 등 주관적 형용사 금지
- 과장 표현, 구어체 금지

## 길이
- 최소 2문장, 최대 8문장
- 평범한 기록: 3~4문장
- 한국 신기록(isKR=true 또는 isKMR=true): 최대 8문장 허용

## 문장 순서 (우선순위)
1. 기록 사실 명시 — 반드시 첫 문장
2. 한국 신기록 관련 (isKR 또는 isKMR이 true일 때) — 두 번째
3. PB 경신 (isPB=true이고 prevPB가 존재할 때)
4. 전국 순위 (nationalRank가 존재하고 1000 이하일 때)
5. WA 포인트 + 타영법 환산 (waPoints가 300 이상일 때)
6. 유사 기록 목록 (similarRecords가 존재할 때)
7. 특수 케이스 (복귀, 첫 등재, 시즌 첫 기록 등)
8. 마지막 문장은 반드시 "축하합니다." — 단독 문장으로

## 각 항목 작성 규칙

### [기록 사실] — 항상 첫 문장
형식: "본 기록은 {athlete} 선수가 {competition}에서 수립한 {event} 종목의 공식 기록입니다."

### [WA 포인트] — waPoints가 300 이상일 때만
형식: "월드아쿠아틱스 포인트 계산 시 {date} 기준 {waPoints}점에 해당되며, 동일한 산정 공식으로 보았을 때 {waEquivalents[0].event} {waEquivalents[0].time}, {waEquivalents[1].event} {waEquivalents[1].time} 등과 동일한 수준의 기록입니다."
- waEquivalents는 최대 3개까지만 나열
- waPoints가 300 미만이면 이 문장 전체 생략

### [유사 기록] — similarRecords가 있을 때
형식: "월드아쿠아틱스 포인트 기준으로 동등한 수준의 기록으로는 {similarRecords[0].athlete}의 {similarRecords[0].event} {similarRecords[0].time}, {similarRecords[1].athlete}의 {similarRecords[1].event} {similarRecords[1].time} 등이 있습니다."
- 최대 3명까지 나열

### [첫 종목 등재] — isFirstInEvent=true
형식: "{event} 종목에서 처음으로 수립한 공식 기록으로, 향후 갱신의 기점이 되는 의미 있는 기록입니다."

### [PB 경신] — isPB=true이고 prevPB가 존재할 때
형식: "종전 개인최고기록({prevPB}) 대비 {pbImprove}초를 단축한 새로운 개인최고기록입니다."
- isPB=true이지만 prevPB가 null이면 (첫 기록) 이 문장 생략

### [전국 순위] — nationalRank가 1000 이하일 때
형식: "전문체육과 마스터즈를 통합한 본 종목 전체 순위에서 {nationalRank}위에 해당하는 기록으로, 대한민국 전국 단위 기준의 위치를 나타냅니다."
- nationalRank가 1000 초과이면 전체 문장 생략

### [복귀 기록] — gapMonths가 12 이상일 때
형식: "약 {gapMonths}개월의 공백을 지나 다시 수면 위에 새겨진 {athlete} 선수의 복귀 기록입니다."

### [시즌 첫 기록] — isSeasonFirst=true
형식: "{athlete} 선수의 {year} 시즌 첫 공식 등재 기록입니다."

### [첫 등재 선수] — isFirstEver=true
형식: "메달뱅크에 처음으로 이름을 올린 기록입니다."

### [종결문] — 항상 마지막 문장
반드시 단독 문장으로: "축하합니다."

## 절대 금지
- facts에 없는 정보를 추측하거나 창작하지 않습니다
- "정보 없음", "해당 없음" 등의 빈 문장을 출력하지 않습니다
- 숫자를 임의로 변경하지 않습니다
- JSON에 null 또는 false로 명시된 항목은 작성하지 않습니다

## 출력 형식
- 순수 텍스트만 출력 (마크다운, HTML, 번호매기기 없음)
- 문단 구분 없이 연속된 문장들
- 따옴표, 괄호 등 불필요한 래핑 없음`

// ── 메인 핸들러 ──────────────────────────────────────────────────────
export default defineEventHandler(async (event) => {
  // 프로덕션에서만 로그인 필요 (로컬 dev 테스트 편의)
  if (process.env.NODE_ENV === 'production') {
    const session = await getUserSession(event)
    if (!session?.user) throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const cfg = useRuntimeConfig(event)
  if (!cfg.nvidiaApiKey) throw createError({ statusCode: 500, statusMessage: 'NVIDIA_API_KEY 미설정' })

  // ── 1. errata 문서 로드 ──────────────────────────────────────────
  const db  = await getDb()
  let oid: ObjectId
  try { oid = new ObjectId(id) } catch { throw createError({ statusCode: 400, statusMessage: '잘못된 id' }) }

  const doc = await db.collection('errata').findOne({ _id: oid })
  if (!doc) throw createError({ statusCode: 404, statusMessage: '문서 없음' })

  const t           = (doc.time ?? {}) as Record<string, any>
  const athlete     = t.name            || ''
  const timeStr     = t.time            || ''
  const gender      = t.gender          || 'men'   // 'men' | 'women'
  const stroke      = t.discipline      || 'FR'
  const distanceStr = t.distance        || '50M'
  const distance    = parseInt(distanceStr)
  const course      = t.course          || 'LCM'
  const isMasters   = !!t.isMasters
  const group       = t.group           || (isMasters ? '성인부' : '일반부')
  const competition = t.competitionName || ''
  const datetime    = t.datetime        || ''       // "2026-05-27"
  const year        = datetime.slice(0, 4)

  if (!athlete || !timeStr) {
    throw createError({ statusCode: 400, statusMessage: '성명 또는 기록이 없습니다.' })
  }

  // ── 2. WA 포인트 계산 ────────────────────────────────────────────
  const timeSec  = parseTimeSeconds(timeStr)
  const basetime = timeSec ? getBasetime(course, gender, stroke, distanceStr) : null
  const timeStamp = timeSec ? timeSec / 86400 : 0
  const waPoints  = (basetime && timeStamp) ? calcWAPoints(basetime, timeStamp) : 0

  // ── 3. WA 등가 기록 (타영법 환산) ───────────────────────────────
  const waEquivalents: { event: string; time: string }[] = []
  if (waPoints >= 300 && basetime && timeSec) {
    const gCode = (gender === 'men' || gender === 'M') ? 'M' : 'W'
    const factor = Math.pow(waPoints / 1000, 1/3)
    for (const [s, dists] of Object.entries(BASE_TIMES[course]?.[gCode] ?? {})) {
      for (const [d, base] of Object.entries(dists as Record<string, number>)) {
        if (s === stroke && `${d}M` === distanceStr) continue
        const equivSec = (base as number) / factor
        waEquivalents.push({
          event: `${GENDER_KO[gCode]} ${STROKE_KO[s] ?? s} ${d}m ${course}`,
          time:  secondsToTimeStr(equivSec),
        })
      }
    }
    waEquivalents.sort((a, b) => a.event.localeCompare(b.event))
  }

  // ── 4. DB 조회: PB, 첫 등재, 시즌 첫, 복귀, 전국 순위 ──────────
  const coll  = db.collection('mergedTimes')
  const dbGender = (gender === 'men' || gender === 'M') ? 'men' : 'women'

  // 같은 종목 선수 기록 (PB + 첫 등재 판별)
  const prevRecords = athlete ? await coll
    .find({ name: athlete, gender: dbGender, discipline: stroke, distance: distanceStr, course })
    .sort({ timeStamp: 1 })
    .toArray() : []

  const prevBest    = prevRecords[0]
  const isFirstInEvent = prevRecords.length === 0
  const isPB  = isFirstInEvent || (!!timeSec && !!prevBest?.timeStamp && timeStamp < prevBest.timeStamp)
  const prevPBStr = prevBest?.time ?? null
  const pbImprove = (isPB && prevBest?.timeStamp && timeSec)
    ? Math.round((prevBest.timeStamp * 86400 - timeSec) * 100) / 100
    : null

  // 모든 종목 통틀어 첫 등재
  const totalCount  = athlete ? await coll.countDocuments({ name: athlete }) : 0
  const isFirstEver = totalCount === 0

  // 올해 첫 등재 (시즌 첫)
  const seasonCount = (athlete && year) ? await coll.countDocuments({ name: athlete, datetime: { $regex: `^${year}` } }) : 0
  const isSeasonFirst = seasonCount === 0

  // 복귀: 직전 기록 날짜
  const lastRecord = athlete ? await coll.findOne({ name: athlete }, { sort: { datetime: -1 } }) : null
  let gapMonths: number | null = null
  if (lastRecord?.datetime && datetime) {
    const prev = new Date(String(lastRecord.datetime).slice(0, 10))
    const curr = new Date(datetime)
    const diff = (curr.getFullYear() - prev.getFullYear()) * 12 + (curr.getMonth() - prev.getMonth())
    if (diff >= 12) gapMonths = diff
  }

  // 전국 통합 순위 (선수별 PB 기준)
  let nationalRank: number | null = null
  if (timeSec && timeStamp) {
    const fasterCount = await coll.aggregate([
      { $match: { gender: dbGender, discipline: stroke, distance: distanceStr, course, timeStamp: { $lt: timeStamp } } },
      { $sort:  { timeStamp: 1 } },
      { $group: { _id: '$name', best: { $first: '$timeStamp' } } },
      { $count: 'n' },
    ]).toArray()
    nationalRank = (fasterCount[0]?.n ?? 0) + 1
    if (nationalRank > 1000) nationalRank = null
  }

  // ── 5. 유사 기록 (sameYear.same 상위 3개) ────────────────────────
  const similarRecords: { athlete: string; event: string; time: string; points: number }[] = []
  if (waPoints > 0 && year) {
    const sameCandidates = await coll.aggregate([
      { $match: {
          gender: dbGender, discipline: stroke, distance: distanceStr, course,
          waPoints: { $gt: 0 },
          datetime: { $regex: `^${year}` },
          ...(athlete ? { name: { $ne: athlete } } : {}),
        }
      },
      { $sort:  { timeStamp: 1 } },
      { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $addFields: { diff: { $abs: { $subtract: ['$waPoints', waPoints] } } } },
      { $sort: { diff: 1 } },
      { $limit: 3 },
    ]).toArray()

    for (const d of sameCandidates) {
      similarRecords.push({
        athlete: d.name,
        event:   `${GENDER_KO[dbGender] ?? '남자'} ${STROKE_KO[stroke] ?? stroke} ${distance}m ${course}`,
        time:    d.time,
        points:  d.waPoints,
      })
    }
  }

  // ── 6. facts 조립 ────────────────────────────────────────────────
  const eventStr = `${GENDER_KO[gender] ?? GENDER_KO[dbGender] ?? '남자'} ${STROKE_KO[stroke] ?? stroke} ${distance}m ${course}`
  const today    = new Date().toISOString().slice(0, 10)

  const facts = {
    athlete,
    event:           eventStr,
    time:            timeStr,
    competition:     competition || '(대회명 미입력)',
    date:            dateToKorean(datetime || today),
    gender:          (gender === 'men' || gender === 'M') ? 'M' : 'W',
    stroke,
    distance,
    course,
    isMasters,
    group,
    waPoints,
    waEquivalents:   waEquivalents.slice(0, 3),
    isPB,
    prevPB:          prevPBStr,
    pbImprove,
    isFirstInEvent,
    isFirstEver,
    isSeasonFirst,
    gapMonths,
    nationalRank,
    isKR:            false,
    prevKR:          null,
    isKMR:           false,
    prevKMR:         null,
    similarRecords,
  }

  // ── 7. NVIDIA API 호출 ───────────────────────────────────────────
  const apiRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.nvidiaApiKey}`,
    },
    body: JSON.stringify({
      model: cfg.nvidiaModelName || 'meta/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `아래 facts를 바탕으로 기념문을 작성하세요.\n\n${JSON.stringify(facts, null, 2)}`,
        },
      ],
      max_tokens: 512,
      temperature: 0.3,
    }),
  })

  if (!apiRes.ok) {
    const errText = await apiRes.text()
    throw createError({ statusCode: 502, statusMessage: `NVIDIA API 오류: ${apiRes.status} ${errText.slice(0, 200)}` })
  }

  const apiJson = await apiRes.json()
  const message = apiJson.choices?.[0]?.message?.content?.trim() ?? ''

  return { message, facts }
})
