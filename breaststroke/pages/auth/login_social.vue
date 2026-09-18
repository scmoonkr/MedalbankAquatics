<!-- pages/login.vue -->
<template>
  <div class="login-page py-12 bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4">
      <!-- 페이지 헤더 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">로그인</h1>
        <p class="mt-2 text-gray-600">계정에 로그인하여 다양한 서비스를 이용해보세요.</p>
      </div>
      
      <!-- 로그인/회원가입 전환 탭 -->
      <div class="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        <div class="flex border-b">
          <button 
            class="flex-1 py-3 font-medium text-center border-b-2 border-blue-500 text-blue-600"
          >
            로그인
          </button>
          <button 
            class="flex-1 py-3 font-medium text-center text-gray-600 hover:text-gray-800"
            @click="goToSignup"
          >
            회원가입
          </button>
        </div>
        
        <!-- 로그인 컴포넌트 -->
        <div class="p-6">
          <Login @switch-to-signup="goToSignup" />
        </div>
      </div>
      
      <!-- 도움말 및 추가 정보 -->
      <div class="max-w-md mx-auto mt-8 text-center text-gray-600 text-sm">
        <p>로그인에 문제가 있으신가요? <a href="/help" class="text-blue-600 hover:underline">도움말</a>을 확인하세요.</p>
        <p class="mt-2">접속하시면 <a href="/terms" class="text-blue-600 hover:underline">이용약관</a>과 <a href="/privacy" class="text-blue-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Login from '~/components/Login.vue'

export default {
  components: {
    Login
  },
  head() {
    return {
      title: '로그인 - 사이트명',
      meta: [
        { hid: 'description', name: 'description', content: '사이트에 로그인하여 다양한 서비스를 이용해보세요.' }
      ]
    }
  },
  methods: {
    goToSignup() {
      this.$router.push('/signup')
    }
  }
}
</script>