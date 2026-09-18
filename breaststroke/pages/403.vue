<!-- pages/403.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div class="text-6xl text-red-500 mb-4">🚫</div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-4">403</h1>
      <h2 class="text-xl text-gray-700 mb-6">접근 권한이 없습니다</h2>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <p class="text-sm text-gray-600 mb-2">
          <template v-if="reason === 'level'">
            <strong>레벨 권한 부족:</strong><br>
            필요 레벨: {{ required }}<br>
            현재 레벨: {{ current }}
          </template>
          <template v-else-if="reason === 'role'">
            <strong>역할 권한 부족:</strong><br>
            필요 역할: {{ required }}<br>
            현재 역할: {{ current || '없음' }}
          </template>
          <template v-else>
            이 페이지에 접근하기 위한 권한이 부족합니다.
          </template>
        </p>
      </div>
      
      <div class="space-y-3">
        <div class="flex justify-center space-x-3">
          <button 
            @click="goBack" 
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            이전 페이지
          </button>
          
          <NuxtLink 
            to="/" 
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            홈으로 가기
          </NuxtLink>
        </div>
        
        <button 
          v-if="authStore.isAuthenticated"
          @click="logout" 
          class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          다른 계정으로 로그인
        </button>
        
        <NuxtLink 
          v-else
          to="/auth/signin" 
          class="block w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
        >
          로그인하기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// URL 파라미터에서 오류 정보 가져오기
const reason = route.query.reason
const required = route.query.required
const current = route.query.current

// console.log('403 페이지 로드됨 - 권한 부족:', { 
//   reason, 
//   required, 
//   current,
//   user: authStore.user 
// })

const goBack = () => {
  // 이전 페이지가 있으면 뒤로 가기, 없으면 홈으로
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const logout = () => {
  authStore.logout()
}

// 페이지 메타 설정 (레이아웃 없이 표시)
definePageMeta({
  layout: false
})
</script>