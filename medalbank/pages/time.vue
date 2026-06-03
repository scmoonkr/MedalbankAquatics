<template>
  <div>
    <div class="stub-shell">
      <div class="tv-shell-inner">
        <div class="eyebrow">00 · TIME ANALYSIS · 기록 분석</div>
        <h1><span v-if="h1Parts.prefix" class="em">{{ h1Parts.prefix }}</span>{{ h1Parts.suffix }}</h1>
        <p class="lede">{{ ledeText }}</p>
        <div class="stub-foot tv-disclaimer">고지사항 · Disclaimer · 본 기록분석지는 World Aquatics(WA)가 공시하는 공식 산정 기준 및 환산 공식에 근거하여 산출된 결과를 제공합니다. 산정 방식은 WA가 공식 발간하는 포인트 테이블(Points Table)과 동일한 알고리즘을 적용하였으나, 본 문서는 World Aquatics의 공식 등재 자료 또는 공인 인증서가 아니며, 어디까지나 참고용 환산 자료로서의 효력만을 가집니다. 본 분석지에 표기된 모든 수치는 공식 기록·순위·인증 등 일체의 효력을 갖지 아니하며, 이를 근거로 한 공식 절차나 권리 주장에는 사용될 수 없습니다. 기준 베이스타임(Base Time)은 본 문서 작성일인 {{ todayKo }}자 World Aquatics 세계기록을 기준으로 하며, 향후 세계기록 경신 등 기준치의 변동이 발생할 경우 산출 포인트는 상대적으로 변동(하락)될 수 있음을 알려드립니다.</div>
        <div class="tv-actions">
          <button class="tv-action-btn" type="button" @click="openInputs">
            <span class="tv-action-icon">⊕</span> 기록 분석
          </button>
          <button class="tv-action-btn" type="button" @click="copyUrl">
            <span class="tv-action-icon">↗</span> URL 공유
          </button>
          <button class="tv-action-btn" type="button" @click="downloadPdf">
            <span class="tv-action-icon">↓</span> PDF 다운로드
          </button>
          <button class="tv-action-btn" type="button" @click="goReport">
            <span class="tv-action-icon">!</span> 오류 제보
          </button>
        </div>
        <div v-if="copyMsg" class="tv-copy-toast">{{ copyMsg }}</div>
      </div>
    </div>

    <div class="page-body">

      <!-- ── 입력 ─────────────────────────────── -->
      <section v-show="showInputs" class="modal-block">
        <div class="modal-block-head">
          <h3>입력 · INPUTS</h3>
        </div>
        <div class="modal-inputs">
          <div class="modal-filter-row">
            <span class="modal-filter-label">성별</span>
            <div class="modal-chip-row">
              <button class="modal-chip" :class="{ active: state.gender === 'M' }" @click="setParam('gender', 'M')">남자</button>
              <button class="modal-chip" :class="{ active: state.gender === 'W' }" @click="setParam('gender', 'W')">여자</button>
            </div>
          </div>
          <div class="modal-filter-row">
            <span class="modal-filter-label">영법</span>
            <div class="modal-chip-row">
              <button v-for="s in STROKES" :key="s.code" class="modal-chip" :class="{ active: state.stroke === s.code }" @click="setParam('stroke', s.code)">{{ s.ko }}</button>
            </div>
          </div>
          <div class="modal-filter-row">
            <span class="modal-filter-label">거리</span>
            <div class="modal-chip-row">
              <button v-for="d in availableDistances" :key="d" class="modal-chip" :class="{ active: state.distance === d }" @click="setParam('distance', d)">{{ d }}m</button>
            </div>
          </div>
          <div class="modal-filter-row">
            <span class="modal-filter-label">코스</span>
            <div class="modal-chip-row">
              <button class="modal-chip active" disabled>LCM</button>
            </div>
          </div>
          <div class="modal-filter-row">
            <span class="modal-filter-label">기록</span>
            <div class="modal-input-col">
              <input
                ref="timeInputEl"
                type="text" class="modal-time-input"
                :class="{ 'input-error': timeInputError }"
                v-model="timeInputRaw" @change="onTimeChange"
                placeholder="00:00.00" inputmode="decimal"
              />
              <span v-if="timeInputError" class="modal-input-error">{{ timeInputError }}</span>
              <span v-else class="modal-hint">숫자만 입력해도 mm:ss.tt 형식으로 정리돼요</span>
            </div>
          </div>
          <div class="modal-filter-row">
            <span class="modal-filter-label">생년월일</span>
            <div class="modal-input-col">
              <input type="date" class="modal-date-input" v-model="state.dob" />
              <span class="modal-hint">입력 시 연령 보정 표가 함께 표시됩니다 (만 25세 이상)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 권위 기록 비교 ───────────────────── -->
      <section class="modal-block">
        <div class="modal-block-head">
          <h3>기록 비교 · RECORDS COMPARISON</h3>
        </div>
        <p v-if="!scoringReady" class="modal-emptynote">로딩 중…</p>
        <div v-else-if="compareRecords" class="modal-compare">
          <div v-for="t in RECORD_TYPES" :key="t.code" class="row" :class="{ empty: !compareRecords[t.code]?.time }">
            <span class="lbl">{{ t.code }}</span>
            <span class="full">{{ t.full }}</span>
            <template v-if="compareRecords[t.code]?.time">
              <span class="time">{{ fmtTime(compareRecords[t.code].time) }}</span>
              <span class="diff">{{ diffStr(state.timeSec, compareRecords[t.code].time) }}</span>
              <span class="credit">{{ creditStr(compareRecords[t.code]) }}</span>
            </template>
            <template v-else>
              <span class="time">—</span>
              <span class="diff"></span>
              <span class="credit"></span>
            </template>
          </div>
        </div>
        <p v-else class="modal-emptynote">이 종목의 권위 기록 데이터가 아직 준비되지 않았습니다.</p>
      </section>

      <!-- ── WA 포인트 ────────────────────────── -->
      <section class="modal-block">
        <div class="modal-block-head">
          <h3>World Aquatics 포인트 · WA POINTS</h3>
        </div>
        <div v-if="scoringReady">
          <div class="modal-points">
            <div class="laurel left">❲</div>
            <div class="content">
              <div class="label">WORLD AQUATICS 포인트</div>
              <div class="value">{{ waPoints != null ? waPoints.toLocaleString() : '—' }}<span class="unit">점</span></div>
              <div class="sub">{{ eventSubLabel }}</div>
            </div>
            <div class="laurel right">❳</div>
          </div>
          <div class="modal-tiers">
            <div v-for="target in [1000, 900, 800]" :key="target" class="modal-tier">
              <div class="label">{{ target }}점 기준</div>
              <div class="value">{{ timeForPts(target) ? fmtTime(timeForPts(target)) : '—' }}</div>
            </div>
            <div class="modal-tier">
              <div class="label">1000점까지</div>
              <div class="value">{{ cutDiff }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 등가 종목 ────────────────────────── -->
      <section class="modal-block">
        <div class="modal-block-head">
          <h3>동일한 점수로 보는 다른 종목 기록대 · EQUIVALENT EVENTS</h3>
        </div>
        <p v-if="!scoringReady" class="modal-emptynote">로딩 중…</p>
        <div v-else-if="equivGrid" class="modal-equiv">
          <table class="modal-equiv-table">
            <tbody>
              <tr v-for="(row, ri) in equivGrid" :key="ri">
                <td
                  v-for="([stroke, distance], ci) in row" :key="ci"
                  :class="{ current: stroke === state.stroke && Number(distance) === state.distance }"
                >
                  <div class="event">{{ strokeKo(stroke) }} {{ distance }}m</div>
                  <div class="time">{{ equivTime(stroke, Number(distance)) }}</div>
                  <div class="base">1000점 기준 {{ basetimeFmt(stroke, Number(distance)) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── 유사한 기록 ──────────────────────── -->
      <section class="modal-block">
        <div class="modal-block-head">
          <h3>동일한 점수대로 보는 유사한 경기실적들 · SIMILAR PERFORMANCES</h3>
        </div>
        <p class="modal-block-note">World Aquatics 포인트가 가장 가까운 기록 모아보기.</p>
        <div v-if="similarPending" class="empty-state">불러오는 중…</div>
        <p v-else-if="!waPoints" class="modal-emptynote">기록을 입력하면 유사한 점수의 기록이 표시됩니다.</p>
        <template v-else>
          <template v-for="set in similarSets" :key="set.key">
            <!-- 같은 영법 -->
            <div class="sim-set-head">
              <span class="sim-set-group">가장 유사한 점수의 {{ strokeKo(state.stroke) }} 기록 ({{ set.data?.same?.length ?? 0 }}건)</span>
              <span class="sim-set-sep"> | </span>
              <span class="sim-set-label">{{ set.title }}</span>
            </div>
            <table class="modal-similar-table">
              <thead>
                <tr>
                  <th class="c-event">종목</th>
                  <th class="c-athlete">선수</th>
                  <th class="c-time">기록</th>
                  <th class="c-date">일자</th>
                  <th class="c-pts">점수</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!set.data?.same?.length">
                  <td colspan="5" class="empty-row">데이터 없음</td>
                </tr>
                <tr v-for="(r, i) in set.data?.same" :key="'s' + i">
                  <td class="event">{{ genderKo(r.gender) }} {{ strokeKo(r.stroke) }} {{ r.distance }}m · {{ r.course }}</td>
                  <td class="athlete">{{ r.athlete }}</td>
                  <td class="time">{{ normTime(r.time) }}</td>
                  <td class="date">{{ r.date }}</td>
                  <td class="pts">{{ r.points.toLocaleString() }}점<span class="pts-diff">{{ ptsDiff(r.points) }}</span></td>
                </tr>
              </tbody>
            </table>
            <!-- 타 영법 -->
            <div class="sim-set-head">
              <span class="sim-set-group">가장 유사한 점수의 타 영법 기록 ({{ set.data?.other?.length ?? 0 }}건)</span>
              <span class="sim-set-sep"> | </span>
              <span class="sim-set-label">{{ set.title }}</span>
            </div>
            <table class="modal-similar-table">
              <thead>
                <tr>
                  <th class="c-event">종목</th>
                  <th class="c-athlete">선수</th>
                  <th class="c-time">기록</th>
                  <th class="c-date">일자</th>
                  <th class="c-pts">점수</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!set.data?.other?.length">
                  <td colspan="5" class="empty-row">데이터 없음</td>
                </tr>
                <tr v-for="(r, i) in set.data?.other" :key="'o' + i">
                  <td class="event">{{ genderKo(r.gender) }} {{ strokeKo(r.stroke) }} {{ r.distance }}m · {{ r.course }}</td>
                  <td class="athlete">{{ r.athlete }}</td>
                  <td class="time">{{ normTime(r.time) }}</td>
                  <td class="date">{{ r.date }}</td>
                  <td class="pts">{{ r.points.toLocaleString() }}점<span class="pts-diff">{{ ptsDiff(r.points) }}</span></td>
                </tr>
              </tbody>
            </table>
          </template>
          <p v-if="!similarSets.some(s => s.data?.same?.length || s.data?.other?.length)" class="modal-emptynote">유사한 기록이 없습니다.</p>
        </template>
      </section>

      <!-- ── 연령 보정 ────────────────────────── -->
      <section class="modal-block">
        <div class="modal-block-head">
          <h3>연령 보정 · AGE ADJUSTMENT</h3>
        </div>
        <p v-if="!state.dob" class="modal-emptynote">생년월일을 입력하면 본인 연령 그룹 기준의 등가 시간 표가 표시됩니다 (만 25세 이상).</p>
        <template v-else-if="scoringReady">
          <p v-if="!ageData" class="modal-emptynote">연령 보정은 만 25세 이상에서 적용됩니다.</p>
          <template v-else>
            <div class="modal-age-summary">
              <div class="age-block">
                <div class="label">본인 연령 그룹</div>
                <div class="value">{{ ageData.myGroup }}</div>
              </div>
              <div class="age-block">
                <div class="label">실제 기록</div>
                <div class="value mono">{{ fmtTime(state.timeSec) }}</div>
                <div class="sub">현재 WA 포인트 {{ waPoints != null ? waPoints.toLocaleString() : '—' }}점</div>
              </div>
              <div class="age-block">
                <div class="label">25-29 등가 시간</div>
                <div class="value mono">{{ fmtTime(ageData.openTime) }}</div>
                <div class="sub">오픈 등가 WA 포인트 {{ ageData.openPts != null ? ageData.openPts.toLocaleString() : '—' }}점</div>
              </div>
            </div>
            <p class="modal-age-caption">같은 수준의 실적을 다른 연령부의 등가 실적으로 환산한 표입니다.</p>
            <table class="modal-age-table">
              <thead>
                <tr><th>연령 그룹</th><th>환산 계수</th><th>등가 시간</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in ageData.rows" :key="row.group" :class="{ mine: row.isMine }">
                  <td class="grp">{{ row.group }}<span v-if="row.isMine" class="mark">현재</span></td>
                  <td class="factor">×{{ row.factor }}</td>
                  <td class="adj">{{ fmtTime(row.adjTime) }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </template>
      </section>

      <!-- ── 단순 속도 ────────────────────────── -->
      <section class="modal-block">
        <div class="modal-block-head">
          <h3>단순 속도 계산 · SIMPLE SPEED</h3>
        </div>
        <p v-if="!state.timeSec" class="modal-emptynote">기록을 입력하면 단순 속도 표가 표시됩니다.</p>
        <div v-else class="modal-speed">
          <div class="speed-row">
            <div class="speed-mine">
              <span class="label">속도</span>
              <span class="value">{{ speedMs.toFixed(2) }}<span class="unit">m/s</span></span>
            </div>
            <div class="speed-compare">
              <template v-if="compareSpeeds.length">
                <span v-for="c in compareSpeeds" :key="c.code" class="speed-compare-chip">
                  <span class="lbl">{{ c.code }}</span>
                  <span class="val">{{ c.ms.toFixed(2) }}<span class="u">m/s</span></span>
                </span>
              </template>
              <span v-else class="speed-compare-empty">비교 기록 없음</span>
            </div>
          </div>
          <div class="speed-row">
            <div class="speed-mine">
              <span class="label">시속</span>
              <span class="value">{{ speedKmh.toFixed(2) }}<span class="unit">km/h</span></span>
            </div>
            <div class="speed-compare">
              <template v-if="compareSpeeds.length">
                <span v-for="c in compareSpeeds" :key="c.code" class="speed-compare-chip">
                  <span class="lbl">{{ c.code }}</span>
                  <span class="val">{{ c.kmh.toFixed(2) }}<span class="u">km/h</span></span>
                </span>
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 단순 페이스 ──────────────────────── -->
      <section class="modal-block">
        <div class="modal-block-head">
          <h3>단순 페이스 계산 · SIMPLE PACE</h3>
        </div>
        <p v-if="!state.timeSec" class="modal-emptynote">기록을 입력하면 단순 페이스 표가 표시됩니다.</p>
        <div v-else class="modal-pace">
          <div class="pace-paces">
            <div
              v-for="d in [50, 100, 200, 400]" :key="d"
              class="pace-cell" :class="{ current: d === state.distance }"
            >
              <div class="label">{{ d }}m</div>
              <div class="value">{{ fmtTime(state.timeSec! * (d / state.distance)) }}</div>
            </div>
          </div>
          <p class="pace-disclaimer">위 단순 속도와 페이스표는 정확한 지표가 아니며 단순 거리 비례 계산이므로 참고용으로만 사용하세요. 실제 수영은 스타트·턴·영법별 특성 때문에 거리 간 페이스가 선형으로 비례하지 않습니다.</p>
        </div>
      </section>

      <!-- ── 계산 방식 안내 ─────────────────────── -->
      <section class="modal-block tv-footnote">
        <div class="modal-block-head">
          <h3>계산 방식 안내 · METHODOLOGY</h3>
        </div>
        <div class="tv-footnote-body">
          <p>본 계산은 <strong>World Aquatics Points</strong> 공식을 따릅니다. 각 종목의 베이스타임은 LCM 세계기록을 기준으로 하며, <em>포인트 = 1000 × (베이스타임 ÷ 기록)³</em> 의 정수 부분으로 산출됩니다. 세계수영연맹이 공식 발간하는 FINA Points 표와 동일한 방식이며, 수영계 전반에서 가장 보편적으로 쓰이는 비교 척도입니다.</p>
          <p>연령 보정은 <strong>Rowson-style</strong> 단일 계수 모델로, 각 5세 연령부의 마스터즈 세계기록을 25-29(오픈) 마스터즈 세계기록과 비교한 근사 비율을 적용합니다. 종목·거리에 따라 실제 비율이 다소 변동하나, 본 표에서는 평균 계수를 사용하여 큰 그림을 가늠합니다.</p>
          <p>두 방식 모두 어디까지나 <em>참고용 환산</em>이며, 공식 등재나 인증 기록과는 구분됩니다.</p>
          <p class="tv-footnote-date">
            {{ todayKo }} 기준 당시 세계기록을 기준으로 계산된 내용.<br>
            <span v-if="wrRef" class="tv-footnote-wr">{{ wrRef }}</span>
          </p>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: 'Time Analysis — 메달뱅크 · Medalbank' })

const route = useRoute()

const STROKES = [
  { code: 'FR', ko: '자유형' },
  { code: 'BK', ko: '배영' },
  { code: 'BR', ko: '평영' },
  { code: 'FL', ko: '접영' },
  { code: 'IM', ko: '개인혼영' },
]

const RECORD_TYPES = [
  { code: 'WR',  full: '세계기록' },
  { code: 'OR',  full: '올림픽기록' },
  { code: 'AR',  full: '아시아기록' },
  { code: 'KR',  full: '한국기록' },
  { code: 'KMR', full: '한국마스터즈기록' },
]

const scoringReady = ref(false)
const canonLoaded  = ref(0)
const _now    = new Date()
const today   = _now.toISOString().slice(0, 10)
const todayKo = `${_now.getFullYear()}년 ${_now.getMonth() + 1}월 ${_now.getDate()}일`

const copyMsg     = ref('')
const showInputs  = ref(false)
const timeInputEl = ref<HTMLInputElement | null>(null)

function openInputs() {
  showInputs.value = !showInputs.value
  if (showInputs.value) nextTick(() => timeInputEl.value?.focus())
}

const openSubmitModal = inject<(data?: Record<string, any>) => void>('submitModal')

function goReport() {
  openSubmitModal?.(submitInitialData.value)
}

const submitInitialData = computed(() => ({
  gender:     state.gender === 'M' ? 'men' : 'women',
  discipline: state.stroke,
  distance:   `${state.distance}M`,
  course:     state.course,
  time:       state.timeSec && scoringReady.value ? S().formatTime(state.timeSec) : '',
  name:       attribution.athlete || '',
}))

async function copyUrl() {
  const q: Record<string, string> = {
    gender:   state.gender,
    stroke:   state.stroke,
    distance: String(state.distance),
    course:   state.course,
  }
  if (state.timeSec && scoringReady.value) q.time = S().formatTime(state.timeSec)
  if (state.dob) q.dob = state.dob
  const qs = new URLSearchParams(q).toString()
  const url = `${location.origin}/time?${qs}`
  try {
    await navigator.clipboard.writeText(url)
    copyMsg.value = 'URL이 복사됐습니다.'
  } catch {
    copyMsg.value = url
  }
  setTimeout(() => { copyMsg.value = '' }, 2500)
}
function S(): any { return (window as any).KSR_SCORING }

function genderKo(g: string) { return g === 'M' ? '남자' : g === 'W' ? '여자' : g }
function strokeKo(code: string) { return STROKES.find(s => s.code === code)?.ko ?? code }

function fmtTime(sec: number | null | undefined): string {
  if (!scoringReady.value || sec == null) return '—'
  return normTime(S().formatTime(sec))
}

const state = reactive({
  gender:   (route.query.gender  as string) || 'M',
  stroke:   (route.query.stroke  as string) || 'FR',
  distance: Number(route.query.distance)    || 50,
  course:   'LCM',
  timeSec:  null as number | null,
  dob:      (route.query.dob as string)     || null as string | null,
})

const attribution = reactive({
  athlete:  (route.query.athlete  as string) || '',
  datetime: (route.query.datetime as string) || '',
  meet:     (route.query.meet     as string) || '',
})

const isDirty = ref(false)

const hasAttribution = computed(() => !isDirty.value && (!!attribution.athlete || !!attribution.meet))

const h1Parts = computed(() => {
  if (!state.timeSec || !scoringReady.value) return { prefix: '00:', suffix: '00.00' }
  const raw = S().formatTime(state.timeSec)
  const t = raw.includes(':') ? raw : '00:' + raw
  const idx = t.indexOf(':')
  const prefix = t.slice(0, idx).padStart(2, '0') + ':'
  const suffix = t.slice(idx + 1)
  return { prefix, suffix }
})

const ledeText = computed(() => {
  const parts: string[] = [`${genderKo(state.gender)} ${strokeKo(state.stroke)} ${state.distance}M ${state.course}`]
  if (attribution.datetime) parts.push(attribution.datetime)
  if (!isDirty.value && attribution.athlete) parts.push(attribution.athlete)
  if (!isDirty.value && attribution.meet)    parts.push(attribution.meet)
  return parts.join(' · ')
})

const timeInputRaw   = ref((route.query.time as string) || '')
const timeInputError = ref('')

function initTimeFromRoute() {
  const raw = route.query.time as string
  if (!raw || !scoringReady.value) return
  const parsed = S().parseTime(raw)
  if (parsed && parsed > 0) {
    state.timeSec = parsed
    timeInputRaw.value = S().formatTime(parsed)
  }
}

const availableDistances = computed<number[]>(() => {
  if (!scoringReady.value) return [50, 100, 200, 400]
  return S().availableDistances(state.gender, state.stroke)
})

function setParam(key: string, val: any) {
  if (key === 'distance') val = Number(val)
  ;(state as any)[key] = val
  isDirty.value = true
  if (key === 'gender' || key === 'stroke') {
    const valid = availableDistances.value
    if (!valid.includes(state.distance)) state.distance = valid[0]
  }
}

function normalizeTimeInput(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  // Pure digits: right-align into 6 slots (mm ss tt) by left-padding with zeros
  if (/^\d+$/.test(trimmed)) {
    const d = trimmed.padStart(6, '0').slice(-6)
    return `${d.slice(0, 2)}:${d.slice(2, 4)}.${d.slice(4, 6)}`
  }

  // Has colon → mm:ss[.tt]
  if (trimmed.includes(':')) {
    const [mRaw, rest = ''] = trimmed.split(':', 2)
    const mm = mRaw.padStart(2, '0').slice(-2)
    if (rest.includes('.')) {
      const [sRaw, tRaw = ''] = rest.split('.', 2)
      return `${mm}:${sRaw.padStart(2, '0').slice(-2)}.${(tRaw + '00').slice(0, 2)}`
    }
    return `${mm}:${rest.padStart(2, '0').slice(-2)}.00`
  }

  // Has dot only → ss.tt
  if (trimmed.includes('.')) {
    const [sRaw, tRaw = ''] = trimmed.split('.', 2)
    return `00:${sRaw.padStart(2, '0').slice(-2)}.${(tRaw + '00').slice(0, 2)}`
  }

  return trimmed
}

function isValidTime(n: string): boolean {
  const m = n.match(/^(\d{2}):(\d{2})\.\d{2}$/)
  if (!m) return false
  return +m[1] <= 59 && +m[2] <= 59
}

function onTimeChange(e: Event) {
  if (!scoringReady.value) return
  const raw = (e.target as HTMLInputElement).value
  if (!raw.trim()) {
    state.timeSec = null
    timeInputError.value = ''
    isDirty.value = true
    return
  }
  const normalized = normalizeTimeInput(raw)
  if (!isValidTime(normalized)) {
    timeInputError.value = '올바른 기록 형식이 아닙니다 (예: 01:23.45)'
    state.timeSec = null
    return
  }
  timeInputError.value = ''
  const parsed = S().parseTime(normalized)
  if (parsed != null && parsed > 0) {
    state.timeSec = parsed
    timeInputRaw.value = normTime(S().formatTime(parsed))
  } else {
    state.timeSec = null
  }
  isDirty.value = true
}

const headerSub = computed(() => {
  const t = state.timeSec && scoringReady.value ? S().formatTime(state.timeSec) : '—'
  return `${genderKo(state.gender)} ${strokeKo(state.stroke)} ${state.distance}m · ${state.course} · ${t}`
})

const eventSubLabel = computed(() => headerSub.value)

const waPoints = computed<number | null>(() => {
  if (!scoringReady.value || !state.timeSec) return null
  return S().calcPoints(state.gender, state.stroke, state.distance, state.timeSec)
})

const compareRecords = computed<Record<string, any> | null>(() => {
  if (!scoringReady.value) return null
  canonLoaded.value // reactive dependency — forces recompute after canon inject
  return S().compareRecords(state.gender, state.stroke, state.distance, state.course)
})

function diffStr(a: number | null, b: number): string {
  if (!scoringReady.value || a == null) return ''
  return S().diffString(a, b)
}

function creditStr(r: any): string {
  return [r.holder, r.nation, r.year, r.ageGroup].filter(Boolean).join(' · ')
}

const wrRef = computed(() => {
  const wr = compareRecords.value?.['WR']
  if (!wr?.time || !wr?.holder) return null
  const parts = [
    'Printed on ' + today,
    'WR',
    fmtTime(wr.time),
    wr.holder,
    wr.nation,
    wr.year,
    wr.venue,
  ].filter(Boolean)
  return parts.join(' | ')
})

function ptsDiff(pts: number): string {
  if (!waPoints.value) return ''
  const d = pts - waPoints.value
  if (d === 0) return ''
  return (d > 0 ? '+' : '−') + Math.abs(d).toLocaleString()
}

function timeForPts(target: number): number | null {
  if (!scoringReady.value) return null
  return S().timeForPoints(state.gender, state.stroke, state.distance, target)
}

const cutDiff = computed(() => {
  const cutTime = timeForPts(1000)
  if (state.timeSec == null || cutTime == null) return '—'
  const d = state.timeSec - cutTime
  return (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(2) + '초'
})

const equivGrid = computed<[string, number][][] | null>(() => {
  if (!scoringReady.value) return null
  return S().EQUIV_GRID
})

function equivTime(stroke: string, distance: number): string {
  if (!scoringReady.value || !waPoints.value) return '—'
  const t = S().timeForPoints(state.gender, stroke, distance, waPoints.value)
  return t ? fmtTime(t) : '—'
}

function basetimeFmt(stroke: string, distance: number): string {
  if (!scoringReady.value) return '—'
  const t = S().basetime(state.gender, stroke, distance)
  return t ? fmtTime(t) : '—'
}

const ageData = computed(() => {
  if (!scoringReady.value || !state.dob || !state.timeSec) return null
  const myGroup = S().ageGroupFromDob(state.dob)
  if (!myGroup) return null
  const factors = S().AGE_GROUP_FACTORS as Record<string, number>
  const myFactor   = factors[myGroup]
  const openFactor = factors['25-29']
  const openTime   = state.timeSec * (myFactor / openFactor)
  const openPts    = S().calcPoints(state.gender, state.stroke, state.distance, openTime)
  const rows = Object.entries(factors).map(([g, fY]) => ({
    group:   g,
    factor:  (myFactor / fY).toFixed(4),
    adjTime: state.timeSec! * (myFactor / fY),
    isMine:  g === myGroup,
  }))
  return { myGroup, openTime, openPts, rows }
})

const speedMs  = computed(() => (state.timeSec && state.distance) ? state.distance / state.timeSec : 0)
const speedKmh = computed(() => speedMs.value * 3.6)

const compareSpeeds = computed<Array<{ code: string; ms: number; kmh: number }>>(() => {
  if (!scoringReady.value || !state.timeSec) return []
  const records = S().compareRecords(state.gender, state.stroke, state.distance, state.course)
  return ['WR', 'KR', 'KMR'].flatMap(code => {
    const r = records?.[code]
    if (!r?.time) return []
    const ms = state.distance / r.time
    return [{ code, ms, kmh: ms * 3.6 }]
  })
})

interface SimilarRecord {
  gender: string; stroke: string; distance: number; course: string
  athlete: string; time: string; date: string; points: number
}
interface SimilarPair    { same: SimilarRecord[]; other: SimilarRecord[] }
interface SimilarResponse {
  oldest:   SimilarPair
  recent:   SimilarPair
  sameYear: SimilarPair
}

const similarData    = ref<SimilarResponse | null>(null)
const similarPending = ref(false)

async function fetchSimilar() {
  if (!waPoints.value || !scoringReady.value) { similarData.value = null; return }
  similarPending.value = true
  try {
    const year = attribution.datetime?.slice(0, 4) || ''
    const params = new URLSearchParams({
      gender:   state.gender,
      stroke:   state.stroke,
      distance: String(state.distance),
      course:   state.course,
      pts:      String(waPoints.value),
    })
    if (attribution.athlete) params.set('athlete', attribution.athlete)
    if (year)                params.set('year',    year)
    const raw = await $fetch<any>(`/api/similar?${params}`)
    // Handle both new format { oldest, recent, sameYear } and legacy { same, other }
    if (raw?.oldest) {
      similarData.value = raw as SimilarResponse
    } else if (raw?.same) {
      similarData.value = {
        oldest:   { same: raw.same,  other: raw.other  },
        recent:   { same: raw.same,  other: raw.other  },
        sameYear: { same: [],        other: []         },
      }
    } else {
      similarData.value = null
    }
  } catch {
    similarData.value = null
  } finally {
    similarPending.value = false
  }
}

watch(
  [() => state.gender, () => state.stroke, () => state.distance, () => state.timeSec, scoringReady,
   () => attribution.datetime, () => attribution.athlete],
  fetchSimilar
)

const similarSets = computed(() => {
  if (!similarData.value) return []
  const year = attribution.datetime?.slice(0, 4) || ''
  return [
    { key: 'oldest',   title: '가장 오래된 기록 모아보기',      data: similarData.value.oldest   },
    { key: 'recent',   title: '가장 최근 작성된 기록 모아보기', data: similarData.value.recent   },
    ...(year ? [{ key: 'sameYear', title: '같은 해 기록만 모아보기', data: similarData.value.sameYear }] : []),
  ]
})

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error('script load failed: ' + src))
    document.head.appendChild(s)
  })
}

function downloadPdf() {
  const stubShell = document.querySelector('.stub-shell') as HTMLElement | null
  const pageBody  = document.querySelector('.page-body')  as HTMLElement | null
  if (!pageBody) return

  const styles = Array.from(document.styleSheets).map(ss => {
    try {
      return Array.from(ss.cssRules).map(r => r.cssText).join('\n')
    } catch {
      return ss.href ? `@import url("${ss.href}");` : ''
    }
  }).join('\n')

  const shellClone = stubShell ? (stubShell.cloneNode(true) as HTMLElement) : null
  if (shellClone) {
    // hide action buttons and toast in printed hero
    ;['.tv-actions', '.tv-copy-toast'].forEach(sel => {
      const el = shellClone.querySelector(sel) as HTMLElement | null
      if (el) el.style.display = 'none'
    })
  }

  const clone = pageBody.cloneNode(true) as HTMLElement

  const gKo  = genderKo(state.gender)
  const sKo  = strokeKo(state.stroke)
  const tStr = state.timeSec && scoringReady.value ? S().formatTime(state.timeSec) : ''
  const title = `메달뱅크 · ${gKo} ${sKo} ${state.distance}m ${state.course}${tStr ? ' · ' + tStr : ''}`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    ${styles}
    @page { size: A4 portrait; margin: 6mm; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    /* shell 패딩이 좌우 여백 역할 (modal.js의 .modal padding과 동일 방식) */
    .tv-pdf-shell { padding: 28px 44px; width: 100%; }
    .page-body { padding: 0 !important; margin: 0 !important; }
    /* stub-shell: 좌우 padding 제거해서 page-body 섹션과 동일한 좌우 기준선 */
    .stub-shell { padding: 0 0 28px !important; border-bottom: 1px solid var(--rule); }
    .stub-shell h1 { font-size: 36px !important; margin-bottom: 16px !important; }
    .block { overflow: hidden; page-break-inside: avoid; }
    .block-head { flex-wrap: wrap; gap: 4px 12px; }
    .block-head h2 { font-size: clamp(16px, 2.4vw, 22px) !important; }
    /* 권위기록 grid */
    .modal-compare .row {
      grid-template-columns: 44px 116px 88px 66px 1fr !important;
      gap: 0 8px !important;
    }
    .modal-compare .full { font-size: 12px !important; }
    .modal-compare .credit { font-size: 10.5px !important; white-space: normal !important; }
    /* equiv 테이블 */
    .modal-equiv-table td { padding: 10px 8px !important; }
    .modal-equiv-table td .time { font-size: 14px !important; }
    .modal-equiv-table td .event, .modal-equiv-table td .base { font-size: 10px !important; }
    .modal-tiers, .modal-age-summary { page-break-inside: avoid; }
    @media print { .modal-block { page-break-inside: auto !important; break-inside: auto !important; } }
    /* modal.css @media print 규칙 무효화 */
    @media print {
      body > * { display: block !important; }
      .modal-filter-row { display: flex !important; }
      .modal-hint { display: block !important; }
    }
    .tv-pdf-credit { display: block; margin-top: 20px; padding-top: 12px; border-top: 1px solid #ddd; font-family: var(--sans); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #aaa; }
  </style>
</head>
<body>
  <div class="tv-pdf-shell">
    ${shellClone ? shellClone.outerHTML : ''}
    ${clone.outerHTML}
    <div class="tv-pdf-credit">메달뱅크 · medalbankaquatics.com · ${new Date().toISOString().slice(0, 10)}</div>
  </div>
</body>
</html>`)
  win.document.close()
  win.focus()
  setTimeout(() => { try { win.print() } catch (_) {} }, 300)
}

function parseTimeSec(str: string): number | null {
  if (!str) return null
  const s = str.replace(/^0+:/, '')
  if (s.includes(':')) {
    const [m, sec] = s.split(':')
    return parseInt(m) * 60 + parseFloat(sec)
  }
  return parseFloat(s) || null
}

async function injectCanonOverlay() {
  try {
    const dbRecords = await $fetch<Record<string, any>>('/api/canon')
    const overlay: Record<string, any> = {}
    for (const [key, rec] of Object.entries(dbRecords)) {
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
    S().injectOverlay(overlay)
    canonLoaded.value++
  } catch (e) {
    console.error('[time] canon inject failed', e)
  }
}

onMounted(async () => {
  await loadScript('/cannon/js/scoring.js')
  scoringReady.value = true
  initTimeFromRoute()
  await injectCanonOverlay()
})
</script>

<style scoped>
.page-body {
  max-width: 1200px;
}
.stub-shell {
  padding-left: 0;
  padding-right: 0;
}
.tv-shell-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--pad-x);
}
.tv-disclaimer {
  font-family: var(--serif-ko);
  font-size: 12px;
  line-height: 1.8;
  color: var(--fg-mute);
  max-width: 760px;
}
.tv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}
.tv-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid var(--line);
  background: transparent;
  font-family: var(--sans);
  font-size: 12.5px;
  letter-spacing: 0.06em;
  color: var(--fg-dim);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.tv-action-btn:hover {
  background: var(--bg-soft);
  color: var(--fg);
  border-color: var(--fg-mute);
}
.tv-action-icon {
  font-size: 13px;
  line-height: 1;
}
.tv-copy-toast {
  margin-top: 10px;
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--fg-mute);
  letter-spacing: 0.02em;
}
.modal-time-input.input-error {
  border-color: #e05;
  outline-color: #e05;
}
.modal-input-error {
  font-family: var(--sans);
  font-size: 11.5px;
  color: #e05;
  letter-spacing: 0.02em;
  margin-top: 4px;
}
.pts-diff {
  display: block;
  font-size: 10px;
  color: var(--fg-mute);
  letter-spacing: 0;
  margin-top: 1px;
}
.sim-set-head {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--fg-mute);
  padding: 20px 0 8px;
  border-top: 1px solid var(--line);
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 4px;
}
.sim-set-head:first-child {
  margin-top: 0;
  border-top: none;
  padding-top: 0;
}
.sim-set-group {
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-dim);
}
.sim-set-sep {
  color: var(--fg-faint);
  font-weight: 400;
}
.sim-set-label {
  font-weight: 400;
  color: var(--fg-mute);
}
.empty-row td {
  color: var(--fg-faint);
  font-size: 12px;
  padding: 10px 0;
  text-align: center;
}
.tv-footnote-body {
  font-family: var(--serif-ko);
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--fg-dim);
  max-width: 760px;
}
.tv-footnote-body p { margin: 0 0 12px; }
.tv-footnote-body p:last-child { margin-bottom: 0; }
.tv-footnote-date {
  font-size: 12px;
  color: var(--fg-mute);
  margin-top: 16px !important;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}
.tv-footnote-wr {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--fg-faint);
  letter-spacing: 0.02em;
}
</style>
