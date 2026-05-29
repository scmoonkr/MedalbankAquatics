<template>
  <div class="be-wrap">

    <!-- Left sidebar -->
    <aside class="be-side">
      <div class="be-brand">
        <span class="be-label">메달뱅크</span>
        <span class="be-title">Backend</span>
      </div>

      <nav class="be-nav">
        <NuxtLink to="/backend/records"      :class="{ active: route.path === '/backend/records'      }">
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Records
        </NuxtLink>
        <NuxtLink to="/backend/cannon"       :class="{ active: route.path === '/backend/cannon'       }">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Cannon
        </NuxtLink>
        <NuxtLink to="/backend/competitions" :class="{ active: route.path === '/backend/competitions' }">
          <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          Competitions
        </NuxtLink>
        <NuxtLink to="/backend/times"        :class="{ active: route.path === '/backend/times'        }">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Times
        </NuxtLink>
        <NuxtLink to="/backend/leaderboard"  :class="{ active: route.path === '/backend/leaderboard'  }">
          <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Leaderboard
        </NuxtLink>
        <NuxtLink to="/backend/errata"       :class="{ active: route.path === '/backend/errata'       }">
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Errata
        </NuxtLink>
        <NuxtLink to="/backend/logs"         :class="{ active: route.path === '/backend/logs'         }">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Logs
        </NuxtLink>
      </nav>

      <div class="be-side-foot">
        <a href="/" class="be-home">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          사이트로
        </a>
        <div v-if="user" class="be-user">
          <img v-if="user.avatar" :src="user.avatar" class="be-avatar" />
          <div class="be-user-info">
            <span class="be-username">{{ user.name || user.nickname }}</span>
            <button class="be-logout" @click="logout">로그아웃</button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="be-main">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useUserSession()

async function logout() {
  await $fetch('/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<style scoped>
.be-wrap {
  display: flex; min-height: 100vh;
  background: #f5f5f3; font-family: var(--sans);
}

/* ── Sidebar ── */
.be-side {
  width: 200px; flex-shrink: 0;
  background: #0d0d0d; display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}

.be-brand {
  padding: 22px 20px 18px;
  border-bottom: 1px solid #1e1e1e;
}
.be-label {
  display: block; font-size: 11px; font-weight: 700;
  letter-spacing: 0.2em; color: #fff; text-transform: uppercase;
}
.be-title {
  display: block; font-size: 10px; letter-spacing: 0.14em;
  color: #555; text-transform: uppercase; margin-top: 3px;
}

/* ── Nav links ── */
.be-nav {
  flex: 1; padding: 10px 0;
  display: flex; flex-direction: column;
}
.be-nav a {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 20px; font-size: 12.5px; letter-spacing: 0.04em;
  color: #777; text-decoration: none;
  transition: background 0.12s, color 0.12s;
  border-left: 2px solid transparent;
}
.be-nav a svg {
  width: 14px; height: 14px; flex-shrink: 0;
  stroke: currentColor; fill: none;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
.be-nav a:hover  { background: #1a1a1a; color: #ccc; }
.be-nav a.active {
  background: #111d2e; color: #93c5fd;
  border-left-color: #3b82f6;
}

/* ── Sidebar footer ── */
.be-side-foot {
  padding: 12px 0 16px;
  border-top: 1px solid #1e1e1e;
}
.be-home {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 20px; font-size: 12px; color: #555;
  text-decoration: none; transition: color 0.12s;
}
.be-home svg {
  width: 13px; height: 13px; flex-shrink: 0;
  stroke: currentColor; fill: none; stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
}
.be-home:hover { color: #aaa; }

.be-user {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 20px 0;
}
.be-avatar { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.be-user-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.be-username {
  font-size: 11.5px; color: #aaa; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.be-logout {
  font-size: 10.5px; color: #555; background: none;
  border: 1px solid #2a2a2a; border-radius: 3px;
  padding: 2px 8px; cursor: pointer; letter-spacing: 0.04em;
  transition: background 0.12s, color 0.12s; text-align: left;
}
.be-logout:hover { background: #1a1a1a; color: #aaa; }

/* ── Main ── */
.be-main { flex: 1; min-width: 0; padding: 28px 32px; overflow-x: auto; }

@media (max-width: 768px) {
  .be-side  { width: 160px; }
  .be-main  { padding: 16px; }
  .be-nav a { padding: 9px 14px; font-size: 12px; }
}
</style>
