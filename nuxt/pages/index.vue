<template>
  <div>
    <div class="loader" id="loader"></div>
    <div class="vignette"></div>
    <div class="stage-dim"></div>
    <div class="grain"></div>

    <NuxtLink class="logo" to="/" aria-label="Medalbank Aquatics — Home">
      <img class="logo-img" src="/images/medalbankaquatics.png" alt="Medalbank Aquatics" />
    </NuxtLink>

    <header class="ui">
      <nav class="menu menu-inline">
        <NuxtLink to="/photos">사진집</NuxtLink>
        <NuxtLink to="/magazines">정기간행물</NuxtLink>
        <NuxtLink to="/about">촬영서비스</NuxtLink>
        <NuxtLink to="/consent">확인요청</NuxtLink>
      </nav>
    </header>

    <button class="menu-toggle" id="menuToggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>

    <div class="menu-overlay" id="menuOverlay" aria-hidden="true">
      <nav class="menu menu-fullscreen">
        <NuxtLink to="/photos">사진집</NuxtLink>
        <NuxtLink to="/magazines">정기간행물</NuxtLink>
        <NuxtLink to="/about">촬영서비스</NuxtLink>
        <NuxtLink to="/consent">확인요청</NuxtLink>
      </nav>
    </div>

    <footer class="ui">
      <div class="meta-left">
        <div class="insta-mobile">
          <a class="insta" href="https://www.instagram.com/medalbankaquatics" target="_blank" rel="noopener noreferrer">@medalbankaquatics</a>
        </div>
        <div>50+ MEETS · 1,000+ ATHLETES · 1M+ FRAMES</div>
        <div>600MM F4 · 300MM F2.8 · 70-200MM F2.8</div>
        <div class="row-strong">SINCE 2019 · <span id="clock">KST 00:00:00</span></div>
      </div>
      <div class="meta-right">
        <div><a class="insta" href="https://www.instagram.com/medalbankaquatics" target="_blank" rel="noopener noreferrer">@medalbankaquatics</a></div>
        <div>EVERY HEAT · EVERY ATHLETE</div>
        <div>NATIONAL · INTERNATIONAL MEETS</div>
        <div>CHAMPIONSHIP-GRADE COVERAGE</div>
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

    <div class="hint">드래그<span class="sep">|</span>스크롤<span class="sep">|</span>클릭<span class="sep">|</span><span class="swim">평영 화이팅</span></div>

    <div id="stage"></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, ssr: false })

useHead({
  title: 'Medalbank Aquatics — Immersive Archive',
  bodyAttrs: { class: 'is-home' },
})

type GalleryImage = { image_id: number; urls: { thumb: string; original: string } }

onMounted(async () => {
  const galleryImages = await $fetch<GalleryImage[]>('/api/gallery').catch(() => [] as GalleryImage[])

  ;(() => {
    'use strict'

    const imageCount = galleryImages.length || 150

    const CFG = {
      desktopCols: 5.5, tabletCols: 3.5, mobileCols: 3.5,
      tabletBreak: 1200, mobileBreak: 768,
      gapDesktop: 14, gapMobile: 8,
      aspectRatio: 4 / 5,
      friction: 0.93, wheelMul: 0.55, dragMul: 1.0, maxVel: 70,
      curveRatio: 0.30, curveVelBoost: 1.5,
      clickThreshold: 6, snapEase: 0.18,
      bufferTiles: 1, imageCount,
    }

    const imgUrl = (idx: number) => galleryImages[idx]?.urls?.thumb ?? ''
    const xlUrl  = (idx: number) => galleryImages[idx]?.urls?.original ?? ''
    const URL_CACHE: string[] = []
    for (let i = 0; i < CFG.imageCount; i++) URL_CACHE[i] = `url("${imgUrl(i)}")`

    const S: any = {
      camX: 0, camY: 0, velX: 0, velY: 0, smoothVelX: 0,
      targetCamX: null, isDown: false, isDragging: false,
      lastPX: 0, lastPY: 0, moveDist: 0,
      tileW: 320, tileH: 400, gap: 14, cols: 8, rows: 5,
      fullCols: 5, perRow: 6, tiles: [], visible: true,
    }

    const stage   = document.getElementById('stage')!
    const clockEl = document.getElementById('clock')!

    function computeSize() {
      const vw = window.innerWidth, vh = window.innerHeight
      const target = vw < CFG.mobileBreak ? CFG.mobileCols
                   : vw < CFG.tabletBreak ? CFG.tabletCols : CFG.desktopCols
      S.gap = vw < CFG.mobileBreak ? CFG.gapMobile : CFG.gapDesktop
      S.fullCols = Math.floor(target)
      S.perRow   = Math.ceil(target)
      S.tileW = (vw - (S.fullCols + 1) * S.gap) / target
      S.tileH = S.tileW / CFG.aspectRatio
      S.cols  = Math.ceil(vw / (S.tileW + S.gap)) + 1 + CFG.bufferTiles * 2
      S.rows  = Math.ceil(vh / (S.tileH + S.gap)) + CFG.bufferTiles * 2 + 1
      stage.style.setProperty('--gap', S.gap + 'px')
    }

    const centerCamX = () =>
      (S.fullCols * S.tileW + (S.fullCols - 1) * S.gap - window.innerWidth) / 2

    function preloadImages() {
      for (let i = 0; i < CFG.imageCount; i++) {
        const im = new Image(); im.src = imgUrl(i)
      }
    }

    function buildPool() {
      stage.innerHTML = ''; S.tiles = []
      for (let i = 0; i < S.cols * S.rows; i++) {
        const t = document.createElement('div')
        t.className = 'tile'
        t.style.width  = S.tileW + 'px'
        t.style.height = S.tileH + 'px'
        const num = document.createElement('span')
        num.className = 'tile-number'
        t.appendChild(num)
        t.dataset.cell = ''
        t.addEventListener('click', onTileClick)
        stage.appendChild(t)
        S.tiles.push(t)
      }
    }

    function imageIndexFor(ci: number, cj: number) {
      const slot = ((ci % S.perRow) + S.perRow) % S.perRow
      const idx  = cj * S.perRow + slot
      return ((idx % CFG.imageCount) + CFG.imageCount) % CFG.imageCount
    }

    function render() {
      if (!S.visible) { requestAnimationFrame(render); return }

      if (S.targetCamX !== null && !S.isDown) {
        const diff = S.targetCamX - S.camX
        if (Math.abs(diff) < 0.5) { S.camX = S.targetCamX; S.targetCamX = null; S.velX = 0 }
        else { S.camX += diff * CFG.snapEase; S.velX = 0 }
      } else if (!S.isDragging) {
        S.camX += S.velX; S.camY += S.velY
        S.velX *= CFG.friction; S.velY *= CFG.friction
        if (Math.abs(S.velX) < 0.05) S.velX = 0
        if (Math.abs(S.velY) < 0.05) S.velY = 0
      }

      S.smoothVelX += (S.velX - S.smoothVelX) * 0.10

      const vw = window.innerWidth
      const cellW = S.tileW + S.gap, cellH = S.tileH + S.gap
      const baseI = Math.floor(S.camX / cellW) - CFG.bufferTiles
      const baseJ = Math.floor(S.camY / cellH) - CFG.bufferTiles
      const speedFactor   = Math.min(1, Math.abs(S.smoothVelX) / CFG.maxVel)
      const curveStrength = S.tileH * CFG.curveRatio * (1 + speedFactor * CFG.curveVelBoost)

      let idx = 0
      for (let row = 0; row < S.rows; row++) {
        for (let col = 0; col < S.cols; col++) {
          const t = S.tiles[idx++]; if (!t) continue
          const ci = baseI + col, cj = baseJ + row
          const sx = ci * cellW - S.camX
          let   sy = cj * cellH - S.camY
          const offX    = (sx + S.tileW / 2 - vw / 2) / (vw / 2)
          const clamped = Math.max(-1.4, Math.min(1.4, offX))
          sy += (1 - Math.cos(clamped * Math.PI / 2)) * curveStrength
          t.style.transform = `translate3d(${sx}px, ${sy}px, 0)`
          const cellKey = ci + ',' + cj
          if (t.dataset.cell !== cellKey) {
            t.dataset.cell = cellKey
            const imgIdx = imageIndexFor(ci, cj)
            t.dataset.imgIdx = String(imgIdx)
            t.style.setProperty('--bg-img', URL_CACHE[imgIdx])
            t.firstElementChild!.textContent = String(imgIdx + 1)
          }
        }
      }
      requestAnimationFrame(render)
    }

    const getPoint = (e: any) => e.touches?.[0]
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY }
    const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v))

    function onDown(e: any) {
      const p = getPoint(e)
      S.isDown = true; S.isDragging = false
      S.lastPX = p.x; S.lastPY = p.y; S.moveDist = 0
      S.velX = 0; S.velY = 0; S.targetCamX = null
      if (e.cancelable) e.preventDefault()
    }
    function onMove(e: any) {
      const p = getPoint(e)
      if (S.isDown) {
        const dx = p.x - S.lastPX, dy = p.y - S.lastPY
        S.moveDist += Math.abs(dx) + Math.abs(dy)
        if (S.moveDist > CFG.clickThreshold) S.isDragging = true
        if (S.isDragging) {
          S.camX -= dx * CFG.dragMul; S.camY -= dy * CFG.dragMul
          S.velX = clamp(-dx * CFG.dragMul * 0.65, -CFG.maxVel, CFG.maxVel)
          S.velY = clamp(-dy * CFG.dragMul * 0.65, -CFG.maxVel, CFG.maxVel)
        }
        S.lastPX = p.x; S.lastPY = p.y
      }
    }
    function onUp() { S.isDown = false; S.isDragging = false }
    function onWheel(e: WheelEvent) {
      e.preventDefault(); S.targetCamX = null
      S.velX = clamp(S.velX + e.deltaX * CFG.wheelMul, -CFG.maxVel, CFG.maxVel)
      S.velY = clamp(S.velY + e.deltaY * CFG.wheelMul, -CFG.maxVel, CFG.maxVel)
    }
    function onTileClick(e: MouseEvent) {
      if (S.moveDist > CFG.clickThreshold) return
      const t = e.currentTarget as HTMLElement
      t.classList.remove('clicked'); void t.offsetWidth; t.classList.add('clicked')
      t.addEventListener('animationend', () => t.classList.remove('clicked'), { once: true })
      openLightbox(parseInt(t.dataset.imgIdx!, 10))
    }

    stage.addEventListener('click', (e) => {
      if (S.moveDist > CFG.clickThreshold || e.target !== stage) return
      S.targetCamX = centerCamX()
    })

    // Lightbox (index has its own inline lightbox logic)
    const lightbox      = document.getElementById('lightbox')!
    const lightboxImg   = document.getElementById('lightboxImg') as HTMLImageElement
    const lightboxBg    = document.getElementById('lightboxBg')!
    const lightboxClose = document.getElementById('lightboxClose')!

    function openLightbox(imgIdx: number) {
      const thumbUrl = imgUrl(imgIdx), bigUrl = xlUrl(imgIdx)
      lightboxImg.removeAttribute('src')
      lightboxImg.style.opacity = '0'
      lightboxImg.alt = `Photo #${imgIdx + 1}`
      lightboxImg.dataset.currentIdx = String(imgIdx)
      lightboxBg.style.backgroundImage = `url("${thumbUrl}")`
      lightbox.classList.add('open')
      lightbox.setAttribute('aria-hidden', 'false')
      document.body.classList.add('lb-open')
      S.velX = 0; S.velY = 0; S.isDown = false; S.isDragging = false
      const hiRes = new Image()
      hiRes.onload = () => {
        if (lightbox.classList.contains('open') &&
            lightboxImg.dataset.currentIdx === String(imgIdx)) {
          lightboxImg.src = bigUrl
          lightboxImg.style.opacity = '1'
          lightboxBg.style.backgroundImage = `url("${bigUrl}")`
        }
      }
      hiRes.src = bigUrl
    }
    function closeLightbox() {
      if (!lightbox.classList.contains('open')) return
      lightbox.classList.remove('open')
      lightbox.setAttribute('aria-hidden', 'true')
      document.body.classList.remove('lb-open')
      setTimeout(() => {
        if (!lightbox.classList.contains('open')) {
          lightboxImg.removeAttribute('src')
          lightboxImg.style.opacity = '0'
          lightboxBg.style.backgroundImage = ''
        }
      }, 500)
    }
    lightbox.addEventListener('click', (e) => {
      if ((e.target as Element).closest('.lightbox-close')) { closeLightbox(); return }
      if ((e.target as Element).closest('.lightbox-frame')) return
      closeLightbox()
    })
    lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox() })
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox()
    })

    // Clock
    const tick = () => {
      clockEl.textContent = 'KST ' + new Date().toLocaleTimeString('en-GB', {
        hour12: false, timeZone: 'Asia/Seoul',
      })
    }
    tick(); setInterval(tick, 1000)

    // Resize
    let resizeTimer: ReturnType<typeof setTimeout>
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        computeSize(); buildPool()
        S.camX = centerCamX(); S.camY = -S.gap; S.targetCamX = null
      }, 150)
    })
    document.addEventListener('visibilitychange', () => { S.visible = !document.hidden })

    // Init
    preloadImages(); computeSize(); buildPool()
    S.camX = centerCamX(); S.camY = -S.gap; S.velX = 0

    stage.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    stage.addEventListener('touchstart', onDown, { passive: false })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    stage.addEventListener('wheel', onWheel, { passive: false })
    document.addEventListener('touchmove', (e) => { if (S.isDown) e.preventDefault() }, { passive: false })

    requestAnimationFrame(render)

    // Loader sequence
    const loader = document.getElementById('loader')!

    function startGalleryReveal() {
      const centerCol = (S.cols - 1) / 2
      let idx = 0
      for (let row = 0; row < S.rows; row++) {
        for (let col = 0; col < S.cols; col++) {
          const t = S.tiles[idx++]; if (!t) continue
          const delay = row * 160 + Math.abs(col - centerCol) * 30
          t.style.setProperty('--reveal-delay', delay + 'ms')
        }
      }
      void document.body.offsetHeight
      document.body.classList.add('revealed')
    }

    function startLoaderSequence() {
      const t1 = 200 + 900 + 1300
      const t2 = t1 + 250
      const t3 = t1 + 1100
      const t4 = t2 + 2000
      setTimeout(() => { document.body.classList.add('logo-done'); loader.classList.add('gone') }, t1)
      setTimeout(startGalleryReveal, t2)
      setTimeout(() => loader.classList.add('removed'), t3)
      setTimeout(() => {
        document.body.classList.add('hint-on')
        let dismissed = false
        const dismiss = () => { if (dismissed) return; dismissed = true; document.body.classList.add('hint-dismissed') }
        setTimeout(dismiss, 7000)
        ;['mousedown', 'touchstart', 'wheel'].forEach(ev =>
          window.addEventListener(ev, dismiss, { once: true, passive: true }))
      }, t4)
    }

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (REDUCED) {
      document.body.classList.add('logo-done')
      loader.classList.add('removed')
      document.body.classList.add('revealed', 'hint-on')
    } else {
      startLoaderSequence()
    }
  })()
})
</script>

<style>
:root {
  --bg:        #07090f;
  --tile-bg:   #0d1119;
  --fg:        #ffffff;
  --fg-dim:    rgba(255,255,255,0.55);
  --fg-faint:  rgba(255,255,255,0.28);
  --accent:    #38B6FF;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
body.is-home {
  width: 100%; height: 100vh; height: 100dvh;
  overflow: hidden; overscroll-behavior: none;
  user-select: none; -webkit-user-select: none;
  position: fixed; inset: 0;
  opacity: 0; animation: pageIn 0.9s 0.15s ease-out forwards;
}
@keyframes pageIn { to { opacity: 1; } }
#stage {
  position: fixed; inset: 0; overflow: hidden; touch-action: none;
  --gap: 14px;
}
.tile {
  position: absolute; top: 0; left: 0;
  background-color: var(--tile-bg); overflow: hidden;
  will-change: transform, opacity;
  transform: translate3d(-9999px, -9999px, 0);
  contain: layout paint; opacity: 0;
  transition: opacity 1.1s cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: var(--reveal-delay, 0ms);
}
body.revealed .tile { opacity: 1; }
.tile::before {
  content: ''; position: absolute; inset: 0;
  background-image: var(--bg-img, none);
  background-size: cover; background-position: center; background-repeat: no-repeat;
  filter: grayscale(0.2) brightness(0.95);
  transition: filter 0.6s ease-out; z-index: 0;
}
.tile:hover::before { filter: none; transition: filter 0.35s ease-out; }
.stage-dim {
  position: fixed; inset: 0; z-index: 6; pointer-events: none; opacity: 0;
  background: rgba(0,0,0,0.35);
  -webkit-backdrop-filter: grayscale(1) brightness(0.45) contrast(0.95);
  backdrop-filter: grayscale(1) brightness(0.45) contrast(0.95);
  transition: opacity 1.0s ease-in-out; will-change: opacity;
}
body:has(.logo:hover) .stage-dim,
body:has(nav.menu:hover) .stage-dim { opacity: 1; }
.tile::after {
  content: ''; position: absolute; inset: 0;
  background: #fff; opacity: 0; pointer-events: none; z-index: 1;
}
.tile.clicked::after { animation: clickFlash 0.45s ease-out; }
@keyframes clickFlash { 0%{opacity:0} 18%{opacity:0.20} 100%{opacity:0} }
.tile-number {
  position: absolute;
  top: calc(var(--gap) - 0.18em); left: var(--gap);
  color: #fff; font-family: 'Playfair Display', Georgia, serif;
  font-style: italic; font-size: 50px; font-weight: 400;
  letter-spacing: -0.015em; line-height: 1; opacity: 0.10;
  mix-blend-mode: difference; pointer-events: none; z-index: 2;
  font-variant-numeric: tabular-nums; font-feature-settings: "tnum";
}
@media (max-width: 768px) { .tile-number { font-size: 32px; opacity: 0.16; } }

.ui {
  position: fixed; z-index: 10; pointer-events: none; color: var(--fg);
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500;
  mix-blend-mode: difference;
}
.ui a, .ui button { pointer-events: auto; }
header.ui {
  top: 0; left: 0; right: 0;
  padding: 26px 32px; padding-top: max(26px, env(safe-area-inset-top));
  display: flex; justify-content: flex-end; align-items: center;
}
/* shared.css의 .logo(코너 위치)를 body.is-home 안에서 덮어씀 */
body.is-home .logo {
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
  animation: loaderLogoIn 0.9s 0.2s cubic-bezier(0.2,0.7,0.2,1) forwards;
  transition: top 1.1s cubic-bezier(0.7,0,0.2,1), left 1.1s cubic-bezier(0.7,0,0.2,1), transform 1.1s cubic-bezier(0.7,0,0.2,1);
}
body.is-home .logo-img {
  max-width: min(380px, 60vw); max-height: 80px;
  transition: max-width 1.1s cubic-bezier(0.7,0,0.2,1), max-height 1.1s cubic-bezier(0.7,0,0.2,1);
}
body.is-home.logo-done .logo {
  top: max(26px, env(safe-area-inset-top)); left: 32px; transform: none;
  pointer-events: auto;
}
body.is-home.logo-done .logo-img { max-width: 220px; max-height: 40px; }
@keyframes loaderLogoIn { to { opacity: 1; } }
@media (max-width: 768px) {
  body.is-home.logo-done .logo { top: max(16px, env(safe-area-inset-top)); left: 18px; }
  body.is-home.logo-done .logo-img { max-width: 150px; max-height: 28px; }
}
nav.menu { display: flex; gap: 22px; }
nav.menu a { position: relative; color: var(--fg); text-decoration: none; padding: 4px 0; overflow: hidden; }
nav.menu-inline a::after {
  content: ''; position: absolute; left: 0; bottom: 2px;
  width: 100%; height: 1px; background: currentColor;
  transform-origin: right center; transform: scaleX(0);
  transition: transform 0.6s cubic-bezier(0.62, 0.05, 0, 1);
}
nav.menu-inline a:hover::after { transform-origin: left center; transform: scaleX(1); }
footer.ui,
body.is-home footer.ui {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  padding: 26px 32px; padding-bottom: max(26px, env(safe-area-inset-bottom));
  display: flex; justify-content: space-between; align-items: flex-end;
}
.meta-left { display: grid; gap: 6px; color: var(--fg-dim); font-size: 10px; line-height: 1.4; }
.meta-left .row-strong { color: var(--fg); font-variant-numeric: tabular-nums; }
.meta-right { display: grid; gap: 6px; color: var(--fg-dim); font-size: 10px; text-align: right; line-height: 1.4; justify-items: end; }
.meta-right .accent { color: var(--accent); letter-spacing: 0.12em; }
.meta-right .insta { color: var(--accent); letter-spacing: 0.12em; text-transform: none; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.35s ease; pointer-events: auto; }
.meta-right .insta:hover { border-bottom-color: currentColor; }
.insta-mobile { display: none; margin-top: 4px; }
.insta-mobile .insta { color: var(--accent); letter-spacing: 0.12em; text-transform: none; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.35s ease; pointer-events: auto; }
@media (max-width: 768px) {
  header.ui { padding-right: 18px; padding-top: max(16px, env(safe-area-inset-top)); padding-left: calc(18px + 150px + 24px); }
  footer.ui { padding-left: 18px; padding-right: 18px; padding-top: max(16px, env(safe-area-inset-top)); padding-bottom: max(16px, env(safe-area-inset-bottom)); }
  nav.menu { gap: 16px; font-size: 10px; }
  .meta-right { display: none; }
  .insta-mobile { display: block; }
  .meta-left { color: var(--fg); display: flex; flex-direction: column; }
  .meta-left .insta-mobile { order: 1; }
  .meta-left .row-strong { order: 2; }
  .meta-left > div:nth-child(1) { order: 3; }
  .meta-left > div:nth-child(2) { order: 4; }
}
.grain {
  position: fixed; inset: -10%; pointer-events: none; z-index: 999;
  opacity: 0.10; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.85'/></svg>");
  background-size: 240px 240px; animation: grainShift 0.5s steps(5) infinite;
}
@keyframes grainShift {
  0%{transform:translate(0,0)} 20%{transform:translate(-6%,4%)}
  40%{transform:translate(3%,-5%)} 60%{transform:translate(-3%,-3%)}
  80%{transform:translate(4%,2%)} 100%{transform:translate(0,0)}
}
.loader {
  position: fixed; inset: 0; z-index: 2000; background: #000;
  pointer-events: none; transition: opacity 1.0s cubic-bezier(0.4,0,0.2,1);
}
.loader.gone { opacity: 0; }
.loader.removed { display: none; }
@media (min-width: 1200px) { .menu-toggle, .menu-overlay { display: none !important; } }
@media (max-width: 1199px) { nav.menu-inline { display: none; } .menu-toggle { display: flex; } header.ui { display: none; } }
.lightbox {
  --lb-margin-x: 50px; --lb-margin-y: 92px;
  position: fixed; inset: 0; z-index: 1100;
  opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
}
.lightbox.open { opacity: 1; pointer-events: auto; }
.lightbox-bg {
  position: absolute; inset: -8%;
  background-image: var(--lb-img, none); background-size: cover; background-position: center;
  filter: blur(48px) brightness(0.55) saturate(1.05); transform: scale(1.1); z-index: 0; pointer-events: none;
}
.lightbox::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.35); z-index: 1; pointer-events: none; }
.lightbox-frame {
  position: absolute; top: var(--lb-margin-y); left: 50%; z-index: 2;
  aspect-ratio: 4/5;
  max-width: calc(100vw - 2 * var(--lb-margin-x));
  max-height: calc(100dvh - 2 * var(--lb-margin-y));
  transform: translateX(-50%) scale(0.96); opacity: 0;
  transition: transform 0.5s cubic-bezier(0.2,0.7,0.2,1), opacity 0.4s 0.05s ease-out;
  box-shadow: 0 30px 80px rgba(0,0,0,0.55);
}
.lightbox.open .lightbox-frame { transform: translateX(-50%) scale(1); opacity: 1; }
.lightbox-img { width: 100%; height: 100%; display: block; object-fit: cover; background-color: var(--tile-bg); pointer-events: none; transition: opacity 0.3s ease; }
.lightbox-close {
  position: absolute; top: 14px; right: 14px; z-index: 3;
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.18); border-radius: 50%;
  color: #fff; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease; padding: 0;
}
.lightbox-close:hover { background: rgba(0,0,0,0.7); border-color: rgba(255,255,255,0.45); transform: scale(1.06); }
.lightbox-close svg { display: block; width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.4; fill: none; stroke-linecap: round; }
@media (max-width: 1199px) { .lightbox { --lb-margin-x: 30px; } .lightbox-close { width: 36px; height: 36px; top: 12px; right: 12px; } }
@media (max-width: 767px) { .lightbox { --lb-margin-x: 10px; --lb-margin-y: 60px; } .lightbox-close { width: 34px; height: 34px; top: 10px; right: 10px; } .lightbox-close svg { width: 16px; height: 16px; } }
body.lb-open .grain { opacity: 0.06; }
.vignette { position: fixed; inset: 0; pointer-events: none; z-index: 5; background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.45) 100%); }
.hint {
  position: fixed; left: 50%; bottom: calc(86px + env(safe-area-inset-bottom));
  transform: translateX(-50%); z-index: 10; color: var(--fg);
  font-family: 'Nanum Myeongjo', serif; font-size: 26px; letter-spacing: 0.01em;
  pointer-events: none; mix-blend-mode: difference; opacity: 0; text-align: center;
  white-space: nowrap; font-weight: 400; max-width: 95vw; overflow: hidden;
}
body.hint-on .hint { opacity: 1; transition: opacity 1.2s ease-out; }
body.hint-on.hint-dismissed .hint { opacity: 0; transition: opacity 1.0s ease-in; }
.hint .sep { opacity: 0.45; margin: 0 0.5em; font-weight: 400; }
@media (max-width: 768px) {
  .hint { top: 50%; bottom: auto; transform: translate(-50%, -50%); font-size: 17px; letter-spacing: 0; }
  .hint .sep { margin: 0 0.35em; }
}
@media (prefers-reduced-motion: reduce) {
  .grain, body, .hint { animation: none; }
  body, .hint { opacity: 1; }
  .tile { opacity: 1 !important; transition: none !important; }
  .tile::before { transition: none; }
  .loader { display: none !important; }
  .logo, .logo-img { transition: none !important; }
  .logo { animation: none !important; opacity: 1 !important; }
}
</style>
