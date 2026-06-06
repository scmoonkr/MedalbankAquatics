<template>
  <div>
    <!-- Shell: 사이드바 필터 + 메인 결과 -->
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
                @click="availableGenderSet.has(g.v) && (filterGender = g.v)"
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

        <!-- 코스 COURSE (전체 없음, 기본 LCM) -->
        <div class="filter-group">
          <div class="legend"><span>코스</span><span class="ko">COURSE</span></div>
          <ul class="filter-list">
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

      <main class="results" @click="handleResultsClick">
        <div class="results-header">
          <h2 v-html="titleHtml"></h2>
        </div>
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
        <div v-if="!names.length" class="empty-state">선수명을 입력하고 검색하세요.</div>
        <div v-else-if="pending" class="empty-state">검색 중…</div>
        <div v-else-if="!displayRows.length" class="empty-state">결과가 없습니다.</div>
        <div v-else v-html="tableHtml"></div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '선수 검색 — 메달뱅크 · Medalbank' })

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
  loadScript('/canon/js/scoring.js')
    .then(() => injectCompareOverlay())
    .catch(err => console.error('[search] script load error', err))
})

// ── 상수 ───────────────────────────────────────────────────────
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

// ── 헬퍼 ───────────────────────────────────────────────────────
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

// ── 이름 파싱 ───────────────────────────────────────────────────
const nameQuery = computed(() => String(route.query.name || '').trim())
const names     = computed(() =>
  nameQuery.value
    ? [...new Set(nameQuery.value.split(/[,\s]+/).map(n => n.trim()).filter(Boolean))]
    : []
)
const isPbMode    = computed(() => names.value.length > 1)
const searchInput = ref(names.value.join(', '))
watch(names, v => { searchInput.value = v.join(', ') })

// ── 필터 상태 (기본: BR · 50M · LCM) ──────────────────────────
const filterGender = ref('M')
const filterDisc   = ref('BR')
const filterDist   = ref('50M')
const filterCourse = ref('LCM')
const sortMode     = ref<'recent' | 'time'>(names.value.length > 1 ? 'time' : 'recent')

// ── 데이터 ────────────────────────────────────────────────────
interface SearchRow {
  id: string; name: string; gender: string
  discipline: string; distance: string; course: string
  time: string; timeStamp: number | null; rank: number | null
  sido: string; team: string; datetime: string
  competitionName: string; pool: string
  isMasters: boolean; group: string
  waPoints?: number; timeID?: number | null; no?: number
}

const { data: rawData, pending } = await useFetch<SearchRow[]>('/api/search', {
  query: computed(() => ({ name: nameQuery.value })),
})

// 새 검색 시 필터 초기화
watch(nameQuery, () => {
  filterDisc.value   = 'BR'
  filterDist.value   = '50M'
  filterCourse.value = 'LCM'
  sortMode.value     = names.value.length > 1 ? 'time' : 'recent'
  filterGender.value = 'M'
})

// 데이터 로드 시 → 첫 번째 선수의 성별로 자동 선택
watch(() => rawData.value, (data) => {
  if (!data?.length || !names.value.length) return
  const firstName = names.value[0]
  const firstRec  = data.find(r => r.name === firstName)
  filterGender.value = firstRec ? normalizeGender(firstRec.gender) : 'M'
})

// ── PB 축소 (복수 선수) ────────────────────────────────────────
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

// ── 선택 가능 옵션 집합 ────────────────────────────────────────
const availableGenderSet = computed(() =>
  new Set(pbRows.value.map(r => normalizeGender(r.gender)))
)

const availableDiscSet = computed(() => {
  const rows = filterGender.value
    ? pbRows.value.filter(r => normalizeGender(r.gender) === filterGender.value)
    : pbRows.value
  return new Set(rows.map(r => r.discipline))
})

const strokeDists = computed(() => STROKE_DISTS[filterDisc.value] ?? ['50M', '100M', '200M'])

const availableDistSet = computed(() => {
  const rows = pbRows.value
    .filter(r => !filterGender.value || normalizeGender(r.gender) === filterGender.value)
    .filter(r => r.discipline === filterDisc.value)
  const has = new Set(rows.map(r => r.distance))
  return new Set(strokeDists.value.filter(d => has.has(d)))
})

const availableCourseSet = computed(() => {
  const rows = pbRows.value
    .filter(r => !filterGender.value || normalizeGender(r.gender) === filterGender.value)
    .filter(r => r.discipline === filterDisc.value)
    .filter(r => r.distance === filterDist.value)
  return new Set(rows.map(r => r.course))
})

// ── 필터값 자동 교정 ───────────────────────────────────────────
watch(availableDiscSet, (set) => {
  if (!names.value.length || !set.size || set.has(filterDisc.value)) return
  filterDisc.value = set.has('BR') ? 'BR' : [...set][0]
})

watch([filterDisc, availableDistSet], () => {
  if (!names.value.length || !availableDistSet.value.size) return
  if (availableDistSet.value.has(filterDist.value)) return
  const pref = strokeDists.value.find(d => availableDistSet.value.has(d))
  if (pref) filterDist.value = pref
})

watch(availableCourseSet, (set) => {
  if (!set.size || set.has(filterCourse.value)) return
  // LCM 우선, 없으면 SCM
  filterCourse.value = set.has('LCM') ? 'LCM' : [...set][0]
})

// ── 영법 변경 시 거리 교정 ─────────────────────────────────────
function setDisc(v: string) {
  filterDisc.value = v
  const dists = STROKE_DISTS[v] ?? []
  if (!dists.includes(filterDist.value)) {
    filterDist.value = dists.includes('50M') ? '50M' : (dists[0] ?? '50M')
  }
}

// ── 결과 rows ─────────────────────────────────────────────────
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
  // 복수 선수 모드: 이름 기준 최종 dedup (정렬 후 첫 번째 = best)
  if (isPbMode.value) {
    const seen = new Set<string>()
    rows = rows.filter(r => {
      if (seen.has(r.name)) return false
      seen.add(r.name)
      return true
    })
  }
  return rows.map((r, i) => ({ ...r, no: i + 1 }))
})

// ── 타이틀 HTML ───────────────────────────────────────────────
const titleHtml = computed(() => {
  if (!filterGender.value || !filterDisc.value) return '검색 결과'
  const gL = esc(GENDER_LABEL[filterGender.value] ?? filterGender.value)
  const dL = esc(DISC_LABEL[filterDisc.value] ?? filterDisc.value)
  const cL = filterCourse.value ? ` ${filterCourse.value}` : ''
  return `${gL} ${dL} <span class="em">${esc(filterDist.value)}${esc(cL)}</span>`
})

// ── 테이블 HTML (index-table 스타일) ──────────────────────────
const THEAD = `<thead><tr>
  <th class="c-rank">Rank · 순위</th>
  <th class="c-name">Name · 성명</th>
  <th class="c-time">Time · 기록</th>
  <th class="c-date">Date · 일자</th>
  <th class="c-city">City · 도시</th>
  <th class="c-meet">Meet · 대회</th>
</tr></thead>`

function fmtWP(wp: number | null | undefined): string {
  if (!wp) return '000'
  return String(Math.min(999, Math.max(0, wp))).padStart(3, '0')
}

function rowHtml(r: SearchRow & { no: number }): string {
  const hasTime   = r.time && r.time !== '—'
  const gender    = normalizeGender(r.gender)
  const distNum   = parseInt(r.distance) || 0
  const datetime  = r.datetime || ''
  const meetFull  = r.competitionName || r.pool || '—'
  const meetShort = r.pool || r.competitionName || '—'
  const isMasters = r.isMasters === true
  const badge     = `<span class="reg-badge">${isMasters ? '비등록' : '등록'}</span>`
  const waBadge   = r.waPoints ? `<span class="wa-badge">${fmtWP(r.waPoints)}</span>` : ''

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
        data-datetime="${esc(datetime)}"
        data-venue="${esc(meetFull)}"
        data-timeid="${r.timeID ?? ''}"
        role="button"
        tabindex="0"
      >${esc(normTime(r.time))}${waBadge}</span></td>`
    : `<td class="time">—</td>`

  return `<tr>
    <td class="rank">${r.no}</td>
    <td class="name">${esc(r.name)}${badge}</td>
    ${timeTd}
    <td class="date">${esc(r.datetime?.slice(0, 10) || '—')}</td>
    <td class="city">${esc(r.sido || '—')}</td>
    <td class="meet"><span class="meet-full">${esc(meetFull)}</span><span class="meet-short">${esc(meetShort)}</span></td>
  </tr>`
}

const tableHtml = computed(() => {
  const body = displayRows.value.map(r => rowHtml(r)).join('')
  return `<table class="index-table">${THEAD}<tbody>${body}</tbody></table>`
})

// ── results click delegation ───────────────────────────────────
function handleResultsClick(e: MouseEvent) {
  const trigger = (e.target as Element).closest('.time-trigger')
  if (!trigger) return
  e.preventDefault()
  e.stopPropagation()
  const d = (trigger as HTMLElement).dataset
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
        athlete:  d.athlete || undefined,
        datetime: d.datetime || undefined,
        meet:     d.venue   || undefined,
      },
    })
  }
}

// ── 검색 제출 ─────────────────────────────────────────────────
function doSearch() {
  const v = searchInput.value.trim()
  if (!v) return
  const normalized = v.split(/[,\s]+/).map(n => n.trim()).filter(Boolean).join(',')
  router.push({ path: '/search', query: { name: normalized } })
}
</script>

<style scoped>
.sr-form {
  display: flex;
  width: 100%;
  margin-bottom: 22px;
}
.sr-input {
  flex: 1;
  padding: 13px 18px;
  border: 1px solid var(--line);
  border-right: none;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--sans);
  font-size: 15px;
  outline: none;
  transition: border-color .15s;
}
.sr-input:focus { border-color: var(--fg-dim); }
.sr-input::placeholder { color: var(--fg-mute); }
.sr-btn {
  padding: 13px 26px;
  border: 1px solid var(--fg);
  background: var(--fg);
  color: var(--bg);
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity .15s;
}
.sr-btn:hover { opacity: 0.8; }

/* ── 비활성화 필터 버튼 ──────────────────────────────────────── */
.filter-btn.disabled {
  opacity: 0.28;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── 모바일 ─────────────────────────────────────────────────── */
@media (max-width: 880px) {
  .sr-form { max-width: 100%; }
  .sr-input { font-size: 14px; }
}
</style>
