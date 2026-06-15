// POST /api/backend/competitions/:id/times-confirm
// Insert reviewed times rows into mergedTimes. Competition fields and all derived
// values (time/timeStamp/waPoints) are recomputed server-side — client is not trusted.
import { ObjectId } from 'mongodb'
import { computeDerived, buildCtx, dedupKey } from '~/server/utils/importTimes'
import { nextTid, syncTidCounter } from '~/server/utils/tid'

const DISTANCES = new Set(['25M', '50M', '100M', '200M', '400M', '800M', '1500M'])

interface InRow {
  name?: string; names?: string[]; gender?: string; discipline?: string
  distance?: string; time?: string; status?: string; rank?: number | null; ageGroup?: string
  isMasters?: boolean; isAdult?: boolean; team?: string; round?: string; rowKey?: string
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  let oid: ObjectId
  try { oid = new ObjectId(id) } catch { throw createError({ statusCode: 400, statusMessage: '잘못된 id' }) }

  const body = await readBody<{ rows?: InRow[] }>(event)
  const inRows = Array.isArray(body?.rows) ? body!.rows : []
  if (!inRows.length) throw createError({ statusCode: 400, statusMessage: '등재할 행이 없습니다.' })

  const db   = await getDb()
  const comp = await db.collection('competitions').findOne({ _id: oid })
  if (!comp) throw createError({ statusCode: 404, statusMessage: '대회를 찾을 수 없습니다.' })
  const ctx = buildCtx(comp)

  const coll = db.collection('mergedTimes')
  // self-heal a stale tid counter before inserting (avoids E11000 on timeID)
  await syncTidCounter(db)
  const results: Array<{ rowKey: string; action: 'insert' | 'duplicate' | 'invalid'; timeID?: number }> = []
  let inserted = 0, skippedDuplicate = 0, skippedInvalid = 0
  const seen = new Set<string>()

  for (const r of inRows) {
    const rowKey = r.rowKey || ''
    const name = String(r.name ?? '').trim()
    const gender = r.gender === 'men' || r.gender === 'women' || r.gender === 'mixed' ? r.gender : ''
    const discipline = ['FR', 'BA', 'BR', 'FL', 'IM', 'FRR', 'MR'].includes(String(r.discipline)) ? String(r.discipline) : ''
    const distance = String(r.distance ?? '').toUpperCase()

    // recompute derived server-side
    const der = computeDerived({ time: String(r.time ?? ''), gender, discipline, distance, course: ctx.course })
    // no record → DNS; time stays empty but the row is still recorded
    const status = String(r.status ?? '') || (!der.time ? 'DNS' : '')

    // re-validate: need a valid event; time may be empty when status is set (DNS/DQ)
    if (!name || !discipline || !DISTANCES.has(distance) || (!der.time && !status)) {
      skippedInvalid++; results.push({ rowKey, action: 'invalid' }); continue
    }
    const isMasters = typeof r.isMasters === 'boolean' ? r.isMasters : ctx.isMasters

    const key = dedupKey({ competitionID: ctx.competitionID, name, gender, isMasters, discipline, course: ctx.course, distance, time: der.time })
    if (seen.has(key)) { skippedDuplicate++; results.push({ rowKey, action: 'duplicate' }); continue }
    seen.add(key)

    // authoritative DB dedup — scoped to this competition
    const exists = await coll.findOne({ competitionID: ctx.competitionID, name, gender, isMasters, discipline, course: ctx.course, distance, time: der.time })
    if (exists) { skippedDuplicate++; results.push({ rowKey, action: 'duplicate' }); continue }

    const timeID = await nextTid(db)
    const names  = Array.isArray(r.names) && r.names.length ? r.names : [name]
    const doc: Record<string, unknown> = {
      timeID,
      name,
      names,
      gender,
      discipline,
      distance,
      course:          ctx.course,
      time:            der.time,
      timeStamp:       der.timeStamp,
      waPoints:        der.waPoints,
      rank:            r.rank != null && !isNaN(Number(r.rank)) ? Number(r.rank) : null,
      ageGroup:        String(r.ageGroup ?? ''),
      isMasters,
      isAdult:         typeof r.isAdult === 'boolean' ? r.isAdult : true,
      team:            String(r.team ?? ''),
      round:           String(r.round ?? ''),
      type:            'event',
      competitionID:   ctx.competitionID,
      competitionName: ctx.competitionName,
      pool:            ctx.pool,
      poolID:          ctx.poolID,
      sido:            ctx.sido,
      datetime:        ctx.datetime,
    }
    if (status) doc.status = status
    await coll.insertOne(doc)
    inserted++
    results.push({ rowKey, action: 'insert', timeID })
  }

  return { ok: true, inserted, skippedDuplicate, skippedInvalid, results }
})
