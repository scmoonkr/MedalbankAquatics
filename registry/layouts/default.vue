<template>
  <div>
    <header class="topbar">
      <div class="topbar-inner">
        <NuxtLink class="brand" to="/">
          <img class="logo-img" src="/images/logo.png" alt="KSR · Korean Swimming Registry" />
          <span class="full">Korean Swimming Registry</span>
        </NuxtLink>
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
          <NuxtLink to="/charter" :class="{ current: route.path === '/charter' }">
            <span class="nav-en">The Charter</span><span class="nav-ko">헌장</span>
          </NuxtLink>
          <a class="nav-cta" :href="naverFormInsert" target="_blank" rel="noopener">
            <span>제보하기</span>
            <span class="arrow">→</span>
          </a>
        </nav>
      </div>
    </header>

    <slot />

    <footer class="site">
      <div class="inner">
        <div class="col">
          <h4>Contribute</h4>
          <p>흩어진 기록, 누락된 순위, 정정이 필요한 한 줄을 알고 계신다면 제보해 주세요. 모든 제보자는 실명으로 명예 등재됩니다. (익명 희망시 가능.)</p>
          <a :href="naverFormInsert" target="_blank" rel="noopener">제보하기 →</a>
        </div>
        <div class="col">
          <h4>In Print</h4>
          <p>본 등재부는 대한민국 유일의 수영 전문지이자 정기간행물인 메달뱅크 아쿠아틱스 매거진에 인쇄본으로 함께 실물 출판됩니다. 여러분이 확인해주시는 한 줄 한 줄의 기록은 실제 대한민국 수영의 횃불이 됩니다.</p>
          <a href="https://medalbankaquatics.com" target="_blank" rel="noopener">정기간행물 살펴보기 →</a>
        </div>
        <div class="col">
          <h4>Principles</h4>
          <p>KSR은 실명 인증과 위키식 검증 절차로 운영됩니다. 한 줄의 정정이 다음 호의 진실이 되며, 기여자는 모두 명예 등재자로 영구히 기록됩니다.</p>
          <NuxtLink to="/charter">헌장 열람하기 →</NuxtLink>
        </div>
      </div>
      <div class="imprint">
        <span>© 2026 Korean Swimming Registry by Medalbank · Unofficial · Continuously revised · Powered by
          <a href="https://www.instagram.com/medalbankaquatics" target="_blank" rel="noopener">@medalbankaquatics</a>
        </span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)
const naverFormInsert = useRuntimeConfig().public.naverFormInsert as string

// Index page uses scroll snap; all other pages opt out
useHead({
  htmlAttrs: { class: computed(() => route.path === '/' ? '' : 'no-snap') },
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function onNavClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('a')) menuOpen.value = false
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
