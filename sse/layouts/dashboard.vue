<template>
  <div class="app-shell">

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ open: mobileOpen }">
      <NuxtLink class="sb-logo" to="/home" @click="mobileOpen = false">
        <div class="sb-logo-mark">
          <svg viewBox="0 0 20 20"><path d="M3 10 Q7 5 10 10 Q13 15 17 10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="4" r="2"/></svg>
        </div>
        <div>
          <div class="sb-logo-title">Medalbank SSE</div>
          <div class="sb-logo-sub">수영 주식 거래소</div>
        </div>
      </NuxtLink>

      <div class="sb-profile">
        <div class="av av-lg" style="background:var(--blue-light);color:var(--blue);">{{ user.initial }}</div>
        <div>
          <div class="sb-user-name">{{ user.name }}</div>
          <div class="sb-user-grade">{{ user.grade }}</div>
        </div>
        <div style="margin-left:auto;text-align:right;">
          <div class="sb-coin-val">{{ user.coin.toLocaleString() }}</div>
          <div class="sb-coin-label">보유 코인</div>
        </div>
      </div>

      <nav class="sb-nav">
        <template v-for="sec in nav" :key="sec.title">
          <div class="sb-section-label">{{ sec.title }}</div>
          <NuxtLink
            v-for="it in sec.items" :key="it.to"
            class="sb-item" :class="{ active: isActive(it.to) }"
            :to="it.to" @click="mobileOpen = false"
          >
            <span class="sb-ico">{{ it.icon }}</span> {{ it.label }}
            <span v-if="it.badge" class="sb-badge">{{ it.badge }}</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="sb-footer">
        <NuxtLink class="sb-logout" to="/">↩ 로그아웃</NuxtLink>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="app-main">

      <!-- TOPBAR -->
      <div class="topbar">
        <div class="topbar-left">
          <button class="sb-toggle" aria-label="메뉴" @click="mobileOpen = !mobileOpen">☰</button>
          <span class="topbar-title">{{ pageTitle }}</span>
        </div>
        <div class="topbar-right">
          <NuxtLink class="topbar-notif" to="/notifications">🔔<div class="notif-dot"></div></NuxtLink>
          <div class="av av-md" style="background:var(--blue-light);color:var(--blue);cursor:pointer;">{{ user.initial }}</div>
        </div>
      </div>

      <!-- TICKER -->
      <div class="app-ticker">
        <div class="app-ticker-track">
          <div v-for="item in [...ticker, ...ticker]" :key="item.key + Math.random()" class="ti">
            <div class="tidot" :class="item.up ? 'tidu' : 'tidd'"></div>
            <span class="ti-n">{{ item.name }}</span>
            <span class="ti-p">{{ item.price.toLocaleString() }}</span>
            <span :class="item.up ? 'ti-u' : 'ti-d'">{{ item.up ? '▲' : '▼' }}{{ item.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <slot />
      </div>
    </div>

    <!-- 모바일 사이드바 오버레이 -->
    <div v-if="mobileOpen" class="sb-backdrop" @click="mobileOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const nav = NAV_SECTIONS
const user = SSE_USER
const ticker = useTicker()
const mobileOpen = ref(false)

// 현재 라우트와 일치하는 메뉴 항목 하이라이트
function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

// 상단바 제목 — 현재 메뉴 라벨을 그대로 쓴다
const pageTitle = computed(() => {
  for (const sec of nav) {
    const hit = sec.items.find(it => isActive(it.to))
    if (hit) return hit.label
  }
  return 'Medalbank SSE'
})

// 라우트 이동 시 모바일 메뉴 닫기
watch(() => route.path, () => { mobileOpen.value = false })
</script>

<style scoped>
/* 풀스크린 셸: 사이드바 고정 + 메인 스크롤 (main.css 의 .app-shell/.sidebar 토큰 위에 얹는다) */
.app-shell { height: 100vh; overflow: hidden; }
.app-main  { height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
.content   { flex: 1; padding: 20px 24px; }
.topbar, .app-ticker { flex-shrink: 0; }

.sb-logo { color: inherit; }
.sb-ico  { font-size: 16px; opacity: .7; }

.topbar-left { display: flex; align-items: center; gap: 10px; }
.sb-toggle {
  display: none; border: 1px solid var(--border); background: var(--surface);
  border-radius: var(--r-md); width: 32px; height: 32px; font-size: 15px; color: var(--ink-soft);
}

/* 인라인 티커 (로그인 화면) */
.app-ticker { background: var(--ink); padding: 6px 0; overflow: hidden; }
.app-ticker-track { display: flex; animation: app-ticker 28s linear infinite; width: max-content; }
@keyframes app-ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.ti { display: flex; align-items: center; gap: 7px; padding: 0 22px; border-right: 1px solid rgba(255,255,255,.08); white-space: nowrap; }
.ti-n { font-size: 11px; color: rgba(255,255,255,.5); font-family: var(--mono); }
.ti-p { font-size: 12px; color: #fff; font-family: var(--mono); font-weight: 500; }
.ti-u { font-size: 10px; color: #4ADE80; font-family: var(--mono); }
.ti-d { font-size: 10px; color: #F87171; font-family: var(--mono); }
.tidot { width: 5px; height: 5px; border-radius: 50%; }
.tidu { background: #4ADE80; }
.tidd { background: #F87171; }

.sb-backdrop { display: none; }

/* ── 태블릿 (≤ 1024px): 사이드바 아이콘만 ── */
@media (max-width: 1024px) {
  .sidebar { width: 64px; }
  .sb-logo-title, .sb-logo-sub, .sb-user-name, .sb-user-grade,
  .sb-coin-val, .sb-coin-label, .sb-section-label, .sb-badge { display: none; }
  .sb-profile { flex-direction: column; align-items: center; gap: 4px; padding: 10px 8px; }
  .sb-item { padding: 10px 0; justify-content: center; font-size: 0; }
  .sb-logout { font-size: 0; }
  .app-main { margin-left: 64px; }
}

/* ── 모바일 (≤ 720px): 사이드바 → 슬라이드 드로어 ── */
@media (max-width: 720px) {
  .app-shell { height: auto; overflow: visible; }
  .app-main  { height: auto; overflow-y: visible; margin-left: 0; min-height: 100vh; }
  .sb-toggle { display: inline-flex; align-items: center; justify-content: center; }

  .sidebar {
    width: var(--sidebar-w); transform: translateX(-100%);
    transition: transform .22s ease; z-index: 200;
    flex-direction: column; border-right: 1px solid var(--border);
  }
  .sidebar.open { transform: translateX(0); }
  .sb-logo-title, .sb-logo-sub, .sb-user-name, .sb-user-grade,
  .sb-coin-val, .sb-coin-label, .sb-section-label, .sb-badge { display: block; }
  .sb-profile { flex-direction: row; align-items: center; gap: 10px; padding: 14px 16px; }
  .sb-item { padding: 9px 20px; justify-content: flex-start; font-size: 13px; }
  .sb-logout { font-size: 12px; }

  .sb-backdrop { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.3); z-index: 150; }
  .content { padding: 14px; }
}
</style>
