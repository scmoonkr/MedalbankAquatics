import { MongoClient } from 'mongodb'
import { config }      from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

const { MONGODB_ADDR, MONGO_USERNAME, MONGO_PWD, MONGO_DBNAME_BR } = process.env
const uri = `mongodb://${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME_BR}?authSource=admin`

const client = new MongoClient(uri)
await client.connect()
const db   = client.db(MONGO_DBNAME_BR)
const coll = db.collection('mergedTimes')

const sample = await coll.findOne({})
console.log('샘플 도큐먼트:')
console.log(JSON.stringify(sample, null, 2))
console.log()

const withTimeID    = await coll.countDocuments({ timeID: { $exists: true } })
const withoutTimeID = await coll.countDocuments({ timeID: { $exists: false } })
console.log('timeID 있음:', withTimeID.toLocaleString())
console.log('timeID 없음:', withoutTimeID.toLocaleString())

await client.close()
