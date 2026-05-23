// POST /api/backend/errata/:id/confirm
// Push the errata's time block into mergedTimes:
//   - "누락건 신규 등재" → insert a new mergedTimes doc
//   - "기록오류 정정"   → match an existing doc and $set the fields
// Marks the errata with confirmed_at on success.
import { ObjectId } from 'mongodb'
import { nextTid } from '~/server/utils/tid'

// Fields copied from errata.time → mergedTimes.
const COPY_FIELDS = [
  'gender', 'name', 'group', 'team', 'sido',
  'discipline', 'course', 'distance', 'time', 'rank',
  'competitionName', 'datetime', 'isMasters',
] as const

// Fields used to LOCATE the existing mergedTimes doc when updating.
// Identity-stable fields only — not `time` / `rank` / `team` / `sido` which the
// errata may be specifically correcting.
const MATCH_FIELDS = [
  'name', 'gender', 'discipline', 'distance', 'course',
  'competitionName', 'datetime',
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

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = await getDb()

  const errata = await db.collection('errata').findOne({ _id: new ObjectId(id) })
  if (!errata) {
    throw createError({ statusCode: 404, statusMessage: 'errata not found' })
  }

  const category = String(errata.category || '')
  const time     = (errata.time || {}) as Record<string, unknown>
  const payload  = buildPayload(time)

  if (category.includes('누락건 신규 등재')) {
    if (!payload.name || !payload.time) {
      throw createError({ statusCode: 400, statusMessage: 'name and time required for insert' })
    }
    const tid = await nextTid(db)
    const result = await db.collection('mergedTimes').insertOne({ ...payload, tid })
    await db.collection('errata').updateOne(
      { _id: new ObjectId(id) },
      { $set: { confirmed_at: new Date().toISOString(), confirmed_target: String(result.insertedId), confirmed_action: 'insert' } }
    )
    return { ok: true, action: 'insert', target: String(result.insertedId) }
  }

  if (category.includes('기록오류 정정') || category.includes('오류 정정')) {
    const match: Record<string, unknown> = {}
    for (const k of MATCH_FIELDS) {
      const v = time?.[k]
      if (v !== undefined && v !== null && v !== '') match[k] = v
    }
    if (Object.keys(match).length < 3) {
      throw createError({ statusCode: 400, statusMessage: 'not enough match fields (need at least 3 of: ' + MATCH_FIELDS.join(', ') + ')' })
    }
    const found = await db.collection('mergedTimes').find(match).limit(2).toArray()
    if (found.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'no matching mergedTimes doc' })
    }
    if (found.length > 1) {
      throw createError({ statusCode: 409, statusMessage: 'multiple matching mergedTimes docs — narrow the criteria' })
    }
    const targetId = found[0]._id
    await db.collection('mergedTimes').updateOne(
      { _id: targetId },
      { $set: payload }
    )
    await db.collection('errata').updateOne(
      { _id: new ObjectId(id) },
      { $set: { confirmed_at: new Date().toISOString(), confirmed_target: String(targetId), confirmed_action: 'update' } }
    )
    return { ok: true, action: 'update', target: String(targetId) }
  }

  throw createError({ statusCode: 400, statusMessage: `unsupported category for confirm: ${category}` })
})
