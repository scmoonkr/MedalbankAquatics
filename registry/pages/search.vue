<template>
  <div class="sr-wrap">

    <!-- 검색 바 -->
    <div class="sr-searchbar">
      <form class="sr-form" @submit.prevent="doSearch">
        <input
          v-model="searchInput"
          class="sr-input"
          type="text"
          placeholder="선수명 입력 (여러 명: 문성태,문성중)"
          autocomplete="off"
        />
        <button class="sr-btn" type="submit">검색</button>
      </form>
    </div>

    <!-- 필터 바 -->
    <div v-if="names.length" class="sr-filters" @click.self="expandedGroup = null">

      <!-- 선수명: 복수일 때만 (단일이면 표시 안 함) -->
      <template v-if="names.length > 1">
        <div class="sr-fg">
          <template v-if="expandedGroup === 'name'">
            <button class="sr-pill" :class="{ active: !filterName }" @click="select('name', '')">{{ names.join(' · ') }}</button>
            <button v-for="n in names" :key="n"
              class="sr-pill" :class="{ active: filterName === n }"
              @click="select('name', n)">{{ n }}</button>
          </template>
          <button v-else class="sr-pill" :class="{ active: !!filterName }" @click="expand('name')">
            {{ filterName || names.join(' · ') }}
          </button>
        </div>
        <div class="sr-sep"></div>
      </template>

      <!-- 영법 -->
      <div class="sr-fg">
        <template v-if="expandedGroup === 'disc'">
          <button class="sr-pill" :class="{ active: !filterDisc }" @click="select('disc', '')">전체</button>
          <button v-for="d in DISCS" :key="d.code"
            class="sr-pill" :class="{ active: filterDisc === d.code }"
            @click="select('disc', d.code)">{{ d.ko }}</button>
        </template>
        <button v-else class="sr-pill" :class="{ active: !!filterDisc }" @click="expand('disc')">
          {{ filterDisc ? discLabel(filterDisc) : '영법' }}
        </button>
      </div>

      <!-- 거리 -->
      <div class="sr-fg">
        <template v-if="expandedGroup === 'dist'">
          <button class="sr-pill" :class="{ active: !filterDist }" @click="select('dist', '')">전체</button>
          <button v-for="d in DISTS" :key="d"
            class="sr-pill" :class="{ active: filterDist === d }"
            @click="select('dist', d)">{{ d }}</button>
        </template>
        <button v-else class="sr-pill" :class="{ active: !!filterDist }" @click="expand('dist')">
          {{ filterDist || '거리' }}
        </button>
      </div>

      <!-- 코스 -->
      <div class="sr-fg">
        <template v-if="expandedGroup === 'course'">
          <button class="sr-pill" :class="{ active: !filterCourse }" @click="select('course', '')">전체</button>
          <button v-for="c in ['LCM','SCM']" :key="c"
            class="sr-pill" :class="{ active: filterCourse === c }"
            @click="select('course', c)">{{ c }}</button>
        </template>
        <button v-else class="sr-pill" :class="{ active: !!filterCourse }" @click="expand('course')">
          {{ filterCourse || '코스' }}
        </button>
      </div>

      <!-- 정렬 토글: 코스 옆에 sep 없이 바로 -->
      <button class="sr-sort" @click="sortMode = sortMode === 'recent' ? 'time' : 'recent'">
        {{ sortMode === 'recent' ? '최근순' : '기록순' }}
      </button>

    </div>

    <!-- 결과 -->
    <div class="sr-body">
      <div v-if="pending" class="sr-state">검색 중…</div>
      <div v-else-if="!names.length" class="sr-state">선수명을 입력하고 검색하세요.</div>
      <div v-else-if="!displayRows.length" class="sr-state">결과가 없습니다.</div>

      <template v-else>
        <div class="sr-meta">
          <span class="sr-meta-selected">
            <template v-if="isPbMode && !filterName">{{ names.join(' · ') }}</template>
            <template v-else-if="filterName">{{ filterName }}</template>
            <template v-else>{{ names[0] }}</template>
            <template v-if="filterDisc"> · {{ discLabel(filterDisc) }}</template>
            <template v-if="filterDist"> · {{ filterDist }}</template>
            <template v-if="filterCourse"> · {{ filterCourse }}</template>
          </span>
          <span class="sr-meta-count">{{ displayRows.length }}건</span>
        </div>

        <table class="sr-table">
          <thead>
            <tr>
              <th class="c-no">No.</th>
              <th class="c-event">종목</th>
              <th class="c-who">선수 / 대회일</th>
              <th class="c-time">기록 / 소속</th>
              <th class="c-meet">대회명 / 경기장</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in displayRows" :key="r.id + r.no" @click="expandedGroup = null">
              <td class="td-no">{{ String(r.no).padStart(2,'0') }}</td>
              <td class="td-event">
                <span class="ev-disc">{{ discLabel(r.discipline) }}</span>
                <span class="ev-dist">{{ r.distance }} {{ r.course }}</span>
              </td>
              <td class="td-who">
                <span class="who-name">{{ r.name }}</span>
                <span class="who-date mono">{{ r.datetime }}</span>
              </td>
              <td class="td-time">
                <span class="time-val mono time-trigger" @click.stop="openModal(r)">{{ r.time }}</span>
                <span class="time-sub">{{ [r.sido, r.team].filter(Boolean).join(' · ') || '—' }}</span>
              </td>
              <td class="td-meet">
                <span class="meet-name">{{ r.competitionName || '—' }}</span>
                <span class="meet-pool">{{ r.pool || '' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({ title: '선수 검색 — KSR · Korean Swimming Registry' })

const route  = useRoute()
const router = useRouter()

const { data: canonData } = await useFetch<Record<string, any>>('/api/canon')

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src; s.onload = () => resolve(); s.onerror = reject
    document.head.appendChild(s)
  })
}

function parseTimeSec(str: string): number {
  if (!str || str === '—') return Infinity
  const parts = str.trim().split(':')
  if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseFloat(parts[1])
  return parseFloat(str) || Infinity
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
    overlay[overlayKey][type] = { time: parseTimeSec(rec.time), holder: rec.athlete, nation: rec.nation, year: rec.year ? parseInt(String(rec.year)) : null, venue: rec.venue || undefined }
  }
  scoring.injectOverlay(overlay)
}

onMounted(() => {
  loadScript('/cannon/js/scoring.js')
    .then(() => loadScript('/cannon/js/modal.js'))
    .then(() => injectCompareOverlay())
})

function toModalGender(g: string) {
  if (g === 'M' || g === 'men' || g === 'male') return 'M'
  if (g === 'W' || g === 'women' || g === 'female') return 'W'
  return g
}

function openModal(r: SearchRow) {
  const modal = (window as any).KSR_MODAL
  if (!modal) return
  modal.open({
    gender:   toModalGender(r.gender),
    stroke:   r.discipline,
    distance: parseInt(r.distance),
    course:   r.course,
    time:     r.time,
    attribution: {
      athlete: r.name,
      date:    r.datetime?.slice(0, 10) ?? '',
      venue:   r.competitionName,
    },
  })
}

const DISCS = [
  { code: 'FR', ko: '자유형' }, { code: 'BK', ko: '배영' },
  { code: 'BR', ko: '평영'   }, { code: 'FL', ko: '접영' },
  { code: 'IM', ko: '개인혼영' },
]
const DISTS = ['25M','50M','100M','200M','400M','800M','1500M']

const nameQuery   = computed(() => String(route.query.name || '').trim())
const names       = computed(() => nameQuery.value ? nameQuery.value.split(',').map(n => n.trim()).filter(Boolean) : [])
const isPbMode    = computed(() => names.value.length > 1)
const searchInput = ref(nameQuery.value)
watch(nameQuery, v => { searchInput.value = v })

const filterName   = ref('')
const filterDisc   = ref('')
const filterDist   = ref('')
const filterCourse = ref('')
const sortMode     = ref<'recent'|'time'>('recent')
const expandedGroup = ref<string|null>(null)

watch(names, () => {
  filterName.value = ''; filterDisc.value = ''
  filterDist.value = ''; filterCourse.value = ''
  sortMode.value   = 'recent'; expandedGroup.value = null
})

function expand(group: string) {
  expandedGroup.value = expandedGroup.value === group ? null : group
}

function select(group: string, val: string) {
  if (group === 'name')   filterName.value   = val
  if (group === 'disc')   filterDisc.value   = val
  if (group === 'dist')   filterDist.value   = val
  if (group === 'course') filterCourse.value = val
  expandedGroup.value = null
}

function discLabel(code: string) {
  return DISCS.find(d => d.code === code)?.ko ?? code
}

interface SearchRow {
  id: string; name: string; gender: string
  discipline: string; distance: string; course: string
  time: string; timeStamp: number | null; rank: number | null
  sido: string; team: string; datetime: string
  competitionName: string; pool: string; no?: number
}

const { data: rawData, pending } = await useFetch<SearchRow[]>('/api/search', {
  query: computed(() => ({ name: nameQuery.value })),
})

const displayRows = computed(() => {
  let rows: SearchRow[] = rawData.value ?? []

  if (isPbMode.value) {
    const map = new Map<string, SearchRow>()
    for (const r of rows) {
      const key = `${r.name}|${r.discipline}|${r.distance}|${r.course}`
      const ex  = map.get(key)
      if (!ex || (r.timeStamp ?? Infinity) < (ex.timeStamp ?? Infinity)) map.set(key, r)
    }
    rows = Array.from(map.values())
  }

  if (filterName.value)   rows = rows.filter(r => r.name === filterName.value)
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

function doSearch() {
  const v = searchInput.value.trim()
  if (!v) return
  router.push({ path: '/search', query: { name: v } })
}
</script>

<style scoped>
.sr-wrap { max-width: 1080px; margin: 0 auto; padding: 48px 24px 80px; }

/* 검색 바 */
.sr-searchbar { margin-bottom: 20px; }
.sr-form { display: flex; }
.sr-input {
  flex: 1; padding: 11px 16px; border: 1px solid var(--line); border-right: none;
  background: var(--bg-soft, #f8f8f8); color: var(--fg);
  font-family: var(--sans); font-size: 14px; outline: none; transition: border-color .15s;
}
.sr-input:focus { border-color: var(--fg-mute); }
.sr-btn {
  padding: 11px 22px; border: 1px solid var(--fg); background: var(--fg); color: var(--bg);
  font-family: var(--sans); font-size: 13px; font-weight: 600; cursor: pointer;
  letter-spacing: 0.04em; transition: opacity .15s; white-space: nowrap;
}
.sr-btn:hover { opacity: 0.82; }

/* 필터 바 */
.sr-filters {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  padding: 14px 0 18px; border-bottom: 1px solid var(--line); margin-bottom: 24px;
  min-height: 48px;
}
.sr-fg { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.sr-sep { width: 1px; height: 18px; background: var(--line); margin: 0 2px; flex-shrink: 0; }

.sr-pill {
  display: inline-flex; align-items: center;
  padding: 5px 13px; border-radius: 999px;
  border: 1px solid var(--line); background: var(--bg);
  font-family: var(--sans); font-size: 12px; color: var(--fg-mute);
  cursor: pointer; transition: background .12s, color .12s, border-color .12s;
  white-space: nowrap;
}
.sr-pill:hover { border-color: var(--fg-dim); color: var(--fg); }
.sr-pill.active { background: var(--fg); color: var(--bg); border-color: var(--fg); }

.sr-pill-clear {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 999px;
  border: 1px dashed var(--line); background: transparent;
  font-family: var(--sans); font-size: 11px; color: var(--fg-faint);
  cursor: pointer;
}
.sr-pill-clear:hover { color: var(--fg-mute); border-color: var(--fg-mute); }

.sr-sort {
  padding: 5px 13px; border-radius: 999px;
  border: 1px solid var(--line); background: var(--fg); color: var(--bg);
  font-family: var(--sans); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: opacity .15s; white-space: nowrap;
}
.sr-sort:hover { opacity: 0.8; }

/* 메타 */
.sr-meta {
  font-family: var(--sans); font-size: 14px; color: var(--fg-mute);
  letter-spacing: 0.04em; margin-bottom: 12px;
  display: flex; align-items: center; gap: 10px;
}
.sr-meta-selected { color: var(--fg); font-weight: 500; }
.sr-meta-count    { color: var(--fg-faint); font-size: 12px; }

/* 상태 */
.sr-state {
  font-family: var(--sans); font-size: 14px; color: var(--fg-faint);
  padding: 60px 0; text-align: center;
}

/* 테이블 */
.sr-table { width: 100%; border-collapse: collapse; }
.sr-table thead th {
  font-family: var(--sans); font-size: 9.5px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-faint);
  border-bottom: 1px solid var(--line); padding: 0 10px 10px; text-align: left;
}
.sr-table tbody tr { border-bottom: 1px solid var(--line-soft, #f0f0ee); cursor: default; }
.sr-table tbody tr:hover { background: var(--bg-soft, #f8f8f8); }
.sr-table td { padding: 8px 10px; vertical-align: middle; }

.c-no    { width: 36px; }
.c-event { width: 120px; }
.c-who   { width: 22%; }
.c-time  { width: 16%; }

.td-no { font-family: var(--mono); font-size: 11px; color: var(--fg-faint); text-align: right; padding-right: 14px; }

.td-event { }
.ev-disc  { display: block; font-family: var(--sans); font-size: 13px; color: var(--fg-dim); line-height: 1.3; }
.ev-dist  { display: block; font-family: var(--sans); font-size: 11px; color: var(--fg-faint); line-height: 1.3; }

.td-who  { }
.who-name { display: block; font-family: var(--sans); font-size: 13px; font-weight: 600; color: var(--fg); line-height: 1.3; }
.who-date { display: block; font-family: var(--mono); font-size: 11px; color: var(--fg-faint); line-height: 1.3; }

.td-time  { }
.time-val { display: block; font-family: var(--mono); font-size: 14px; font-weight: 500; color: var(--fg); line-height: 1.3; }
.time-trigger { cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.time-trigger:hover { color: #2563eb; }
.time-sub { display: block; font-family: var(--sans); font-size: 11px; color: var(--fg-faint); line-height: 1.3; }

.td-meet  { }
.meet-name { display: block; font-family: var(--sans); font-size: 13px; color: var(--fg-dim); line-height: 1.3; }
.meet-pool { display: block; font-family: var(--sans); font-size: 11px; color: var(--fg-faint); line-height: 1.3; }

.mono { font-family: var(--mono); }

@media (max-width: 640px) {
  .sr-wrap { padding: 24px 16px 60px; }
  .c-meet, .c-event { display: none; }
}
</style>
