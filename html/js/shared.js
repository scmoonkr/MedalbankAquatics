/* ═══════════════════════════════════════════════════════════════════
   MEDALBANK AQUATICS — SHARED JS
   커서 / 메뉴 / 라이트박스 / 시계 / hint dismiss
   각 페이지에서 <script src="js/shared.js"></script>로 로드
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  // ─────────────────────────────────────────────
  // CURSOR
  // ─────────────────────────────────────────────
  const cursorEl = document.getElementById('cursor');
  const labelEl  = cursorEl ? cursorEl.querySelector('.label') : null;

  if (cursorEl) {
    const S = { px: -1e4, py: -1e4, cx: 0, cy: 0 };
    const EASE = 0.20;

    function tick() {
      S.cx += (S.px - S.cx) * EASE;
      S.cy += (S.py - S.cy) * EASE;
      cursorEl.style.transform = `translate(${S.cx}px, ${S.cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('mousemove', (e) => {
      S.px = e.clientX; S.py = e.clientY;
      if (!cursorEl.classList.contains('visible')) {
        S.cx = e.clientX; S.cy = e.clientY;
        cursorEl.classList.add('visible');
      }
      // 라벨이 있을 때 우측 끝 근처면 flip
      if (labelEl) {
        labelEl.classList.toggle('flip', e.clientX > window.innerWidth - 240);
      }
    });

    // 인터랙티브(a, button, [data-cursor-over]) 위에서 over 모드
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('a, button, [data-cursor-over]');
      if (t) cursorEl.classList.add('over');
    });
    document.addEventListener('mouseout', (e) => {
      const t = e.target.closest('a, button, [data-cursor-over]');
      if (t && !e.relatedTarget?.closest('a, button, [data-cursor-over]')) {
        cursorEl.classList.remove('over');
      }
    });
  }

  // ─────────────────────────────────────────────
  // MENU (햄버거 + 풀스크린 오버레이)
  // ─────────────────────────────────────────────
  const menuToggle  = document.getElementById('menuToggle');
  const menuOverlay = document.getElementById('menuOverlay');

  if (menuToggle && menuOverlay) {
    const menuLinks = menuOverlay.querySelectorAll('nav.menu-fullscreen a');
    menuLinks.forEach((a, i) => {
      a.style.setProperty('--menu-delay', (i * 60) + 'ms');
    });

    function openMenu() {
      document.body.classList.add('menu-open');
      menuOverlay.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', '메뉴 닫기');
    }
    function closeMenu() {
      document.body.classList.remove('menu-open');
      menuOverlay.setAttribute('aria-hidden', 'true');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', '메뉴 열기');
    }
    function toggleMenu() {
      if (document.body.classList.contains('menu-open')) closeMenu();
      else openMenu();
    }

    menuToggle.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', (e) => {
      if (e.target.closest('nav.menu-fullscreen a')) return;
      closeMenu();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMenu();
      }
    });
  }

  // ─────────────────────────────────────────────
  // LIGHTBOX
  // 호출: window.MB.openLightbox(thumbUrl, fullUrl, alt?)
  // ─────────────────────────────────────────────
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxBg    = document.getElementById('lightboxBg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(thumbUrl, fullUrl, alt = '') {
    if (!lightbox || !lightboxImg) return;
    // 1단계: 썸네일 즉시 표시 (캐시됨)
    lightboxImg.src = thumbUrl;
    lightboxImg.alt = alt;
    lightboxImg.dataset.currentUrl = thumbUrl;
    lightbox.style.setProperty('--lb-img', `url("${thumbUrl}")`);
    if (lightboxBg) lightboxBg.style.backgroundImage = `url("${thumbUrl}")`;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-open');

    // 2단계: 고해상도 백그라운드 로드 → 슬쩍 교체
    if (fullUrl && fullUrl !== thumbUrl) {
      const hi = new Image();
      hi.onload = () => {
        if (lightbox.classList.contains('open') &&
            lightboxImg.dataset.currentUrl === thumbUrl) {
          lightboxImg.src = fullUrl;
          lightbox.style.setProperty('--lb-img', `url("${fullUrl}")`);
          if (lightboxBg) lightboxBg.style.backgroundImage = `url("${fullUrl}")`;
          lightboxImg.dataset.currentUrl = fullUrl;
        }
      };
      hi.src = fullUrl;
    }
  }
  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
    setTimeout(() => {
      if (!lightbox.classList.contains('open')) {
        lightboxImg.removeAttribute('src');
        lightbox.style.setProperty('--lb-img', 'none');
        if (lightboxBg) lightboxBg.style.backgroundImage = 'none';
      }
    }, 500);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target.closest('.lightbox-close')) { closeLightbox(); return; }
      if (e.target.closest('.lightbox-frame')) return;
      closeLightbox();
    });
    if (lightboxClose) {
      lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  // ─────────────────────────────────────────────
  // 시계 (footer KST)
  // ─────────────────────────────────────────────
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const tick = () => {
      clockEl.textContent = 'KST ' + new Date().toLocaleTimeString('en-GB', {
        hour12: false, timeZone: 'Asia/Seoul'
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  // ─────────────────────────────────────────────
  // HINT dismiss (있는 페이지에서만)
  // ─────────────────────────────────────────────
  function setupHintDismiss(delayMs = 7000) {
    const hint = document.querySelector('.hint');
    if (!hint) return;
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      document.body.classList.add('hint-dismissed');
    };
    setTimeout(dismiss, delayMs);
    ['mousedown', 'touchstart', 'wheel'].forEach(ev => {
      window.addEventListener(ev, dismiss, { once: true, passive: true });
    });
  }

  // ─────────────────────────────────────────────
  // 글로벌 노출
  // ─────────────────────────────────────────────
  window.MB = {
    openLightbox,
    closeLightbox,
    setupHintDismiss,
  };
})();
