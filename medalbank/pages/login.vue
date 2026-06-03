<template>
  <div class="login-wrap">
    <div class="login-card">

      <div class="login-logo">
        <img src="/images/logo.png" alt="메달뱅크" class="login-logo-img" />
        <div class="login-logo-text">
          <span class="login-site">메달뱅크</span>
          <span class="login-sub">로그인</span>
        </div>
      </div>

      <p class="login-desc">
        대한민국수영등재부의 모든 컨텐츠는 로그인 없이도 100% 이용 가능합니다.<br>
        본 사이트는 <strong>네이버 아이디</strong>를 통한 로그인만 허용합니다.
      </p>

      <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

      <a href="/auth/naver" class="btn-naver">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
        </svg>
        네이버로 로그인
      </a>

      <p class="login-note">
        제보 또는 기여를 희망하시는 경우, 로그인은 필수입니다.<br>
        로그인 시 이름·성별·생년월일 등 네이버 계정 정보 일부가 수집되며,<br>
        본인인증 및 제보 실명 확인 목적으로만 사용됩니다.
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '로그인 — 메달뱅크 · Medalbank' })

const route = useRoute()
const errorMsg = computed(() => {
  const e = route.query.error as string | undefined
  if (!e) return ''
  if (e === 'access_denied') return '로그인이 취소되었습니다.'
  if (e === 'token_failed') return '인증 토큰 발급에 실패했습니다.'
  if (e === 'profile_failed') return '사용자 정보를 가져올 수 없습니다.'
  if (e === 'not_allowed') return '입력하신 아이디로 로그인할 수 없습니다.\n현재 Medalbank은 개발 중 상태입니다.\n개발 중 상태에서는 등록된 아이디만 로그인할 수 있습니다.\n자세한 사항은 Medalbank 관리자에게 문의 바랍니다.'
  return '로그인 중 오류가 발생했습니다.'
})
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-soft, #f5f5f3);
  font-family: var(--sans);
  padding: 40px 16px;
}
.login-card {
  background: #fff;
  border: 1px solid #e0e0de;
  border-radius: 6px;
  padding: 48px 40px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.login-logo {
  display: flex;
  align-items: center;
  gap: 14px;
}
.login-logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.login-logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.login-site {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #0a0a0a;
}
.login-sub {
  font-size: 11px;
  color: #aaa;
  letter-spacing: 0.1em;
}
.login-desc {
  font-size: 13px;
  color: #555;
  line-height: 1.8;
  text-align: center;
  margin: 0;
}
.login-desc strong { color: #0a0a0a; }
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
  white-space: pre-line;
  line-height: 1.75;
}
.btn-naver {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 13px 20px;
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
.login-note {
  font-size: 11.5px;
  color: #aaa;
  line-height: 1.8;
  text-align: center;
  margin: 0;
  border-top: 1px solid #f0f0ee;
  padding-top: 16px;
  width: 100%;
}
</style>
