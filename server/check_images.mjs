import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config({ path: 'C:/Develop/MedalbankAquatics/server/.env' })

const { MONGODB_ADDR, MONGO_USERNAME, MONGO_PWD, MONGO_DBNAME } = process.env
const uri = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME}?authSource=admin`
const client = new MongoClient(uri)
await client.connect()
const db = client.db(MONGO_DBNAME)

const docs = await db.collection('images').find(
  { image_id: { $in: [39, 40] } },
  { projection: { _id: 0, image_id: 1, consent_date: 1 } }
).toArray()
console.log(JSON.stringify(docs, null, 2))

await client.close()
