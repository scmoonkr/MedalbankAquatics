<template>
  <main class="photos-shell">
    <div class="photos-head">
      <h1>사진집</h1>
      <span class="vol">— vol. <span>{{ currentPage }}</span></span>
      <span class="meta-inline">
        전체 <span>{{ activeTotalCount }}</span>장 ·
        <span>{{ currentPage }} / {{ totalPages }}</span>
      </span>
    </div>

    <div class="photos-controls">
      <div class="event-select" :class="{ open: dropOpen }">
        <button class="event-select-btn" type="button" :aria-expanded="dropOpen" @click="dropOpen = !dropOpen">
          <span class="label">{{ activeLabel }}</span>
          <svg class="caret" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
            <polyline points="1 1.5, 5 5, 9 1.5"/>
          </svg>
        </button>
        <div class="event-select-list" role="listbox">
          <button type="button"
            :class="{ active: activeMeetId === null }"
            @click="selectMeet(null)">
            전체 대회<span class="count">{{ meetsData?.total ?? 0 }}장</span>
          </button>
          <button v-for="m in meetsData?.meets" :key="m.meet_id" type="button"
            :class="{ active: activeMeetId === m.meet_id }"
            @click="selectMeet(m.meet_id)">
            {{ m.short }} · {{ m.label }}<span class="count">{{ m.photo_count }}장</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="imagesStatus === 'pending'" class="grid-loading">
      <div class="photos-grid">
        <div v-for="n in PER_PAGE" :key="n" class="photo-tile skeleton" />
      </div>
    </div>

    <div v-else class="photos-grid" id="grid">
      <button v-for="img in imagesData?.images" :key="img.image_id" type="button"
        class="photo-tile" :class="{ clicked: clickedId === img.image_id }"
        :style="{ backgroundImage: `url('${img.urls.thumb}')` }"
        :aria-label="`사진 ${img.image_id} 확대 보기`"
        @click="onTileClick(img)">
        <span class="num">{{ img.image_id }}</span>
      </button>
    </div>

    <nav v-if="totalPages > 1" class="pagination" aria-label="페이지 네비게이션">
      <div class="page-numbers">
        <button v-for="p in totalPages" :key="p" type="button"
          class="page-num" :class="{ active: p === currentPage }"
          :aria-current="p === currentPage ? 'page' : undefined"
          @click="goToPage(p)">{{ p }}</button>
      </div>
    </nav>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: '메달뱅크 아쿠아틱스 — 사진집' })

const PER_PAGE = 50

// ── Meets ────────────────────────────────────────────────────────────────────
const { data: meetsData } = useFetch<{
  total: number
  meets: { meet_id: number; label: string; short: string; date: string; photo_count: number }[]
}>('/api/meets')

// ── State ────────────────────────────────────────────────────────────────────
const activeMeetId  = ref<number | null>(null)
const currentPage   = ref(1)
const dropOpen      = ref(false)
const clickedId     = ref<number | null>(null)

// ── Images (reactive query → auto-refetch) ────────────────────────────────────
const { data: imagesData, status: imagesStatus } = useFetch<{
  images: { image_id: number; meet_id: number; date: string; urls: { thumb: string; preview: string; xl: string; full: string } }[]
  total: number
  page: number
  per_page: number
  pages: number
}>('/api/images', {
  query: {
    meet_id:  activeMeetId,
    page:     currentPage,
    per_page: PER_PAGE,
  },
  watch: [activeMeetId, currentPage],
})

// ── Computed ─────────────────────────────────────────────────────────────────
const totalPages = computed(() => imagesData.value?.pages ?? 1)

const activeTotalCount = computed(() =>
  activeMeetId.value === null
    ? (meetsData.value?.total ?? 0)
    : (meetsData.value?.meets.find(m => m.meet_id === activeMeetId.value)?.photo_count ?? 0)
)

const activeLabel = computed(() => {
  if (activeMeetId.value === null) return '전체 대회'
  const m = meetsData.value?.meets.find(m => m.meet_id === activeMeetId.value)
  return m ? `${m.short} · ${m.label}` : '전체 대회'
})

// ── Actions ───────────────────────────────────────────────────────────────────
function selectMeet(meetId: number | null) {
  activeMeetId.value = meetId
  currentPage.value  = 1
  dropOpen.value     = false
}

function goToPage(n: number) {
  if (n === currentPage.value) return
  currentPage.value = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onTileClick(img: { image_id: number; urls: { thumb: string; xl: string } }) {
  clickedId.value = img.image_id
  setTimeout(() => { clickedId.value = null }, 500)
  if (window.MB?.openLightbox) {
    window.MB.openLightbox(img.urls.thumb, img.urls.xl, `Photo #${img.image_id}`)
  }
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const sel = document.querySelector('.event-select')
    if (sel && !sel.contains(e.target as Node)) dropOpen.value = false
  })
})
</script>

<style scoped>
:root { --grid-margin: 14px; }
.photos-shell { min-height: 100vh; min-height: 100dvh; padding-top: 96px; padding-bottom: 40px; }
.photos-head { padding: 8px 32px 24px; display: flex; align-items: baseline; gap: 22px; flex-wrap: wrap; }
.photos-head h1 { font-family: var(--font-myungjo); font-size: 44px; font-weight: 400; letter-spacing: -0.01em; line-height: 1; }
.photos-head .vol { font-family: var(--font-serif); font-style: italic; font-size: 24px; color: var(--fg-faint); letter-spacing: -0.01em; }
.photos-head .meta-inline { margin-left: auto; color: var(--fg-dim); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
@media (max-width: 768px) { .photos-head { padding: 4px 18px 20px; gap: 14px; } .photos-head h1 { font-size: 32px; } .photos-head .vol { font-size: 18px; } .photos-head .meta-inline { font-size: 10px; width: 100%; margin-left: 0; } }
.photos-controls { padding: 4px 32px 26px; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.event-select { position: relative; }
.event-select-btn { display: inline-flex; align-items: center; gap: 12px; padding: 10px 16px; background: var(--bg-soft); border: 1px solid var(--line); color: var(--fg); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: border-color 0.3s, background 0.3s; min-width: 240px; text-align: left; }
.event-select-btn:hover { border-color: var(--accent-dim); background: rgba(56,182,255,0.04); }
.event-select-btn .label { flex: 1; }
.event-select-btn .caret { width: 10px; height: 10px; transform: rotate(0deg); transition: transform 0.3s var(--ease-out); }
.event-select.open .event-select-btn .caret { transform: rotate(180deg); }
.event-select-list { position: absolute; top: calc(100% + 6px); left: 0; min-width: 100%; max-height: 320px; overflow-y: auto; background: var(--bg-soft); border: 1px solid var(--line); padding: 6px 0; opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity 0.25s, transform 0.25s var(--ease-out); z-index: 30; }
.event-select.open .event-select-list { opacity: 1; pointer-events: auto; transform: translateY(0); }
.event-select-list button { display: block; width: 100%; text-align: left; padding: 10px 16px; color: var(--fg-dim); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.04em; cursor: pointer; transition: color 0.2s, background 0.2s; background: none; border: 0; }
.event-select-list button:hover, .event-select-list button.active { color: var(--fg); background: rgba(255,255,255,0.04); }
.event-select-list button .count { float: right; color: var(--fg-faint); font-variant-numeric: tabular-nums; margin-left: 16px; }
@media (max-width: 768px) { .photos-controls { padding: 0 18px 22px; } .event-select-btn { min-width: 200px; padding: 9px 14px; font-size: 11px; } }
.photos-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; padding: 0 14px; }
@media (max-width: 1199px) { .photos-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 10px; } }
@media (max-width: 768px) { .photos-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 8px; } }
.grid-loading { padding: 0 14px; }
.photo-tile { position: relative; aspect-ratio: 3/2; background-color: var(--tile-bg); background-size: cover; background-position: center; background-repeat: no-repeat; border: 0; padding: 0; overflow: hidden; cursor: pointer; filter: grayscale(0.18) brightness(0.96); transition: filter 0.5s ease-out; -webkit-tap-highlight-color: transparent; }
.photo-tile:hover { filter: none; transition-duration: 0.3s; }
.photo-tile::after { content: ''; position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
.photo-tile.clicked::after { animation: photoClickFlash 0.45s ease-out; }
.photo-tile.skeleton { cursor: default; animation: skeletonPulse 1.4s ease-in-out infinite; }
@keyframes photoClickFlash { 0%{opacity:0} 18%{opacity:0.18} 100%{opacity:0} }
@keyframes skeletonPulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
.photo-tile .num { position: absolute; top: 12px; left: 12px; color: #fff; font-family: var(--font-serif); font-style: italic; font-size: 36px; font-weight: 400; letter-spacing: -0.015em; line-height: 1; opacity: 0.10; mix-blend-mode: difference; pointer-events: none; font-variant-numeric: tabular-nums; }
@media (max-width: 1199px) { .photo-tile .num { font-size: 30px; top: 10px; left: 10px; } }
@media (max-width: 768px) { .photo-tile .num { font-size: 24px; opacity: 0.14; top: 8px; left: 8px; } }
:deep(.lightbox-frame) { aspect-ratio: 3/2; }
.pagination { margin: 56px 0 0; padding: 0 14px 80px; display: flex; align-items: center; justify-content: flex-start; flex-wrap: wrap; }
.page-numbers { display: flex; align-items: baseline; gap: 2px; flex-wrap: wrap; justify-content: flex-start; }
.page-num { background: none; border: 0; color: var(--fg-dim); font-family: var(--font-serif); font-style: italic; font-size: 17px; letter-spacing: -0.01em; line-height: 1; min-width: 26px; height: 30px; padding: 0 5px; cursor: pointer; font-variant-numeric: tabular-nums; transition: color 0.3s ease, transform 0.3s var(--ease-out); position: relative; }
.page-num:not(.active):not(:disabled):hover { color: var(--fg); }
.page-num.active { color: var(--fg); font-size: 21px; transform: translateY(-1px); }
.page-num.active::after { content: ''; position: absolute; left: 50%; bottom: -4px; transform: translateX(-50%); width: 12px; height: 1px; background: var(--fg); }
@media (max-width: 768px) { .pagination { margin-top: 40px; padding-bottom: 60px; } .page-num { font-size: 14px; min-width: 22px; height: 26px; padding: 0 3px; } .page-num.active { font-size: 17px; } }
</style>
