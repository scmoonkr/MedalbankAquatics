export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/backend')) return
  // 로컬 dev 환경: 자동 dev 세션 주입 후 통과
  if (process.env.NODE_ENV !== 'production') {
    const session = await getUserSession(event)
    if (!session.user) {
      await setUserSession(event, {
        user: { id: 'dev-local', name: '개발자', email: 'library4@naver.com', nickname: '개발자', avatar: '', provider: 'dev' },
      })
    }
    return
  }
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
