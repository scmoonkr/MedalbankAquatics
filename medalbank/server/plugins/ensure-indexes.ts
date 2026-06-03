// Ensure MongoDB indexes exist on Nitro startup. createIndex is idempotent —
// it no-ops when an index with the same key/name already exists.

export default defineNitroPlugin(async () => {
  try {
    const db = await getDb()
    await Promise.all([
      db.collection('mergedTimes').createIndex(
        { gender: 1, discipline: 1, distance: 1, course: 1, isMasters: 1, group: 1, time: 1 },
        { name: 'ksr-event-time' },
      ),
      db.collection('mergedTimes').createIndex(
        { tid: 1 },
        { name: 'ksr-tid', unique: true, sparse: true },
      ),
      // similar records 조회용 — timeStamp range scan (레거시 보존)
      db.collection('mergedTimes').createIndex(
        { gender: 1, discipline: 1, distance: 1, course: 1, timeStamp: 1 },
        { name: 'ksr-event-ts' },
      ),
      // similar records 조회용 — waPoints 기반 (같은 종목)
      db.collection('mergedTimes').createIndex(
        { gender: 1, discipline: 1, distance: 1, course: 1, waPoints: -1 },
        { name: 'ksr-event-wapts' },
      ),
      // similar records 조회용 — waPoints 기반 (타 종목 교차 쿼리)
      db.collection('mergedTimes').createIndex(
        { gender: 1, course: 1, waPoints: -1 },
        { name: 'ksr-course-wapts' },
      ),
    ])
  } catch (err) {
    console.error('[ensure-indexes] failed:', err)
  }
})
