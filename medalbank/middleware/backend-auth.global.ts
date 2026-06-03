export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/backend')) return
  // 로컬 dev 환경에서는 체크 건너뜀
  if (import.meta.dev) return

  const { loggedIn, user, fetch } = useUserSession()
  await fetch()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
  if (!['manager', 'admin'].includes((user.value as any)?.role)) {
    useState('noPermission').value = true
    return navigateTo('/')
  }
})
