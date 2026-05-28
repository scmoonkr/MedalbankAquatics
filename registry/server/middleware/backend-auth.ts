import { getDb } from '~/server/utils/mongo'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/backend')) return

  // 로컬 dev 환경: admin 세션 자동 주입 후 통과
  if (process.env.NODE_ENV !== 'production') {
    const session = await getUserSession(event)
    if (!session.user) {
      await setUserSession(event, {
        user: { id: 'dev-local', name: '개발자', email: 'library4@naver.com', nickname: '개발자', avatar: '', provider: 'dev', role: 'admin' },
      })
    }
    return
  }

  // 로그인 체크
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // admin 권한 체크 — DB에서 재확인 (세션 위조 방지)
  const db      = await getDb()
  const userDoc = await db.collection('users').findOne(
    { naverId: (session.user as any).id },
    { projection: { role: 1 } },
  )
  if (userDoc?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: admin only' })
  }
})
