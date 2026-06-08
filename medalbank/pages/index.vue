<template>
  <div>
    <!-- Hero -->
    <div class="hero" ref="heroEl">
      <div class="hero-eyebrow">
        01 · The Index · 등재부 <span class="dot">·</span> 메달뱅크
      </div>
      <div class="hero-corner">메달뱅크</div>
      <h1>The <span class="em">Index.</span></h1>
      <p class="hero-sub">대한민국 경영 전 종목 종합순위표. 한 명 한 명, 기록이 역사가 됩니다.</p>
      <div class="hero-foot">
        <span>{{ heroStat }}</span>
        <span class="arrow">↓</span>
      </div>
    </div>

    <!-- Shell: filters sidebar + results -->
    <div class="shell">
      <aside class="filters">
        <div class="filters-head">
          <span>Filters</span>
          <span class="count">{{ currentEntryCount }}</span>
        </div>

        <!-- Division -->
        <div class="filter-group">
          <div class="legend"><span>구분</span><span class="ko">DIVISION</span></div>
          <ul class="filter-list">
            <li v-for="d in DIVISIONS" :key="d.v">
              <button class="filter-btn" :class="{ current: state.division === d.v }" @click="setFilter('division', d.v)">
                <span class="label-wrap"><span class="indicator">·</span><span>{{ d.label }}</span></span>
                <span class="sub">{{ d.sub }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Group -->
        <div class="filter-group">
          <div class="legend"><span>연령</span><span class="ko">GROUP</span></div>
          <ul class="filter-list">
            <li v-for="g in GROUPS" :key="g.v">
              <button
                class="filter-btn"
                :class="{ current: state.group === g.v, disabled: !g.enabled }"
                :aria-disabled="g.enabled ? undefined : 'true'"
                @click="g.enabled && setFilter('group', g.v)"
              >
                <span class="label-wrap"><span class="indicator">·</span><span>{{ groupLabelFor(g.v, state.division) }}</span></span>
                <span class="sub">{{ g.sub }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Gender -->
        <div class="filter-group">
          <div class="legend"><span>성별</span><span class="ko">GENDER</span></div>
          <ul class="filter-list">
            <li v-for="g in GENDERS" :key="g.v">
              <button class="filter-btn" :class="{ current: state.gender === g.v }" @click="setFilter('gender', g.v)">
                <span class="label-wrap"><span class="indicator">·</span><span>{{ g.label }}</span></span>
                <span class="sub">{{ g.sub }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Stroke -->
        <div class="filter-group">
          <div class="legend"><span>종목</span><span class="ko">STROKE</span></div>
          <ul class="filter-list">
            <li v-for="s in STROKES" :key="s.v">
              <button class="filter-btn" :class="{ current: state.stroke === s.v }" @click="setFilter('stroke', s.v)">
                <span class="label-wrap"><span class="indicator">·</span><span>{{ s.label }}</span></span>
                <span class="sub">
                  <span class="lbl-desk">{{ s.subDesk }}</span>
                  <span class="lbl-mob">{{ s.subMob }}</span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Distance -->
        <div class="filter-group">
          <div class="legend"><span>거리</span><span class="ko">DISTANCE</span></div>
          <ul class="filter-list">
            <li v-for="d in availableDistances" :key="d">
              <button class="filter-btn" :class="{ current: state.distance === d }" @click="setFilter('distance', d)">
                <span class="label-wrap"><span class="indicator">·</span><span>{{ d }}m</span></span>
                <span class="sub">{{ d <= 50 ? 'SPRINT' : d <= 200 ? 'MID' : 'DISTANCE' }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Course -->
        <div class="filter-group">
          <div class="legend"><span>코스</span><span class="ko">COURSE</span></div>
          <ul class="filter-list">
            <li v-for="c in COURSES" :key="c.v">
              <button class="filter-btn" :class="{ current: state.course === c.v }" @click="setFilter('course', c.v)">
                <span class="label-wrap"><span class="indicator">·</span><span>{{ c.label }}</span></span>
                <span class="sub">{{ c.sub }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Stats -->
        <div class="aside-stats">
          <div class="stat-row">
            <span class="label">Events</span>
            <span class="value">{{ (sheet && sheet.total > 0) ? 1 : 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="label">Ranks</span>
            <span class="value">{{ rankCount.toLocaleString() }}</span>
          </div>
          <div class="stat-row">
            <span class="label">Athletes</span>
            <span class="value">{{ athleteCount.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Submit CTA -->
        <div class="aside-submit">
          <div class="small">Contribute</div>
          <button class="cta" type="button" @click="openSubmitModal">
            직접 기록 추가하기 <span class="arrow">→</span>
          </button>
          <button class="cta cta-file" type="button" @click="openSubmitFileModal">
            기록지 업로드하기 <span class="arrow">↑</span>
          </button>
          <div class="note">새로운 기록이나 누락된 기록 제보하기</div>
        </div>
      </aside>

      <main class="results" @click="handleResultsClick">
        <div class="results-header">
          <h2 ref="resultsTitleEl" v-html="titleHtml"></h2>
          <div class="right">
            <button
              class="pdf-btn"
              type="button"
              :disabled="pdfBusy || !totalCount"
              @click="downloadPdf"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
                <path d="M12 11.5v5" />
                <path d="M9.5 14l2.5 2.5L14.5 14" />
              </svg>
              <span>{{ pdfBusy ? '준비 중…' : 'PDF 다운로드' }}</span>
            </button>
          </div>
        </div>
        <div v-if="pending && !allRanks.length" class="empty-state">데이터를 불러오는 중입니다…</div>
        <div v-else v-html="tableHtml"></div>
        <div ref="sentinelEl" class="scroll-sentinel"></div>
        <div v-if="loadingMore" class="load-more-state">불러오는 중…</div>
        <div v-else-if="!hasMore && allRanks.length > 100" class="load-end-state">— 전체 {{ totalCount.toLocaleString() }}명 표시 완료 —</div>
      </main>
    </div>
  </div>

</template>

<script setup lang="ts">
useHead({ title: 'The Index — 메달뱅크 · Medalbank' })

const naverFormInsert = useRuntimeConfig().public.naverFormInsert as string
const route  = useRoute()
const router = useRouter()

// Canon comparison overlay — modal의 권위 기록 비교 섹션에 DB 데이터 주입
const { data: dbRecords } = await useFetch('/api/canon')

function parseTimeSec(str: string): number | null {
  if (!str) return null
  const s = str.replace(/^0+:/, '')
  if (s.includes(':')) {
    const [m, sec] = s.split(':')
    return parseInt(m) * 60 + parseFloat(sec)
  }
  return parseFloat(s) || null
}

function injectCompareOverlay() {
  const scoring = (window as any).KSR_SCORING
  if (!scoring || !dbRecords.value) return
  const overlay: Record<string, any> = {}
  for (const [key, rec] of Object.entries(dbRecords.value as Record<string, any>)) {
    const parts = key.split('-')
    if (parts.length < 4) continue
    const [gender, stroke, dist, type] = parts
    const overlayKey = `${gender}-${stroke}-${dist}-LCM`
    if (!overlay[overlayKey]) overlay[overlayKey] = {}
    overlay[overlayKey][type] = {
      time:   parseTimeSec(rec.time),
      holder: rec.athlete,
      nation: rec.nation,
      year:   rec.year ? parseInt(String(rec.year)) : null,
      venue:  rec.venue || undefined,
    }
  }
  scoring.injectOverlay(overlay)
}

// ── filter defaults ────────────────────────────────────────────
const DEFAULTS = { division: 'all', group: 'all', gender: 'm', stroke: 'breast', distance: 50, course: 'lcm' }

// ── taxonomies ─────────────────────────────────────────────────
const DIVISIONS = [
  { v: 'all',     label: '전체',     sub: 'ALL' },
  { v: 'elite',   label: '전문체육', sub: 'ELITE' },
  { v: 'masters', label: '마스터즈', sub: 'MASTERS' },
]
const GROUPS = [
  { v: 'all',   labels: { all: '전체',   elite: '전체',   masters: '전체'   }, sub: 'ALL',   enabled: true },
  { v: 'adult', labels: { all: '성인',   elite: '일반부', masters: '성인부' }, sub: 'ADULT', enabled: true },
  { v: 'high',  labels: { all: '고등부', elite: '고등부', masters: '고등부' }, sub: 'HIGH',  enabled: true },
  { v: 'mid',   labels: { all: '중등부', elite: '중등부', masters: '중등부' }, sub: 'MID',   enabled: true },
  { v: 'elem',  labels: { all: '초등부', elite: '초등부', masters: '초등부' }, sub: 'ELEM',  enabled: true },
  { v: 'youth', labels: { all: '유년부', elite: '유년부', masters: '유년부' }, sub: 'YOUTH', enabled: true },
]
const GENDERS  = [
  { v: 'm', label: '남자', sub: 'MEN'   },
  { v: 'f', label: '여자', sub: 'WOMEN' },
]
const STROKES = [
  { v: 'free',   label: '자유형',   subDesk: 'FREE',   subMob: 'FR' },
  { v: 'back',   label: '배영',     subDesk: 'BACK',   subMob: 'BA' },
  { v: 'breast', label: '평영',     subDesk: 'BREAST', subMob: 'BR' },
  { v: 'fly',    label: '접영',     subDesk: 'FLY',    subMob: 'FL' },
  { v: 'im',     label: '개인혼영', subDesk: 'I.M.',   subMob: 'IM' },
]
const COURSES = [
  { v: 'lcm', label: 'LCM', sub: '50m · LONG'  },
  { v: 'scm', label: 'SCM', sub: '25m · SHORT' },
]
const GENDER_LABEL: Record<string, string> = { m: '남자', f: '여자' }
const STROKE_LABEL: Record<string, string> = {
  breast: '평영', free: '자유형', back: '배영', fly: '접영', im: '개인혼영',
}

// index state → modal data 속성 매핑
const MODAL_GENDER: Record<string, string> = { m: 'M', f: 'W' }
const MODAL_STROKE: Record<string, string> = {
  free: 'FR', back: 'BA', breast: 'BR', fly: 'FL', im: 'IM',
}

// ── state: init from URL query params, then localStorage fallback ─
const _q = route.query
const state = reactive({
  division: String(_q.division ?? DEFAULTS.division),
  group:    String(_q.group    ?? DEFAULTS.group),
  gender:   String(_q.gender   ?? DEFAULTS.gender),
  stroke:   String(_q.stroke   ?? DEFAULTS.stroke),
  distance: Number(_q.distance ?? DEFAULTS.distance) || DEFAULTS.distance,
  course:   String(_q.course   ?? DEFAULTS.course),
})

// ── data ───────────────────────────────────────────────────────
type EventRank     = { rank: number; name: string; city: string; team: string; date: string; time: string; meet: string; meet_full: string; isMasters?: boolean; waPoints?: number; timeID?: number | null }
type SheetResponse = { page: number; pageSize: number; total: number; ranks: EventRank[] }

const allRanks    = ref<EventRank[]>([])
const currentPage = ref(1)
const totalCount  = ref(0)
const loadingMore = ref(false)
const sentinelEl  = ref<HTMLElement | null>(null)
const hasMore     = computed(() => allRanks.value.length < totalCount.value)

// ── helpers ────────────────────────────────────────────────────
function esc(s: unknown): string {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m as string] ?? m))
}
function groupLabelFor(gv: string, dv: string): string {
  const g = GROUPS.find(x => x.v === gv)
  if (!g) return gv
  return (g.labels as Record<string, string>)[dv] ?? (g.labels as Record<string, string>).all ?? gv
}

// ── available distances ────────────────────────────────────────
const availableDistances = computed(() => {
  const { stroke, division, course } = state
  const base = [50, 100, 200]
  const free  = stroke === 'free' ? [400, 800, 1500] : []
  const im400 = stroke === 'im'   ? [400] : []
  const m25   = (division === 'masters' && course === 'scm') ? [25] : []
  return [...new Set([...m25, ...base, ...free, ...im400])].sort((a, b) => a - b)
})
watch(availableDistances, (dists) => {
  if (!dists.includes(state.distance)) state.distance = dists.includes(100) ? 100 : dists[0]
})

// ── fetch single event page ────────────────────────────────────
const fetchQuery = computed(() => ({
  division: state.division,
  group:    state.group,
  gender:   state.gender,
  stroke:   state.stroke,
  distance: state.distance,
  course:   state.course,
  page:     1,
}))
const { data: sheet, pending } = useFetch<SheetResponse>('/api/sheet', {
  query: fetchQuery,
  // Bypass useFetch's payload cache so deleted/edited records reflect immediately.
  key: () => `sheet:${Date.now()}:${Math.random()}`,
})

// filters 바뀌면 즉시 초기화 (fetch 완료 전에 비워서 깜빡임 방지)
watch(fetchQuery, () => {
  allRanks.value   = []
  currentPage.value = 1
  totalCount.value  = 0
})
// fetch 완료 → 첫 페이지 채우기
watch(sheet, (s) => {
  if (!s) return
  allRanks.value   = [...s.ranks]
  currentPage.value = s.page
  totalCount.value  = s.total
})

// ── load more ─────────────────────────────────────────────────
async function loadMore() {
  if (loadingMore.value || !hasMore.value || pending.value) return
  loadingMore.value = true
  try {
    const next = await $fetch<SheetResponse>('/api/sheet', {
      query: { ...fetchQuery.value, page: currentPage.value + 1 },
    })
    allRanks.value   = [...allRanks.value, ...next.ranks]
    currentPage.value = next.page
    totalCount.value  = next.total
  } finally {
    loadingMore.value = false
  }
}

// ── stats ──────────────────────────────────────────────────────
const rankCount    = computed(() => allRanks.value.length)
const athleteCount = computed(() => totalCount.value)
const currentEntryCount = computed(() => totalCount.value ? `${totalCount.value} entries` : '—')
const heroStat = computed(() => totalCount.value ? `${totalCount.value.toLocaleString()} ATHLETES LISTED` : '…')

// ── title / meta ───────────────────────────────────────────────
const titleHtml = computed(() => {
  const gL  = esc(GENDER_LABEL[state.gender] ?? state.gender)
  const sL  = esc(STROKE_LABEL[state.stroke] ?? state.stroke)
  const mPfx = state.division === 'masters' ? '마스터즈 ' : ''
  const gPfx = state.group !== 'all' ? `${groupLabelFor(state.group, state.division)} ` : ''
  return `${esc(mPfx)}${esc(gPfx)}${gL} ${sL} <span class="em">${state.distance}m ${state.course.toUpperCase()}</span>`
})
const resultsMeta = computed(() => {
  const dL    = DIVISIONS.find(d => d.v === state.division)?.label ?? state.division
  const gPart = state.group === 'all' ? '' : ` · ${groupLabelFor(state.group, state.division).toUpperCase()}`
  const shown = allRanks.value.length
  const total = totalCount.value
  const cnt   = total > shown ? `TOP ${shown.toLocaleString()} / ${total.toLocaleString()}` : `${total.toLocaleString()}명`
  return `${dL.toUpperCase()}${gPart} · ${cnt}`
})

// ── table builder ──────────────────────────────────────────────
const THEAD = `<thead><tr>
  <th class="c-rank">Rank · 순위</th><th class="c-name">Name · 성명</th>
  <th class="c-time">Time · 기록</th><th class="c-date">Date · 일자</th>
  <th class="c-city">City · 도시</th><th class="c-meet">Meet · 대회</th>
  <th class="c-pts">POINT · 포인트</th>
</tr></thead>`

function fmtWP(wp: number | null | undefined): string {
  if (!wp) return '000'
  return String(Math.min(999, Math.max(0, wp))).padStart(3, '0')
}

const tableHtml = computed(() => {
  if (!totalCount.value && !pending.value) {
    return `<div class="empty-state">선택한 조합에 해당하는 종목 데이터가 아직 수집되지 않았습니다.<br/>제보를 통해 The Index에 처음으로 이름을 올려보세요.</div>`
  }
  if (!allRanks.value.length) return ''
  const p1  = allRanks.value.filter(r => r.rank <= 100)
  const ext = allRanks.value.filter(r => r.rank > 100)
  const body = buildFirstPageRows(p1) + ext.map(r => rowHtml(r, false)).join('')
  return `<table class="index-table">${THEAD}<tbody>${body}</tbody></table>`
})

function buildFirstPageRows(ranks: EventRank[]): string {
  const sorted = [...ranks].sort((a, b) => a.rank !== b.rank ? a.rank - b.rank : (a.date ?? '').localeCompare(b.date ?? ''))
  let body = ''
  let i = 1
  while (i <= 10) {
    const m = sorted.filter(r => r.rank === i)
    if (m.length) { m.forEach(r => { body += rowHtml(r, i === 1) }); i += m.length }
    else          { body += emptyRowHtml(i, i === 1); i++ }
  }
  while (i <= 100) {
    const m = sorted.filter(r => r.rank === i)
    if (m.length) { m.forEach(r => { body += rowHtml(r, false) }); i += m.length }
    else          { body += emptyRowHtml(i, false); i++ }
  }
  return body
}
function rowHtml(r: EventRank, isFirst: boolean): string {
  const hasTime   = r.time && r.time !== '—'
  const mGender   = MODAL_GENDER[state.gender] ?? 'M'
  const mStroke   = MODAL_STROKE[state.stroke]  ?? 'FR'
  const mCourse   = state.course.toUpperCase()
  const datetime  = r.date || ''
  const timeTd    = hasTime
    ? `<td class="time"><span
        class="time-trigger"
        data-gender="${mGender}"
        data-stroke="${mStroke}"
        data-distance="${state.distance}"
        data-course="${mCourse}"
        data-time="${esc(r.time)}"
        data-athlete="${esc(r.name)}"
        data-nation="${esc(r.team)}"
        data-datetime="${esc(datetime)}"
        data-venue="${esc(r.meet_full || r.meet)}"
        data-timeid="${r.timeID ?? ''}"
        role="button"
        tabindex="0"
      >${esc(normTime(r.time))}</span></td>`
    : `<td class="time">—</td>`
  const regBadge = state.division === 'all'
    ? ` <span class="reg-badge">${r.isMasters ? '비등록' : '등록'}</span>`
    : ''
  const ptsTd = r.waPoints
    ? `<td class="pts">${fmtWP(r.waPoints)}</td>`
    : `<td class="pts">—</td>`
  return `<tr${isFirst ? ' class="first"' : ''}>
    <td class="rank">${r.rank}</td>
    <td class="name"><span class="name-link" data-name="${esc(r.name||'')}">${esc(r.name||'—')}</span>${regBadge}</td>
    ${timeTd}
    <td class="date">${esc(r.date||'—')}</td>
    <td class="city">${esc(r.city||'—')}</td>
    <td class="meet"><span class="meet-full">${esc(r.meet_full||r.meet||'—')}</span><span class="meet-short">${esc(r.meet||r.meet_full||'—')}</span></td>
    ${ptsTd}
  </tr>`
}
function emptyRowHtml(i: number, isFirst: boolean): string {
  return `<tr class="empty${isFirst?' first':''}">
    <td class="rank">${i}</td><td class="name">등재 대기중</td>
    <td class="time">—</td><td class="date">—</td>
    <td class="city">—</td><td class="meet">—</td><td class="pts">—</td>
  </tr>`
}

// ── submit modals ──────────────────────────────────────────────
const openSubmitModal     = inject<(data?: Record<string, any>) => void>('submitModal')!
const openSubmitFileModal = inject<() => void>('submitFileModal')!

// ── PDF (Results Summary) download — print window ──────────────
const GENDER_EN: Record<string, string> = { m: 'MEN', f: 'WOMEN' }
const STROKE_EN: Record<string, string> = {
  free: 'Freestyle', back: 'Backstroke', breast: 'Breaststroke', fly: 'Butterfly', im: 'Individual Medley',
}
const pdfBusy = ref(false)

// strip leading "00:" so sprint times read like 25.95 (matches the summary sheet)
function fmtRecTime(t: string | null | undefined): string {
  const n = normTime(t)
  if (!n || n === '—') return '—'
  return n.replace(/^0?0:/, '')
}

// look up an authoritative record (WR / KR …) for the current event
function recordFor(type: string): { time: string; athlete: string; nation: string; year: string | number } | null {
  const recs = dbRecords.value as Record<string, any> | null
  if (!recs) return null
  const key = `${MODAL_GENDER[state.gender]}-${MODAL_STROKE[state.stroke]}-${state.distance}-${type}`
  return recs[key] ?? null
}

// fetch every page of the current event so the PDF holds the full ranking
async function fetchAllRanks(): Promise<EventRank[]> {
  const collected: EventRank[] = []
  let page = 1
  while (page <= 60) {
    const res = await $fetch<SheetResponse>('/api/sheet', { query: { ...fetchQuery.value, page } })
    collected.push(...res.ranks)
    if (collected.length >= res.total || res.ranks.length === 0) break
    page++
  }
  return collected
}

function buildPdfHtml(ranks: EventRank[]): string {
  const genderKo = GENDER_LABEL[state.gender] ?? state.gender
  const strokeKo = STROKE_LABEL[state.stroke] ?? state.stroke
  const genderEn = GENDER_EN[state.gender] ?? state.gender.toUpperCase()
  const strokeEn = STROKE_EN[state.stroke] ?? state.stroke
  const courseU  = state.course.toUpperCase()
  const divKo    = state.division === 'masters' ? '마스터즈' : state.division === 'elite' ? '전문체육' : '전체'
  const grpKo    = state.group !== 'all' ? groupLabelFor(state.group, state.division) : ''

  const wr = recordFor('WR')
  const kr = recordFor('KR')
  const recRow = (label: string, rec: ReturnType<typeof recordFor>) =>
    `<div class="rec-row"><span class="rec-tag">${label}</span><span class="rec-time">${rec ? fmtRecTime(rec.time) : '—'}</span></div>`

  const rows = [...ranks]
    .sort((a, b) => a.rank !== b.rank ? a.rank - b.rank : (a.date ?? '').localeCompare(b.date ?? ''))
    .map(r => `<tr>
      <td class="c-rank">${r.rank}</td>
      <td class="c-name">${esc(r.name || '—')}</td>
      <td class="c-team">${esc(r.team || r.city || '—')}</td>
      <td class="c-date">${esc(r.date || '—')}</td>
      <td class="c-time">${esc(fmtRecTime(r.time))}</td>
      <td class="c-pts">${r.waPoints ? fmtWP(r.waPoints) : '—'}</td>
    </tr>`).join('')

  const now = new Date()
  const p2 = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`
  const fullStamp = `${now.getFullYear()}/${p2(now.getMonth() + 1)}/${p2(now.getDate())} ${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`
  const evTitleKo = `${divKo === '전체' ? '' : divKo + ' '}${grpKo ? grpKo + ' ' : ''}${genderKo} ${strokeKo} ${state.distance}m ${courseU}`

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>${esc(evTitleKo)} — Medalbank Results Summary</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  /* @page margins are unreliable here (the print dialog's margin setting can
     override them to 0). So margins are baked into the content instead:
     - left/right + page-1 top  → body padding
     - per-page top  → repeating .thead-spacer row (thead repeats every page)
     - per-page bottom → .foot-cell padding-bottom (tfoot repeats every page) */
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'JetBrains Mono', 'Courier New', monospace; color: #111; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 14mm 16mm 0; }
  .sheet { padding: 0; }
  .head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; }
  .mark { display: flex; align-items: center; gap: 9px; }
  .mark .logo { width: 30px; height: 30px; object-fit: contain; flex-shrink: 0; }
  .mark .word { font-weight: 700; letter-spacing: 0.18em; font-size: 12px; }
  .mark .sub { display: block; font-weight: 400; letter-spacing: 0.12em; font-size: 8px; color: #555; margin-top: 3px; }
  .head .center { text-align: center; }
  .head .center .big { font-weight: 700; letter-spacing: 0.24em; font-size: 16px; }
  .head .center .small { font-size: 8px; letter-spacing: 0.16em; color: #555; margin-top: 3px; }
  .head .right-mark { text-align: right; font-size: 9px; letter-spacing: 0.1em; color: #555; }
  .summary-title { text-align: center; font-size: 22px; font-weight: 500; letter-spacing: 0.16em; padding: 6px 0 10px; }
  .ev { display: flex; align-items: flex-start; justify-content: space-between; border-top: 1.5px solid #111; border-bottom: 1px solid #111; padding: 8px 2px; }
  .ev .ev-main { display: flex; flex-wrap: wrap; gap: 4px 22px; align-items: baseline; }
  .ev .ev-main .label { font-size: 8px; color: #888; letter-spacing: 0.1em; display: block; }
  .ev .ev-main .val { font-size: 13px; font-weight: 500; }
  .ev .recs { text-align: right; min-width: 120px; }
  .rec-row { display: flex; justify-content: flex-end; gap: 10px; font-size: 11px; line-height: 1.5; }
  .rec-tag { color: #555; letter-spacing: 0.08em; }
  .rec-time { font-weight: 700; min-width: 56px; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  thead th { font-size: 8.5px; letter-spacing: 0.1em; color: #555; text-transform: uppercase; text-align: left; padding: 7px 6px; border-bottom: 1.2px solid #111; font-weight: 500; }
  /* repeats on every page → per-page top margin above the column headers */
  thead .thead-spacer td { height: 10mm; padding: 0; border: none; }
  tbody td { padding: 6px; border-bottom: 0.5px solid #ccc; font-size: 11px; }
  tbody tr:nth-child(1) td, tbody tr:nth-child(2) td, tbody tr:nth-child(3) td { font-weight: 700; }
  .c-rank { width: 42px; text-align: center; }
  .c-time, .c-pts { text-align: right; font-variant-numeric: tabular-nums; }
  .c-pts { width: 60px; }
  .c-date { width: 96px; color: #555; }
  .c-team { color: #333; }
  tbody tr { page-break-inside: avoid; }
  /* tfoot repeats on every printed page AND the browser reserves its height,
     so table rows never overlap the footer (unlike position:fixed). */
  tfoot { display: table-footer-group; }
  /* padding-bottom repeats with the tfoot → per-page bottom margin under the footer */
  .foot-cell { border-top: 1px solid #111; border-bottom: none; padding: 6px 4px 12mm; }
  .foot { display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #555; letter-spacing: 0.06em; }
  .foot .center { text-align: center; }
  .foot .right { text-align: right; }
</style></head>
<body><div class="sheet">
  <div class="head">
    <div class="mark">
      <img class="logo" src="/images/logo.png" alt="Medalbank" />
      <span class="word">MEDALBANK<span class="sub">대한민국 경영 종합순위표</span></span>
    </div>
    <div class="center"><div class="big">THE INDEX</div><div class="small">MEDALBANK · 등재부</div></div>
    <div class="right-mark">medalbank.com<br>${stamp}</div>
  </div>
  <div class="summary-title">Results Summary</div>
  <div class="ev">
    <div class="ev-main">
      <div><span class="label">Event</span><span class="val">${esc(genderEn)} ${state.distance}m ${esc(strokeEn)}</span></div>
      <div><span class="label">종목</span><span class="val">${esc(evTitleKo)}</span></div>
      <div><span class="label">Course</span><span class="val">${courseU === 'LCM' ? 'Long (50m)' : 'Short (25m)'}</span></div>
    </div>
    <div class="recs">
      ${recRow('WR', wr)}
      ${recRow('KR', kr)}
    </div>
  </div>
  <table>
    <thead>
      <tr class="thead-spacer"><td colspan="6"></td></tr>
      <tr>
        <th class="c-rank">Rank<br>순위</th>
        <th class="c-name">Name<br>성명</th>
        <th class="c-team">Team<br>소속</th>
        <th class="c-date">Date<br>일자</th>
        <th class="c-time">Time<br>기록</th>
        <th class="c-pts">Point<br>포인트</th>
      </tr>
    </thead>
    <tfoot><tr><td colspan="6" class="foot-cell">
      <div class="foot">
        <span class="left">${fullStamp}</span>
        <span class="center">Medalbank Swimming Results System · ${ranks.length}명</span>
        <span class="right">medalbank.com</span>
      </div>
    </td></tr></tfoot>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:#888">데이터가 없습니다.</td></tr>'}</tbody>
  </table>
</div>
</body></html>`
}

async function downloadPdf() {
  if (pdfBusy.value || !totalCount.value) return
  // open the window synchronously (inside the click) so it isn't blocked as a popup
  const w = window.open('', '_blank')
  if (!w) { alert('팝업이 차단되었습니다. 브라우저의 팝업 차단을 해제해 주세요.'); return }
  w.document.write('<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px;color:#555">PDF 준비 중…</body>')
  pdfBusy.value = true
  try {
    const ranks = await fetchAllRanks()
    w.document.open()
    w.document.write(buildPdfHtml(ranks))
    w.document.close()
    w.focus()
    // same-origin window — drive print from here once layout/fonts settle
    w.onafterprint = () => { try { w.close() } catch {} }
    setTimeout(() => { try { w.print() } catch {} }, 350)
  } catch (err) {
    console.error('[index] pdf build error', err)
    try { w.close() } catch {}
    alert('PDF 생성 중 오류가 발생했습니다.')
  } finally {
    pdfBusy.value = false
  }
}

// ── filter setter ──────────────────────────────────────────────
function setFilter(key: string, val: string | number) {
  ;(state as Record<string, unknown>)[key] = val
  try { localStorage.setItem('ksr-index-filters', JSON.stringify({ ...state })) } catch {}
  router.replace({ query: { ...state } })
}

// ── modal scripts ─────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(s)
  })
}

// ── localStorage fallback (runs only when no URL query params) ─
onMounted(() => {
  if (Object.keys(route.query).length) return
  try {
    const saved = JSON.parse(localStorage.getItem('ksr-index-filters') ?? 'null')
    if (saved && typeof saved === 'object') {
      state.division = String(saved.division ?? DEFAULTS.division)
      state.group    = String(saved.group    ?? DEFAULTS.group)
      state.gender   = String(saved.gender   ?? DEFAULTS.gender)
      state.stroke   = String(saved.stroke   ?? DEFAULTS.stroke)
      state.distance = Number(saved.distance) || DEFAULTS.distance
      state.course   = String(saved.course   ?? DEFAULTS.course)
    }
  } catch {}
})

// ── sticky brand: IntersectionObserver ────────────────────────
const resultsTitleEl = ref<HTMLElement | null>(null)
onMounted(() => {
  if (!resultsTitleEl.value) return
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      document.body.classList.toggle('scrolled-past-hero', !e.isIntersecting && e.boundingClientRect.top < 0)
    })
  }, { threshold: 0 })
  io.observe(resultsTitleEl.value)
  onUnmounted(() => io.disconnect())
})

// ── infinite scroll sentinel ───────────────────────────────────
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore()
  }, { rootMargin: '300px' })
  watchEffect(() => {
    if (sentinelEl.value) io.observe(sentinelEl.value)
  })
  onUnmounted(() => io.disconnect())
})

// ── scoring script ─────────────────────────────────────────────
onMounted(() => {
  loadScript('/canon/js/scoring.js')
    .then(() => injectCompareOverlay())
    .catch(err => console.error('[index] script load error', err))
})

// ── results click delegation ───────────────────────────────────
function handleResultsClick(e: MouseEvent) {
  const timeTrigger = (e.target as Element).closest('.time-trigger')
  if (timeTrigger) {
    e.preventDefault()
    e.stopPropagation()
    const d = (timeTrigger as HTMLElement).dataset
    if (d.timeid) {
      router.push(`/time/${d.timeid}`)
    } else {
      router.push({
        path: '/time',
        query: {
          gender:   d.gender,
          stroke:   d.stroke,
          distance: d.distance,
          course:   d.course,
          time:     d.time,
          athlete:  d.athlete  || undefined,
          datetime: d.datetime || undefined,
          meet:     d.venue    || undefined,
        },
      })
    }
    return
  }
  const nameTrigger = (e.target as Element).closest('.name-link')
  if (nameTrigger) {
    e.preventDefault()
    e.stopPropagation()
    const name = (nameTrigger as HTMLElement).dataset.name
    if (name) router.push({ path: '/search', query: { name } })
  }
}

// ── pending report from time.vue ───────────────────────────────
onMounted(() => {
  const raw = sessionStorage.getItem('medalbank_pending_report')
  if (raw) {
    sessionStorage.removeItem('medalbank_pending_report')
    try { openSubmitModal(JSON.parse(raw)) } catch {}
  }
})

// ── auto-scroll past hero on first load (matches MVP behavior) ─
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let cancelled = false
  const cancel = () => { cancelled = true }
  const opts = { once: true, passive: true } as const
  ;(['wheel', 'touchstart', 'keydown', 'mousedown'] as const).forEach(e =>
    window.addEventListener(e, cancel, opts)
  )
  setTimeout(() => {
    if (cancelled || window.scrollY > 5) return
    const isMobile = window.innerWidth <= 1024
    const target = isMobile
      ? document.querySelector('main.results')
      : document.querySelector('.shell')
    if (!target) return
    const topbarH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')
    ) || 68
    const y = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - topbarH
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, 350)
})
</script>
