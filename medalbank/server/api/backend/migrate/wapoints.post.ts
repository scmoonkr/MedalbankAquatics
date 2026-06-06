// POST /api/backend/migrate/wapoints
// mergedTimes 전체 문서에 waPoints 필드를 일괄 계산하여 저장.
// timeStamp 없는 레코드는 time 문자열에서 직접 파싱하여 timeStamp도 함께 저장.
// 쿼리 파라미터:
//   overwrite=1  — 이미 waPoints가 있는 문서도 재계산 (기본: 없는 문서만)

import { getBasetime, calcWAPoints } from '~/server/utils/wapoints'

function parseTimeSeconds(t: string): number | null {
  const m = String(t ?? '').trim().match(/^(?:(\d+):)?(\d{1,2})\.(\d{2})$/)
  if (!m) return null
  return parseInt(m[1] || '0') * 60 + parseInt(m[2]) + parseInt(m[3]) / 100
}

export default defineEventHandler(async (event) => {
  const q         = getQuery(event)
  const overwrite = q.overwrite === '1' || q.overwrite === 'true'

  const db         = await getDb()
  const collection = db.collection('mergedTimes')

  const filter = overwrite ? {} : { waPoints: { $exists: false } }

  const cursor = collection.find(filter, {
    projection: { _id: 1, course: 1, gender: 1, discipline: 1, distance: 1, timeStamp: 1, time: 1 },
  })

  const BATCH = 500
  let ops:    any[] = []
  let updated  = 0
  let skipped  = 0

  for await (const doc of cursor) {
    const basetime = getBasetime(
      doc.course     || '',
      doc.gender     || '',
      doc.discipline || '',
      doc.distance   || '',
    )

    let timeStamp: number = doc.timeStamp || 0
    if (!timeStamp && doc.time) {
      const sec = parseTimeSeconds(String(doc.time))
      if (sec) timeStamp = sec / 86400
    }

    if (!timeStamp) { skipped++; continue }

    const waPoints = basetime ? calcWAPoints(basetime, timeStamp) : 0
    const $set: Record<string, unknown> = { waPoints }
    if (!doc.timeStamp && timeStamp) $set.timeStamp = timeStamp

    ops.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set },
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
