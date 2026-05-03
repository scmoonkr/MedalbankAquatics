<template>
  <div class="bk-root">
    <aside class="bk-side">
      <div class="bk-brand">
        <span class="bk-brand-main">Medalbank</span>
        <span class="bk-brand-sub">Backend</span>
      </div>
      <nav class="bk-nav">
        <NuxtLink to="/backend/athletes" :class="{ active: route.path === '/backend/athletes' }">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"/></svg>
          선수
        </NuxtLink>
        <NuxtLink to="/backend/meets" :class="{ active: route.path === '/backend/meets' }">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M5 2v2M11 2v2M2 7h12"/></svg>
          대회
        </NuxtLink>
        <NuxtLink to="/backend/images" :class="{ active: route.path === '/backend/images' }">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="5.5" cy="6.5" r="1"/><path d="M2 11l3-3 2.5 2.5L11 7l3 3"/></svg>
          이미지
        </NuxtLink>
        <NuxtLink to="/backend/request" :class="{ active: route.path === '/backend/request' }">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13 3H3a1 1 0 00-1 1v7a1 1 0 001 1h2l3 2 3-2h2a1 1 0 001-1V4a1 1 0 00-1-1z"/></svg>
          촬영요청
        </NuxtLink>
      </nav>
    </aside>
    <main class="bk-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>

<style scoped>
.bk-root {
  display: flex;
  min-height: 100vh;
  background: #0d1117;
  color: #e6edf3;
  font-family: var(--font-sans, sans-serif);
}

/* ── 사이드바 ──────────────────────────────────────────── */
.bk-side {
  width: 192px;
  flex-shrink: 0;
  background: #0d1117;
  border-right: 1px solid #21262d;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 50;
}

.bk-brand {
  padding: 22px 20px 20px;
  border-bottom: 1px solid #21262d;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.bk-brand-main {
  font-size: 13px;
  font-weight: 700;
  color: #e6edf3;
  letter-spacing: 0.04em;
}
.bk-brand-sub {
  font-size: 10px;
  color: #484f58;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bk-nav {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  flex: 1;
}
.bk-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 20px;
  color: #8b949e;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
  border-left: 2px solid transparent;
}
.bk-nav a svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.bk-nav a:hover {
  color: #e6edf3;
  background: #161b22;
}
.bk-nav a:hover svg { opacity: 1; }
.bk-nav a.active {
  color: #e6edf3;
  background: #161b22;
  border-left-color: #388bfd;
}
.bk-nav a.active svg { opacity: 1; }

/* ── 메인 콘텐츠 ──────────────────────────────────────── */
.bk-main {
  flex: 1;
  min-width: 0;
  margin-left: 192px;
}

/* ── 모바일: 상단 바 ───────────────────────────────────── */
@media (max-width: 768px) {
  .bk-side {
    width: 100%;
    height: 48px;
    flex-direction: row;
    align-items: center;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: auto;
    border-right: none;
    border-bottom: 1px solid #21262d;
  }
  .bk-brand {
    padding: 0 14px;
    border-bottom: none;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .bk-brand-sub { display: none; }
  .bk-nav {
    flex-direction: row;
    padding: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .bk-nav::-webkit-scrollbar { display: none; }
  .bk-nav a {
    padding: 0 14px;
    height: 48px;
    font-size: 12px;
    border-left: none;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .bk-nav a.active {
    background: none;
    border-bottom-color: #388bfd;
    color: #e6edf3;
  }
  .bk-nav a svg { display: none; }
  .bk-main {
    margin-left: 0;
    padding-top: 48px;
  }
}
</style>
