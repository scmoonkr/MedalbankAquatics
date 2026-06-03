// 로컬 dev 전용: 모든 요청에서 세션이 없으면 자동으로 dev 유저 주입
// → useUserSession().user가 프론트엔드에서도 채워짐
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') return
  const session = await getUserSession(event)
  if (session.user) return
  await setUserSession(event, {
    user: {
      id:       'dev-local',
      name:     '개발자',
      email:    'library4@naver.com',
      nickname: '개발자',
      avatar:   '',
      provider: 'dev',
    },
  })
})
