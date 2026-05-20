import { MongoClient, Db } from 'mongodb'

declare global {
  // persist connection across Nitro hot-reloads
  var __ksrMongo: MongoClient | undefined
}

export async function getDb(): Promise<Db> {
  const config = useRuntimeConfig()
  const { mongoAddr, mongoUser, mongoPwd, mongoDb } = config

  if (!globalThis.__ksrMongo) {
    const uri = `mongodb://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPwd)}@${mongoAddr}/${mongoDb}?authSource=admin`
    globalThis.__ksrMongo = new MongoClient(uri)
    await globalThis.__ksrMongo.connect()
  }

  return globalThis.__ksrMongo.db(mongoDb)
}
