import type { Db } from 'mongodb'

const COUNTER_ID = 'mergedTimes_tid'

/**
 * Atomically reserves the next tid for mergedTimes.
 * Uses the `counters` collection: { _id: 'mergedTimes_tid', seq: N }
 */
export async function nextTid(db: Db): Promise<number> {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: COUNTER_ID },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  )
  return (result as unknown as { seq: number }).seq
}

/**
 * Initialise the counter to `value` (only if counter doesn't exist yet, or
 * if the existing seq is less than value). Used by the migration.
 */
export async function initTidCounter(db: Db, value: number): Promise<void> {
  await db.collection('counters').updateOne(
    { _id: COUNTER_ID, $or: [{ seq: { $exists: false } }, { seq: { $lt: value } }] },
    { $set: { seq: value } },
    { upsert: true },
  )
}

/**
 * Self-heal: ensure the counter is not behind the real max(timeID).
 * mergedTimes has a unique `timeID` index; if the counter ever lags the actual
 * max (e.g. historical data inserted past it), nextTid() would hand out a value
 * that already exists → E11000 on insert. Call this before a batch of inserts.
 */
export async function syncTidCounter(db: Db): Promise<void> {
  const top = await db.collection('mergedTimes')
    .find({}, { projection: { _id: 0, timeID: 1 } })
    .sort({ timeID: -1 })
    .limit(1)
    .toArray()
  const maxTid = Number(top[0]?.timeID) || 0
  if (maxTid > 0) {
    // $max only raises seq (never lowers it); upsert creates it if missing.
    await db.collection('counters').updateOne(
      { _id: COUNTER_ID },
      { $max: { seq: maxTid } },
      { upsert: true },
    )
  }
}
