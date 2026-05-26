// POST /api/log — client-side analytics events
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, ...data } = body ?? {}
  if (!type || typeof type !== 'string') return { ok: false }

  const session = await getUserSession(event).catch(() => null)
  const userId = (session as any)?.user?.id

  await writeLog(type, { ...data, ...(userId ? { userId } : {}) })
  return { ok: true }
})
