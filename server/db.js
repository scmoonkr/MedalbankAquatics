import { MongoClient } from 'mongodb'

let client
let db

export async function connectDB() {
  const { MONGODB_ADDR, MONGO_USERNAME, MONGO_PWD, MONGO_DBNAME } = process.env
  const uri = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME}?authSource=admin`
  client = new MongoClient(uri)
  await client.connect()
  db = client.db(MONGO_DBNAME)
  console.log(`MongoDB connected: ${MONGO_DBNAME}`)
}

export function getDB() {
  if (!db) throw new Error('DB not initialized. Call connectDB() first.')
  return db
}
