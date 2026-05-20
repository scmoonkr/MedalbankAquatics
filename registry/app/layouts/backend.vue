<template>
  <div class="be-wrap">
    <header class="be-bar">
      <div class="be-bar-inner">
        <div class="be-brand">
          <span class="be-label">KSR</span>
          <span class="be-sep">/</span>
          <span class="be-title">Backend</span>
        </div>
        <nav class="be-nav">
          <NuxtLink to="/backend/records" :class="{ active: route.path === '/backend/records' }">Records</NuxtLink>
          <NuxtLink to="/backend/times"   :class="{ active: route.path === '/backend/times'   }">Times</NuxtLink>
          <a href="/" class="be-home">← Site</a>
        </nav>
      </div>
    </header>
    <main class="be-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>

<style scoped>
.be-wrap { min-height: 100vh; background: #f5f5f3; font-family: var(--sans); }

.be-bar {
  position: sticky; top: 0; z-index: 100;
  background: #0a0a0a; border-bottom: 1px solid #222;
}
.be-bar-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 48px; gap: 24px;
}
.be-brand { display: flex; align-items: center; gap: 8px; }
.be-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.22em;
  color: #fff; text-transform: uppercase;
}
.be-sep { color: #444; font-size: 14px; }
.be-title { font-size: 11px; letter-spacing: 0.16em; color: #888; text-transform: uppercase; }

.be-nav { display: flex; align-items: center; gap: 4px; }
.be-nav a {
  font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  color: #666; padding: 6px 12px; border-radius: 3px;
  transition: background 0.15s, color 0.15s; text-decoration: none;
}
.be-nav a:hover { background: #1a1a1a; color: #ccc; }
.be-nav a.active { background: #1e3a5f; color: #fff; }
.be-nav a.be-home { margin-left: 8px; color: #555; border-left: 1px solid #222; padding-left: 16px; }

.be-main { padding: 28px 32px; }

@media (max-width: 640px) {
  .be-bar-inner { padding: 0 16px; }
  .be-main { padding: 16px; }
}
</style>
