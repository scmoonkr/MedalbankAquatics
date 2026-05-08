export default defineNuxtPlugin(() => {
  const setupCursor = () => {
    const cursorEl = document.getElementById('cursor')
    const labelEl  = cursorEl?.querySelector<HTMLElement>('.label') ?? null
    if (!cursorEl) return

    const S = { px: -1e4, py: -1e4, cx: 0, cy: 0 }
    const tick = () => {
      S.cx += (S.px - S.cx) * 0.20
      S.cy += (S.py - S.cy) * 0.20
      cursorEl.style.transform = `translate(${S.cx}px, ${S.cy}px) translate(-50%, -50%)`
      requestAnimationFrame(tick)
    }
    tick()

    window.addEventListener('mousemove', (e) => {
      S.px = e.clientX; S.py = e.clientY
      if (!cursorEl.classList.contains('visible')) {
        S.cx = e.clientX; S.cy = e.clientY
        cursorEl.classList.add('visible')
      }
      if (labelEl) labelEl.classList.toggle('flip', e.clientX > window.innerWidth - 240)
    })
    document.addEventListener('mouseover', (e) => {
      if ((e.target as Element).closest('a, button, [data-cursor-over]'))
        cursorEl.classList.add('over')
    })
    document.addEventListener('mouseout', (e) => {
      const t = (e.target as Element).closest('a, button, [data-cursor-over]')
      if (t && !(e.relatedTarget as Element)?.closest('a, button, [data-cursor-over]'))
        cursorEl.classList.remove('over')
    })
  }

  const setupMenu = () => {
    const menuToggle  = document.getElementById('menuToggle')
    const menuOverlay = document.getElementById('menuOverlay')
    if (!menuToggle || !menuOverlay) return

    menuOverlay.querySelectorAll<HTMLElement>('nav.menu-fullscreen a')
      .forEach((a, i) => a.style.setProperty('--menu-delay', `${i * 60}ms`))

    const openMenu  = () => {
      document.body.classList.add('menu-open')
      menuOverlay.setAttribute('aria-hidden', 'false')
      menuToggle.setAttribute('aria-expanded', 'true')
      menuToggle.setAttribute('aria-label', '메뉴 닫기')
    }
    const closeMenu = () => {
      document.body.classList.remove('menu-open')
      menuOverlay.setAttribute('aria-hidden', 'true')
      menuToggle.setAttribute('aria-expanded', 'false')
      menuToggle.setAttribute('aria-label', '메뉴 열기')
    }

    menuToggle.addEventListener('click', () =>
      document.body.classList.contains('menu-open') ? closeMenu() : openMenu())
    menuOverlay.addEventListener('click', (e) => {
      if (!(e.target as Element).closest('nav.menu-fullscreen a')) closeMenu()
    })
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu()
    })
  }

  const openLightbox = (thumbUrl: string, fullUrl: string, alt = '') => {
    const lightbox    = document.getElementById('lightbox')
    const lightboxImg = document.getElementById('lightboxImg') as HTMLImageElement | null
    const lightboxBg  = document.getElementById('lightboxBg')
    if (!lightbox || !lightboxImg) return

    lightboxImg.src = thumbUrl
    lightboxImg.alt = alt
    lightboxImg.dataset.currentUrl = thumbUrl
    lightbox.style.setProperty('--lb-img', `url("${thumbUrl}")`)
    if (lightboxBg) lightboxBg.style.backgroundImage = `url("${thumbUrl}")`
    lightbox.classList.add('open')
    lightbox.setAttribute('aria-hidden', 'false')
    document.body.classList.add('lb-open')

    if (fullUrl && fullUrl !== thumbUrl) {
      const hi = new Image()
      hi.onload = () => {
        const lb  = document.getElementById('lightbox')
        const li  = document.getElementById('lightboxImg') as HTMLImageElement | null
        const lbg = document.getElementById('lightboxBg')
        if (lb?.classList.contains('open') && li?.dataset.currentUrl === thumbUrl) {
          if (li) li.src = fullUrl
          lb.style.setProperty('--lb-img', `url("${fullUrl}")`)
          if (lbg) lbg.style.backgroundImage = `url("${fullUrl}")`
          if (li) li.dataset.currentUrl = fullUrl
        }
      }
      hi.src = fullUrl
    }
  }

  const closeLightbox = () => {
    const lightbox    = document.getElementById('lightbox')
    const lightboxImg = document.getElementById('lightboxImg') as HTMLImageElement | null
    const lightboxBg  = document.getElementById('lightboxBg')
    if (!lightbox?.classList.contains('open')) return
    lightbox.classList.remove('open')
    lightbox.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('lb-open')
    setTimeout(() => {
      const lb  = document.getElementById('lightbox')
      const li  = document.getElementById('lightboxImg') as HTMLImageElement | null
      const lbg = document.getElementById('lightboxBg')
      if (!lb?.classList.contains('open')) {
        li?.removeAttribute('src')
        lb?.style.setProperty('--lb-img', 'none')
        if (lbg) lbg.style.backgroundImage = 'none'
      }
    }, 500)
  }

  const setupLightbox = () => {
    // 이벤트 리스너는 document에 한 번만 위임 등록
    if ((window as any).__mbLightboxInit) return
    ;(window as any).__mbLightboxInit = true
    document.addEventListener('click', (e) => {
      const t = e.target as Element
      if (!t.closest('#lightbox')) return
      if (t.closest('.lightbox-close')) { closeLightbox(); return }
      if (t.closest('.lightbox-frame')) return
      closeLightbox()
    })
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox()
    })
  }

  const setupClock = () => {
    const clockEl = document.getElementById('clock')
    if (!clockEl) return
    const tick = () => {
      clockEl.textContent = 'KST ' + new Date().toLocaleTimeString('en-GB', {
        hour12: false, timeZone: 'Asia/Seoul',
      })
    }
    tick()
    setInterval(tick, 1000)
  }

  window.MB = { openLightbox, closeLightbox }

  const router = useRouter()
  const init = () => {
    if (router.currentRoute.value.path === '/') return  // index.vue handles home page
    setupCursor()
    setupMenu()
    setupLightbox()
    setupClock()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  router.afterEach(() => setTimeout(init, 0))
})

declare global {
  interface Window {
    MB: {
      openLightbox: (thumb: string, full: string, alt?: string) => void
      closeLightbox: () => void
    }
  }
}
