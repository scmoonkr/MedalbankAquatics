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
