// POST /api/backend/migrate/wapoints
// mergedTimes 전체 문서에 waPoints 필드를 일괄 계산하여 저장.
// 대용량(80만+ 건)이므로 cursor + bulkWrite 배치(500건) 방식으로 처리.
// 쿼리 파라미터:
//   overwrite=1  — 이미 waPoints가 있는 문서도 재계산 (기본: 없는 문서만)

import { getBasetime, calcWAPoints } from '~/server/utils/wapoints'

export default defineEventHandler(async (event) => {
  const q         = getQuery(event)
  const overwrite = q.overwrite === '1' || q.overwrite === 'true'

  const db         = await getDb()
  const collection = db.collection('mergedTimes')

  const filter = overwrite ? {} : { waPoints: { $exists: false } }

  const cursor = collection.find(filter, {
    projection: { _id: 1, course: 1, gender: 1, discipline: 1, distance: 1, timeStamp: 1 },
  })

  const BATCH = 500
  let ops:     any[] = []
  let updated  = 0
  let skipped  = 0

  for await (const doc of cursor) {
    const basetime = getBasetime(
      doc.course     || '',
      doc.gender     || '',
      doc.discipline || '',
      doc.distance   || '',
    )

    if (basetime === null || !doc.timeStamp) {
      skipped++
      continue
    }

    const waPoints = calcWAPoints(basetime, doc.timeStamp)

    ops.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { waPoints } },
      },
    })

    if (ops.length >= BATCH) {
      await collection.bulkWrite(ops, { ordered: false })
      updated += ops.length
      ops = []
    }
  }

  if (ops.length > 0) {
    await collection.bulkWrite(ops, { ordered: false })
    updated += ops.length
  }

  return { updated, skipped }
})
