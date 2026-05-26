// POST /api/log — client-side analytics events
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, ...data } = body ?? {}
  if (!type || typeof type !== 'string') return { ok: false }

  const session = await getUserSession(event).catch(() => null)
  const u = (session as any)?.user
  const userFields = u?.id ? { userId: u.id, name: u.name ?? null } : {}

  await writeLog(type, { ...data, ...userFields })
  return { ok: true }
})
