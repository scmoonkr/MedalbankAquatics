<template>
  <div>
    <header class="topbar">
      <div class="topbar-inner">
        <!-- brand + lock: gap matches .brand's internal gap (14px) -->
        <div class="brand-group" @mouseleave="brandHovered = false">
          <NuxtLink class="brand" to="/">
            <img class="logo-img" src="/images/logo.png" alt="메달뱅크 · Medalbank" />
            <span class="full" :class="{ hovered: brandHovered }" @mouseenter="brandHovered = true">
              <span class="full-default">The Medallion Banca</span>
              <span class="full-hover">Medalbank</span>
            </span>
          </NuxtLink>
          <NuxtLink :to="loggedIn ? '/user' : '/login'" class="lock-btn" :class="{ 'lock-hovered': brandHovered }" :title="loggedIn ? '로그인됨' : '로그인 필요'">
            <!-- closed lock: logged in -->
            <svg v-if="loggedIn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <!-- open lock: not logged in -->
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
            </svg>
          </NuxtLink>
        </div>
        <button
          class="menu-toggle"
          :class="{ open: menuOpen }"
          type="button"
          aria-label="Menu"
          @click.stop="toggleMenu"
        >
          <span></span><span></span><span></span>
        </button>
        <nav class="nav" :class="{ open: menuOpen }" @click.capture="onNavClick">
          <NuxtLink to="/" :class="{ current: route.path === '/' }">
            <span class="nav-en">The Index</span><span class="nav-ko">등재부</span>
          </NuxtLink>
          <NuxtLink to="/errata" :class="{ current: route.path === '/errata' }">
            <span class="nav-en">The Errata</span><span class="nav-ko">정오표</span>
          </NuxtLink>
          <NuxtLink to="/ledger" :class="{ current: route.path === '/ledger' }">
            <span class="nav-en">The Ledger</span><span class="nav-ko">기록대장</span>
          </NuxtLink>
          <NuxtLink to="/canon" :class="{ current: route.path === '/canon' }">
            <span class="nav-en">The Canon</span><span class="nav-ko">정전</span>
          </NuxtLink>
          <NuxtLink to="/charter" :class="{ current: route.path === '/charter' }">
            <span class="nav-en">The Charter</span><span class="nav-ko">헌장</span>
          </NuxtLink>
          <button class="nav-cta" type="button" @click="openSubmit">
            <span>제보하기</span>
            <span class="arrow">→</span>
          </button>
        </nav>
      </div>
    </header>

    <slot />

    <footer class="site">
      <div class="inner">
        <div class="col">
          <h4>Contribute</h4>
          <p>흩어진 기록, 누락된 순위, 정정이 필요한 한 줄을 알고 계신다면 제보해 주세요. 모든 제보자는 실명으로 명예 등재됩니다. (익명 희망시 가능.)</p>
          <button class="footer-submit-btn" type="button" @click="openSubmit">직접 기록 추가하기 →</button>
        </div>
        <div class="col">
          <h4>In Print</h4>
          <p>본 등재부는 대한민국 유일의 수영 전문지이자 정기간행물인 메달뱅크 아쿠아틱스 매거진에 인쇄본으로 함께 실물 출판됩니다. 여러분이 확인해주시는 한 줄 한 줄의 기록은 실제 대한민국 수영의 횃불이 됩니다.</p>
          <a href="https://medalbankaquatics.com" target="_blank" rel="noopener">정기간행물 살펴보기 →</a>
        </div>
        <div class="col">
          <h4>Principles</h4>
          <p>메달뱅크는 네이버 로그인을 통한 검증 절차로 운영됩니다. 여러분이 가장 편리하게 제보하실 수 있도록 준비하였고, 여러분께서 적어주신 한 줄의 정정이 다음 호의 진실이 됩니다. 기여자는 모두 명예 등재자로 영구히 기록됩니다.</p>
          <NuxtLink to="/charter">헌장 열람하기 →</NuxtLink>
        </div>
      </div>
      <div class="imprint">
        <span>© 2026 메달뱅크 by Medalbank · Unofficial · Continuously revised · Powered by
          <a href="https://www.instagram.com/medalbankaquatics" target="_blank" rel="noopener">@medalbankaquatics</a>
        </span>
      </div>
    </footer>

    <SubmitModal     :open="submitOpen"     :initial-data="submitData" @close="closeSubmit" />
    <SubmitFileModal :open="submitFileOpen"                            @close="closeSubmitFile" />

    <Transition name="no-perm-toast">
      <div v-if="noPermission" class="no-perm-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        접근 권한이 없습니다
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)
const brandHovered = ref(false)
const { loggedIn } = useUserSession()

const noPermission = useState('noPermission', () => false)
watch(noPermission, (v) => {
  if (v) setTimeout(() => { noPermission.value = false }, 2800)
})

const submitOpen = ref(false)
const submitData = ref<Record<string, any> | undefined>(undefined)

function openSubmit(data?: Record<string, any>) {
  menuOpen.value = false
  submitData.value = data
  submitOpen.value = true
}
function closeSubmit() {
  submitOpen.value = false
  submitData.value = undefined
}

provide('submitModal', openSubmit)

const submitFileOpen = ref(false)

function openSubmitFile() {
  menuOpen.value = false
  submitFileOpen.value = true
}
function closeSubmitFile() {
  submitFileOpen.value = false
}

provide('submitFileModal', openSubmitFile)

// Index page uses scroll snap; all other pages opt out
useHead({
  htmlAttrs: { class: computed(() => route.path === '/' ? '' : 'no-snap') },
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function onNavClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('a, button')) menuOpen.value = false
}
watch(menuOpen, (open) => {
  if (import.meta.client) document.body.classList.toggle('menu-open', open)
})

function handleOutsideClick(e: MouseEvent) {
  if (!menuOpen.value) return
  const nav = document.querySelector('nav.nav')
  const btn = document.querySelector('.menu-toggle')
  if (!nav?.contains(e.target as Node) && !btn?.contains(e.target as Node)) {
    menuOpen.value = false
  }
}
let touchStartY: number | null = null
function onTouchStart(e: TouchEvent) {
  if (menuOpen.value) touchStartY = e.touches[0].clientY
}
function onTouchMove(e: TouchEvent) {
  if (touchStartY !== null && e.touches[0].clientY - touchStartY < -60) {
    menuOpen.value = false; touchStartY = null
  }
}
function onTouchEnd() { touchStartY = null }

onMounted(() => {
  // brand text 너비 차이 측정 → lock icon translateX 값 설정
  nextTick(() => {
    const defEl  = document.querySelector<HTMLElement>('.full-default')
    const hovEl  = document.querySelector<HTMLElement>('.full-hover')
    if (defEl && hovEl) {
      const diff = defEl.offsetWidth - hovEl.offsetWidth
      if (diff > 0) document.documentElement.style.setProperty('--brand-text-diff', `${diff}px`)
    }
  })

  document.addEventListener('click', handleOutsideClick)
  const nav = document.querySelector('nav.nav')
  nav?.addEventListener('touchstart', onTouchStart as EventListener, { passive: true })
  nav?.addEventListener('touchmove', onTouchMove as EventListener, { passive: true })
  nav?.addEventListener('touchend', onTouchEnd)
})
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.body.classList.remove('menu-open')
})
</script>

<style scoped>
/* brand text swap: Vue 상태 기반 (CSS :hover 미사용 → no flicker)
   - @mouseenter on .full → brandHovered = true
   - @mouseleave on .brand-group → brandHovered = false (그룹 밖으로 나갈 때만)
   - lock transform은 Vue :class로 제어 → CSS hover 반짝거림 없음 */
.full-default { transition: opacity 0.2s; white-space: nowrap; }
.full-hover   { position: absolute; left: 0; top: 50%; transform: translateY(-50%);
                opacity: 0; transition: opacity 0.2s; white-space: nowrap; pointer-events: none; }
.full.hovered .full-default { opacity: 0; }
.full.hovered .full-hover   { opacity: 1; }
.lock-btn { transition: transform 0.2s ease; }
.lock-btn.lock-hovered { transform: translateX(calc(-1 * var(--brand-text-diff, 0px))); }

/* brand-group: brand + lock을 묶어서 gap을 .brand 내부 gap(14px)과 동일하게 유지 */
.brand-group {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 100%;
  min-width: 0;
}
.lock-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--fg-dim, #888);
  transition: color 0.15s;
}
.lock-btn:hover { color: var(--fg, #0a0a0a); }
.lock-btn svg { width: 14px; height: 14px; }
button.nav-cta {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
.footer-submit-btn {
  background: none;
  border: none;
  border-bottom: 1px solid var(--rule);
  padding: 0 0 1px;
  font-family: var(--serif);
  font-style: italic;
  font-size: 16px;
  color: var(--fg);
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s;
}
.footer-submit-btn:hover { opacity: 0.6; }

.no-perm-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 9999;
  white-space: nowrap;
}
.no-perm-toast svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #f87171;
}
.no-perm-toast-enter-active { transition: opacity 0.2s, transform 0.2s; }
.no-perm-toast-leave-active { transition: opacity 0.35s, transform 0.35s; }
.no-perm-toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(8px); }
.no-perm-toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
