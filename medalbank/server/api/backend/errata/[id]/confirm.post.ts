// POST /api/backend/errata/:id/confirm
// mergedTimes 중복 체크 { name, gender, isMasters, discipline, course, distance, time }
// 없으면 mergedTimes insert
// errata.status = "confirmed" (insert 여부와 무관)

import { ObjectId } from 'mongodb'
import { nextTid } from '~/server/utils/tid'
import { getBasetime, calcWAPoints } from '~/server/utils/wapoints'

// errata.time → mergedTimes 복사 필드
const COPY_FIELDS = [
  'gender', 'name', 'group', 'team', 'sido',
  'discipline', 'course', 'distance', 'time', 'rank',
  'competitionName', 'pool', 'datetime', 'isMasters',
] as const

function buildPayload(time: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const k of COPY_FIELDS) {
    const v = time?.[k]
    if (v === undefined || v === null || v === '') continue
    out[k] = v
  }
  return out
}

function calcMagazine(from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(1)
  d.setMonth(d.getMonth() + (from.getDate() <= 20 ? 1 : 2))
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월호`
}

function parseTimeSeconds(t: string): number | null {
  const m = String(t).trim().match(/^(?:(\d+):)?(\d{1,2})\.(\d{2})$/)
  if (!m) return null
  return parseInt(m[1] || '0') * 60 + parseInt(m[2]) + parseInt(m[3]) / 100
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = await getDb()

  const errata = await db.collection('errata').findOne({ _id: new ObjectId(id) })
  if (!errata) {
    throw createError({ statusCode: 404, statusMessage: 'errata not found' })
  }

  const time    = (errata.time || {}) as Record<string, unknown>
  const now     = new Date()
  const magazine = calcMagazine(now)

  const name       = String(time.name       || '')
  const gender     = String(time.gender     || '')
  const isMasters  = !!(time.isMasters)
  const discipline = String(time.discipline || '')
  const course     = String(time.course     || 'LCM')
  const distance   = String(time.distance   || '')
  const timeStr    = String(time.time       || '')

  if (!name || !timeStr) {
    throw createError({ statusCode: 400, statusMessage: 'name과 time이 필요합니다.' })
  }

  // ── 중복 체크 ─────────────────────────────────────────────────────
  const exists = await db.collection('mergedTimes').findOne({
    name, gender, isMasters, discipline, course, distance, time: timeStr,
  })

  let action: 'insert' | 'skipped' | 'updated' = 'skipped'
  let targetId: string | null = null

  if (!exists) {
    // ── 신규 insert ─────────────────────────────────────────────────
    const timeSec   = parseTimeSeconds(timeStr)
    const basetime  = timeSec ? getBasetime(course, gender, discipline, distance) : null
    const timeStamp = timeSec ? timeSec / 86400 : 0
    const waPoints  = (basetime && timeStamp) ? calcWAPoints(basetime, timeStamp) : 0

    const payload = buildPayload(time)
    const timeID  = await nextTid(db)

    const result = await db.collection('mergedTimes').insertOne({
      ...payload,
      timeID,
      timeStamp,
      waPoints,
      competitionID: time.competitionID ?? 1,
    })

    action   = 'insert'
    targetId = String(result.insertedId)

  } else {
    // ── 중복 — 대회 정보 보강 가능 여부 확인 ────────────────────────
    const existingCompId = exists.competitionID
    const isMissingComp  = existingCompId === undefined || existingCompId === null || existingCompId === 1

    const erataCompId   = time.competitionID
    const erataCompName = time.competitionName

    if (isMissingComp && erataCompId && erataCompName) {
      // competitionID / competitionName 은 필수 조건이 충족됐을 때만 갱신
      const patch: Record<string, unknown> = {
        competitionID:   erataCompId,
        competitionName: erataCompName,
      }

      // 나머지 선택 필드: 값이 있을 때만 포함
      const OPTIONAL = ['pool', 'poolID', 'datetime', 'sido', 'course', 'isMasters'] as const
      for (const k of OPTIONAL) {
        const v = time[k]
        if (v !== undefined && v !== null && v !== '') patch[k] = v
      }

      await db.collection('mergedTimes').updateOne(
        { _id: exists._id },
        { $set: patch },
      )

      action   = 'updated'
      targetId = String(exists._id)
    }
  }

  // ── errata 상태 업데이트 ───────────────────────────────────────────
  await db.collection('errata').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status:           'confirmed',
        confirmed_at:     now.toISOString(),
        confirmed_action: action,
        confirmed_target: targetId,
        magazine,
      },
    },
  )

  return { ok: true, action, targetId, magazine }
})
