// POST /api/backend/times — create one mergedTimes doc
import { computeDerived } from '~/server/utils/importTimes'
import { nextTid, syncTidCounter } from '~/server/utils/tid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Strip id-like fields the client may have sent.
  const { id: _id1, _id: _id2, ...form } = body

  const der = computeDerived({
    time:       String(form.time ?? ''),
    gender:     String(form.gender ?? ''),
    discipline: String(form.discipline ?? ''),
    distance:   String(form.distance ?? ''),
    course:     String(form.course ?? ''),
  })

  const rank = form.rank != null && !isNaN(Number(form.rank)) ? Number(form.rank) : null

  const db = await getDb()
  // timeID = max(timeID) + 1 (counter self-heals to the real max before incrementing)
  await syncTidCounter(db)
  const timeID = await nextTid(db)

  const doc = {
    timeID,
    name:            String(form.name ?? ''),
    sido:            String(form.sido ?? ''),
    team:            String(form.team ?? ''),
    pool:            String(form.pool ?? ''),
    datetime:        String(form.datetime ?? ''),
    competitionName: String(form.competitionName ?? ''),
    gender:          String(form.gender ?? ''),
    group:           String(form.group ?? ''),
    ageGroup:        String(form.ageGroup ?? ''),
    discipline:      String(form.discipline ?? ''),
    distance:        String(form.distance ?? ''),
    course:          String(form.course ?? ''),
    isMasters:       !!form.isMasters,
    isAdult:         !!form.isAdult,
    rank,
    status:          String(form.status ?? ''),
    time:            der.time,
    timeSec:         der.timeSec,
    timeStamp:       der.timeStamp,
    waPoints:        der.waPoints,
  }

  const res = await db.collection('mergedTimes').insertOne(doc)
  return { ok: true, id: String(res.insertedId), timeID }
})
