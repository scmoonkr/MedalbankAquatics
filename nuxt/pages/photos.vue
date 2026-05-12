<template>
  <main class="photos-shell">
    <div class="photos-head">
      <div class="eyebrow"><span class="num">00</span>Photos · 사진집</div>
      <div class="head-title-row">
        <h1>사진집.</h1>
        <span v-if="activeMeetId !== null" class="vol">— {{ activeLabel }}</span>
        <span class="meta-inline">
          전체 <span>{{ activeTotalCount }}</span>장 ·
          <span>{{ currentPage }} / {{ totalPages }}</span>
        </span>
      </div>
    </div>
    <p class="photos-sub">아래 드롭다운 메뉴 또는 태그 버튼을 통해 각 태그를 선택하여 사진을 열람할 수 있습니다.</p>

    <div class="photos-controls">
      <!-- 대회 dropdown -->
      <div class="event-select" :class="{ open: dropOpen }">
        <button class="event-select-btn" type="button" :aria-expanded="dropOpen" @click="dropOpen = !dropOpen">
          <span class="label">{{ activeLabel }}</span>
          <svg class="caret" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
            <polyline points="1 1.5, 5 5, 9 1.5"/>
          </svg>
        </button>
        <div class="event-select-list" role="listbox">
          <button type="button" :class="{ active: activeMeetId === null }" @click="selectMeet(null)">
            전체 대회<span class="count">{{ meetsData?.total ?? 0 }}장</span>
          </button>
          <template v-for="g in meetsGrouped" :key="g.year">
            <div class="group-label">{{ g.year }}</div>
            <button v-for="m in g.meets" :key="m.meet_id" type="button"
              :class="{ active: activeMeetId === m.meet_id }"
              @click="selectMeet(m.meet_id)">
              {{ m.short }} · {{ m.label }}<span class="count">{{ m.photo_count }}장</span>
            </button>
          </template>
        </div>
      </div>

      <!-- 선수별 사진 열람 버튼 -->
      <NuxtLink class="athlete-browse-btn" to="/athletes">
        선수별 사진 열람
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4, 13 8, 9 12"/>
        </svg>
      </NuxtLink>

      <!-- 태그 버튼들 -->
      <div v-if="tagsData?.length" class="tag-filter">
        <button type="button" class="tag-btn" :class="{ active: activeTag === null }" @click="selectTag(null)">전체</button>
        <button v-for="tag in tagsData" :key="tag" type="button"
          class="tag-btn" :class="{ active: activeTag === tag }"
          @click="selectTag(tag)">{{ tag }}</button>
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
useHead({ title: '메달뱅크 아쿠아틱스 — 사진집.' })

const PER_PAGE = 50

// ── Meets ────────────────────────────────────────────────────────────────────
const { data: meetsData } = useFetch<{
  total: number
  meets: { meet_id: number; label: string; short: string; date: string; photo_count: number }[]
}>('/api/meets')

// ── State ────────────────────────────────────────────────────────────────────
const activeMeetId    = ref<number | null>(null)
const activeTag       = ref<string | null>(null)
const currentPage     = ref(1)
const dropOpen        = ref(false)
const clickedId       = ref<number | null>(null)

const { data: tagsData } = useFetch<string[]>('/api/tags')

// ── Images (reactive query → auto-refetch) ────────────────────────────────────
const { data: imagesData, status: imagesStatus } = useFetch<{
  images: { image_id: number; meet_id: number; date: string; urls: { thumb: string; preview: string; original: string; large: string } }[]
  total: number
  page: number
  per_page: number
  pages: number
}>('/api/images', {
  query: {
    meet_id:  activeMeetId,
    tag:      activeTag,
    page:     currentPage,
    per_page: PER_PAGE,
  },
  watch: [activeMeetId, activeTag, currentPage],
})

// ── Computed ─────────────────────────────────────────────────────────────────
const quickMeetsDesktop = computed(() =>
  (meetsData.value?.meets ?? []).slice(0, 10)
)

const quickMeetsMobile = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return (meetsData.value?.meets ?? []).filter(m => new Date(m.date) >= cutoff)
})

const meetsGrouped = computed(() => {
  const list = meetsData.value?.meets ?? []
  const groups = new Map<string, typeof list>()
  for (const m of list) {
    const year = m.short?.slice(0, 4) ?? '기타'
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(m)
  }
  return [...groups.entries()]
    .map(([year, meets]) => ({ year, meets }))
    .sort((a, b) => b.year.localeCompare(a.year))
})

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

function selectTag(tag: string | null) {
  activeTag.value   = tag
  currentPage.value = 1
}

function goToPage(n: number) {
  if (n === currentPage.value) return
  currentPage.value = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onTileClick(img: { image_id: number; urls: { thumb: string; original: string } }) {
  clickedId.value = img.image_id
  setTimeout(() => { clickedId.value = null }, 500)
  if (window.MB?.openLightbox) {
    window.MB.openLightbox(img.urls.thumb, img.urls.original, `Photo #${img.image_id}`)
  }
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const t = e.target as Node
    const sel = document.querySelector('.event-select')
    if (sel && !sel.contains(t)) dropOpen.value = false
  })
})
</script>

<style scoped>
:root { --grid-margin: 14px; }
.photos-shell { min-height: 100vh; min-height: 100dvh; padding-top: 96px; padding-bottom: 80px; }
.photos-head { padding: 8px 32px 24px; }
.photos-head .eyebrow { color: var(--fg-faint); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; margin-bottom: 22px; }
.photos-head .eyebrow .num { font-family: var(--font-serif); font-style: italic; font-size: 14px; margin-right: 10px; color: var(--accent); letter-spacing: -0.01em; }
.head-title-row { display: flex; align-items: baseline; gap: 22px; flex-wrap: wrap; }
.photos-head h1 { font-family: var(--font-myungjo); font-size: clamp(36px, 5vw, 60px); font-weight: 400; line-height: 1.18; letter-spacing: -0.018em; }
.photos-head .vol { font-family: var(--font-serif); font-style: italic; font-size: 24px; color: var(--fg-faint); letter-spacing: -0.01em; }
.photos-head .meta-inline { margin-left: auto; color: var(--fg-dim); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
@media (max-width: 768px) { .photos-head { padding: 4px 18px 20px; } .head-title-row { gap: 14px; } .photos-head h1 { font-size: 32px; } .photos-head .vol { font-size: 18px; } .photos-head .meta-inline { font-size: 10px; width: 100%; margin-left: 0; } }
.photos-sub { padding: 0 32px 24px; color: var(--fg-dim); font-family: var(--font-myungjo); font-size: clamp(13px, 1.2vw, 15px); line-height: 1.7; letter-spacing: -0.005em; max-width: 680px; }
@media (max-width: 768px) { .photos-sub { padding: 0 18px 20px; font-size: 13px; } }
.photos-controls { padding: 4px 32px 26px; display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap; }
.event-select { position: relative; }
.event-select-btn { display: inline-flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--fg); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: border-color 0.3s, background 0.3s; min-width: 240px; text-align: left; -webkit-appearance: none; appearance: none; }
.event-select-btn:hover { border-color: var(--accent-dim); background: rgba(56,182,255,0.04); }
.event-select-btn .label { flex: 1; }
.event-select-btn .caret { width: 10px; height: 10px; transform: rotate(0deg); transition: transform 0.3s var(--ease-out); }
.event-select.open .event-select-btn .caret { transform: rotate(180deg); }
.event-select-list { position: absolute; top: calc(100% + 6px); left: 0; width: max-content; min-width: 100%; max-height: 320px; overflow-y: auto; padding: 6px 0; opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity 0.25s, transform 0.25s var(--ease-out); z-index: 30; }
.event-select.open .event-select-list { opacity: 1; pointer-events: auto; transform: translateY(0); }
.event-select-list button { display: block; width: 100%; text-align: left; padding: 10px 16px; color: var(--fg-dim); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.04em; cursor: pointer; transition: color 0.2s, background 0.2s; background: none; border: 0; white-space: nowrap; }
.event-select-list button:hover, .event-select-list button.active { color: var(--fg); background: rgba(255,255,255,0.04); }
.event-select-list button .count { float: right; color: var(--fg-faint); font-variant-numeric: tabular-nums; margin-left: 16px; }
.event-select-list .group-label { padding: 8px 16px 4px; color: var(--fg-faint); font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; pointer-events: none; font-variant-numeric: tabular-nums; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px; }
.event-select-list .group-label:first-child { border-top: 0; margin-top: 0; }
@media (max-width: 768px) { .photos-controls { padding: 0 18px 22px; } .event-select-btn { min-width: 200px; padding: 9px 14px; font-size: 11px; } }
.athlete-browse-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--line);
  color: var(--fg-dim);
  font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
  text-decoration: none; white-space: nowrap;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.athlete-browse-btn:hover { color: var(--fg); border-color: var(--fg-dim); background: rgba(255,255,255,0.03); }
.athlete-browse-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
.tag-filter { display: flex; align-items: stretch; gap: 6px; flex-wrap: wrap; }
.tag-btn { padding: 10px 12px; background: none; border: 1px solid var(--line); color: var(--fg-faint); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.07em; cursor: pointer; transition: color 0.2s, border-color 0.2s, background 0.2s; white-space: nowrap; }
.tag-btn:hover { color: var(--fg); border-color: var(--fg-dim); }
.tag-btn.active { color: var(--accent); border-color: var(--accent); background: rgba(56,182,255,0.06); }
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
.photo-tile .num { position: absolute; bottom: 7px; left: 9px; color: #fff; font-family: var(--font-sans); font-size: 10px; font-weight: 400; letter-spacing: 0.06em; line-height: 1; opacity: 0.55; mix-blend-mode: difference; pointer-events: none; font-variant-numeric: tabular-nums; }
@media (max-width: 1199px) { .photo-tile .num { font-size: 9px; bottom: 6px; left: 8px; } }
@media (max-width: 768px) { .photo-tile .num { font-size: 9px; bottom: 5px; left: 7px; } }
:deep(.lightbox-frame) { aspect-ratio: 3/2; }
.pagination { margin: 56px 0 0; padding: 0 14px 0; display: flex; align-items: center; justify-content: flex-start; flex-wrap: wrap; }
.page-numbers { display: flex; align-items: baseline; gap: 2px; flex-wrap: wrap; justify-content: flex-start; }
.page-num { background: none; border: 0; color: var(--fg-dim); font-family: var(--font-serif); font-style: italic; font-size: 17px; letter-spacing: -0.01em; line-height: 1; min-width: 26px; height: 30px; padding: 0 5px; cursor: pointer; font-variant-numeric: tabular-nums; transition: color 0.3s ease, transform 0.3s var(--ease-out); position: relative; }
.page-num:not(.active):not(:disabled):hover { color: var(--fg); }
.page-num.active { color: var(--fg); font-size: 21px; transform: translateY(-1px); }
.page-num.active::after { content: ''; position: absolute; left: 50%; bottom: -4px; transform: translateX(-50%); width: 12px; height: 1px; background: var(--fg); }
@media (max-width: 768px) { .pagination { margin-top: 40px; padding-bottom: 0; } .page-num { font-size: 14px; min-width: 22px; height: 26px; padding: 0 3px; } .page-num.active { font-size: 17px; } }
</style>
