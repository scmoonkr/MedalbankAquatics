<template>
  <div>
    <div class="vignette"></div>
    <div class="grain"></div>

    <div class="cursor" id="cursor">
      <img class="cursor-img" src="/images/cursor_2.png" alt="" />
      <div class="label" id="cursorLabel"></div>
    </div>

    <NuxtLink class="logo" to="/" aria-label="메달뱅크 아쿠아틱스 — 메인">
      <img class="logo-img" src="/images/medalbankaquatics.png" alt="Medalbank Aquatics" />
    </NuxtLink>

    <header class="ui">
      <nav class="menu menu-inline">
        <NuxtLink to="/photos"    :class="{ active: route.path === '/photos' }">사진집</NuxtLink>
        <NuxtLink to="/athletes"  :class="{ active: route.path.startsWith('/athlete') }">선수목록</NuxtLink>
        <NuxtLink to="/magazines" :class="{ active: route.path === '/magazines' }">정기간행물</NuxtLink>
        <NuxtLink to="/about"     :class="{ active: route.path === '/about' }">촬영서비스</NuxtLink>
        <NuxtLink to="/request"   :class="{ active: route.path === '/request' }">촬영요청</NuxtLink>
        <NuxtLink to="/consent"   :class="{ active: route.path === '/consent' }">공개요청</NuxtLink>
      </nav>
    </header>

    <button class="menu-toggle" id="menuToggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>

    <div class="menu-overlay" id="menuOverlay" aria-hidden="true">
      <nav class="menu menu-fullscreen">
        <NuxtLink to="/photos">사진집</NuxtLink>
        <NuxtLink to="/athletes">선수목록</NuxtLink>
        <NuxtLink to="/magazines">정기간행물</NuxtLink>
        <NuxtLink to="/about">촬영서비스</NuxtLink>
        <NuxtLink to="/request">촬영요청</NuxtLink>
        <NuxtLink to="/consent">공개요청</NuxtLink>
      </nav>
    </div>

    <slot />

    <footer class="ui">
      <div class="meta-left">
        <div>50+ MEETS · 1,000+ ATHLETES · 1M+ FRAMES</div>
        <div>600MM F4 · 300MM F2.8 · 70-200MM F2.8</div>
        <div class="row-strong">SINCE 2019 · <span id="clock">KST 00:00:00</span></div>
        <div class="insta-mobile">
          <a class="insta" href="https://www.instagram.com/medalbankaquatics" target="_blank" rel="noopener noreferrer">@medalbankaquatics</a>
        </div>
      </div>
      <div class="meta-right">
        <div>EVERY HEAT · EVERY ATHLETE</div>
        <div>NATIONAL · INTERNATIONAL MEETS</div>
        <div>CHAMPIONSHIP-GRADE COVERAGE</div>
        <div><a class="insta" href="https://www.instagram.com/medalbankaquatics" target="_blank" rel="noopener noreferrer">@medalbankaquatics</a></div>
      </div>
    </footer>

    <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="사진 확대 보기">
      <div class="lightbox-bg" id="lightboxBg"></div>
      <div class="lightbox-frame">
        <img class="lightbox-img" id="lightboxImg" alt="" />
        <button class="lightbox-close" id="lightboxClose" type="button" aria-label="닫기">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18"/>
            <line x1="18" y1="6" x2="6" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
