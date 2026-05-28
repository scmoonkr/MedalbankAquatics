export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/backend')) return
  // 로컬 dev 환경에서는 로그인 체크 건너뜀
  if (import.meta.dev) return
  const { loggedIn, fetch } = useUserSession()
  await fetch()
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
