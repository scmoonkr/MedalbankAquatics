<template>
  <div class="cp-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Capture</div>
        <div class="be-page-sub">mergedTimes · {{ cards.length }} boards</div>
      </div>
    </div>

    <!-- 대회 검색 -->
    <div class="be-filters">
      <div class="cp-search">
        <input
          v-model="competitionQuery"
          class="be-search"
          placeholder="대회명 검색… (2자 이상)"
          @input="searchCompetitions"
        />
        <div v-if="competitionResults.length" class="cp-suggest">
          <button
            v-for="c in competitionResults" :key="c.competitionID"
            class="cp-suggest-item"
            @click="pickCompetition(c)"
          >
            {{ c.competitionName }}<span class="cp-suggest-year">({{ (c.datetime || '').slice(0, 4) }})</span>
          </button>
        </div>
      </div>
      <input v-model="subtitle" class="be-search cp-subtitle" placeholder="대회명1 (카드 부제)" />
      <input v-model="typeName" class="be-search cp-typename" placeholder="대회기록 / 순위" />
      <div class="be-filter-actions">
        <span v-if="filter.competitionID" class="cp-cid">cid {{ filter.competitionID }}</span>
        <button class="be-add" :disabled="downloading || !cards.length" @click="handleDownload">
          <template v-if="!downloading">download</template>
          <template v-else>{{ progress.done }}/{{ progress.total }}</template>
        </button>
      </div>
    </div>

    <!-- 필터 -->
    <div class="be-filters cp-filters">
      <div class="cp-group">
        <span class="cp-group-label">등록</span>
        <button
          v-for="o in ['등록', '비등록']" :key="o"
          class="cp-chip" :class="{ active: filter.masters === o }"
          @click="setFilter('masters', o)"
        >{{ o }}</button>
      </div>
      <div class="cp-group">
        <span class="cp-group-label">부</span>
        <button
          v-for="o in ['전체', '성인', '학생']" :key="o"
          class="cp-chip" :class="{ active: filter.adult === o }"
          @click="setFilter('adult', o)"
        >{{ o }}</button>
      </div>
      <div class="cp-group">
        <span class="cp-group-label">성별</span>
        <button
          v-for="g in ['men', 'women']" :key="g"
          class="cp-chip" :class="{ active: filter.gender === g }"
          @click="setFilter('gender', g)"
        >{{ getGenderByEng(g) }}</button>
      </div>
      <div class="cp-group">
        <span class="cp-group-label">기록</span>
        <button
          v-for="t in typeTimes" :key="t.value"
          class="cp-chip" :class="{ active: filter.typeTime === t.value }"
          @click="setFilter('typeTime', t.value)"
        >{{ t.label }}</button>
      </div>
      <div class="cp-group">
        <span class="cp-group-label">캡처</span>
        <button
          v-for="t in ['stories', 'posts']" :key="t"
          class="cp-chip" :class="{ active: captureType === t }"
          @click="captureType = t as CaptureType"
        >{{ t }}</button>
      </div>
    </div>

    <div v-if="downloading" class="cp-progress-note">
      {{ progress.done }}/{{ progress.total }} 보드 저장 중 · {{ captureType }} 1080×{{ captureType === 'stories' ? 1920 : 1350 }}
    </div>

    <!-- 리더보드 카드 -->
    <div v-if="cards.length" class="cp-rail">
      <div
        v-for="card in cards"
        :key="`${card.discipline}-${card.course}-${card.distance}`"
        class="cp-scale"
        :class="captureType"
      >
        <div
          :ref="el => setCardRef(card, el)"
          class="cap-card"
          :class="captureType"
        >
          <div class="cap-pad"></div>

          <div class="cap-head">
            <div class="cap-title">{{ cardTitle(card) }}</div>
            <div class="cap-sub">{{ subtitle }} <span v-if="datetime">{{ datetime }}</span></div>
          </div>

          <div class="cap-rows">
            <div
              v-for="(t, i) in card.times.slice(0, 10)" :key="t.timeID ?? i"
              class="cap-row" :class="{ stripe: i % 2 === 1 }"
            >
              <div class="cap-rank" :class="rankClass(i)">{{ t.rank }}</div>

              <div class="cap-athlete">
                <img v-if="imageUrl(t.thumbnail)" :src="imageUrl(t.thumbnail)" :alt="t.name" class="cap-thumb" crossorigin="anonymous" />
                <div v-else class="cap-thumb cap-thumb-ph" :class="{ none: !t.athleteID }"></div>
                <div class="cap-names">
                  <div class="cap-name" :class="{ dim: !t.athleteID }">{{ t.athleteID ? t.name : '미등록' }}</div>
                  <div class="cap-team" :class="{ dim: !t.athleteID }">{{ t.athleteID ? (t.team || '') : '미등록' }}</div>
                </div>
              </div>

              <div class="cap-time">
                <div class="cap-time-v">{{ t.time }}</div>
                <div class="cap-time-d">{{ t.datetime }}</div>
              </div>
            </div>
          </div>

          <div class="cap-foot">
            <span class="cap-foot-date">{{ today }} 기준</span>
            <span class="cap-foot-tag">@medalbankaquatics</span>
          </div>

          <div class="cap-pad"></div>
        </div>
      </div>
    </div>
    <div v-else class="be-empty">{{ loading ? '불러오는 중…' : '대회를 선택하면 리더보드를 만들어 보여줍니다.' }}</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Capture — 메달뱅크 Backend' })

const route   = useRoute()

type CaptureType = 'stories' | 'posts'

interface CompetitionName {
  id:              string
  competitionID:   number
  competitionName: string
  datetime?:       string
}

interface TimeRow {
  timeID:    number | null
  athleteID: number
  name:      string
  team:      string
  thumbnail: string
  time:      string
  timeStamp: number
  datetime:  string
  rank:      number | string
}

interface Board {
  discipline: string
  course:     string
  distance:   string
  gender:     string
  isMasters:  boolean | null
  isAdult:    boolean | null
  times:      TimeRow[]
}

const loading     = ref(false)
const downloading = ref(false)
const captureType = ref<CaptureType>('stories')
const subtitle    = ref('')
const typeName    = ref('대회기록')
const datetime    = ref('')
const cards       = ref<Board[]>([])
const progress    = reactive({ total: 0, done: 0 })

const today = new Date().toISOString().slice(0, 10)

const filter = reactive({
  competitionID: 0,
  gender:   'women',
  typeTime: 'eventResult',
  masters:  '비등록',
  adult:    '전체',
})

// athletes.thumbnail 은 /cms/... 같은 상대 경로도 있어서 절대 URL 일 때만 그린다.
function imageUrl(image?: string) {
  return image && image.startsWith('http') ? image : ''
}

// ── 대회 검색 ─────────────────────────────────────────────────────
const competitionQuery   = ref('')
const competitionResults = ref<CompetitionName[]>([])

async function searchCompetitions() {
  if (competitionQuery.value.length < 2) { competitionResults.value = []; return }
  competitionResults.value = await $fetch<CompetitionName[]>('/api/backend/competitions', {
    params: { name: competitionQuery.value },
  })
}
async function pickCompetition(c: CompetitionName) {
  competitionQuery.value   = c.competitionName
  subtitle.value           = c.competitionName
  filter.competitionID     = c.competitionID
  competitionResults.value = []
  await refresh()
}

function setFilter(field: 'masters' | 'adult' | 'gender' | 'typeTime', value: string) {
  ;(filter as any)[field] = value
  if (field === 'typeTime') typeName.value = value === 'eventResult' ? '대회기록' : '훈련기록'
  refresh()
}

// ── 데이터 ────────────────────────────────────────────────────────
// 그룹핑·순위·썸네일 조인은 서버(/api/backend/capture)가 한다.
async function refresh() {
  loading.value = true
  try {
    const res = await $fetch<{ boards: Board[]; datetime: string }>('/api/backend/capture', {
      params: {
        competitionID: filter.competitionID,
        gender:        filter.gender,
        masters:       filter.masters,
        adult:         filter.adult,
        typeTime:      filter.typeTime,
      },
    })
    cards.value    = res.boards
    datetime.value = res.datetime
  } catch (e: any) {
    cards.value = []
    alert(`리더보드를 불러오지 못했습니다: ${e?.statusMessage || e?.message || e}`)
  } finally {
    loading.value = false
  }
}

// ── 카드 타이틀 ───────────────────────────────────────────────────
function cardTitle(card: Board) {
  const parts: string[] = [card.isMasters ? '비등록' : '등록']
  if (filter.adult && filter.adult !== '전체') parts.push(filter.adult)
  if (card.gender)     parts.push(getGenderByEng(card.gender))
  if (card.discipline) parts.push(getStyleLabel(card.discipline))
  if (card.distance)   parts.push(card.distance)
  if (card.course)     parts.push(card.course)
  if (typeName.value)  parts.push(typeName.value)
  return parts.join(' ')
}

function rankClass(i: number) {
  return i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
}

// ── 캡처 ──────────────────────────────────────────────────────────
// medalbank이 이미 번들한 public/racingcaps/html2canvas.min.js 를 그대로 재사용한다.
const cardRefs = new Map<string, HTMLElement>()
function boardKey(b: Board) { return `${b.discipline}-${b.course}-${b.distance}` }
function setCardRef(b: Board, el: any) {
  if (el) cardRefs.set(boardKey(b), el as HTMLElement)
  else    cardRefs.delete(boardKey(b))
}

let html2canvasPromise: Promise<any> | null = null
function loadHtml2Canvas(): Promise<any> {
  if ((window as any).html2canvas) return Promise.resolve((window as any).html2canvas)
  if (!html2canvasPromise) {
    html2canvasPromise = new Promise((resolve, reject) => {
      const el = document.createElement('script')
      el.src = '/racingcaps/html2canvas.min.js'
      el.onload  = () => resolve((window as any).html2canvas)
      el.onerror = () => reject(new Error('html2canvas 를 불러오지 못했습니다.'))
      document.head.appendChild(el)
    })
  }
  return html2canvasPromise
}

async function handleDownload() {
  if (downloading.value || !cards.value.length) return
  downloading.value = true
  progress.total = cards.value.length
  progress.done  = 0

  try {
    const html2canvas = await loadHtml2Canvas()
    await nextTick()

    const height = captureType.value === 'stories' ? 1920 : 1350
    for (const card of cards.value) {
      const el = cardRefs.get(boardKey(card))
      if (!el) { progress.done++; continue }
      try {
        const canvas = await html2canvas(el, {
          width: 1080,
          height,
          scale: 1,
          useCORS: true,
          backgroundColor: '#0f172a',
          logging: false,
        })
        const dataUrl = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${getStyleLabel(card.discipline)} ${card.course} ${card.distance} ${captureType.value}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
      } catch (e) {
        console.error('캡처 실패:', boardKey(card), e)
      }
      progress.done++
      // 브라우저가 연속 다운로드를 막지 않도록 약간 간격을 둔다.
      await new Promise(r => setTimeout(r, 250))
    }
  } catch (e: any) {
    alert(String(e?.message || e))
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  // 원본과 동일하게 쿼리스트링으로 초기 필터를 받는다.
  filter.adult    = (route.query.adult    as string) || '전체'
  filter.masters  = (route.query.masters  as string) || '비등록'
  filter.typeTime = (route.query.typeTime as string) || 'eventResult'
  filter.gender   = (route.query.gender   as string) || 'women'
  typeName.value  = filter.typeTime === 'eventResult' ? '대회기록' : '훈련기록'
})
</script>

<style scoped>
.cp-root { font-family: var(--sans); }

.be-page-head  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.be-page-title { font-size: 20px; font-weight: 700; color: #0a0a0a; }
.be-page-sub   { font-size: 12px; color: #aaa; margin-top: 2px; }

/* ── Filters ── */
.be-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 12px 0; border-bottom: 1px solid #e8e8e4; margin-bottom: 12px;
}
.cp-filters { gap: 18px; }
.cp-search  { position: relative; }
.be-search  { height: 34px; padding: 0 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px; width: 300px; outline: none; }
.be-search:focus { border-color: #0a1d3a; }
.cp-subtitle { width: 260px; }
.cp-typename { width: 150px; }

.cp-suggest {
  position: absolute; top: 38px; left: 0; z-index: 20;
  width: 420px; max-height: 300px; overflow-y: auto;
  background: #fff; border: 1px solid #ddd; border-radius: 3px; box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}
.cp-suggest-item {
  display: block; width: 100%; text-align: left;
  padding: 8px 12px; font-size: 12.5px; color: #222;
  border: 0; border-bottom: 1px solid #f0f0ee; background: #fff; cursor: pointer;
}
.cp-suggest-item:last-child { border-bottom: 0; }
.cp-suggest-item:hover      { background: #f5f5f3; }
.cp-suggest-year { color: #aaa; font-family: var(--mono); font-size: 11px; margin-left: 6px; }

.be-filter-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.cp-cid { font-family: var(--mono); font-size: 11px; color: #1e40af; background: #dbeafe; padding: 4px 8px; border-radius: 3px; }
.be-add { height: 34px; padding: 0 16px; font-size: 12px; cursor: pointer; border-radius: 3px; border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; transition: background 0.15s; }
.be-add:hover:not(:disabled) { background: #1a3560; }
.be-add:disabled { opacity: 0.45; cursor: not-allowed; }

.cp-group       { display: flex; align-items: center; gap: 4px; }
.cp-group-label { font-size: 10px; font-weight: 600; color: #bbb; letter-spacing: 0.1em; text-transform: uppercase; margin-right: 4px; }
.cp-chip {
  height: 28px; padding: 0 12px; font-size: 12px; cursor: pointer;
  border: 1px solid #e0e0e0; background: #fff; color: #777;
  border-radius: 3px; transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.cp-chip:hover  { background: #f0f0f0; }
.cp-chip.active { background: #0a1d3a; border-color: #0a1d3a; color: #fff; }

.cp-progress-note { font-size: 12px; color: #1e40af; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 8px 12px; margin-bottom: 14px; }
.be-empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

/* ── Rail: 1080px 카드를 축소해 미리보기 ── */
.cp-rail  { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 12px; }
.cp-scale { flex: 0 0 auto; overflow: hidden; }
.cp-scale.stories { width: 270px; height: 480px; }
.cp-scale.posts   { width: 270px; height: 338px; }
.cp-scale > .cap-card { transform: scale(0.25); transform-origin: top left; }

/* ── Capture card (실측 1080px) ── */
.cap-card {
  width: 1080px; box-sizing: border-box;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #e2e8f0; font-family: var(--sans);
  display: flex; flex-direction: column; overflow: hidden;
}
.cap-card.stories { height: 1920px; }
.cap-card.posts   { height: 1350px; }

.cap-pad { background: rgba(255,255,255,0.05); flex-shrink: 0; }
.cap-card.stories .cap-pad { height: 40px; }
.cap-card.posts   .cap-pad { height: 121px; }

.cap-head { background: #0f172a; display: flex; flex-direction: column; justify-content: center; gap: 4px; flex-shrink: 0; }
.cap-card.stories .cap-head { height: 160px; padding: 0 40px; }
.cap-card.posts   .cap-head { height: 72px;  padding: 0 134px; }

.cap-title { font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cap-sub   { color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cap-card.stories .cap-title { font-size: 28px; line-height: 40px; }
.cap-card.stories .cap-sub   { font-size: 24px; line-height: 32px; }
.cap-card.posts   .cap-title { font-size: 22px; line-height: 30px; }
.cap-card.posts   .cap-sub   { font-size: 18px; line-height: 24px; }

.cap-rows { flex: 1 1 auto; display: flex; flex-direction: column; }
.cap-row  { display: flex; align-items: center; flex-shrink: 0; }
.cap-row.stripe { background: rgba(255,255,255,0.03); }
.cap-card.stories .cap-row { height: 152px; }
.cap-card.posts   .cap-row { height: 72px; }

.cap-rank {
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; flex-shrink: 0;
  background: rgba(255,255,255,0.05); color: #fff;
}
.cap-card.stories .cap-rank { width: 152px; height: 152px; margin-left: 40px; font-size: 40px; line-height: 48px; }
.cap-card.posts   .cap-rank { width: 72px;  height: 72px;  margin-left: 134px; font-size: 24px; line-height: 32px; }
.cap-rank.gold   { background: #ffd700; color: #000; }
.cap-rank.silver { background: #c0c0c0; color: #000; }
.cap-rank.bronze { background: #cd7f32; color: #000; }

.cap-athlete { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; }
.cap-card.stories .cap-athlete { gap: 64px; padding-left: 64px; }
.cap-card.posts   .cap-athlete { gap: 24px; padding-left: 24px; }

.cap-thumb { object-fit: cover; flex-shrink: 0; display: block; }
.cap-card.stories .cap-thumb { width: 152px; height: 152px; }
.cap-card.posts   .cap-thumb { width: 72px;  height: 72px; }
.cap-thumb-ph      { background: rgba(255,255,255,0.2); }
.cap-thumb-ph.none { background: rgba(15,23,42,0.2); }

.cap-names { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.cap-name  { color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cap-team  { color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cap-name.dim { color: rgba(255,255,255,0.1); }
.cap-team.dim { color: rgba(255,255,255,0.05); }
.cap-card.stories .cap-name { font-size: 40px; line-height: 48px; }
.cap-card.stories .cap-team { font-size: 28px; line-height: 40px; }
.cap-card.posts   .cap-name { font-size: 28px; line-height: 40px; }
.cap-card.posts   .cap-team { font-size: 16px; line-height: 22px; }

.cap-time {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  text-align: right; background: rgba(255,255,255,0.05); flex-shrink: 0; gap: 4px;
}
.cap-card.stories .cap-time { height: 152px; padding: 0 64px; margin-right: 40px; }
.cap-card.posts   .cap-time { height: 72px;  padding: 0 48px; margin-right: 134px; }

.cap-time-v { font-family: var(--mono); font-weight: 700; font-variant-numeric: tabular-nums; }
.cap-time-d { font-family: var(--mono); color: rgba(255,255,255,0.5); font-variant-numeric: tabular-nums; }
.cap-card.stories .cap-time-v { font-size: 40px; line-height: 48px; }
.cap-card.stories .cap-time-d { font-size: 28px; line-height: 40px; }
.cap-card.posts   .cap-time-v { font-size: 28px; line-height: 40px; }
.cap-card.posts   .cap-time-d { font-size: 16px; line-height: 22px; }

.cap-foot {
  background: #0f172a; display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.cap-card.stories .cap-foot { height: 160px; padding: 0 40px; font-size: 28px; line-height: 40px; }
.cap-card.posts   .cap-foot { height: 72px;  padding: 0 134px; font-size: 20px; line-height: 28px; }
.cap-foot-date { color: #fff; }
.cap-foot-tag  { color: rgba(255,255,255,0.1); }
</style>
