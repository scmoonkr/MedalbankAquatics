<!-- pages/auth.vue -->
<template>
  <div class="auth-page py-12 bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4">
      <!-- 페이지 헤더 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">{{ isLogin ? '로그인' : '회원가입' }}</h1>
        <p class="mt-2 text-gray-600">
          {{ isLogin ? '계정에 로그인하여 다양한 서비스를 이용해보세요.' : '새 계정을 만들고 다양한 서비스를 이용해보세요.' }}
        </p>
      </div>

      <!-- 로그인/회원가입 전환 탭 -->
      <div class="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        <div class="flex border-b">
          <button class="flex-1 py-3 font-medium text-center"
            :class="isLogin ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'"
            @click="isLogin = true">
            로그인
          </button>
          <button class="flex-1 py-3 font-medium text-center"
            :class="!isLogin ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'"
            @click="isLogin = false">
            회원가입
          </button>
        </div>

        <!-- 로그인/회원가입 컴포넌트 -->
        <div class="p-6">
          <Login v-if="isLogin" @switch-to-signup="isLogin = false" />
          <Signup v-else @switch-to-login="isLogin = true" />
        </div>
      </div>

      <!-- 도움말 및 추가 정보 -->
      <div class="max-w-md mx-auto mt-8 text-center text-gray-600 text-sm">
        <p>
          {{ isLogin ? '로그인' : '회원가입' }}에 문제가 있으신가요?
          <a href="/help" class="text-blue-600 hover:underline">도움말</a>을 확인하세요.
        </p>
        <p class="mt-2">
          {{ isLogin ? '접속' : '가입' }}하시면
          <a href="/terms" class="text-blue-600 hover:underline">이용약관</a>과
          <a href="/privacy" class="text-blue-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Login from '~/components/Login.vue'
import Signup from '~/components/Signup.vue'

export default {
  components: {
    Login,
    Signup
  },
  data() {
    return {
      isLogin: true // true: 로그인 모드, false: 회원가입 모드
    }
  },
  head() {
    return {
      title: this.isLogin ? '로그인 - 사이트명' : '회원가입 - 사이트명',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.isLogin ?
            '사이트에 로그인하여 다양한 서비스를 이용해보세요.' :
            '새 계정을 만들고 다양한 서비스를 이용해보세요.'
        }
      ]
    }
  },
  created() {
    // URL 쿼리 파라미터로 초기 모드 설정
    // 예: /auth?mode=signup 또는 /auth?mode=login
    const mode = this.$route.query.mode
    if (mode === 'signup') {
      this.isLogin = false
    } else if (mode === 'login') {
      this.isLogin = true
    }
  },
  methods: {
    // URL 쿼리 파라미터 업데이트
    updateUrlParam() {
      this.$router.replace({
        query: { ...this.$route.query, mode: this.isLogin ? 'login' : 'signup' }
      })
    }
  },
  watch: {
    // 모드가 변경될 때 URL 업데이트
    isLogin() {
      this.updateUrlParam()
    }
  }
}
</script>