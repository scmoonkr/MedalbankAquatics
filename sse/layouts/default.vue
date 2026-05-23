<template>
  <div>
    <header class="topbar">
      <div class="topbar-inner">
        <NuxtLink class="brand" to="/">
          <img class="logo-img" src="/images/logo.png" alt="SSE · Swim Stock Exchange" />
          <span class="full">Swim Stock Exchange</span>
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
            <span class="nav-en">The Exchange</span><span class="nav-ko">시장</span>
          </NuxtLink>
          <NuxtLink to="/athletes" :class="{ current: route.path === '/athletes' }">
            <span class="nav-en">Athletes</span><span class="nav-ko">선수</span>
          </NuxtLink>
          <NuxtLink to="/portfolio" :class="{ current: route.path === '/portfolio' }">
            <span class="nav-en">Portfolio</span><span class="nav-ko">포트폴리오</span>
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
          <h4>Participate</h4>
          <p>아카데미 회원이라면 자동으로 시장에 상장되며, 누구나 응원하는 선수에 투자할 수 있습니다. 참가비가 곧 자산이 되는 구조입니다.</p>
          <a :href="naverFormInsert" target="_blank" rel="noopener">참여 문의 →</a>
        </div>
        <div class="col">
          <h4>In Print</h4>
          <p>매주 주가 변동·이벤트 공시·시즌 결산이 메달뱅크 아쿠아틱스 매거진의 인쇄본과 함께 발표됩니다. 시즌 결산은 연 1회 <strong>평영인의 밤</strong>으로 진행됩니다.</p>
          <a href="https://medalbankaquatics.com" target="_blank" rel="noopener">정기간행물 살펴보기 →</a>
        </div>
        <div class="col">
          <h4>Principles</h4>
          <p>SSE는 실측 기록만 주가에 반영합니다. 훈련 일지는 콘텐츠와 응원의 채널이며, 도핑은 즉시 상장폐지, 투자자는 전액 환불됩니다.</p>
          <NuxtLink to="/charter">헌장 열람하기 →</NuxtLink>
        </div>
      </div>
      <div class="imprint">
        <span>© 2026 Swim Stock Exchange by Medalbank · Pilot Season · Powered by
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
