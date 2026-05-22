<template>
  <div>
    <!-- Hero -->
    <div class="hero" ref="heroEl">
      <div class="hero-eyebrow">
        01 · The Index · 등재부 <span class="dot">·</span> Korean Swimming Registry
      </div>
      <div class="hero-corner">KSR</div>
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
          <a class="cta" href="https://naver.me/xeFYWn8m" target="_blank" rel="noopener">
            제보하기 <span class="arrow">→</span>
          </a>
          <div class="note">발굴 기록·정정 제보 시 실명 등재</div>
        </div>
      </aside>

      <main class="results">
        <div class="results-header">
          <h2 ref="resultsTitleEl" v-html="titleHtml"></h2>
          <div class="right">
            <span class="ctx-meta">{{ resultsMeta }}</span>
          </div>
        </div>
        <div v-if="pending && !sheet" class="empty-state">데이터를 불러오는 중입니다…</div>
        <div v-else v-html="tableHtml"></div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'The Index — KSR · Korean Swimming Registry' })

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

// ── state ──────────────────────────────────────────────────────
const state = reactive({
  division: 'elite',
  group:    'all',
  gender:   'm',
  stroke:   'breast',
  distance: 50,
  course:   'lcm',
})

// ── data ───────────────────────────────────────────────────────
type EventRank     = { rank: number; name: string; city: string; team: string; date: string; time: string; meet: string; meet_full: string }
type SheetResponse = { page: number; pageSize: number; total: number; ranks: EventRank[] }

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

// ── stats ──────────────────────────────────────────────────────
const rankCount    = computed(() => Math.min(sheet.value?.total ?? 0, 100))
const athleteCount = computed(() => sheet.value?.total ?? 0)
const currentEntryCount = computed(() => sheet.value ? `${sheet.value.total} entries` : '—')
const heroStat = computed(() => sheet.value ? `${sheet.value.total.toLocaleString()} ATHLETES LISTED` : '…')

// ── title / meta ───────────────────────────────────────────────
const titleHtml = computed(() => {
  const gL  = esc(GENDER_LABEL[state.gender] ?? state.gender)
  const sL  = esc(STROKE_LABEL[state.stroke] ?? state.stroke)
  const mPfx = state.division === 'masters' ? '마스터즈 ' : ''
  const gPfx = state.group !== 'all' ? `${groupLabelFor(state.group, state.division)} ` : ''
  return `${esc(mPfx)}${esc(gPfx)}${gL} ${sL} <span class="em">${state.distance}m ${state.course.toUpperCase()}</span>`
})
const resultsMeta = computed(() => {
  const dL   = DIVISIONS.find(d => d.v === state.division)?.label ?? state.division
  const gPart = state.group === 'all' ? '' : ` · ${groupLabelFor(state.group, state.division).toUpperCase()}`
  return `${dL.toUpperCase()}${gPart} · TOP 100`
})

// ── table builder ──────────────────────────────────────────────
const tableHtml = computed(() => {
  if (!sheet.value || sheet.value.total === 0) {
    return `<div class="empty-state">선택한 조합에 해당하는 종목 데이터가 아직 수집되지 않았습니다.<br/>제보를 통해 The Index에 처음으로 이름을 올려보세요.</div>`
  }
  return buildTable(sheet.value.ranks)
})

function buildTable(ranks: EventRank[]): string {
  const sorted = [...ranks].sort((a, b) => a.rank !== b.rank ? a.rank - b.rank : (a.date ?? '').localeCompare(b.date ?? ''))
  let body = ''
  // Top 10. Ties consume slots: rank 12 ×2 → next rank is 14, not 13.
  let i = 1
  while (i <= 10) {
    const m = sorted.filter(r => r.rank === i)
    if (m.length) {
      m.forEach(r => { body += rowHtml(r, i === 1) })
      i += m.length
    } else {
      body += emptyRowHtml(i, i === 1)
      i++
    }
  }
  body += `<tr class="tier-divider"><td colspan="6">RANKS 11 – 100 · 등재 대기중</td></tr>`
  // Continue from wherever i landed (carries tie skips from the top block).
  while (i <= 100) {
    const m = sorted.filter(r => r.rank === i)
    if (m.length) {
      m.forEach(r => { body += rowHtml(r, false) })
      i += m.length
    } else {
      body += emptyRowHtml(i, false)
      i++
    }
  }
  return `<table class="index-table"><thead><tr>
    <th class="c-rank">Rank · 순위</th><th class="c-name">Name · 성명</th>
    <th class="c-city">City · 도시</th><th class="c-date">Date · 일자</th>
    <th class="c-meet">Meet · 대회</th><th class="c-time">Time · 기록</th>
  </tr></thead><tbody>${body}</tbody></table>`
}
function rowHtml(r: EventRank, isFirst: boolean): string {
  return `<tr${isFirst ? ' class="first"' : ''}>
    <td class="rank">${r.rank}</td>
    <td class="name">${esc(r.name||'—')}</td>
    <td class="city">${esc(r.city||'—')}</td>
    <td class="date">${esc(r.date||'—')}</td>
    <td class="meet"><span class="meet-full">${esc(r.meet_full||r.meet||'—')}</span><span class="meet-short">${esc(r.meet||r.meet_full||'—')}</span></td>
    <td class="time">${esc(r.time||'—')}</td>
  </tr>`
}
function emptyRowHtml(i: number, isFirst: boolean): string {
  return `<tr class="empty${isFirst?' first':''}">
    <td class="rank">${i}</td><td class="name">등재 대기중</td>
    <td class="city">—</td><td class="date">—</td><td class="meet">—</td><td class="time">—</td>
  </tr>`
}

// ── filter setter ──────────────────────────────────────────────
function setFilter(key: string, val: string | number) {
  ;(state as Record<string, unknown>)[key] = val
}

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
