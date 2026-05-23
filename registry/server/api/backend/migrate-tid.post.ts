// POST /api/backend/migrate-tid
// One-time migration: assign tid 1, 2, 3 … to every mergedTimes doc that
// doesn't already have one, ordered by _id (insertion order).
// Safe to re-run — skips docs that already have tid.
// Processes in batches of 5000 to avoid memory issues with large collections.
import { initTidCounter } from '~/server/utils/tid'

const BATCH = 5_000

export default defineEventHandler(async () => {
  const db   = await getDb()
  const coll = db.collection('mergedTimes')

  // Find the current max tid (from docs that already have it)
  const maxDoc = await coll.findOne(
    { tid: { $exists: true } },
    { sort: { tid: -1 }, projection: { tid: 1 } },
  )
  let next = (maxDoc?.tid ?? 0) + 1

  let totalAssigned = 0

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
    totalAssigned += batch.length
  }

  if (totalAssigned > 0) {
    await initTidCounter(db, next - 1)
  }

  return { ok: true, assigned: totalAssigned, maxTid: next - 1 }
})
