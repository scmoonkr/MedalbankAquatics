// node registry/scripts/migrate-tid.mjs
// mergedTimes 컬렉션의 모든 도큐먼트에 tid(1부터 시작)를 부여합니다.
// 이미 tid가 있는 도큐먼트는 건너뜁니다. 재실행 안전.

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

const uri  = `mongodb://${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME_BR}?authSource=admin`
const BATCH = 5_000

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  console.log(`✔ connected → ${MONGO_DBNAME_BR}`)

  const db   = client.db(MONGO_DBNAME_BR)
  const coll = db.collection('mergedTimes')

  // 현재 최대 tid 조회
  const maxDoc = await coll.findOne(
    { tid: { $exists: true } },
    { sort: { tid: -1 }, projection: { tid: 1 } },
  )
  let next = (maxDoc?.tid ?? 0) + 1
  console.log(`  tid 없는 도큐먼트 처리 시작 (next=${next})`)

  // tid 없는 전체 개수
  const total = await coll.countDocuments({ tid: { $exists: false } })
  console.log(`  tid 없는 도큐먼트: ${total.toLocaleString()}개`)

  if (total === 0) {
    console.log('  ✔ 모든 도큐먼트에 이미 tid가 있습니다.')
    await client.close()
    return
  }

  let assigned = 0
  while (true) {
    const batch = await coll
      .find({ tid: { $exists: false } })
      .sort({ _id: 1 })
      .limit(BATCH)
      .project({ _id: 1 })
      .toArray()

    if (batch.length === 0) break

    const ops = batch.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { tid: next++ } },
      },
    }))

    await coll.bulkWrite(ops, { ordered: false })
    assigned += batch.length

    const pct = ((assigned / total) * 100).toFixed(1)
    process.stdout.write(`\r  진행: ${assigned.toLocaleString()} / ${total.toLocaleString()} (${pct}%)`)
  }

  console.log()

  // counters 컬렉션 동기화
  await db.collection('counters').updateOne(
    { _id: 'mergedTimes_tid' },
    { $set: { seq: next - 1 } },
    { upsert: true },
  )

  console.log(`✔ 완료: ${assigned.toLocaleString()}개 부여, maxTid=${next - 1}`)
  await client.close()
}

main().catch(err => {
  console.error('✖ 오류:', err)
  process.exit(1)
})
