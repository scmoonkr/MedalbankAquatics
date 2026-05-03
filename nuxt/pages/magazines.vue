<template>
<main class="mag-shell">

  <div class="mag-head">
    <div class="eyebrow"><span class="num">00</span>Magazine · 정기간행물</div>
    <h1>메달뱅크 아쿠아틱스<br /><span class="em">매거진.</span></h1>
    <span class="meta-inline">vol. 01 ~ {{ String(latestVol).padStart(2, '0') }} · {{ activeCount }}호 발행</span>
  </div>

  <p class="mag-intro">
    분기마다 발행하는 <strong>메달뱅크 아쿠아틱스 매거진</strong>. 한 권에 한 시즌 — 대회 현장의 표정, 선수들의 한 호흡, 그리고 물 위의 한 순간을 인쇄로 담습니다. > 대한민국 유일의 수영전문지, 월간 수영, 메달뱅크 아쿠아틱스. — 대회 현장의 모든 표정을 인쇄합니다.

  </p>

  <div class="mag-grid">
    <template v-for="m in MAGAZINES" :key="m.vol">
      <div v-if="m.status === 'active'"
        class="mag-tile active"
        :style="{ backgroundImage: `url('${m.cover}')` }"
        :aria-label="m.title">
        <div class="mag-tile-inner"></div>
        <div class="vol-meta">
          <span class="v">vol. {{ String(m.vol).padStart(2, '0') }}</span>
          <span class="t">{{ m.title }}</span>
        </div>
      </div>
      <div v-else
        class="mag-tile coming"
        :aria-label="`${m.date} 발행 예정 (vol. ${m.vol})`">
        <div class="mag-tile-inner">
          <span class="vol-num">{{ String(m.vol).padStart(2, '0') }}</span>
          <span class="coming-label">Coming Soon</span>
          <span class="vol-date">{{ m.date }}</span>
        </div>
      </div>
    </template>
  </div>

</main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: "메달뱅크 아쿠아틱스 — 정기간행물" })

const MAGAZINES = [
  { vol: 1, title: '창간호 · ISSUE 01', date: '2026.05', cover: '/images/magazine/cover-01.jpg', status: 'active' },
  { vol: 2, date: '2026.06', status: 'coming' },
  { vol: 3, date: '2026.07', status: 'coming' },
  { vol: 4, date: '2026.08', status: 'coming' },
  { vol: 5, date: '2026.09', status: 'coming' },
  { vol: 6, date: '2026.10', status: 'coming' },
  { vol: 7, date: '2026.11', status: 'coming' },
  { vol: 8, date: '2026.12', status: 'coming' },
] as const

const activeCount = MAGAZINES.filter(m => m.status === 'active').length
const latestVol   = MAGAZINES.reduce((acc, m) => m.status === 'active' ? Math.max(acc, m.vol) : acc, 0)
</script>

<style scoped>
.mag-shell {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 96px;
  padding-bottom: 80px;
}

/* ── 페이지 타이틀 ────────── */
.mag-head { padding: 8px 32px 24px; }
.mag-head .eyebrow {
  color: var(--fg-faint);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 22px;
}
.mag-head .eyebrow .num {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  margin-right: 10px;
  color: var(--accent);
  letter-spacing: -0.01em;
}
.mag-head h1 {
  font-family: var(--font-myungjo);
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 400;
  line-height: 1.18;
  letter-spacing: -0.018em;
  margin-bottom: 24px;
  max-width: 1100px;
}
.mag-head h1 .em {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--accent);
  font-weight: 400;
  letter-spacing: -0.02em;
}
.mag-head .meta-inline {
  display: block;
  color: var(--fg-dim);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 768px) {
  .mag-head { padding: 4px 18px 22px; }
  .mag-head .meta-inline { font-size: 10px; }
}

/* ── 인트로 ─────────────────── */
.mag-intro {
  padding: 0 32px 36px;
  max-width: 720px;
  color: var(--fg-dim);
  font-family: var(--font-myungjo);
  font-size: 17px;
  line-height: 1.7;
  letter-spacing: -0.005em;
}
.mag-intro strong { color: var(--fg); font-weight: 400; }
@media (max-width: 768px) {
  .mag-intro { padding: 0 18px 28px; font-size: 15px; line-height: 1.65; }
}

/* ── 그리드 ────────────── */
.mag-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 0 14px;
}
@media (max-width: 1199px) {
  .mag-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 12px; }
}
@media (max-width: 768px) {
  .mag-grid { grid-template-columns: 1fr; gap: 10px; padding: 0 10px; }
}

/* ── 잡지 표지 타일 ─────────────── */
.mag-tile {
  position: relative;
  aspect-ratio: 1 / 1.4142;
  background-color: var(--bg-soft);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 0;
  padding: 0;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.5s var(--ease-out);
}
.mag-tile.active {
  filter: grayscale(0.18) brightness(0.96);
  cursor: default;
  transition: filter 0.5s ease-out, transform 0.5s var(--ease-out);
}
.mag-tile.active:hover {
  filter: none;
  transition-duration: 0.4s;
}
.mag-tile.active:hover .mag-tile-inner { box-shadow: 0 8px 20px rgba(0,0,0,0.4); }

.mag-tile-inner {
  position: absolute;
  inset: 0;
  transition: box-shadow 0.4s ease-out;
}
.mag-tile-inner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.18) 0%,
    transparent 8%,
    transparent 92%,
    rgba(0,0,0,0.12) 100%
  );
  pointer-events: none;
}

/* coming-soon */
.mag-tile.coming {
  background-color: var(--bg-soft);
  cursor: not-allowed;
  border: 1px solid var(--line);
}
.mag-tile.coming .mag-tile-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  color: var(--fg-faint);
}
.mag-tile.coming .mag-tile-inner::after { display: none; }
.mag-tile.coming .vol-num {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(80px, 9vw, 140px);
  line-height: 1;
  color: var(--fg-ghost);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.mag-tile.coming .coming-label {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fg-faint);
}
.mag-tile.coming .vol-date {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--fg-faint);
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 1199px) {
  .mag-tile.coming .vol-num { font-size: 64px; }
}
@media (max-width: 768px) {
  .mag-tile.coming .vol-num { font-size: 44px; }
  .mag-tile.coming .vol-date { font-size: 9px; }
}

/* 활성 표지 메타 오버레이 */
.mag-tile.active .vol-meta {
  position: absolute;
  left: 22px; bottom: 22px;
  z-index: 2;
  color: #fff;
  mix-blend-mode: difference;
  pointer-events: none;
}
.mag-tile.active .vol-meta .v {
  display: block;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(22px, 2.4vw, 32px);
  letter-spacing: -0.01em;
  line-height: 1;
  opacity: 0.9;
  font-variant-numeric: tabular-nums;
}
.mag-tile.active .vol-meta .t {
  display: block;
  margin-top: 5px;
  font-family: var(--font-sans);
  font-size: clamp(9px, 0.9vw, 11px);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.75;
}
@media (max-width: 768px) {
  .mag-tile.active .vol-meta { left: 8px; bottom: 8px; }
  .mag-tile.active .vol-meta .v { font-size: 16px; }
  .mag-tile.active .vol-meta .t { font-size: 8px; }
}

@media (hover: none), (pointer: coarse) {
  .mag-tile { cursor: auto; }
}
</style>
