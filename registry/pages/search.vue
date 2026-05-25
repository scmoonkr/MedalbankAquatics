<template>
  <div>
    <!-- Hero: 검색폼 없음, 타이틀만 -->
    <div class="hero sr-hero">
      <div class="hero-eyebrow">
        02 · The Search · 선수 검색 <span class="dot">·</span> Korean Swimming Registry
      </div>
      <div class="hero-corner">KSR</div>
      <h1>The <span class="em">Search.</span></h1>
      <p class="hero-sub">선수명으로 전체 기록을 검색합니다. 여러 선수를 동시에 비교할 수 있습니다.</p>
    </div>

    <!-- Shell: 사이드바 + 메인 -->
    <div class="shell">
      <aside class="filters">
        <div class="filters-head">
          <span>Filters</span>
          <span class="count">{{ names.length ? displayRows.length + ' entries' : '—' }}</span>
        </div>

        <!-- 성별 GENDER -->
        <div class="filter-group">
          <div class="legend"><span>성별</span><span class="ko">GENDER</span></div>
          <ul class="filter-list">
            <li v-for="g in GENDERS" :key="g.v">
              <button
                class="filter-btn"
                :class="{ current: filterGender === g.v, disabled: !availableGenderSet.has(g.v) }"
                :aria-disabled="availableGenderSet.has(g.v) ? undefined : 'true'"
                @click="availableGenderSet.has(g.v) && setGender(g.v)"
              >
                <span class="label-wrap"><span class="indicator">·</span><span>{{ g.label }}</span></span>
                <span class="sub">{{ g.sub }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- 영법 STROKE (전체 없음) -->
        <div class="filter-group">
          <div class="legend"><span>영법</span><span class="ko">STROKE</span></div>
          <ul class="filter-list">
            <li v-for="d in DISCS" :key="d.code">
              <button
                class="filter-btn"
                :class="{ current: filterDisc === d.code, disabled: !availableDiscSet.has(d.code) }"
                :aria-disabled="availableDiscSet.has(d.code) ? undefined : 'true'"
                @click="availableDiscSet.has(d.code) && setDisc(d.code)"
              >
                <span class="label-wrap"><span class="indicator">·</span><span>{{ d.ko }}</span></span>
                <span class="sub">{{ d.en }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- 거리 DISTANCE (전체 없음, 영법별 룰) -->
        <div class="filter-group">
          <div class="legend"><span>거리</span><span class="ko">DISTANCE</span></div>
          <ul class="filter-list">
            <li v-for="d in strokeDists" :key="d">
              <button
                class="filter-btn"
                :class="{ current: filterDist === d, disabled: !availableDistSet.has(d) }"
                :aria-disabled="availableDistSet.has(d) ? undefined : 'true'"
                @click="availableDistSet.has(d) && (filterDist = d)"
              >
                <span class="label-wrap"><span class="indicator">·</span><span>{{ d }}</span></span>
              </button>
            </li>
          </ul>
        </div>

        <!-- 코스 COURSE -->
        <div class="filter-group">
          <div class="legend"><span>코스</span><span class="ko">COURSE</span></div>
          <ul class="filter-list">
            <li>
              <button class="filter-btn" :class="{ current: !filterCourse }" @click="filterCourse = ''">
                <span class="label-wrap"><span class="indicator">·</span><span>전체</span></span>
                <span class="sub">ALL</span>
              </button>
            </li>
            <li v-for="c in COURSES" :key="c.v">
              <button
                class="filter-btn"
                :class="{ current: filterCourse === c.v, disabled: !availableCourseSet.has(c.v) }"
                :aria-disabled="availableCourseSet.has(c.v) ? undefined : 'true'"
                @click="availableCourseSet.has(c.v) && (filterCourse = c.v)"
              >
                <span class="label-wrap"><span class="indicator">·</span><span>{{ c.label }}</span></span>
                <span class="sub">{{ c.sub }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- 정렬 SORT -->
        <div class="filter-group">
          <div class="legend"><span>정렬</span><span class="ko">SORT</span></div>
          <ul class="filter-list">
            <li>
              <button class="filter-btn" :class="{ current: sortMode === 'recent' }" @click="sortMode = 'recent'">
                <span class="label-wrap"><span class="indicator">·</span><span>최근순</span></span>
                <span class="sub">DATE</span>
              </button>
            </li>
            <li>
              <button class="filter-btn" :class="{ current: sortMode === 'time' }" @click="sortMode = 'time'">
                <span class="label-wrap"><span class="indicator">·</span><span>기록순</span></span>
                <span class="sub">TIME</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Stats -->
        <div v-if="names.length" class="aside-stats">
          <div class="stat-row">
            <span class="label">Results</span>
            <span class="value">{{ displayRows.length }}</span>
          </div>
          <div v-if="isPbMode" class="stat-row">
            <span class="label">Athletes</span>
            <span class="value">{{ names.length }}</span>
          </div>
        </div>
      </aside>

      <main class="results">
        <!-- ① 검색 폼: 컨텐츠 타이틀 바로 위, 보더로 구분 -->
        <div class="sr-search-bar">
          <form class="sr-form" @submit.prevent="doSearch">
            <input
              v-model="searchInput"
              class="sr-input"
              type="text"
              placeholder="선수명 입력 · 여러 명은 쉼표 또는 공백으로 구분"
              autocomplete="off"
              spellcheck="false"
            />
            <button class="sr-btn" type="submit">검색 →</button>
          </form>
        </div>

        <!-- ② 결과 영역 -->
        <div v-if="!names.length" class="empty-state">선수명을 입력하고 검색하세요.</div>
        <div v-else-if="pending" class="empty-state">검색 중…</div>
        <div v-else-if="!displayRows.length" class="empty-state">결과가 없습니다.</div>

        <template v-else>
          <!-- 타이틀: 현재 선택된 종목 / 서브타이틀: 선수명 -->
          <div class="results-header">
            <h2 v-html="titleHtml"></h2>
            <div class="right">
              <span class="ctx-meta">{{ names.join(' · ') }}</span>
            </div>
          </div>
          <!-- Index 스타일 테이블 -->
          <div v-html="tableHtml"></div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '선수 검색 — KSR · Korean Swimming Registry' })

const route  = useRoute()
const router = useRouter()

// ── Canon 비교 오버레이 ─────────────────────────────────────────
const { data: canonData } = await useFetch<Record<string, any>>('/api/canon')

function parseTimeSec(str: string): number {
  if (!str || str === '—') return Infinity
  const parts = str.trim().split(':')
  if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseFloat(parts[1])
  return parseFloat(str) || Infinity
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src; s.onload = () => resolve(); s.onerror = reject
    document.head.appendChild(s)
  })
}

function injectCompareOverlay() {
  const scoring = (window as any).KSR_SCORING
  if (!scoring || !canonData.value) return
  const overlay: Record<string, any> = {}
  for (const [key, rec] of Object.entries(canonData.value)) {
    const parts = key.split('-')
    if (parts.length < 4) continue
    const [gCode, style, dist] = parts
    const overlayKey = `${gCode}-${style}-${dist}-LCM`
    if (!overlay[overlayKey]) overlay[overlayKey] = {}
    const type = parts[3]
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

onMounted(() => {
  loadScript('/cannon/js/scoring.js')
    .then(() => loadScript('/cannon/js/modal.js'))
    .then(() => injectCompareOverlay())
    .catch(err => console.error('[search] script load error', err))
})

// ── 상수 ────────────────────────────────────────────────────────
const STROKE_DISTS: Record<string, string[]> = {
  FR: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'],
  BK: ['25M', '50M', '100M', '200M'],
  BR: ['25M', '50M', '100M', '200M'],
  FL: ['25M', '50M', '100M', '200M'],
  IM: ['100M', '200M', '400M'],
}
const GENDER_LABEL: Record<string, string> = { M: '남자', W: '여자' }
const DISC_LABEL:   Record<string, string> = { FR: '자유형', BK: '배영', BR: '평영', FL: '접영', IM: '개인혼영' }

const GENDERS = [
  { v: 'M', label: '남자', sub: 'MEN'   },
  { v: 'W', label: '여자', sub: 'WOMEN' },
]
const DISCS = [
  { code: 'FR', ko: '자유형',   en: 'FREE'   },
  { code: 'BK', ko: '배영',     en: 'BACK'   },
  { code: 'BR', ko: '평영',     en: 'BREAST' },
  { code: 'FL', ko: '접영',     en: 'FLY'    },
  { code: 'IM', ko: '개인혼영', en: 'I.M.'   },
]
const COURSES = [
  { v: 'LCM', label: 'LCM', sub: '50m · LONG'  },
  { v: 'SCM', label: 'SCM', sub: '25m · SHORT' },
]

// ── 헬퍼 ────────────────────────────────────────────────────────
function normalizeGender(g: string): string {
  if (g === 'M' || g === 'men'   || g === 'male')   return 'M'
  if (g === 'W' || g === 'women' || g === 'female') return 'W'
  return g
}

function esc(s: unknown): string {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m as string] ?? m)
  )
}

// ── 이름 파싱: 쉼표 또는 공백 모두 구분자 ─────────────────────
const nameQuery = computed(() => String(route.query.name || '').trim())
const names     = computed(() =>
  nameQuery.value
    ? nameQuery.value.split(/[,\s]+/).map(n => n.trim()).filter(Boolean)
    : []
)
const isPbMode    = computed(() => names.value.length > 1)
const searchInput = ref(nameQuery.value)
watch(nameQuery, v => { searchInput.value = v })

// ── 필터 상태 ─────────────────────────────────────────────────
const filterGender = ref('')
const filterDisc   = ref('BR')
const filterDist   = ref('50M')
const filterCourse = ref('')
const sortMode     = ref<'recent' | 'time'>('recent')

// ── 데이터 ────────────────────────────────────────────────────
interface SearchRow {
  id: string; name: string; gender: string
  discipline: string; distance: string; course: string
  time: string; timeStamp: number | null; rank: number | null
  sido: string; team: string; datetime: string
  competitionName: string; pool: string
  isMasters?: boolean; no?: number
}

const { data: rawData, pending } = await useFetch<SearchRow[]>('/api/search', {
  query: computed(() => ({ name: nameQuery.value })),
})

// 새 검색 시 필터 초기화
watch(nameQuery, () => {
  filterDisc.value   = 'BR'
  filterDist.value   = '50M'
  filterCourse.value = ''
  sortMode.value     = 'recent'
  filterGender.value = ''
})

// 데이터 로드 시 성별 자동 선택
watch(() => rawData.value, (data) => {
  if (!data?.length) { filterGender.value = ''; return }
  const mCount = data.filter(r => normalizeGender(r.gender) === 'M').length
  const fCount = data.filter(r => normalizeGender(r.gender) === 'W').length
  filterGender.value = mCount >= fCount ? 'M' : 'W'
})

// 복수 선수 → 종목별 PB 축소
const pbRows = computed(() => {
  let rows = rawData.value ?? []
  if (isPbMode.value) {
    const map = new Map<string, SearchRow>()
    for (const r of rows) {
      const key = `${r.name}|${normalizeGender(r.gender)}|${r.discipline}|${r.distance}|${r.course}`
      const ex  = map.get(key)
      if (!ex || (r.timeStamp ?? Infinity) < (ex.timeStamp ?? Infinity)) map.set(key, r)
    }
    rows = Array.from(map.values())
  }
  return rows
})

// ── 선택 가능 필터 옵션 ────────────────────────────────────────
// 성별: 전체 데이터 기준
const availableGenderSet = computed(() =>
  new Set(pbRows.value.map(r => normalizeGender(r.gender)))
)

// 영법: 선택된 성별로 필터링한 데이터 기준
const availableDiscSet = computed(() => {
  const rows = filterGender.value
    ? pbRows.value.filter(r => normalizeGender(r.gender) === filterGender.value)
    : pbRows.value
  return new Set(rows.map(r => r.discipline))
})

// 거리: 선택된 성별+영법, 영법 룰 범위 내에서만
const strokeDists = computed(() => STROKE_DISTS[filterDisc.value] ?? ['50M', '100M', '200M'])
const availableDistSet = computed(() => {
  const rows = pbRows.value
    .filter(r => !filterGender.value || normalizeGender(r.gender) === filterGender.value)
    .filter(r => r.discipline === filterDisc.value)
  const has = new Set(rows.map(r => r.distance))
  return new Set(strokeDists.value.filter(d => has.has(d)))
})

// 코스: 선택된 성별+영법+거리 기준
const availableCourseSet = computed(() => {
  const rows = pbRows.value
    .filter(r => !filterGender.value || normalizeGender(r.gender) === filterGender.value)
    .filter(r => r.discipline === filterDisc.value)
    .filter(r => r.distance === filterDist.value)
  return new Set(rows.map(r => r.course))
})

// ── 선택값 자동 교정 ──────────────────────────────────────────
// 성별 변경 시 영법이 사라지면 교정
watch(availableDiscSet, (set) => {
  if (!names.value.length || !set.size || set.has(filterDisc.value)) return
  filterDisc.value = set.has('BR') ? 'BR' : [...set][0]
})

// 영법 변경 시 거리가 사라지면 교정
watch([filterDisc, availableDistSet], () => {
  if (!names.value.length || !availableDistSet.value.size) return
  if (availableDistSet.value.has(filterDist.value)) return
  const pref = strokeDists.value.find(d => availableDistSet.value.has(d))
  if (pref) filterDist.value = pref
})

// 코스가 사라지면 전체로 교정
watch(availableCourseSet, (set) => {
  if (filterCourse.value && !set.has(filterCourse.value)) filterCourse.value = ''
})

// ── 필터 액션 ─────────────────────────────────────────────────
function setGender(v: string) {
  filterGender.value = v
}
function setDisc(v: string) {
  filterDisc.value = v
  // 거리 교정: 새 영법의 룰에서 현재 거리가 없으면 50M 또는 첫번째로
  const dists = STROKE_DISTS[v] ?? []
  if (!dists.includes(filterDist.value)) {
    filterDist.value = dists.includes('50M') ? '50M' : (dists[0] ?? '50M')
  }
}

// ── 결과 ──────────────────────────────────────────────────────
const displayRows = computed(() => {
  let rows = pbRows.value
  if (filterGender.value) rows = rows.filter(r => normalizeGender(r.gender) === filterGender.value)
  if (filterDisc.value)   rows = rows.filter(r => r.discipline === filterDisc.value)
  if (filterDist.value)   rows = rows.filter(r => r.distance === filterDist.value)
  if (filterCourse.value) rows = rows.filter(r => r.course === filterCourse.value)
  rows = [...rows].sort((a, b) =>
    sortMode.value === 'recent'
      ? (b.datetime ?? '').localeCompare(a.datetime ?? '')
      : (a.timeStamp ?? Infinity) - (b.timeStamp ?? Infinity)
  )
  return rows.map((r, i) => ({ ...r, no: i + 1 }))
})

// ── 타이틀 HTML ────────────────────────────────────────────────
const titleHtml = computed(() => {
  if (!filterGender.value || !filterDisc.value) return '검색 결과'
  const gL  = esc(GENDER_LABEL[filterGender.value] ?? filterGender.value)
  const dL  = esc(DISC_LABEL[filterDisc.value] ?? filterDisc.value)
  const cL  = filterCourse.value ? ` ${filterCourse.value}` : ''
  return `${gL} ${dL} <span class="em">${esc(filterDist.value)}${esc(cL)}</span>`
})

// ── 테이블 HTML (index-table 스타일) ──────────────────────────
const THEAD = `<thead><tr>
  <th class="c-rank">No.</th>
  <th class="c-name">Name · 성명</th>
  <th class="c-city">City · 도시</th>
  <th class="c-date">Date · 일자</th>
  <th class="c-meet">Meet · 대회</th>
  <th class="c-time">Time · 기록</th>
</tr></thead>`

function rowHtml(r: SearchRow & { no: number }): string {
  const hasTime  = r.time && r.time !== '—'
  const gender   = normalizeGender(r.gender)
  const distNum  = parseInt(r.distance) || 0
  const year     = r.datetime ? r.datetime.slice(0, 4) : ''
  const meetFull = r.competitionName || r.pool || '—'
  const meetShort = r.pool || r.competitionName || '—'
  const badge    = `<span class="reg-badge">${r.isMasters ? '비등록' : '등록'}</span>`

  const timeTd = hasTime
    ? `<td class="time"><span
        class="time-trigger"
        data-gender="${esc(gender)}"
        data-stroke="${esc(r.discipline)}"
        data-distance="${distNum}"
        data-course="${esc(r.course)}"
        data-time="${esc(r.time)}"
        data-athlete="${esc(r.name)}"
        data-nation="${esc(r.team)}"
        data-year="${esc(year)}"
        data-venue="${esc(meetFull)}"
        role="button"
        tabindex="0"
      >${esc(r.time)}</span></td>`
    : `<td class="time">—</td>`

  return `<tr>
    <td class="rank">${r.no}</td>
    <td class="name">${esc(r.name)}${badge}</td>
    <td class="city">${esc(r.sido || '—')}</td>
    <td class="date">${esc(r.datetime?.slice(0, 10) || '—')}</td>
    <td class="meet"><span class="meet-full">${esc(meetFull)}</span><span class="meet-short">${esc(meetShort)}</span></td>
    ${timeTd}
  </tr>`
}

const tableHtml = computed(() => {
  const body = displayRows.value.map(r => rowHtml(r)).join('')
  return `<table class="index-table">${THEAD}<tbody>${body}</tbody></table>`
})

// ── 검색 제출 ─────────────────────────────────────────────────
function doSearch() {
  const v = searchInput.value.trim()
  if (!v) return
  const normalized = v.split(/[,\s]+/).map(n => n.trim()).filter(Boolean).join(',')
  router.push({ path: '/search', query: { name: normalized } })
}
</script>

<style scoped>
/* ── Hero: 검색폼 없음, 콤팩트 ──────────────────────────────── */
.hero {
  height: auto;
  min-height: 420px;
  justify-content: flex-start;
  padding-top: 148px;
  padding-bottom: 72px;
}
@media (max-width: 880px) {
  .hero { min-height: 320px; padding-top: 110px; padding-bottom: 48px; }
}

/* ── 비활성화 필터 버튼 ──────────────────────────────────────── */
.filter-btn.disabled {
  opacity: 0.28;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── 검색 폼: main.results 상단, 컨텐츠 타이틀 위 ──────────── */
.sr-search-bar {
  padding-top: 36px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--line);
}
.sr-form {
  display: flex;
  max-width: 540px;
}
.sr-input {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid var(--line);
  border-right: none;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--sans);
  font-size: 14px;
  outline: none;
  transition: border-color .15s;
}
.sr-input:focus { border-color: var(--fg-dim); }
.sr-input::placeholder { color: var(--fg-mute); }
.sr-btn {
  padding: 11px 22px;
  border: 1px solid var(--fg);
  background: var(--fg);
  color: var(--bg);
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity .15s;
}
.sr-btn:hover { opacity: 0.8; }

/* ── 모바일 ─────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .sr-form { max-width: 100%; }
}
</style>
