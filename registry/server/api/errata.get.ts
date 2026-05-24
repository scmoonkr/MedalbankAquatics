// GET /api/errata  — errata list, cached 30 seconds
export default defineCachedEventHandler(async () => {
  const db   = await getDb()
  const docs = await db.collection('errata').find({}).sort({ submittedAt: 1 }).toArray()

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

    // ── time 객체 정규화 ──────────────────────────────────────
    // 신버전: d.time = { name, time, gender, ... }
    // 구버전: d.time = "00:33.45" (문자열), 나머지 필드는 최상위에 저장
    // 구버전 오류 정정: errata에 없는 필드는 mergedTimes 원본으로 채움
    //   (diff에서 "성명 최동열 → " 같은 오탐 방지 + evtLabel 정상 출력)
    const tid0 = Number(d.timeID) || 0
    const orig0 = (!isNewFormat && tid0 > 0) ? (tidMap.get(tid0) ?? null) : null

    const time = isNewFormat
      ? d.time
      : {
          name:            d.name            ?? orig0?.name            ?? '',
          time:            typeof d.time === 'string' ? d.time : (orig0?.time ?? ''),
          gender:          d.gender          ?? orig0?.gender          ?? '',
          discipline:      d.discipline      ?? orig0?.discipline      ?? '',
          distance:        d.distance        ?? orig0?.distance        ?? '',
          course:          d.course          ?? orig0?.course          ?? '',
          rank:            d.rank            ?? orig0?.rank            ?? null,
          sido:            d.sido            ?? orig0?.sido            ?? '',
          team:            d.team            ?? orig0?.team            ?? '',
          datetime:        d.datetime        ?? orig0?.datetime        ?? '',
          competitionName: d.competitionName ?? orig0?.competitionName ?? '',
          pool:            d.pool            ?? orig0?.pool            ?? '',
        }

    // ── no ────────────────────────────────────────────────────
    const no = d.no ?? (idx + 1)

    // ── category ─────────────────────────────────────────────
    const category = d.category
      ?? (Number(d.timeID) > 0 ? '오류 정정' : '누락건 신규 등재')

    // ── reporter (구버전은 항상 "본인"이 붙어있을 수 있음) ─────
    // 제보자 이름 == 선수 이름이면 "본인", 아니면 이름만
    const submitterName = d.submittedBy?.name ?? ''
    const athleteName   = time.name ?? ''
    const reporter = submitterName
      ? (athleteName && athleteName === submitterName
          ? `${submitterName} 본인`
          : submitterName)
      : (() => {
          // 구버전: submittedBy가 문자열(email)이라 이름 비교 불가
          // 저장된 reporter에서 " 본인" 제거 후 선수명과 재비교
          const raw = String(d.reporter ?? '—')
          const strippedName = raw.endsWith(' 본인') ? raw.slice(0, -3) : raw
          return (athleteName && athleteName === strippedName)
            ? raw               // 선수명 일치 → 원본 그대로("본인" 유지)
            : strippedName      // 불일치 또는 선수명 없음 → "본인" 제거
        })()

    // ── report_date ───────────────────────────────────────────
    const report_date = d.report_date
      ?? (d.submittedAt ? new Date(d.submittedAt).toISOString().slice(0, 10) : '—')

    // ── magazine (반영호) — confirm 시점에 기재됨 ─────────────
    const magazine = d.magazine ?? ''

    // ── before ───────────────────────────────────────────────
    const tid = tid0
    let before = d.before ?? null
    if (!before && tid > 0) {
      const orig = orig0 ?? tidMap.get(tid)
      if (orig) {
        before = {
          name:            orig.name            ?? '',
          time:            orig.time            ?? '',
          gender:          orig.gender          ?? '',
          discipline:      orig.discipline      ?? '',
          distance:        orig.distance        ?? '',
          course:          orig.course          ?? '',
          rank:            orig.rank            ?? null,
          sido:            orig.sido            ?? '',
          team:            orig.team            ?? '',
          datetime:        orig.datetime        ?? '',
          competitionName: orig.competitionName ?? '',
          pool:            orig.pool            ?? '',
        }
      }
    }

    return {
      no,
      category,
      timeID:      tid,
      time,
      before,
      note:        d.note        ?? '',
      reporter,
      report_date,
      magazine:    magazine      || '—',
    }
  })
}, {
  maxAge: 5,
  name:   'ksr-errata',
  getKey: () => 'all',
})
