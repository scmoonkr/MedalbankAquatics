// POST /api/backend/recalc/wapoints
// 특정 종목의 세계신기록 갱신 시 해당 종목 전체 waPoints 재계산.
// Body (JSON):
//   gender:      'men' | 'women'
//   discipline:  'FR' | 'BA' | 'BR' | 'FL' | 'IM'
//   distance:    '50M' | '100M' | ...
//   course:      'LCM' | 'SCM'
//   basetime?:   number (초) — 생략 시 wapoints.ts 상수 사용

import { getBasetime, calcWAPoints } from '~/server/utils/wapoints'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const gender     = String(body.gender     || '')
  const discipline = String(body.discipline || '')
  const distance   = String(body.distance   || '')
  const course     = String(body.course     || '')
  const customBase = body.basetime ? Number(body.basetime) : null

  if (!gender || !discipline || !distance || !course) {
    throw createError({ statusCode: 400, message: 'gender, discipline, distance, course 필수' })
  }

  const basetime = customBase ?? getBasetime(course, gender, discipline, distance)
  if (basetime === null) {
    throw createError({ statusCode: 400, message: `BASE_TIME 없음: ${course} ${gender} ${discipline} ${distance}` })
  }

  const db         = await getDb()
  const collection = db.collection('mergedTimes')

  const cursor = collection.find(
    { gender, discipline, distance, course, timeStamp: { $gt: 0 } },
    { projection: { _id: 1, timeStamp: 1 } },
  )

  const BATCH = 500
  let ops:    any[] = []
  let updated = 0

  for await (const doc of cursor) {
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

  return { updated, basetime, gender, discipline, distance, course }
})
