// middleware/auth.js
export default defineNuxtRouteMiddleware((to) => {
  const { $auth } = useNuxtApp()
  
  // console.log('Nuxt middleware 실행됨:', to.path)
  // console.log('메타 정보:', to.meta)
  
  if (to.meta.login && !$auth.isAuthenticated) {
    // console.log('로그인 필요 - 리다이렉트')
    return navigateTo('/auth/signin')
  }
})