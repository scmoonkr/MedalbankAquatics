<template>
  <div>
    <div class="stub-shell">
      <div class="eyebrow">03 · The Ledger · 기록대장</div>
      <h1>The <span class="em">Ledger.</span></h1>
      <p class="lede">새로 발굴·등재된 기록이 이곳에 시간순으로 기록됩니다.</p>
      <div class="stub-foot">{{ ledgerList.length }} entries</div>
    </div>

    <div class="page-body">
      <section class="block">
        <div class="block-head">
          <h2>최근 등재된 <span class="em">기록들.</span></h2>
          <span class="meta">{{ ledgerList.length }} ENTRIES · 최신순</span>
        </div>

        <div v-if="pending" class="empty-state">불러오는 중…</div>
        <div v-else-if="!ledgerList.length" class="empty-state">데이터를 불러올 수 없습니다.</div>
        <div v-else class="ledger-feed">
          <article v-for="(doc, i) in pagedRows" :key="i" class="ledger-entry kind-record">
            <div class="tag">
              {{ doc.event }}
              <span class="label-ko">{{ doc.group }}</span>
            </div>
            <div class="body">
              <h3>{{ doc.name }}</h3>
              <div class="athlete">
                <span class="rank">·</span>
                {{ doc.city }} · {{ doc.team }}
              </div>
              <p>{{ doc.meet }}</p>
            </div>
            <div class="figures">
              <span
                v-if="doc.time !== '—' && doc.rawGender && doc.rawStroke && doc.rawDistance > 0"
                class="time time-trigger"
                :data-gender="doc.rawGender"
                :data-stroke="doc.rawStroke"
                :data-distance="doc.rawDistance"
                :data-course="doc.rawCourse"
                :data-time="doc.time"
                :data-athlete="doc.name"
                :data-venue="doc.meet"
                :data-date="doc.date"
                role="button"
                tabindex="0"
              >{{ doc.time }}</span>
              <span v-else class="time">{{ doc.time }}</span>
              <span class="when">
                {{ doc.date }}
                <template v-if="doc.report_date"><br />등재 {{ doc.report_date }}</template>
              </span>
            </div>
          </article>
        </div>

        <div class="pagination">
          <button class="page-btn prev" :disabled="page <= 1" @click="page--">← Prev</button>
          <span class="page-info">
            Page <strong>{{ String(page).padStart(2, '0') }}</strong>
            <span class="total"> / </span>
            <span>{{ String(totalPages).padStart(2, '0') }}</span>
          </span>
          <button class="page-btn next" :disabled="page >= totalPages" @click="page++">Next →</button>
        </div>
      </section>

      <section class="block">
        <div class="block-head">
          <h2>기록대장에 대하여.</h2>
          <span class="meta">ABOUT</span>
        </div>
        <p style="font-family:var(--serif-ko);font-size:16px;line-height:1.85;color:var(--fg-dim);max-width:760px;">
          The Ledger는 Korean Swimming Registry에 가장 최근에 등재된 기록들을 시간순으로 보여주는 페이지입니다. 새로 발굴되거나 정정을 통해 새롭게 반영된 기록들이 이곳에 순차적으로 기록됩니다. 제보를 통해 이 등재부에 처음으로 이름을 올려보세요.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'The Ledger — KSR · Korean Swimming Registry' })

const PER_PAGE = 25
const page = ref(1)

interface TimeData {
  name?: string; time?: string; gender?: string; discipline?: string
  distance?: string; course?: string; rank?: number | null
  datetime?: string; competitionName?: string; pool?: string
  sido?: string; team?: string; isMasters?: boolean; group?: string
}

interface ErrataDoc {
  no:          number
  category:    string
  timeID:      number
  time:        TimeData
  before:      TimeData | null
  note:        string
  reporter:    string
  report_date: string
  magazine:    string
}

interface LedgerDoc {
  event:       string
  group:       string
  name:        string
  city:        string
  team:        string
  time:        string
  date:        string
  meet:        string
  report_date: string | null
  rawGender:   string
  rawStroke:   string
  rawDistance: number
  rawCourse:   string
}

const GENDER_LABEL: Record<string, string> = { men: '남자', women: '여자', M: '남자', W: '여자' }
const DISC_LABEL:   Record<string, string> = { BR: '평영', FR: '자유형', BK: '배영', FL: '접영', IM: '개인혼영' }

function toRawGender(g: string | undefined): string {
  if (!g) return ''
  if (g === 'men'   || g === 'M') return 'M'
  if (g === 'women' || g === 'W') return 'W'
  return g
}

function toEventLabel(t: TimeData): string {
  return [GENDER_LABEL[t.gender ?? ''] ?? t.gender, DISC_LABEL[t.discipline ?? ''] ?? t.discipline, t.distance, t.course].filter(Boolean).join(' ')
}

function toGroupLabel(t: TimeData): string {
  if (!t.isMasters) return ''
  return t.group ? `M${t.group}` : 'Masters'
}

function toDoc(d: ErrataDoc): LedgerDoc {
  const t = d.time ?? {}
  const rawGender   = toRawGender(t.gender)
  const rawStroke   = t.discipline ?? ''
  const rawDistance = parseInt(String(t.distance ?? '0'), 10) || 0
  const rawCourse   = t.course ?? 'LCM'
  return {
    event:       toEventLabel(t),
    group:       toGroupLabel(t),
    name:        t.name        ?? '—',
    city:        t.sido        ?? '—',
    team:        t.team        ?? '—',
    time:        t.time        ?? '—',
    date:        t.datetime    ?? '—',
    meet:        t.competitionName ?? t.pool ?? '—',
    report_date: d.report_date ?? null,
    rawGender,
    rawStroke,
    rawDistance,
    rawCourse,
  }
}

interface CanonRec { time: string; athlete: string; nation: string; year: string | number; venue: string }
const { data: canonData } = await useFetch<Record<string, CanonRec>>('/api/canon')
const { data: errataData, pending } = await useFetch<ErrataDoc[]>('/api/errata')
const ledgerList = computed(() =>
  (errataData.value ?? [])
    .filter(d => d.category !== '오류 정정')
    .map(toDoc)
)
const totalPages = computed(() => Math.max(1, Math.ceil(ledgerList.value.length / PER_PAGE)))
const pagedRows  = computed(() => ledgerList.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(ledgerList, () => { page.value = 1 })

// ── scoring + modal scripts ────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error(`script load failed: ${src}`))
    document.head.appendChild(s)
  })
}

function injectCompareOverlay() {
  const scoring = (window as any).KSR_SCORING
  if (!scoring || !canonData.value) return
  const overlay: Record<string, any> = {}
  for (const [key, rec] of Object.entries(canonData.value)) {
    // key: "M-FR-50-WR" → overlayKey: "M-FR-50-LCM"
    const parts = key.split('-')
    if (parts.length < 4) continue
    const [gCode, style, dist, type] = parts
    const overlayKey = `${gCode}-${style}-${dist}-LCM`
    if (!overlay[overlayKey]) overlay[overlayKey] = {}
    overlay[overlayKey][type] = { time: rec.time, athlete: rec.athlete, nation: rec.nation, year: rec.year, venue: rec.venue }
  }
  scoring.injectOverlay(overlay)
}

onMounted(() => {
  loadScript('/cannon/js/scoring.js')
    .then(() => loadScript('/cannon/js/modal.js'))
    .then(() => injectCompareOverlay())
    .catch(err => console.error('[ledger] script load error', err))
})
</script>
