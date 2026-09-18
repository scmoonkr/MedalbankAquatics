<!-- pages/signup.vue -->
<template>
  <div class="signup-page py-12 bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4">
      <!-- 페이지 헤더 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">회원가입</h1>
        <p class="mt-2 text-gray-600">새 계정을 만들고 다양한 서비스를 이용해보세요.</p>
      </div>
      
      <!-- 로그인/회원가입 전환 탭 -->
      <div class="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        <div class="flex border-b">
          <button 
            class="flex-1 py-3 font-medium text-center text-gray-600 hover:text-gray-800"
            @click="goToLogin"
          >
            로그인
          </button>
          <button 
            class="flex-1 py-3 font-medium text-center border-b-2 border-blue-500 text-blue-600"
          >
            회원가입
          </button>
        </div>
        
        <!-- 회원가입 컴포넌트 -->
        <div class="p-6">
          <Signup @switch-to-login="goToLogin" />
        </div>
      </div>
      
      <!-- 도움말 및 추가 정보 -->
      <div class="max-w-md mx-auto mt-8 text-center text-gray-600 text-sm">
        <p>회원가입에 문제가 있으신가요? <a href="/help" class="text-blue-600 hover:underline">도움말</a>을 확인하세요.</p>
        <p class="mt-2">가입하시면 <a href="/terms" class="text-blue-600 hover:underline">이용약관</a>과 <a href="/privacy" class="text-blue-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Signup from '~/components/Signup.vue'

export default {
  components: {
    Signup
  },
  head() {
    return {
      title: '회원가입 - 사이트명',
      meta: [
        { hid: 'description', name: 'description', content: '새 계정을 만들고 다양한 서비스를 이용해보세요.' }
      ]
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/auth/signin')
    }
  }
}
</script>