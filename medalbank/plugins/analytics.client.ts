export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { user } = useUserSession()
  router.afterEach((to) => {
    const key = `pv:${to.path}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    $fetch('/api/log', {
      method: 'POST',
      body: { type: 'view', path: to.path },
    }).catch(() => {})
  })
})
