export async function writeLog(type: string, data?: Record<string, unknown>) {
  try {
    const db = await getDb()
    await db.collection('logs').insertOne({ type, time: new Date(), ...(data ?? {}) })
  } catch {}
}
