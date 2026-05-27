// GET /api/backend/errata — errata list for admin, newest first.
// Accepts filter query params (category, gender, discipline, name) so the
// page can re-query when filters change.
export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const match: Record<string, unknown> = {}
  if (q.category)   match.category = String(q.category)
  if (q.status)     match.status   = String(q.status)
  if (q.gender) {
    match.$or = [
      { 'time.gender': String(q.gender) },
      { gender:        String(q.gender) },   // 구버전
    ]
  }
  if (q.discipline) {
    match.$or = [
      { 'time.discipline': String(q.discipline) },
      { discipline:        String(q.discipline) }, // 구버전
    ]
  }
  if (q.name) {
    const safe = String(q.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    match.$or = [
      { 'time.name': { $regex: safe, $options: 'i' } },
      { name:        { $regex: safe, $options: 'i' } }, // 구버전
    ]
  }

  const db   = await getDb()
  const docs = await db.collection('errata').find(match).sort({ no: -1 }).toArray()

  // ── before 없는 오류 정정 건 → mergedTimes에서 일괄 조회 ──────
  const missingTids = docs
    .filter(d => !d.before && Number(d.timeID) > 0)
    .map(d => Number(d.timeID))
  const tidMap = new Map<number, any>()
  if (missingTids.length) {
    const originals = await db.collection('mergedTimes')
      .find({ timeID: { $in: missingTids } })
      .toArray()
    for (const o of originals) tidMap.set(Number(o.timeID), o)
  }

  return docs.map((d, idx) => {
    const isNewFormat = d.time && typeof d.time === 'object'
    const tid         = Number(d.timeID) || 0
    const orig        = (!isNewFormat && tid > 0) ? (tidMap.get(tid) ?? null) : null

    const time = isNewFormat
      ? d.time
      : {
          name:            d.name            ?? orig?.name            ?? '',
          time:            typeof d.time === 'string' ? d.time : (orig?.time ?? ''),
          gender:          d.gender          ?? orig?.gender          ?? '',
          discipline:      d.discipline      ?? orig?.discipline      ?? '',
          distance:        d.distance        ?? orig?.distance        ?? '',
          course:          d.course          ?? orig?.course          ?? '',
          rank:            d.rank            ?? orig?.rank            ?? null,
          sido:            d.sido            ?? orig?.sido            ?? '',
          team:            d.team            ?? orig?.team            ?? '',
          datetime:        d.datetime        ?? orig?.datetime        ?? '',
          competitionName: d.competitionName ?? orig?.competitionName ?? '',
          pool:            d.pool            ?? orig?.pool            ?? '',
        }

    let before = d.before ?? null
    if (!before && tid > 0) {
      const o = orig ?? tidMap.get(tid)
      if (o) {
        before = {
          name:            o.name            ?? '',
          time:            o.time            ?? '',
          gender:          o.gender          ?? '',
          discipline:      o.discipline      ?? '',
          distance:        o.distance        ?? '',
          course:          o.course          ?? '',
          rank:            o.rank            ?? null,
          sido:            o.sido            ?? '',
          team:            o.team            ?? '',
          datetime:        o.datetime        ?? '',
          competitionName: o.competitionName ?? '',
          pool:            o.pool            ?? '',
        }
      }
    }

    const no         = d.no ?? (idx + 1)
    const category   = d.category ?? (tid > 0 ? '오류 정정' : '누락건 신규 등재')
    const report_date = d.report_date
      ?? (d.submittedAt ? new Date(d.submittedAt).toISOString().slice(0, 10) : '')

    const submitterName = d.submittedBy?.name ?? ''
    const athleteName   = time.name ?? ''
    const reporter = submitterName
      ? (athleteName && athleteName === submitterName
          ? `${submitterName} 본인`
          : submitterName)
      : (() => {
          const raw = String(d.reporter ?? '')
          const stripped = raw.endsWith(' 본인') ? raw.slice(0, -3) : raw
          return (athleteName && athleteName === stripped) ? raw : stripped
        })()

    return {
      id:              String(d._id),
      no,
      category,
      timeID:          tid,
      time,
      before,
      note:            d.note           ?? '',
      reporter,
      report_date,
      magazine:        d.magazine       ?? '',
      status:          d.status         ?? 'pending',
      confirmed_at:    d.confirmed_at   ?? '',
      confirmed_target:d.confirmed_target ?? '',
      confirmed_action:d.confirmed_action ?? '',
      evidenceUrls:    Array.isArray(d.evidenceUrls) ? d.evidenceUrls : [],
      file:            d.file ?? null,
    }
  })
})
