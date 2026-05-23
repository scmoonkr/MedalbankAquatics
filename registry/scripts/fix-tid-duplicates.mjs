// node registry/scripts/fix-tid-duplicates.mjs
// mergedTimes에서 tid 중복을 찾아 재부여합니다.

import { MongoClient } from 'mongodb'
import { config }      from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

const {
  MONGODB_ADDR,
  MONGO_USERNAME,
  MONGO_PWD,
  MONGO_DBNAME_BR,
} = process.env

const uri = `mongodb://${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME_BR}?authSource=admin`

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  console.log(`✔ connected → ${MONGO_DBNAME_BR}`)

  const db   = client.db(MONGO_DBNAME_BR)
  const coll = db.collection('mergedTimes')

  // 1. 중복 tid 목록 조회
  console.log('  중복 tid 검색 중...')
  const dupes = await coll.aggregate([
    { $match: { tid: { $exists: true } } },
    { $group: { _id: '$tid', count: { $sum: 1 }, ids: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } },
    { $sort:  { _id: 1 } },
  ]).toArray()

  if (dupes.length === 0) {
    console.log('  ✔ 중복 없음')
    await client.close()
    return
  }

  const dupeCount = dupes.reduce((s, d) => s + d.count - 1, 0)
  console.log(`  중복 tid 그룹: ${dupes.length}개, 영향 도큐먼트: ${dupeCount}개`)

  // 2. 현재 최대 tid
  const maxDoc = await coll.findOne(
    { tid: { $exists: true } },
    { sort: { tid: -1 }, projection: { tid: 1 } },
  )
  let next = (maxDoc?.tid ?? 0) + 1
  console.log(`  새 tid 시작값: ${next}`)

  // 3. 각 중복 그룹에서 첫 번째(_id 오름차순)는 유지, 나머지에 새 tid 부여
  const ops = []
  for (const { ids } of dupes) {
    // _id 오름차순 정렬 → 첫 번째는 그대로, 나머지 재부여
    const sorted = ids.slice().sort((a, b) => (a.toString() < b.toString() ? -1 : 1))
    for (const id of sorted.slice(1)) {
      ops.push({
        updateOne: {
          filter: { _id: id },
          update: { $set: { tid: next++ } },
        },
      })
    }
  }

  // 4. 배치 실행
  const BATCH = 1_000
  let fixed = 0
  for (let i = 0; i < ops.length; i += BATCH) {
    await coll.bulkWrite(ops.slice(i, i + BATCH), { ordered: false })
    fixed += Math.min(BATCH, ops.length - i)
    process.stdout.write(`\r  수정: ${fixed} / ${ops.length}`)
  }
  console.log()

  // 5. counters 동기화
  await db.collection('counters').updateOne(
    { _id: 'mergedTimes_tid' },
    { $set: { seq: next - 1 } },
    { upsert: true },
  )

  console.log(`✔ 완료: ${fixed}개 재부여, maxTid=${next - 1}`)
  await client.close()
}

main().catch(err => {
  console.error('✖ 오류:', err)
  process.exit(1)
})
