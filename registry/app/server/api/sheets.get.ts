// GET /api/sheets  — full KSR_DATA sheets, cached 5 minutes
export default defineCachedEventHandler(async () => {
  const db   = await getDb()
  const docs = await db.collection('mergedTimes').find({ round: 'finals' }).toArray()
  return buildSheets(docs)
}, {
  maxAge: 300,   // 5 minutes
  name:   'ksr-sheets',
  getKey: () => 'all',
})
