export default defineEventHandler(async (event) => {
  const session = await getUserSession(event).catch(() => null)
  const user = (session as any)?.user
  if (user?.id) await writeLog('logout', { userId: user.id, name: user.name })
  await clearUserSession(event)
  return sendRedirect(event, '/login')
})
