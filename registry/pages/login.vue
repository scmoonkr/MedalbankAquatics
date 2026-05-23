<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-brand">
        <span class="login-label">KSR</span>
        <span class="login-sep">/</span>
        <span class="login-title">Backend</span>
      </div>

      <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

      <a href="/auth/naver" class="btn-naver">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
        </svg>
        네이버로 로그인
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const errorMsg = computed(() => {
  const e = route.query.error as string | undefined
  if (!e) return ''
  if (e === 'access_denied') return '로그인이 취소되었습니다.'
  if (e === 'token_failed') return '인증 토큰 발급에 실패했습니다.'
  if (e === 'profile_failed') return '사용자 정보를 가져올 수 없습니다.'
  return '로그인 중 오류가 발생했습니다.'
})
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f3;
  font-family: var(--sans);
}
.login-card {
  background: #fff;
  border: 1px solid #e0e0de;
  border-radius: 6px;
  padding: 48px 40px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.login-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.login-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #0a0a0a;
  text-transform: uppercase;
}
.login-sep { color: #ccc; font-size: 16px; }
.login-title {
  font-size: 13px;
  letter-spacing: 0.16em;
  color: #888;
  text-transform: uppercase;
}
.login-error {
  font-size: 13px;
  color: #c0392b;
  background: #fdf2f2;
  border: 1px solid #f5c6c6;
  border-radius: 4px;
  padding: 8px 14px;
  width: 100%;
  text-align: center;
  margin: 0;
}
.btn-naver {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 20px;
  background: #03c75a;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.15s;
  letter-spacing: 0.02em;
}
.btn-naver:hover { background: #02b350; }
</style>
