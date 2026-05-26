export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  router.afterEach((to) => {
    const key = `pv:${to.path}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    $fetch('/api/log', {
      method: 'POST',
      body: { type: 'pageview', path: to.path },
    }).catch(() => {})
  })
})
