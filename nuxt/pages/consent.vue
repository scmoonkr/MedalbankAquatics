<template>
<main class="consent-shell" @click="dropOpen = false">

  <div class="consent-head">
    <div class="eyebrow"><span class="num">00</span>Consent Request · 공개 요청</div>
    <h1>내 사진을 찾아<br /><span class="em">장바구니에 담아주세요.</span></h1>
    <p class="lead">
      <strong>본인 또는 자제분의 사진을 장바구니에 담아 한 번에 공개요청</strong>할 수 있습니다.
    </p>
    <p class="meta-inline">
      현재 {{ currentEvent.count }}장 · {{ currentPage }} / {{ pages }}
    </p>
  </div>

  <div class="consent-controls">
    <div class="event-select" :class="{ open: dropOpen }">
      <button class="event-select-btn" type="button" aria-haspopup="listbox" :aria-expanded="String(dropOpen)"
        @click.stop="dropOpen = !dropOpen">
        <span class="label">{{ currentEvent.label }}</span>
        <svg class="caret" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <polyline points="1 1.5, 5 5, 9 1.5"/>
        </svg>
      </button>
      <div class="event-select-list" role="listbox" aria-label="대회 선택">
        <button v-for="ev in events" :key="ev.id" type="button"
          :class="{ active: eventId === ev.id }"
          @click.stop="selectEvent(ev.id)">
          {{ ev.label }}<span class="count">{{ ev.count }}장</span>
        </button>
      </div>
    </div>
    <span class="consent-help">사진을 클릭하면 선택됩니다 · 다시 클릭하면 해제</span>
  </div>

  <div class="consent-grid">
    <button v-for="img in galleryImages" :key="img.image_id"
      type="button"
      class="photo-tile"
      :class="{ selected: cart.has(img.image_id) }"
      :style="{ backgroundImage: img.urls?.preview ? `url('${img.urls.preview}')` : '' }"
      :aria-label="`사진 ${img.image_id} 선택`"
      :aria-pressed="String(cart.has(img.image_id))"
      @click="toggleSelect(img.image_id)">
      <span class="check" aria-hidden="true">
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <polyline points="2.5 7.5, 6 11, 11.5 3.5" />
        </svg>
      </span>
      <span class="num">{{ img.image_id }}</span>
    </button>
  </div>

  <nav class="pagination" aria-label="페이지 네비게이션">
    <div class="page-numbers">
      <button v-for="p in pages" :key="p"
        type="button"
        class="page-num"
        :class="{ active: p === currentPage }"
        :aria-label="`${p} 페이지로 이동`"
        :aria-current="p === currentPage ? 'page' : undefined"
        @click="goToPage(p)">{{ p }}</button>
    </div>
  </nav>

  <NuxtLink class="cart-fab" to="/cart" :class="{ visible: cart.size > 0 }" aria-label="선택한 사진 보기">
    <span class="count">
      <span class="n">{{ cart.size }}</span>
      <span class="label">장 선택</span>
    </span>
    <span>동의 신청하기</span>
    <span class="arrow">→</span>
  </NuxtLink>

</main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: "메달뱅크 아쿠아틱스 — 공개 요청" })

const PER_PAGE = 100
const CART_KEY = 'medalbank_consent_cart'

type GalleryImage = { image_id: number; urls: { preview: string } }
type EventItem    = { id: number | 'all'; label: string; count: number }

const events       = ref<EventItem[]>([{ id: 'all', label: '전체 대회', count: 0 }])
const galleryImages = ref<GalleryImage[]>([])
const pages        = ref(1)
const eventId      = ref<number | 'all'>('all')
const dropOpen     = ref(false)
const currentPage  = ref(1)
const cart         = ref(new Set<number>())

const currentEvent = computed(() => events.value.find(e => e.id === eventId.value) ?? events.value[0])

async function fetchImages() {
  const query: Record<string, number | string> = { page: currentPage.value, per_page: PER_PAGE }
  if (eventId.value !== 'all') query.meet_id = eventId.value
  try {
    const data = await $fetch<{ images: GalleryImage[]; pages: number }>('/api/images', { query: { ...query, consented: 'false' } })
    galleryImages.value = data.images
    pages.value = data.pages
  } catch {
    galleryImages.value = []
  }
}

function toggleSelect(id: number) {
  const c = new Set(cart.value)
  if (c.has(id)) c.delete(id)
  else c.add(id)
  cart.value = c
  try { localStorage.setItem(CART_KEY, JSON.stringify([...c])) } catch {}
}

function selectEvent(id: number | 'all') {
  eventId.value = id
  currentPage.value = 1
  dropOpen.value = false
}

function goToPage(n: number) {
  if (n === currentPage.value) return
  currentPage.value = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch([eventId, currentPage], fetchImages)

onMounted(async () => {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) cart.value = new Set(arr)
    }
  } catch {}

  try {
    const data = await $fetch<{ total: number; meets: { meet_id: number; label: string; photo_count: number }[] }>('/api/meets')
    events.value = [
      { id: 'all', label: '전체 대회', count: data.total },
      ...data.meets.map(m => ({ id: m.meet_id as number | 'all', label: m.label, count: m.photo_count })),
    ]
  } catch {}

  await fetchImages()
})
</script>

<style scoped>
.consent-shell {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 96px;
  padding-bottom: 40px;
}

/* ── 페이지 타이틀 ─────────────────────── */
.consent-head { padding: 8px 32px 24px; }
.consent-head .eyebrow {
  color: var(--fg-faint);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 22px;
}
.consent-head .eyebrow .num {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  margin-right: 10px;
  color: var(--accent);
  letter-spacing: -0.01em;
}
.consent-head h1 {
  font-family: var(--font-myungjo);
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 400;
  line-height: 1.18;
  letter-spacing: -0.018em;
  margin-bottom: 24px;
  max-width: 1100px;
}
.consent-head h1 .em {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--accent);
  font-weight: 400;
  letter-spacing: -0.02em;
}
.consent-head .lead {
  font-family: var(--font-myungjo);
  font-size: clamp(15px, 1.3vw, 17px);
  line-height: 1.7;
  color: var(--fg-dim);
  letter-spacing: -0.005em;
  max-width: 720px;
}
.consent-head .lead strong { color: var(--fg); font-weight: 400; }
.consent-head .meta-inline {
  margin-top: 18px;
  color: var(--fg-faint);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 768px) {
  .consent-head { padding: 4px 18px 22px; }
  .consent-head h1 { line-height: 1.2; }
  .consent-head .lead { font-size: 14.5px; }
  .consent-head .meta-inline { font-size: 10px; }
}

/* ── 컨트롤 ───── */
.consent-controls {
  padding: 4px 32px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.event-select { position: relative; }
.event-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
  min-width: 240px;
  text-align: left;
}
.event-select-btn:hover { border-color: var(--accent-dim); background: rgba(56,182,255,0.04); }
.event-select-btn .label { flex: 1; }
.event-select-btn .caret {
  width: 10px; height: 10px;
  transform: rotate(0deg);
  transition: transform 0.3s var(--ease-out);
}
.event-select.open .event-select-btn .caret { transform: rotate(180deg); }
.event-select-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  max-height: 320px;
  overflow-y: auto;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  padding: 6px 0;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.25s, transform 0.25s var(--ease-out);
  z-index: 30;
}
.event-select.open .event-select-list { opacity: 1; pointer-events: auto; transform: translateY(0); }
.event-select-list button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  color: var(--fg-dim);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  background: none;
  border: 0;
}
.event-select-list button:hover,
.event-select-list button.active { color: var(--fg); background: rgba(255,255,255,0.04); }
.event-select-list button .count {
  float: right;
  color: var(--fg-faint);
  font-variant-numeric: tabular-nums;
  margin-left: 16px;
}
.consent-help { color: var(--fg-faint); font-size: 11px; letter-spacing: 0.04em; margin-left: auto; }
@media (max-width: 768px) {
  .consent-controls { padding: 0 18px 22px; }
  .event-select-btn { min-width: 200px; padding: 9px 14px; font-size: 11px; }
  .consent-help { width: 100%; margin-left: 0; }
}

/* ── 그리드 ───────── */
.consent-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  padding: 0 14px;
}
@media (max-width: 1199px) { .consent-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 10px; } }
@media (max-width: 768px)  { .consent-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 8px; } }

/* ── 사진 타일 ─────────────── */
.photo-tile {
  position: relative;
  aspect-ratio: 3 / 2;
  background-color: var(--bg-soft);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  border: 0;
  padding: 0;
  overflow: hidden;
  transition: transform 0.25s ease-out;
  -webkit-tap-highlight-color: transparent;
}
.photo-tile:hover { transform: scale(1.01); }
.photo-tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15);
  pointer-events: none;
  transition: background 0.3s;
}
.photo-tile:hover::before { background: rgba(0,0,0,0); }
.photo-tile.selected { box-shadow: inset 0 0 0 3px var(--accent); }
.photo-tile.selected::before { background: rgba(56,182,255,0.10); }
.photo-tile .check {
  position: absolute;
  top: 8px; right: 8px;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(0,0,0,0.45);
  border: 1.5px solid rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s, border-color 0.25s, transform 0.25s var(--ease-out);
}
.photo-tile .check svg {
  width: 14px; height: 14px;
  stroke: #fff; stroke-width: 2; fill: none;
  stroke-linecap: round; stroke-linejoin: round;
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.2s, transform 0.25s var(--ease-out);
}
.photo-tile.selected .check { background: var(--accent); border-color: var(--accent); transform: scale(1.05); }
.photo-tile.selected .check svg { opacity: 1; transform: scale(1); }
.photo-tile .num {
  position: absolute;
  bottom: 8px; left: 10px;
  color: rgba(255,255,255,0.45);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 16px;
  line-height: 1;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
@media (max-width: 768px) {
  .photo-tile .check { width: 22px; height: 22px; top: 6px; right: 6px; }
  .photo-tile .check svg { width: 12px; height: 12px; }
  .photo-tile .num { font-size: 13px; bottom: 6px; left: 8px; }
}

/* ── 페이지네이션 ──────────────────────── */
.pagination {
  margin: 56px 0 0;
  padding: 0 14px 80px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.page-numbers {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.page-num {
  background: none;
  border: 0;
  color: var(--fg-dim);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 17px;
  letter-spacing: -0.01em;
  line-height: 1;
  min-width: 26px;
  height: 30px;
  padding: 0 5px;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease, transform 0.3s var(--ease-out);
  position: relative;
}
.page-num:not(.active):hover { color: var(--fg); }
.page-num.active { color: var(--fg); font-size: 21px; transform: translateY(-1px); }
.page-num.active::after {
  content: '';
  position: absolute;
  left: 50%; bottom: -4px;
  transform: translateX(-50%);
  width: 12px; height: 1px;
  background: var(--fg);
}
@media (max-width: 768px) {
  .pagination { margin-top: 40px; padding-bottom: 60px; }
  .page-numbers { gap: 1px; }
  .page-num { font-size: 14px; min-width: 22px; height: 26px; padding: 0 3px; }
  .page-num.active { font-size: 17px; }
  .page-num.active::after { width: 9px; bottom: -3px; }
}

/* ── Floating Cart 버튼 ────────────────── */
.cart-fab {
  position: fixed;
  bottom: 32px; right: 32px;
  z-index: 800;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 22px 14px 18px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  border-radius: 999px;
  box-shadow: 0 12px 32px rgba(56,182,255,0.35), 0 4px 12px rgba(0,0,0,0.4);
  transform: translateY(28px);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.5s var(--ease-out), opacity 0.4s ease, box-shadow 0.3s ease, background 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}
.cart-fab.visible { transform: translateY(0); opacity: 1; pointer-events: auto; }
.cart-fab:hover {
  background: #5cc4ff;
  box-shadow: 0 14px 36px rgba(56,182,255,0.5), 0 6px 16px rgba(0,0,0,0.5);
  transform: translateY(-2px);
}
.cart-fab .count {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  background: rgba(0,0,0,0.18);
  padding: 6px 12px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}
.cart-fab .count .n {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 18px;
  line-height: 1;
  letter-spacing: -0.02em;
}
.cart-fab .count .label { font-size: 11px; letter-spacing: 0.06em; line-height: 1; }
.cart-fab .arrow { font-size: 14px; letter-spacing: 0; margin-left: 2px; }
@media (max-width: 768px) {
  .cart-fab { bottom: 18px; right: 18px; padding: 12px 18px 12px 14px; font-size: 12px; gap: 12px; }
  .cart-fab .count { padding: 5px 10px; }
  .cart-fab .count .n { font-size: 16px; }
}
</style>
