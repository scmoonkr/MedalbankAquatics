<template>
  <main class="ath-shell">
    <template v-if="athlete">
      <header class="ath-head">
        <h1>{{ athlete.name }}</h1>
        <p class="summary">
          {{ meetSummary }}<strong>{{ athlete.photo_count }}장</strong> 동의 · {{ span }}
        </p>
        <div class="meta-row">
          <div class="item"><span class="v">{{ athlete.photo_count }}</span>동의 사진</div>
          <div class="item"><span class="v">{{ meets.length }}</span>출전 대회</div>
          <div class="item"><span class="v">{{ span.split(' ~ ')[0] }}</span>첫 사진</div>
          <div class="item"><span class="v">{{ span.split(' ~ ').pop() }}</span>최근 사진</div>
        </div>
      </header>

      <div class="sort-toggle" role="tablist">
        <button type="button" :class="{ active: sortMode === 'meet' }" role="tab" @click="sortMode = 'meet'">대회별</button>
        <button type="button" :class="{ active: sortMode === 'recent' }" role="tab" @click="sortMode = 'recent'">최신순</button>
      </div>

      <!-- 대회별 -->
      <template v-if="sortMode === 'meet'">
        <template v-for="(m, i) in meets" :key="m.id">
          <section class="meet-group">
            <div class="meet-head">
              <span class="date">{{ m.short }}</span>
              <span class="label">{{ m.label }}</span>
              <span class="count">{{ meetPhotos(m.id).length }} photos</span>
            </div>
            <div class="photos-grid">
              <button v-for="p in meetPhotos(m.id)" :key="p.idx" type="button"
                class="photo-tile" :class="{ clicked: clickedKey === `${m.id}-${p.idx}` }"
                :style="{ backgroundImage: `url('${thumbUrl(p.idx)}')` }"
                @click="onTileClick(`${m.id}-${p.idx}`, p.idx)">
                <span class="num">{{ p.idx }}</span>
              </button>
            </div>
          </section>
          <hr v-if="i < meets.length - 1" class="meet-divider" />
        </template>
      </template>

      <!-- 최신순 -->
      <template v-else>
        <section class="meet-group">
          <div class="meet-head">
            <span class="date">최신순</span>
            <span class="label">전체 {{ sortedPhotos.length }}장</span>
          </div>
          <div class="photos-grid">
            <button v-for="p in sortedPhotos" :key="p.idx" type="button"
              class="photo-tile" :class="{ clicked: clickedKey === `recent-${p.idx}` }"
              :style="{ backgroundImage: `url('${thumbUrl(p.idx)}')` }"
              @click="onTileClick(`recent-${p.idx}`, p.idx)">
              <span class="num">{{ p.idx }}</span>
            </button>
          </div>
        </section>
      </template>
    </template>

    <div v-else class="state-empty">
      <h2>{{ errorMsg }}</h2>
      <p><NuxtLink to="/athletes">← 선수목록으로 돌아가기</NuxtLink></p>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: '메달뱅크 아쿠아틱스 — 선수 상세' })

const route = useRoute()
const athleteId = computed(() => route.query.id as string)

const { data: raw } = await useFetch('/data/athletes.json')
const allAthletes = computed(() => (raw.value as any)?.athletes ?? [])
const meetsById   = computed(() => Object.fromEntries(((raw.value as any)?.meets ?? []).map((m: any) => [m.id, m])))

const athlete  = computed(() => allAthletes.value.find((a: any) => a.id === athleteId.value) ?? null)
const errorMsg = computed(() => athleteId.value ? '해당 선수를 찾을 수 없습니다.' : '선수 ID가 없습니다.')

const TOTAL_PHOTOS = 150
const thumbUrl = (idx: number) => `/images/thumbs/thumb-${String(((idx - 1) % TOTAL_PHOTOS) + 1).padStart(3,'0')}.jpg`
const xlUrl    = (idx: number) => `/images/xl/xl-${String(((idx - 1) % TOTAL_PHOTOS) + 1).padStart(3,'0')}.jpg`

const fmtMonth = (s: string) => s.slice(0, 7).replace('-', '.')

const meets = computed(() => {
  if (!athlete.value) return []
  const uniqueIds = [...new Set(athlete.value.photos.map((p: any) => p.meet_id))] as string[]
  return uniqueIds
    .map(id => meetsById.value[id])
    .filter(Boolean)
    .sort((a: any, b: any) => b.date.localeCompare(a.date))
})

const span = computed(() => {
  if (!athlete.value) return ''
  const a = fmtMonth(athlete.value.first_date)
  const b = fmtMonth(athlete.value.last_date)
  return a === b ? b : `${a} ~ ${b}`
})

const meetSummary = computed(() => {
  if (!meets.value.length) return ''
  const headline = meets.value[0]?.label ?? ''
  const others   = meets.value.length - 1
  return others > 0 ? `${headline} 외 ${others}개 대회 · ` : (headline ? `${headline} · ` : '')
})

const meetPhotos = (meetId: string) =>
  athlete.value?.photos.filter((p: any) => p.meet_id === meetId) ?? []

const sortedPhotos = computed(() =>
  [...(athlete.value?.photos ?? [])].sort((a: any, b: any) =>
    b.date.localeCompare(a.date) || (b.idx - a.idx)))

const sortMode  = ref('meet')
const clickedKey = ref<string | null>(null)

function onTileClick(key: string, idx: number) {
  clickedKey.value = key
  setTimeout(() => { clickedKey.value = null }, 500)
  window.MB?.openLightbox(thumbUrl(idx), xlUrl(idx), `Photo #${idx}`)
}
</script>

<style scoped>
:root { --grid-margin: 14px; }
.ath-shell { min-height: 100vh; min-height: 100dvh; padding-top: 96px; padding-bottom: 40px; }
.ath-head { padding: 8px 32px 28px; }
.ath-head h1 { font-family: var(--font-myungjo); font-size: clamp(48px,7vw,88px); font-weight: 400; line-height: 1.05; letter-spacing: -0.018em; margin-bottom: 22px; }
.ath-head .summary { color: var(--fg-dim); font-family: var(--font-myungjo); font-size: clamp(15px,1.4vw,18px); line-height: 1.7; letter-spacing: -0.005em; max-width: 720px; }
.ath-head .summary strong { color: var(--fg); font-weight: 400; }
.ath-head .meta-row { margin-top: 22px; display: flex; gap: 28px; flex-wrap: wrap; color: var(--fg-faint); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.ath-head .meta-row .item .v { display: block; font-family: var(--font-serif); font-style: italic; font-size: 26px; color: var(--fg); letter-spacing: -0.01em; margin-bottom: 4px; text-transform: none; }
@media (max-width: 768px) { .ath-head { padding: 4px 18px 22px; } .ath-head .meta-row { gap: 22px; font-size: 10px; } .ath-head .meta-row .item .v { font-size: 22px; } }
.sort-toggle { padding: 0 32px 28px; display: flex; gap: 0; align-items: center; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
.sort-toggle button { background: none; border: 0; padding: 14px 22px 16px 0; margin-right: 18px; color: var(--fg-faint); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; position: relative; transition: color 0.3s ease; }
.sort-toggle button:hover { color: var(--fg-dim); }
.sort-toggle button.active { color: var(--fg); }
.sort-toggle button.active::after { content: ''; position: absolute; left: 0; bottom: -1px; width: 100%; height: 2px; background: var(--accent); }
@media (max-width: 768px) { .sort-toggle { padding: 0 18px 22px; } .sort-toggle button { font-size: 11px; padding: 12px 18px 14px 0; margin-right: 12px; } }
.meet-group { padding-top: 36px; }
.meet-head { padding: 0 32px; margin-bottom: 18px; display: flex; align-items: baseline; gap: 18px; flex-wrap: wrap; }
.meet-head .date { font-family: var(--font-serif); font-style: italic; font-size: clamp(20px,2.4vw,28px); color: var(--accent); letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.meet-head .label { font-family: var(--font-myungjo); font-size: clamp(18px,2vw,22px); font-weight: 400; color: var(--fg); letter-spacing: -0.005em; }
.meet-head .count { margin-left: auto; color: var(--fg-faint); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
@media (max-width: 768px) { .meet-head { padding: 0 18px; margin-bottom: 14px; gap: 12px; } }
.photos-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; padding: 0 14px; }
@media (max-width: 1199px) { .photos-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 10px; } }
@media (max-width: 768px) { .photos-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 8px; } }
.photo-tile { position: relative; aspect-ratio: 3/2; background-color: var(--tile-bg); background-size: cover; background-position: center; background-repeat: no-repeat; cursor: pointer; border: 0; padding: 0; overflow: hidden; filter: grayscale(0.18) brightness(0.96); transition: filter 0.5s ease-out; -webkit-tap-highlight-color: transparent; }
.photo-tile:hover { filter: none; transition-duration: 0.3s; }
.photo-tile::after { content: ''; position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
.photo-tile.clicked::after { animation: photoClickFlash 0.45s ease-out; }
@keyframes photoClickFlash { 0%{opacity:0} 18%{opacity:0.18} 100%{opacity:0} }
.photo-tile .num { position: absolute; top: 12px; left: 12px; color: #fff; font-family: var(--font-serif); font-style: italic; font-size: 36px; font-weight: 400; letter-spacing: -0.015em; line-height: 1; opacity: 0.10; mix-blend-mode: difference; pointer-events: none; font-variant-numeric: tabular-nums; }
@media (max-width: 1199px) { .photo-tile .num { font-size: 30px; top: 10px; left: 10px; } }
@media (max-width: 768px) { .photo-tile .num { font-size: 24px; opacity: 0.14; top: 8px; left: 8px; } }
.meet-divider { height: 1px; background: var(--line); margin: 48px 32px 0; border: 0; }
@media (max-width: 768px) { .meet-divider { margin: 32px 18px 0; } }
.state-empty { padding: 80px 32px; text-align: center; color: var(--fg-faint); }
.state-empty h2 { font-family: var(--font-myungjo); font-size: 28px; font-weight: 400; color: var(--fg); margin-bottom: 12px; }
.state-empty a { color: var(--accent); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.3s; }
.state-empty a:hover { border-bottom-color: currentColor; }
:deep(.lightbox-frame) { aspect-ratio: 3/2; }
</style>
