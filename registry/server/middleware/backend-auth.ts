export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/backend')) return
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
