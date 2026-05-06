<template>
<main class="consent-shell" @click="dropOpen = false">

  <div class="consent-head">
    <div class="eyebrow"><span class="num">00</span>Consent Request · 확인요청</div>
    <h1>내 사진을 찾아<br /><span class="em">장바구니에 담아주세요.</span></h1>
    <p class="lead">
      본인의 사진을 장바구니에 담아 한 번에 사진집으로 이동할 수 있습니다. 초상권자의 동의가 없는 사진은 모두 이 페이지에 흑백저화질사진으로 나열됩니다. 동의가 완료된 사진만 사진집 또는 선수목록에서 컬러로 확인하실 수 있습니다.
      일정 기간 동안 동의가 완료되지 않은 사진은 영구적으로 삭제될 수 있습니다.
      <button class="info-btn" type="button" @click.stop="infoOpen = true" aria-label="동의 철회 안내">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="9" r="7.5"/>
          <line x1="9" y1="7.5" x2="9" y2="12.5"/>
          <circle cx="9" cy="5.5" r="0.8" fill="currentColor" stroke="none"/>
        </svg>
      </button>
    </p>

    <Teleport to="body">
      <div v-if="infoOpen" class="info-overlay" @click="infoOpen = false">
        <div class="info-modal" @click.stop>
          <button class="info-modal-close" type="button" @click="infoOpen = false" aria-label="닫기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
            </svg>
          </button>
          <div class="disc-block">
            <h4>동의 철회</h4>
            <p>사용 동의를 철회하시려는 경우, <a href="mailto:press@medalbank.com?subject=%5B%EB%8F%99%EC%9D%98%20%EC%B2%A0%ED%9A%8C%20%EC%9A%94%EC%B2%AD%5D">press@medalbank.com</a>으로 요청해 주시기 바랍니다. 갤러리에서 철회를 원하는 사진을 캡처하여 첨부해 주시고, 메일 본문에 동의 시 사용하신 이메일 주소를 함께 기재해 주시면 처리가 빠릅니다.</p>
            <p>접수 순서에 따라 처리되며, 영업일 기준 5일 이내에 처리 완료 메일을 발송해 드립니다. 철회 후 재동의는 언제든 가능합니다.</p>
          </div>
        </div>
      </div>
    </Teleport>
    <p class="meta-inline">
      현재 {{ currentEvent.count }}장
    </p>
  </div>

  <div v-if="restoredCount > 0" class="restored-banner">
    <span>이전에 선택한 사진 <strong>{{ restoredCount }}장</strong>이 남아있습니다.</span>
    <button type="button" @click="clearRestoredCart">초기화</button>
  </div>

  <div class="consent-controls">
    <!-- 대회 dropdown -->
    <div class="event-select" :class="{ open: dropOpen }">
      <button class="event-select-btn" type="button" aria-haspopup="listbox" :aria-expanded="String(dropOpen)"
        @click.stop="dropOpen = !dropOpen">
        <span class="label">{{ currentEvent.displayLabel }}</span>
        <svg class="caret" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <polyline points="1 1.5, 5 5, 9 1.5"/>
        </svg>
      </button>
      <div class="event-select-list" role="listbox" aria-label="대회 선택">
        <button type="button" :class="{ active: eventId === 'all' }" @click.stop="selectEvent('all')">
          전체 대회<span class="count">{{ allCount }}장</span>
        </button>
        <template v-for="g in meetsGrouped" :key="g.year">
          <div class="group-label">{{ g.year }}</div>
          <button v-for="ev in g.meets" :key="ev.id" type="button"
            :class="{ active: eventId === ev.id }"
            @click.stop="selectEvent(ev.id)">
            {{ ev.short }} · {{ ev.label }}<span class="count">{{ ev.count }}장</span>
          </button>
        </template>
      </div>
    </div>

    <!-- 카테고리 dropdown -->
    <div v-if="categoriesSorted.length" class="event-select cat-select" :class="{ open: catDropOpen }">
      <button class="event-select-btn" type="button" :aria-expanded="String(catDropOpen)"
        @click.stop="catDropOpen = !catDropOpen">
        <span class="label">{{ activeCategoryLabel }}</span>
        <svg class="caret" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <polyline points="1 1.5, 5 5, 9 1.5"/>
        </svg>
      </button>
      <div class="event-select-list" role="listbox">
        <button type="button" :class="{ active: activeCategory === null }" @click.stop="selectCategory(null)">
          전체 카테고리
        </button>
        <button v-for="cat in categoriesSorted" :key="cat" type="button"
          :class="{ active: activeCategory === cat }"
          @click.stop="selectCategory(cat)">
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- 태그 버튼 -->
    <div v-if="tagsData?.length" class="category-filter">
      <button type="button" class="cat-btn tag-btn-accent" :class="{ active: activeTag === null }" @click="selectTag(null)">전체 카테고리</button>
      <button v-for="tag in tagsData" :key="tag" type="button"
        class="cat-btn tag-btn-accent" :class="{ active: activeTag === tag }"
        @click="selectTag(tag)">{{ tag }}</button>
    </div>
  </div>
  <p class="consent-help">사진을 클릭하면 선택됩니다 · 다시 클릭하면 해제</p>

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

  <div ref="sentinelEl" class="scroll-sentinel" />
  <div v-if="loadingMore" class="load-more-spinner">
    <span /><span /><span />
  </div>

  <NuxtLink class="cart-fab" to="/cart" :class="{ visible: cart.size > 0 }" aria-label="선택한 사진 보기">
    <span class="count">
      <span class="n">{{ cart.size }}</span>
      <span class="label">장 선택</span>
    </span>
    <span>사진집으로 이동하기</span>
    <span class="arrow">→</span>
  </NuxtLink>

</main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: "메달뱅크 아쿠아틱스 — 확인요청" })

const PER_PAGE = 60
const CART_KEY = 'medalbank_consent_cart'

type GalleryImage = { image_id: number; urls: { preview: string } }
type EventItem    = { id: number | 'all'; label: string; short?: string; date?: string; count: number }

const events         = ref<EventItem[]>([{ id: 'all', label: '전체 대회', count: 0 }])
const galleryImages  = ref<GalleryImage[]>([])
const eventId        = ref<number | 'all'>('all')
const activeCategory = ref<string | null>(null)
const activeTag      = ref<string | null>(null)
const dropOpen       = ref(false)
const catDropOpen    = ref(false)
const cart           = ref(new Set<number>())
const infoOpen       = ref(false)
const restoredCount  = ref(0)
const loadingMore    = ref(false)
const hasMore        = ref(true)
const apiPage        = ref(1)
const sentinelEl     = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const { data: categoriesData } = useFetch<string[]>('/api/categories')
const { data: tagsData }       = useFetch<string[]>('/api/tags')

watch(categoriesData, (val) => {
  if (val?.length && activeCategory.value === null) {
    activeCategory.value = [...val].sort().reverse()[0]
  }
}, { immediate: true })

function clearRestoredCart() {
  cart.value = new Set()
  restoredCount.value = 0
  try { localStorage.removeItem(CART_KEY) } catch {}
}

const currentEvent = computed(() => {
  const ev = events.value.find(e => e.id === eventId.value) ?? events.value[0]
  const displayLabel = ev.id === 'all' || !ev.short ? ev.label : `${ev.short} · ${ev.label}`
  return { ...ev, displayLabel }
})

const allCount = computed(() => events.value.find(e => e.id === 'all')?.count ?? 0)

const categoriesSorted = computed(() =>
  [...(categoriesData.value ?? [])].sort().reverse()
)

const activeCategoryLabel = computed(() =>
  activeCategory.value ?? '전체 카테고리'
)

const meetsGrouped = computed(() => {
  const groups = new Map<string, EventItem[]>()
  for (const ev of events.value) {
    if (ev.id === 'all') continue
    const year = ev.short?.slice(0, 4) ?? '기타'
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(ev)
  }
  return [...groups.entries()]
    .map(([year, meets]) => ({ year, meets }))
    .sort((a, b) => b.year.localeCompare(a.year))
})

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  const query: Record<string, number | string> = { page: apiPage.value, per_page: PER_PAGE }
  if (eventId.value !== 'all') query.meet_id = eventId.value
  if (activeCategory.value) query.category = activeCategory.value
  if (activeTag.value)      query.tag      = activeTag.value
  try {
    const data = await $fetch<{ images: GalleryImage[]; pages: number }>('/api/images', { query: { ...query, consented: 'false' } })
    galleryImages.value = [...galleryImages.value, ...data.images]
    hasMore.value = apiPage.value < data.pages
    apiPage.value++
  } catch {
    hasMore.value = false
  } finally {
    loadingMore.value = false
  }
}

function resetAndLoad() {
  galleryImages.value = []
  hasMore.value = true
  apiPage.value = 1
  loadMore()
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
  activeCategory.value = null
  dropOpen.value = false
}

function selectCategory(cat: string | null) {
  activeCategory.value = cat
  eventId.value = 'all'
  catDropOpen.value = false
}

function selectTag(tag: string | null) {
  activeTag.value = tag
}

watch([eventId, activeCategory, activeTag], resetAndLoad)

onMounted(async () => {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length > 0) {
        cart.value = new Set(arr)
        restoredCount.value = arr.length
      }
    }
  } catch {}

  try {
    const data = await $fetch<{ total: number; meets: { meet_id: number; label: string; short: string; date: string; photo_count: number }[] }>('/api/meets')
    events.value = [
      { id: 'all', label: '전체 대회', count: data.total },
      ...data.meets.map(m => ({ id: m.meet_id as number | 'all', label: m.label, short: m.short, date: m.date, count: m.photo_count })),
    ]
  } catch {}

  await loadMore()

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore()
  }, { rootMargin: '300px' })

  if (sentinelEl.value) observer.observe(sentinelEl.value)

  document.addEventListener('click', (e) => {
    const t = e.target as Node
    const sel = document.querySelector('.consent-controls .event-select:not(.cat-select)')
    if (sel && !sel.contains(t)) dropOpen.value = false
    const cat = document.querySelector('.consent-controls .cat-select')
    if (cat && !cat.contains(t)) catDropOpen.value = false
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.consent-shell {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 96px;
  padding-bottom: 80px;
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
.info-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 17px; height: 17px; margin-left: 6px; vertical-align: middle;
  color: var(--fg-faint); cursor: pointer; background: none; border: 0; padding: 0;
  transition: color 0.2s;
  position: relative; top: -1px;
}
.info-btn:hover { color: var(--fg-dim); }
.info-btn svg { width: 17px; height: 17px; }
.info-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.55);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.info-modal {
  position: relative; background: #0d1119;
  border: 1px solid rgba(255,255,255,0.10);
  padding: 36px 36px 32px; max-width: 560px; width: 100%;
}
.info-modal-close {
  position: absolute; top: 14px; right: 14px;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: none; border: 0; cursor: pointer; color: var(--fg-faint);
  transition: color 0.2s;
}
.info-modal-close:hover { color: var(--fg); }
.info-modal-close svg { width: 16px; height: 16px; }
.disc-block h4 {
  font-family: var(--font-sans); font-size: 11px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-faint);
  margin-bottom: 16px;
}
.disc-block p {
  font-family: var(--font-myungjo); font-size: 14px; line-height: 1.75;
  color: var(--fg-dim); margin-bottom: 12px;
}
.disc-block p:last-child { margin-bottom: 0; }
.disc-block a { color: var(--accent); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
.disc-block a:hover { border-bottom-color: var(--accent); }
@media (max-width: 768px) {
  .info-modal { padding: 28px 22px 24px; }
}
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

/* ── 이전 선택 복원 배너 ─── */
.restored-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 32px 16px;
  padding: 10px 16px;
  background: rgba(56,182,255,0.07);
  border: 1px solid rgba(56,182,255,0.2);
  border-radius: 6px;
  font-size: 13px;
  color: var(--fg-dim);
}
.restored-banner strong { color: var(--accent); font-weight: 500; }
.restored-banner button {
  margin-left: auto;
  flex-shrink: 0;
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 4px;
  color: var(--fg-faint);
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: border-color 0.2s, color 0.2s;
}
.restored-banner button:hover { border-color: rgba(255,255,255,0.4); color: var(--fg); }
@media (max-width: 768px) {
  .restored-banner { margin: 0 18px 14px; font-size: 12px; }
}

/* ── 컨트롤 ───── */
.consent-controls {
  padding: 4px 32px 10px;
  display: flex;
  align-items: stretch;
  gap: 8px;
  flex-wrap: wrap;
}
.category-filter { display: flex; align-items: stretch; gap: 6px; flex-wrap: wrap; }
.cat-btn { padding: 10px 12px; background: none; border: 1px solid var(--line); color: var(--fg-faint); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.07em; cursor: pointer; transition: color 0.2s, border-color 0.2s, background 0.2s; white-space: nowrap; }
.cat-btn:hover { color: var(--fg); border-color: var(--fg-dim); }
.cat-btn.active { color: #a371f7; border-color: #a371f7; background: rgba(163,113,247,0.06); }
.tag-btn-accent.active { color: var(--accent, #38b6ff); border-color: var(--accent, #38b6ff); background: rgba(56,182,255,0.06); }
.event-select { position: relative; }
.event-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
  min-width: 240px;
  text-align: left;
  -webkit-appearance: none;
  appearance: none;
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
  width: max-content;
  min-width: 100%;
  max-height: min(70vh, 700px);
  overflow-y: auto;
  padding: 6px 0;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.25s, transform 0.25s var(--ease-out);
  z-index: 30;
}
.event-select-list .group-label {
  padding: 8px 16px 4px;
  color: var(--fg-faint);
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: 4px;
}
.event-select-list .group-label:first-child { border-top: 0; margin-top: 0; }
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
  white-space: nowrap;
}
.event-select-list button:hover,
.event-select-list button.active { color: var(--fg); background: rgba(255,255,255,0.04); }
.event-select-list button .count {
  float: right;
  color: var(--fg-faint);
  font-variant-numeric: tabular-nums;
  margin-left: 16px;
}
.consent-help { padding: 0 32px 16px; color: var(--fg-faint); font-size: 11px; letter-spacing: 0.04em; }
@media (max-width: 768px) {
  .consent-controls { padding: 0 18px 10px; }
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

/* ── 인피니티 스크롤 ──────────────────── */
.scroll-sentinel { height: 1px; }
.load-more-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 40px 0;
}
.load-more-spinner span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--fg-faint);
  animation: spinnerPulse 1.2s ease-in-out infinite;
}
.load-more-spinner span:nth-child(2) { animation-delay: 0.2s; }
.load-more-spinner span:nth-child(3) { animation-delay: 0.4s; }
@keyframes spinnerPulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
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
