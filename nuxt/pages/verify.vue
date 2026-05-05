<template>
<main class="verify-shell">
  <div class="verify-box">

    <div v-if="state === 'loading'" class="state-loading">
      <span class="spinner"></span>
      <p>인증 처리 중입니다…</p>
    </div>

    <div v-else-if="state === 'success'" class="state-success">
      <div class="icon">
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <polyline points="4 14, 11 21, 24 7" />
        </svg>
      </div>
      <h1>동의가 완료되었습니다.</h1>
      <p>{{ result.name }}님의 공개 동의가 정상적으로 처리되었습니다.<br />선택하신 <strong>{{ result.modified_count ?? result.image_ids?.length ?? 0 }}장</strong>의 사진이 공개 처리됩니다.</p>
      <NuxtLink class="home-link" to="/">메인으로 돌아가기 →</NuxtLink>
    </div>

    <div v-else-if="state === 'already'" class="state-success">
      <div class="icon">
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <polyline points="4 14, 11 21, 24 7" />
        </svg>
      </div>
      <h1>이미 완료된 인증입니다.</h1>
      <p>{{ result.name }}님의 동의는 이미 처리되었습니다.</p>
      <NuxtLink class="home-link" to="/">메인으로 돌아가기 →</NuxtLink>
    </div>

    <div v-else class="state-error">
      <div class="icon error">
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <line x1="7" y1="7" x2="21" y2="21"/>
          <line x1="21" y1="7" x2="7" y2="21"/>
        </svg>
      </div>
      <h1>인증에 실패했습니다.</h1>
      <p>{{ errorMsg }}</p>
      <NuxtLink class="home-link" to="/">메인으로 돌아가기 →</NuxtLink>
    </div>

  </div>
</main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: "메달뱅크 아쿠아틱스 — 동의 인증" })

const route = useRoute()
const state    = ref<'loading' | 'success' | 'already' | 'error'>('loading')
const result   = ref<{ name?: string; image_ids?: number[]; modified_count?: number }>({})
const errorMsg = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    errorMsg.value = '유효하지 않은 링크입니다.'
    state.value = 'error'
    return
  }
  try {
    const data = await $fetch<{ ok: boolean; already?: boolean; name?: string; image_ids?: number[]; modified_count?: number }>(
      '/api/consent-verify', { query: { token } }
    )
    result.value = data
    state.value  = data.already ? 'already' : (data.modified_count === 0 && (data.image_ids?.length ?? 0) > 0 ? 'error' : 'success')
    if (state.value === 'error') errorMsg.value = `인증 처리 중 오류가 발생했습니다. (이미지 업데이트 실패)`
  } catch (e: any) {
    errorMsg.value = e?.data?.error ?? '오류가 발생했습니다.'
    state.value = 'error'
  }
})
</script>

<style scoped>
.verify-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
.verify-box {
  max-width: 520px;
  width: 100%;
  text-align: center;
}
.icon {
  width: 64px; height: 64px;
  margin: 0 auto 28px;
  border-radius: 50%;
  border: 1.5px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon svg {
  width: 28px; height: 28px;
  stroke: var(--accent);
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.icon.error { border-color: #ff4040; }
.icon.error svg { stroke: #ff4040; }
h1 {
  font-family: var(--font-myungjo);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 400;
  margin-bottom: 18px;
  letter-spacing: -0.01em;
}
p {
  font-family: var(--font-myungjo);
  font-size: 15px;
  line-height: 1.7;
  color: var(--fg-dim);
  margin-bottom: 32px;
}
p strong { color: var(--fg); font-weight: 400; }
.home-link {
  display: inline-block;
  padding: 12px 28px;
  border: 1px solid var(--line);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  transition: border-color 0.3s, color 0.3s;
}
.home-link:hover { border-color: var(--fg-dim); }

.state-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: var(--fg-faint);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.1em;
}
.spinner {
  width: 32px; height: 32px;
  border: 2px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
