<template>
  <div class="page-body u-wrap">

    <div class="u-card">

      <!-- 상태 헤더 -->
      <div class="u-status">
        <span class="u-dot"></span>
        <span class="u-status-text">로그인됨</span>
      </div>

      <!-- 사용자 정보 -->
      <div class="u-info">

        <div class="u-row u-name-row">
          <span class="u-label">이름</span>
          <span class="u-value u-name">{{ user?.name || '—' }}</span>
          <span class="u-badge">공개</span>
        </div>

        <div class="u-row">
          <span class="u-label">네이버 아이디</span>
          <span class="u-value u-private">{{ user?.email || '—' }}</span>
          <span class="u-badge u-badge-priv">비공개</span>
        </div>

        <div class="u-row">
          <span class="u-label">성별</span>
          <span class="u-value u-private">{{ genderLabel }}</span>
          <span class="u-badge u-badge-priv">비공개</span>
        </div>

        <div class="u-row">
          <span class="u-label">생년월일</span>
          <span class="u-value u-private">{{ dobLabel }}</span>
          <span class="u-badge u-badge-priv">비공개</span>
        </div>

      </div>

      <!-- 안내 -->
      <div class="u-notices">
        <p>
          <strong>이름</strong>은 기록 제보 시 실명으로 사용될 수 있습니다.
          나머지 정보는 로그인·본인인증 목적으로만 사용되며 타인에게 공개되지 않습니다.
        </p>
        <p>
          로그아웃 전까지 로그인 상태가 유지됩니다.
          이 기기를 공유한다면 사용 후 로그아웃하세요.
        </p>
      </div>

      <!-- 로그아웃 -->
      <form action="/auth/logout" method="post" class="u-foot">
        <button type="submit" class="btn-logout">로그아웃</button>
      </form>

    </div>

  </div>
</template>

<script setup lang="ts">
useHead({ title: '내 계정 — KSR · Korean Swimming Registry' })

const { loggedIn, user } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/login')
}

const genderLabel = computed(() => {
  const g = (user.value as any)?.gender
  if (g === 'M') return '남성'
  if (g === 'F') return '여성'
  return '—'
})

const dobLabel = computed(() => {
  const u = user.value as any
  const year = u?.birthyear
  const mmdd = u?.birthday   // "MM-DD"
  if (!year && !mmdd) return '—'
  if (year && mmdd) {
    const [m, d] = mmdd.split('-')
    return `${year}년 ${parseInt(m)}월 ${parseInt(d)}일`
  }
  return year || mmdd || '—'
})
</script>

<style scoped>
.u-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 20px 80px;
  min-height: 60vh;
}
.u-card {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 상태 */
.u-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}
.u-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}
.u-status-text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #22c55e;
}

/* 정보 테이블 */
.u-info {
  border: 1px solid #e8e8e4;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
}
.u-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f0ee;
}
.u-row:last-child { border-bottom: 0; }
.u-label {
  font-size: 11.5px;
  color: #aaa;
  letter-spacing: 0.06em;
  width: 90px;
  flex-shrink: 0;
}
.u-value {
  flex: 1;
  font-size: 14px;
  color: #0a0a0a;
  font-family: var(--sans);
}
.u-name { font-weight: 600; }
.u-private { color: #555; }

/* 배지 */
.u-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 2px 7px;
  border-radius: 2px;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  white-space: nowrap;
}
.u-badge-priv {
  background: #fafaf8;
  color: #aaa;
  border-color: #e8e8e4;
}

/* 안내 */
.u-notices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 2px;
  margin-bottom: 32px;
}
.u-notices p {
  font-size: 12.5px;
  color: #888;
  line-height: 1.8;
  margin: 0;
}
.u-notices strong { color: #555; }

/* 로그아웃 */
.u-foot { margin: 0; }
.btn-logout {
  height: 40px;
  padding: 0 24px;
  border: 1px solid #e0e0de;
  background: #fff;
  font-family: var(--sans);
  font-size: 13px;
  color: #555;
  cursor: pointer;
  border-radius: 3px;
  transition: border-color 0.15s, color 0.15s;
}
.btn-logout:hover {
  border-color: #ef4444;
  color: #ef4444;
}

@media (max-width: 600px) {
  .u-wrap { padding: 40px 16px 60px; }
  .u-label { width: 72px; }
}
</style>
