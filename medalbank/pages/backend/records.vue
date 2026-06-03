<template>
  <div class="rc-root">

    <!-- Toolbar -->
    <div class="rc-bar">
      <nav class="rc-jumps">
        <a v-for="s in STROKE_ORDER" :key="s" :href="`#sec-${s.toLowerCase()}`">{{ STROKE_LABELS[s].ko }}</a>
      </nav>
      <div class="rc-bar-right">
        <button class="btn-csv-im" @click="importFileRef?.click()">CSV 불러오기</button>
        <button class="btn-csv-ex" @click="exportCSV">CSV 내보내기</button>
        <input ref="importFileRef" type="file" accept=".csv" style="display:none" @change="importCSV" />
      </div>
    </div>

    <!-- Info -->
    <div class="rc-info">
      <strong>WR / OR / AR / KR / WMR / KMR / ER</strong> 7가지 권위 기록을 종목별로 입력·수정합니다. LCM(장수영장) 기록만 다룹니다. 셀을 클릭하면 우측 패널에서 편집할 수 있습니다. <strong>기록</strong>란은 숫자만 입력해도 자동 정형되고(002091 → 00:20.91), <strong>작성일</strong>도 20260518 → 2026-05-18 로 맞춰집니다. 상단 <strong>CSV 내보내기·불러오기</strong>로 전체 일괄 편집도 가능합니다. 50m 배영·평영·접영의 OR은 비올림픽 종목이라 입력란이 없습니다.
    </div>

    <!-- Body: table + optional right panel -->
    <div class="rc-body">

      <!-- Content: matrix by stroke -->
      <div class="rc-content" v-if="loaded">
        <section
          v-for="s in STROKE_ORDER"
          :key="s"
          :id="`sec-${s.toLowerCase()}`"
          class="rc-section"
        >
          <div class="rc-section-head">
            <span class="rc-ev-label">{{ STROKE_LABELS[s].ko }}</span>
            <span class="rc-ev-slug">{{ STROKE_LABELS[s].en }} · LCM</span>
          </div>
          <div class="rc-table-wrap">
            <table class="rc-table rc-matrix">
              <thead>
                <tr>
                  <th class="th-dist">거리</th>
                  <th class="th-gen">성별</th>
                  <th v-for="rt in ALL_RT" :key="rt" class="th-rt">
                    <span class="rt-code">{{ rt }}</span>
                    <span class="rt-lbl">{{ RT_LABELS_SHORT[rt] }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="dist in STROKE_DISTS_STYLE[s]" :key="dist">
                  <!-- 남자 -->
                  <tr class="gender-m row-clickable">
                    <td class="td-dist" rowspan="2">{{ dist }}m</td>
                    <td class="td-gen">남자</td>
                    <td
                      v-for="rt in ALL_RT" :key="rt"
                      class="td-rec"
                      :class="{
                        'rec-na':    isNoOR(s, dist, rt),
                        'rec-empty': !isNoOR(s, dist, rt) && !entry('men', STYLE_TO_STROKE[s], dist, rt).time,
                        'rec-dirty': !isNoOR(s, dist, rt) && entry('men', STYLE_TO_STROKE[s], dist, rt)._dirty,
                        'rec-sel':   !isNoOR(s, dist, rt) && isCellSelected('men', STYLE_TO_STROKE[s], dist, rt),
                      }"
                      @click="isNoOR(s, dist, rt) ? null : openPanel('men', STYLE_TO_STROKE[s], dist, rt)"
                    >
                      <template v-if="isNoOR(s, dist, rt)">—</template>
                      <template v-else-if="entry('men', STYLE_TO_STROKE[s], dist, rt).time">
                        <span
                          class="rec-time time-trigger"
                          :data-gender="'M'"
                          :data-stroke="s"
                          :data-distance="dist"
                          data-course="LCM"
                          :data-time="entry('men', STYLE_TO_STROKE[s], dist, rt).time"
                          :data-athlete="entry('men', STYLE_TO_STROKE[s], dist, rt).name"
                          :data-nation="entry('men', STYLE_TO_STROKE[s], dist, rt).nationality"
                          :data-year="entry('men', STYLE_TO_STROKE[s], dist, rt).year"
                          :data-venue="entry('men', STYLE_TO_STROKE[s], dist, rt).competitionName"
                          @click.stop="openModal($event, 'men', STYLE_TO_STROKE[s], dist, rt)"
                        >{{ normTime(entry('men', STYLE_TO_STROKE[s], dist, rt).time) }}</span>
                        <span class="rec-who">{{ entry('men', STYLE_TO_STROKE[s], dist, rt).name }}</span>
                        <span class="rec-when">{{ recWhen(entry('men', STYLE_TO_STROKE[s], dist, rt)) }}</span>
                      </template>
                      <template v-else>—</template>
                    </td>
                  </tr>
                  <!-- 여자 -->
                  <tr class="gender-w row-clickable">
                    <td class="td-gen">여자</td>
                    <td
                      v-for="rt in ALL_RT" :key="rt"
                      class="td-rec"
                      :class="{
                        'rec-na':    isNoOR(s, dist, rt),
                        'rec-empty': !isNoOR(s, dist, rt) && !entry('women', STYLE_TO_STROKE[s], dist, rt).time,
                        'rec-dirty': !isNoOR(s, dist, rt) && entry('women', STYLE_TO_STROKE[s], dist, rt)._dirty,
                        'rec-sel':   !isNoOR(s, dist, rt) && isCellSelected('women', STYLE_TO_STROKE[s], dist, rt),
                      }"
                      @click="isNoOR(s, dist, rt) ? null : openPanel('women', STYLE_TO_STROKE[s], dist, rt)"
                    >
                      <template v-if="isNoOR(s, dist, rt)">—</template>
                      <template v-else-if="entry('women', STYLE_TO_STROKE[s], dist, rt).time">
                        <span
                          class="rec-time time-trigger"
                          :data-gender="'W'"
                          :data-stroke="s"
                          :data-distance="dist"
                          data-course="LCM"
                          :data-time="entry('women', STYLE_TO_STROKE[s], dist, rt).time"
                          :data-athlete="entry('women', STYLE_TO_STROKE[s], dist, rt).name"
                          :data-nation="entry('women', STYLE_TO_STROKE[s], dist, rt).nationality"
                          :data-year="entry('women', STYLE_TO_STROKE[s], dist, rt).year"
                          :data-venue="entry('women', STYLE_TO_STROKE[s], dist, rt).competitionName"
                          @click.stop="openModal($event, 'women', STYLE_TO_STROKE[s], dist, rt)"
                        >{{ normTime(entry('women', STYLE_TO_STROKE[s], dist, rt).time) }}</span>
                        <span class="rec-who">{{ entry('women', STYLE_TO_STROKE[s], dist, rt).name }}</span>
                        <span class="rec-when">{{ recWhen(entry('women', STYLE_TO_STROKE[s], dist, rt)) }}</span>
                      </template>
                      <template v-else>—</template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div v-else class="rc-loading">불러오는 중…</div>

      <!-- Right edit panel -->
      <div class="ep-panel" :class="{ open: panel.open }" v-if="panel.open">
        <div class="ep-head">
          <div>
            <div class="ep-rt"><span class="rt-code">{{ panel.rt }}</span> {{ RT_LABELS[panel.rt] }}</div>
            <div class="ep-sub">{{ panel.genderLabel }} · {{ panel.strokeLabel }} · {{ panel.dist }}M · LCM</div>
          </div>
          <button class="ep-close" @click="closePanel">✕</button>
        </div>

        <div class="ep-body">
          <div class="ep-field">
            <label>기록</label>
            <input v-model="panel.form.time"
              @blur="panel.form.time = fmtTime(panel.form.time)"
              @paste.prevent="onPanelPaste($event)"
              class="ep-inp ep-inp-mono" placeholder="00:00.00" />
          </div>
          <div class="ep-field">
            <label>보유자</label>
            <input v-model="panel.form.name" class="ep-inp" placeholder="이름" />
          </div>
          <div class="ep-field">
            <label>국적</label>
            <div class="ep-nat-row">
              <button class="ep-nat-btn" @click="openCtryPanel">
                <span v-if="panel.form.nation_code" class="ep-flag">{{ panel.form.nation_code }}</span>
                <span class="ep-nat-code">{{ panel.form.nationality || '선택' }}</span>
              </button>
              <button v-if="panel.form.nationality" class="ep-nat-clear" @click="panel.form.nationality = ''; panel.form.nation_code = ''">✕</button>
            </div>
          </div>
          <div class="ep-field">
            <label>연도</label>
            <input v-model="panel.form.year" class="ep-inp ep-inp-mono" placeholder="2026" />
          </div>
          <div class="ep-field">
            <label>작성일</label>
            <input v-model="panel.form.datetime"
              @blur="panel.form.datetime = fmtDate(panel.form.datetime)"
              class="ep-inp ep-inp-mono" placeholder="0000-00-00" />
          </div>
          <div class="ep-field">
            <label>연령대</label>
            <input v-model="panel.form.age" class="ep-inp" placeholder="25-29" />
          </div>
          <div class="ep-field">
            <label>지역</label>
            <input v-model="panel.form.sido" class="ep-inp" placeholder="서울" />
          </div>
          <div class="ep-field">
            <label>대회명</label>
            <input v-model="panel.form.competitionName" class="ep-inp" placeholder="대회명" />
          </div>
          <div class="ep-field">
            <label>수영장</label>
            <input v-model="panel.form.pool" class="ep-inp" placeholder="수영장명" />
          </div>
        </div>

        <div class="ep-foot">
          <button class="ep-btn-save" :disabled="panel.saving" @click="panelSave">{{ panel.saving ? '저장 중…' : '저장' }}</button>
          <button class="ep-btn-cancel" :disabled="panel.saving" @click="closePanel">취소</button>
        </div>
      </div>

    </div>

    <!-- Country modal -->
    <div class="cm-overlay" v-if="ctry.open" @click.self="ctry.open = false">
      <div class="cm-box">
        <div class="cm-head">
          <span>국가 선택</span>
          <button @click="ctry.open = false">✕</button>
        </div>
        <input ref="ctryInputRef" v-model="ctry.q" class="cm-search" placeholder="검색 (KOR · 한국 · Korea)…" @keydown.escape="ctry.open = false" />
        <div class="cm-list">
          <button v-for="c in filteredCtry" :key="c.ioc" class="cm-item" :class="{ active: ctry.cur && entry(ctry.cur.gender, ctry.cur.stroke, ctry.cur.dist, ctry.cur.rt).nationality === c.ioc }" @click="pickCtry(c)">
            <span class="ci-flag">{{ c.flag }}</span>
            <span class="ci-ko">{{ c.ko }}</span>
            <span class="ci-en">{{ c.en }}</span>
            <span class="ci-code">{{ c.ioc }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Records — 메달뱅크 Backend' })

// ── Constants ─────────────────────────────────────────────────────
const TABS = [
  { key:'men-free',   gender:'men',   stroke:'free',   style:'FR', label:'남자 자유형',   genderLabel:'남자', strokeLabel:'자유형' },
  { key:'men-back',   gender:'men',   stroke:'back',   style:'BK', label:'남자 배영',     genderLabel:'남자', strokeLabel:'배영' },
  { key:'men-breast', gender:'men',   stroke:'breast', style:'BR', label:'남자 평영',     genderLabel:'남자', strokeLabel:'평영' },
  { key:'men-fly',    gender:'men',   stroke:'fly',    style:'FL', label:'남자 접영',     genderLabel:'남자', strokeLabel:'접영' },
  { key:'men-im',     gender:'men',   stroke:'im',     style:'IM', label:'남자 개인혼영', genderLabel:'남자', strokeLabel:'개인혼영' },
  { key:'women-free',   gender:'women', stroke:'free',   style:'FR', label:'여자 자유형',   genderLabel:'여자', strokeLabel:'자유형' },
  { key:'women-back',   gender:'women', stroke:'back',   style:'BK', label:'여자 배영',     genderLabel:'여자', strokeLabel:'배영' },
  { key:'women-breast', gender:'women', stroke:'breast', style:'BR', label:'여자 평영',     genderLabel:'여자', strokeLabel:'평영' },
  { key:'women-fly',    gender:'women', stroke:'fly',    style:'FL', label:'여자 접영',     genderLabel:'여자', strokeLabel:'접영' },
  { key:'women-im',     gender:'women', stroke:'im',     style:'IM', label:'여자 개인혼영', genderLabel:'여자', strokeLabel:'개인혼영' },
]
const STROKE_DISTS: Record<string, number[]> = {
  free: [50, 100, 200, 400, 800, 1500],
  back: [50, 100, 200], breast: [50, 100, 200], fly: [50, 100, 200], im: [200, 400],
}
const ALL_RT = ['WR', 'OR', 'AR', 'KR', 'WMR', 'KMR', 'ER']
const RT_LABELS: Record<string, string> = {
  WR:'세계기록', OR:'올림픽기록', AR:'아시아기록', KR:'한국기록',
  WMR:'세계마스터즈기록', KMR:'한국마스터즈기록', ER:'인핸스드게임기록',
}
const STYLE_TO_STROKE: Record<string, string> = { FR:'free', BK:'back', BR:'breast', FL:'fly', IM:'im' }
const STROKE_TO_STYLE: Record<string, string> = { free:'FR', back:'BK', breast:'BR', fly:'FL', im:'IM' }

const STROKE_ORDER = ['FR', 'BK', 'BR', 'FL', 'IM'] as const
const STROKE_LABELS: Record<string, { ko: string; en: string }> = {
  FR: { ko: '자유형',   en: 'Freestyle'         },
  BK: { ko: '배영',     en: 'Backstroke'        },
  BR: { ko: '평영',     en: 'Breaststroke'      },
  FL: { ko: '접영',     en: 'Butterfly'         },
  IM: { ko: '개인혼영', en: 'Individual Medley' },
}
const STROKE_DISTS_STYLE: Record<string, number[]> = {
  FR: [50, 100, 200, 400, 800, 1500],
  BK: [50, 100, 200], BR: [50, 100, 200], FL: [50, 100, 200], IM: [200, 400],
}
const RT_LABELS_SHORT: Record<string, string> = {
  WR:'세계', OR:'올림픽', AR:'아시아', KR:'한국',
  WMR:'세계M', KMR:'한국M', ER:'인핸스드',
}

function isNoOR(style: string, dist: number, rt: string): boolean {
  return rt === 'OR' && dist === 50 && ['BK', 'BR', 'FL'].includes(style)
}
function recWhen(e: Entry): string {
  return [e.year, e.competitionName].filter(Boolean).join(' · ')
}
function isCellSelected(gender: string, stroke: string, dist: number, rt: string): boolean {
  return panel.open && panel.gender === gender && panel.stroke === stroke && panel.dist === dist && panel.rt === rt
}

const COUNTRIES = [
  { ioc:'KOR', flag:'🇰🇷', ko:'대한민국',         en:'South Korea' },
  { ioc:'JPN', flag:'🇯🇵', ko:'일본',             en:'Japan' },
  { ioc:'CHN', flag:'🇨🇳', ko:'중국',             en:'China' },
  { ioc:'HKG', flag:'🇭🇰', ko:'홍콩',             en:'Hong Kong' },
  { ioc:'TPE', flag:'🇹🇼', ko:'대만',             en:'Chinese Taipei' },
  { ioc:'SGP', flag:'🇸🇬', ko:'싱가포르',         en:'Singapore' },
  { ioc:'THA', flag:'🇹🇭', ko:'태국',             en:'Thailand' },
  { ioc:'VIE', flag:'🇻🇳', ko:'베트남',           en:'Vietnam' },
  { ioc:'MAS', flag:'🇲🇾', ko:'말레이시아',       en:'Malaysia' },
  { ioc:'INA', flag:'🇮🇩', ko:'인도네시아',       en:'Indonesia' },
  { ioc:'PHI', flag:'🇵🇭', ko:'필리핀',           en:'Philippines' },
  { ioc:'IND', flag:'🇮🇳', ko:'인도',             en:'India' },
  { ioc:'KAZ', flag:'🇰🇿', ko:'카자흐스탄',       en:'Kazakhstan' },
  { ioc:'UZB', flag:'🇺🇿', ko:'우즈베키스탄',     en:'Uzbekistan' },
  { ioc:'PRK', flag:'🇰🇵', ko:'북한',             en:'North Korea' },
  { ioc:'IRI', flag:'🇮🇷', ko:'이란',             en:'Iran' },
  { ioc:'QAT', flag:'🇶🇦', ko:'카타르',           en:'Qatar' },
  { ioc:'UAE', flag:'🇦🇪', ko:'아랍에미리트',     en:'United Arab Emirates' },
  { ioc:'KSA', flag:'🇸🇦', ko:'사우디아라비아',   en:'Saudi Arabia' },
  { ioc:'ISR', flag:'🇮🇱', ko:'이스라엘',         en:'Israel' },
  { ioc:'USA', flag:'🇺🇸', ko:'미국',             en:'United States' },
  { ioc:'CAN', flag:'🇨🇦', ko:'캐나다',           en:'Canada' },
  { ioc:'BRA', flag:'🇧🇷', ko:'브라질',           en:'Brazil' },
  { ioc:'ARG', flag:'🇦🇷', ko:'아르헨티나',       en:'Argentina' },
  { ioc:'MEX', flag:'🇲🇽', ko:'멕시코',           en:'Mexico' },
  { ioc:'CHI', flag:'🇨🇱', ko:'칠레',             en:'Chile' },
  { ioc:'COL', flag:'🇨🇴', ko:'콜롬비아',         en:'Colombia' },
  { ioc:'CUB', flag:'🇨🇺', ko:'쿠바',             en:'Cuba' },
  { ioc:'JAM', flag:'🇯🇲', ko:'자메이카',         en:'Jamaica' },
  { ioc:'PUR', flag:'🇵🇷', ko:'푸에르토리코',     en:'Puerto Rico' },
  { ioc:'GBR', flag:'🇬🇧', ko:'영국',             en:'Great Britain' },
  { ioc:'FRA', flag:'🇫🇷', ko:'프랑스',           en:'France' },
  { ioc:'GER', flag:'🇩🇪', ko:'독일',             en:'Germany' },
  { ioc:'ITA', flag:'🇮🇹', ko:'이탈리아',         en:'Italy' },
  { ioc:'ESP', flag:'🇪🇸', ko:'스페인',           en:'Spain' },
  { ioc:'NED', flag:'🇳🇱', ko:'네덜란드',         en:'Netherlands' },
  { ioc:'HUN', flag:'🇭🇺', ko:'헝가리',           en:'Hungary' },
  { ioc:'SWE', flag:'🇸🇪', ko:'스웨덴',           en:'Sweden' },
  { ioc:'RUS', flag:'🇷🇺', ko:'러시아',           en:'Russia' },
  { ioc:'POL', flag:'🇵🇱', ko:'폴란드',           en:'Poland' },
  { ioc:'ROU', flag:'🇷🇴', ko:'루마니아',         en:'Romania' },
  { ioc:'UKR', flag:'🇺🇦', ko:'우크라이나',       en:'Ukraine' },
  { ioc:'LTU', flag:'🇱🇹', ko:'리투아니아',       en:'Lithuania' },
  { ioc:'GRE', flag:'🇬🇷', ko:'그리스',           en:'Greece' },
  { ioc:'IRL', flag:'🇮🇪', ko:'아일랜드',         en:'Ireland' },
  { ioc:'BEL', flag:'🇧🇪', ko:'벨기에',           en:'Belgium' },
  { ioc:'AUT', flag:'🇦🇹', ko:'오스트리아',       en:'Austria' },
  { ioc:'SUI', flag:'🇨🇭', ko:'스위스',           en:'Switzerland' },
  { ioc:'CZE', flag:'🇨🇿', ko:'체코',             en:'Czechia' },
  { ioc:'DEN', flag:'🇩🇰', ko:'덴마크',           en:'Denmark' },
  { ioc:'NOR', flag:'🇳🇴', ko:'노르웨이',         en:'Norway' },
  { ioc:'FIN', flag:'🇫🇮', ko:'핀란드',           en:'Finland' },
  { ioc:'POR', flag:'🇵🇹', ko:'포르투갈',         en:'Portugal' },
  { ioc:'CRO', flag:'🇭🇷', ko:'크로아티아',       en:'Croatia' },
  { ioc:'SRB', flag:'🇷🇸', ko:'세르비아',         en:'Serbia' },
  { ioc:'SLO', flag:'🇸🇮', ko:'슬로베니아',       en:'Slovenia' },
  { ioc:'SVK', flag:'🇸🇰', ko:'슬로바키아',       en:'Slovakia' },
  { ioc:'BUL', flag:'🇧🇬', ko:'불가리아',         en:'Bulgaria' },
  { ioc:'EST', flag:'🇪🇪', ko:'에스토니아',       en:'Estonia' },
  { ioc:'LAT', flag:'🇱🇻', ko:'라트비아',         en:'Latvia' },
  { ioc:'ISL', flag:'🇮🇸', ko:'아이슬란드',       en:'Iceland' },
  { ioc:'TUR', flag:'🇹🇷', ko:'튀르키예',         en:'Türkiye' },
  { ioc:'BLR', flag:'🇧🇾', ko:'벨라루스',         en:'Belarus' },
  { ioc:'LUX', flag:'🇱🇺', ko:'룩셈부르크',       en:'Luxembourg' },
  { ioc:'AUS', flag:'🇦🇺', ko:'호주',             en:'Australia' },
  { ioc:'NZL', flag:'🇳🇿', ko:'뉴질랜드',         en:'New Zealand' },
  { ioc:'RSA', flag:'🇿🇦', ko:'남아프리카공화국', en:'South Africa' },
  { ioc:'EGY', flag:'🇪🇬', ko:'이집트',           en:'Egypt' },
  { ioc:'TUN', flag:'🇹🇳', ko:'튀니지',           en:'Tunisia' },
  { ioc:'MAR', flag:'🇲🇦', ko:'모로코',           en:'Morocco' },
  { ioc:'ALG', flag:'🇩🇿', ko:'알제리',           en:'Algeria' },
  { ioc:'KEN', flag:'🇰🇪', ko:'케냐',             en:'Kenya' },
  { ioc:'NGR', flag:'🇳🇬', ko:'나이지리아',       en:'Nigeria' },
  { ioc:'ZIM', flag:'🇿🇼', ko:'짐바브웨',         en:'Zimbabwe' },
]
type Country = typeof COUNTRIES[0]

// ── Types ─────────────────────────────────────────────────────────
interface Entry {
  _id?: string; _dirty: boolean; _new: boolean
  time: string; name: string; nationality: string; nation_code: string
  year: string; datetime: string; age: string; sido: string
  competitionName: string; pool: string
}
type EventMap = Record<string, Record<string, Entry>>

const mkEmpty = (): Entry => ({
  _dirty: false, _new: true, time: '', name: '', nationality: '', nation_code: '',
  year: '', datetime: '', age: '25-29', sido: '', competitionName: '', pool: '',
})

// ── State ─────────────────────────────────────────────────────────
const activeTab    = ref('men-free')
const eventMap     = ref<EventMap>({})
const loaded       = ref(false)
const importFileRef = ref<HTMLInputElement | null>(null)

const ctry = reactive<{ open: boolean; q: string; cur: { gender:string; stroke:string; dist:number; rt:string } | null; fromPanel: boolean }>({
  open: false, q: '', cur: null, fromPanel: false,
})
const ctryInputRef = ref<HTMLInputElement | null>(null)

const panel = reactive({
  open: false, saving: false, gender: '', stroke: '', dist: 0 as number, rt: '',
  genderLabel: '', strokeLabel: '',
  form: { time:'', name:'', nationality:'', nation_code:'', year:'', datetime:'', age:'25-29', sido:'', competitionName:'', pool:'' },
})

// ── Computed ──────────────────────────────────────────────────────
const curTab = computed(() => TABS.find(t => t.key === activeTab.value) ?? TABS[0])
const curDistances = computed(() => STROKE_DISTS[curTab.value.stroke] ?? [])
const filteredCtry = computed(() => {
  const q = ctry.q.trim().toLowerCase()
  if (!q) return COUNTRIES
  return COUNTRIES.filter(c =>
    c.ioc.toLowerCase().includes(q) || c.ko.includes(ctry.q.trim()) || c.en.toLowerCase().includes(q)
  )
})

// ── Helpers ───────────────────────────────────────────────────────
function mkKey(gender: string, stroke: string, dist: number) {
  return `${gender}-${stroke}-${dist}-lcm`
}
function rtList(stroke: string, dist: number): string[] {
  if (dist === 50 && ['back', 'breast', 'fly'].includes(stroke)) return ALL_RT.filter(r => r !== 'OR')
  return ALL_RT
}
function entry(gender: string, stroke: string, dist: number, rt: string): Entry {
  return eventMap.value[mkKey(gender, stroke, dist)]?.[rt] ?? mkEmpty()
}
function isEmpty(gender: string, stroke: string, dist: number, rt: string): boolean {
  const e = entry(gender, stroke, dist, rt)
  return !e.time && !e.name
}
function rowClass(gender: string, stroke: string, dist: number, rt: string) {
  return {
    'row-empty':    isEmpty(gender, stroke, dist, rt),
    'row-dirty':    entry(gender, stroke, dist, rt)._dirty,
    'row-selected': panel.open && panel.gender === gender && panel.stroke === stroke && panel.dist === dist && panel.rt === rt,
  }
}

// ── Data load ─────────────────────────────────────────────────────
interface CanonRec { time: string; athlete: string; nation: string; year: string | number; venue: string }
interface ApiRecord { id: string; type: string; gender: string; distance: string | number; time: string }

const { data: canonData } = await useFetch<Record<string, CanonRec>>('/api/canon')
const { data: backendRecs } = useFetch<ApiRecord[]>('/api/backend/records')

watchEffect(() => {
  if (!canonData.value) return
  const map: EventMap = {}
  // init all slots
  for (const tab of TABS) {
    for (const dist of STROKE_DISTS[tab.stroke]) {
      const k = mkKey(tab.gender, tab.stroke, dist)
      map[k] = {}
      for (const rt of rtList(tab.stroke, dist)) map[k][rt] = mkEmpty()
    }
  }
  // ID lookup from backend records (best-effort: type+gender+dist+time)
  const idMap: Record<string, string> = {}
  for (const r of (backendRecs.value ?? [])) {
    const dist = parseInt(String(r.distance))
    if (r.id && r.type && r.gender && dist && r.time)
      idMap[`${r.type}-${r.gender}-${dist}-${r.time}`] = r.id
  }
  // fill from canon: key = "M-FR-50-WR"
  for (const [cKey, rec] of Object.entries(canonData.value)) {
    const parts = cKey.split('-')
    if (parts.length < 4) continue
    const [g, style, distStr, type] = parts
    const gender = g === 'M' ? 'men' : g === 'W' ? 'women' : ''
    const stroke = STYLE_TO_STROKE[style]
    const dist = parseInt(distStr)
    if (!gender || !stroke || !dist) continue
    const k = mkKey(gender, stroke, dist)
    if (!map[k]?.[type]) continue
    const _id = idMap[`${type}-${gender}-${dist}-${rec.time}`]
    map[k][type] = {
      _id, _dirty: false, _new: !_id,
      time:            rec.time    || '',
      name:            rec.athlete || '',
      nationality:     rec.nation  || '',
      nation_code:     '',
      year:            String(rec.year || ''),
      datetime:        '',
      age:             '25-29',
      sido:            '',
      competitionName: rec.venue   || '',
      pool:            '',
    }
  }
  eventMap.value = map
  loaded.value = true
})

// ── Field setters ─────────────────────────────────────────────────
function set(gender: string, stroke: string, dist: number, rt: string, field: string, e: Event) {
  const v = (e.target as HTMLInputElement).value
  const k = mkKey(gender, stroke, dist)
  ;(eventMap.value[k][rt] as any)[field] = v
  eventMap.value[k][rt]._dirty = true
}
function setVal(gender: string, stroke: string, dist: number, rt: string, field: string, v: string) {
  const k = mkKey(gender, stroke, dist)
  ;(eventMap.value[k][rt] as any)[field] = v
  eventMap.value[k][rt]._dirty = true
}

// ── Auto-format ───────────────────────────────────────────────────
function fmtTime(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (!d || d === '000000') return raw
  const p = d.padStart(6, '0').slice(-6)
  return `${p.slice(0,2)}:${p.slice(2,4)}.${p.slice(4,6)}`
}
function fmtDate(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length === 8) return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`
  return raw
}
function blurTime(gender: string, stroke: string, dist: number, rt: string, raw: string) {
  const v = fmtTime(raw)
  if (v !== raw) setVal(gender, stroke, dist, rt, 'time', v)
}
function blurDate(gender: string, stroke: string, dist: number, rt: string, raw: string) {
  const v = fmtDate(raw)
  if (v !== raw) setVal(gender, stroke, dist, rt, 'datetime', v)
}

// ── Paste from Excel ──────────────────────────────────────────────
const PASTE_FIELDS = ['time','name','nationality','nation_code','year','datetime','age','sido','competitionName','pool']
function onPaste(e: ClipboardEvent, gender: string, stroke: string, dist: number, rt: string) {
  const text = e.clipboardData?.getData('text') ?? ''
  if (!text.includes('\t')) {
    // single value — re-dispatch as regular paste so the input gets it
    return
  }
  const cells = text.split('\t').map(c => c.trim().replace(/\r?\n.*$/s, ''))
  const k = mkKey(gender, stroke, dist)
  for (let i = 0; i < PASTE_FIELDS.length && i < cells.length; i++) {
    let v = cells[i]
    if (PASTE_FIELDS[i] === 'time') v = fmtTime(v)
    if (PASTE_FIELDS[i] === 'datetime') v = fmtDate(v)
    ;(eventMap.value[k][rt] as any)[PASTE_FIELDS[i]] = v
  }
  eventMap.value[k][rt]._dirty = true
}

// ── Panel ─────────────────────────────────────────────────────────
function openPanel(gender: string, stroke: string, dist: number, rt: string) {
  const e = entry(gender, stroke, dist, rt)
  const tab = TABS.find(t => t.gender === gender && t.stroke === stroke)!
  Object.assign(panel, { open: true, gender, stroke, dist, rt, genderLabel: tab.genderLabel, strokeLabel: tab.strokeLabel })
  Object.assign(panel.form, { time: e.time, name: e.name, nationality: e.nationality, nation_code: e.nation_code, year: e.year, datetime: e.datetime, age: e.age || '25-29', sido: e.sido, competitionName: e.competitionName, pool: e.pool })
}
function closePanel() { panel.open = false }
async function panelSave() {
  const k = mkKey(panel.gender, panel.stroke, panel.dist)
  const cur = eventMap.value[k][panel.rt]
  const payload = {
    gender: panel.gender, style: STROKE_TO_STYLE[panel.stroke],
    distance: panel.dist + 'M', course: 'LCM', type: panel.rt,
    ...panel.form,
  }
  panel.saving = true
  try {
    if (cur._id) {
      await $fetch(`/api/backend/records/${cur._id}`, { method: 'PUT', body: payload })
      eventMap.value[k][panel.rt] = { ...cur, ...panel.form, _dirty: false }
    } else {
      const res = await $fetch<{ id: string }>('/api/backend/records', { method: 'POST', body: payload })
      eventMap.value[k][panel.rt] = { ...cur, ...panel.form, _id: res.id, _new: false, _dirty: false }
    }
    panel.open = false
  } catch {
    alert('저장 실패')
  } finally {
    panel.saving = false
  }
}
function onPanelPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  if (!text.includes('\t')) return
  const cells = text.split('\t').map(c => c.trim().replace(/\r?\n.*$/s, ''))
  PASTE_FIELDS.forEach((f, i) => {
    if (i >= cells.length) return
    let v = cells[i]
    if (f === 'time') v = fmtTime(v)
    if (f === 'datetime') v = fmtDate(v)
    ;(panel.form as any)[f] = v
  })
}

// ── Country modal ─────────────────────────────────────────────────
function openCtry(gender: string, stroke: string, dist: number, rt: string) {
  ctry.cur = { gender, stroke, dist, rt }
  ctry.q = ''; ctry.fromPanel = false
  ctry.open = true
  nextTick(() => ctryInputRef.value?.focus())
}
function openCtryPanel() {
  ctry.cur = { gender: panel.gender, stroke: panel.stroke, dist: panel.dist, rt: panel.rt }
  ctry.q = ''; ctry.fromPanel = true
  ctry.open = true
  nextTick(() => ctryInputRef.value?.focus())
}
function pickCtry(c: Country) {
  if (!ctry.cur) return
  if (ctry.fromPanel) {
    panel.form.nationality = c.ioc
    panel.form.nation_code = c.flag
  } else {
    const { gender, stroke, dist, rt } = ctry.cur
    setVal(gender, stroke, dist, rt, 'nationality', c.ioc)
    setVal(gender, stroke, dist, rt, 'nation_code', c.flag)
  }
  ctry.open = false
}

// ── CSV ───────────────────────────────────────────────────────────
function exportCSV() {
  const header = ['event_key','type','time','name','nationality','nation_code','year','datetime','age','sido','competitionName','pool']
  const rows = [header]
  for (const tab of TABS) {
    for (const dist of STROKE_DISTS[tab.stroke]) {
      for (const rt of rtList(tab.stroke, dist)) {
        const e = entry(tab.gender, tab.stroke, dist, rt)
        rows.push([mkKey(tab.gender, tab.stroke, dist), rt, e.time, e.name, e.nationality, e.nation_code, e.year, e.datetime, e.age, e.sido, e.competitionName, e.pool])
      }
    }
  }
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `ksr_records_all.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ── Modal (scoring + compare overlay) ────────────────────────────
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
  const overlay: Record<string, Record<string, any>> = {}
  for (const [cKey, rec] of Object.entries(canonData.value)) {
    // cKey: "M-FR-50-WR" → overlayKey: "M-FR-50-LCM"
    const parts = cKey.split('-')
    if (parts.length < 4) continue
    const [g, style, distStr, type] = parts
    const dist = parseInt(distStr)
    const overlayKey = `${g}-${style}-${dist}-LCM`
    if (!overlay[overlayKey]) overlay[overlayKey] = {}
    overlay[overlayKey][type] = {
      time:   scoring.parseTime(rec.time),
      holder: rec.athlete || undefined,
      nation: rec.nation  || undefined,
      year:   rec.year    ? parseInt(String(rec.year)) : null,
      venue:  rec.venue   || undefined,
    }
  }
  scoring.injectOverlay(overlay)
}

function openModal(e: MouseEvent, gender: string, stroke: string, dist: number, rt: string) {
  const modal = (window as any).KSR_MODAL
  if (!modal) return
  const ent = entry(gender, stroke, dist, rt)
  if (!ent.time) return
  const gCode = gender === 'men' ? 'M' : 'W'
  const style = STROKE_TO_STYLE[stroke]
  modal.open({
    gender:      gCode,
    stroke:      style,
    distance:    dist,
    course:      'LCM',
    time:        ent.time,
    attribution: {
      athlete: ent.name             || null,
      nation:  ent.nationality      || null,
      year:    ent.year             || null,
      date:    ent.datetime         || null,
      venue:   ent.competitionName  || null,
    },
  })
}

onMounted(() => {
  loadScript('/cannon/js/scoring.js')
    .then(() => loadScript('/cannon/js/modal.js'))
    .then(() => injectCompareOverlay())
    .catch(err => console.error('[records] script load error', err))
})

async function importCSV(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const text = await file.text()
  const lines = text.replace(/^﻿/, '').trim().split('\n')
  if (lines.length < 2) return
  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map(c => c.replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    header.forEach((h, idx) => { row[h] = cells[idx] ?? '' })
    const k = row.event_key; const rt = row.type
    if (!k || !rt || !eventMap.value[k]?.[rt]) continue
    const cur = eventMap.value[k][rt]
    eventMap.value[k][rt] = { ...cur, time: row.time, name: row.name, nationality: row.nationality, nation_code: row.nation_code, year: row.year, datetime: row.datetime, age: row.age, sido: row.sido, competitionName: row.competitionName, pool: row.pool, _dirty: true }
  }
  if (importFileRef.value) importFileRef.value.value = ''
}
</script>

<style scoped>
.rc-root { font-family: var(--sans); }

/* ── Jump nav ── */
.rc-jumps {
  display: flex; gap: 20px; flex-wrap: wrap; align-items: center;
}
.rc-jumps a {
  font-size: 13px; color: #555; text-decoration: none; padding: 4px 0;
  border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.rc-jumps a:hover { color: #0a1d3a; border-bottom-color: #0a1d3a; }

/* ── Toolbar ── */
.rc-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; gap: 12px; flex-wrap: wrap;
}
.rc-bar-right { display: flex; gap: 8px; }
.btn-csv-ex, .btn-csv-im {
  height: 32px; padding: 0 14px; border: 1px solid #ddd; background: #fff;
  font-size: 12px; color: #555; cursor: pointer; border-radius: 3px;
}
.btn-csv-ex:hover, .btn-csv-im:hover { background: #f5f5f3; }

/* ── Info box ── */
.rc-info {
  padding: 14px 18px; background: #fafaf8; border: 1px solid #e8e8e4;
  border-radius: 3px; font-size: 12.5px; color: #555; line-height: 1.8;
  margin-bottom: 24px;
}
.rc-info strong { color: #0a0a0a; }

/* ── Body layout ── */
.rc-body {
  display: flex; gap: 0; align-items: flex-start;
  transition: gap 0.2s;
}
.rc-content { flex: 1; min-width: 0; transition: all 0.2s; }

/* ── Loading ── */
.rc-loading { padding: 60px; text-align: center; color: #aaa; }

/* ── Sections ── */
.rc-section { margin-bottom: 48px; scroll-margin-top: 80px; }
.rc-section-head {
  display: flex; align-items: baseline; gap: 16px;
  padding: 10px 0 8px; border-bottom: 2px solid #0a0a0a; margin-bottom: 0;
}
.rc-ev-label { font-size: 18px; font-weight: 700; color: #0a0a0a; font-family: var(--serif-ko); }
.rc-ev-slug  { font-size: 11px; color: #bbb; font-family: var(--mono); letter-spacing: 0.04em; }

.rc-table-wrap { overflow-x: auto; }
.rc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.rc-table thead th {
  padding: 7px 10px; background: #f8f8f6; border-bottom: 1px solid #e8e8e4;
  font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: #aaa; text-align: left; white-space: nowrap;
}
.rc-table tbody tr { border-bottom: 1px solid #f0f0ee; cursor: pointer; }
.rc-table tbody tr:last-child { border-bottom: 0; }
.rc-table tbody tr.row-empty td:not(.td-type) { opacity: 0.4; }
.rc-table tbody tr.row-dirty { background: #fffbeb; }
.rc-table tbody tr.row-clickable:hover { background: #f0f5ff; }
.rc-table tbody tr.row-dirty:hover { background: #fef3c7; }
.rc-table tbody tr.row-selected { background: #dbeafe !important; }
.rc-table tbody td { padding: 7px 10px; vertical-align: middle; color: #222; white-space: nowrap; }
td.mono { font-family: var(--mono); font-size: 12.5px; }
td.bold { font-weight: 600; }
td.dim  { color: #777; font-size: 12px; }

/* ── Type label col ── */
.td-type  { padding: 6px 10px !important; white-space: nowrap; width: 130px; }
.rt-code  { font-family: var(--mono); font-size: 12px; font-weight: 700; color: #0a0a0a; margin-right: 6px; }
.rt-lbl   { font-size: 11.5px; color: #888; }

/* ── Column widths (original) ── */
.th-type  { width: 130px; }
.th-time  { width: 96px; }
.th-name  { min-width: 110px; }
.th-nat   { width: 60px; }
.th-flag  { width: 36px; }
.th-year  { width: 58px; }
.th-date  { width: 108px; }
.th-age   { width: 72px; }
.th-sido  { width: 80px; }
.th-meet  { min-width: 160px; }
.th-pool  { min-width: 100px; }
.td-flag  { font-size: 18px; padding: 4px 6px !important; }

/* ── Matrix table ── */
.rc-matrix { min-width: 900px; }
.rc-matrix thead th { padding: 8px 10px; border-right: 1px solid #e8e8e4; }
.rc-matrix thead th:last-child { border-right: 0; }
.th-dist { width: 72px; text-align: center; }
.th-gen  { width: 52px; }
.th-rt   { min-width: 120px; }
.th-rt .rt-code { display: block; font-size: 11px; font-weight: 700; color: #0a0a0a; letter-spacing: 0.1em; }
.th-rt .rt-lbl  { display: block; margin-top: 2px; font-size: 10px; font-weight: 400; color: #aaa; text-transform: none; letter-spacing: 0; }
.td-dist {
  font-family: var(--mono); font-size: 18px; font-weight: 600; color: #0a0a0a;
  text-align: center; vertical-align: middle; background: #fafaf8;
  border-right: 1px solid #e8e8e4; padding: 0 !important;
}
.td-gen {
  font-size: 11px; color: #888; letter-spacing: 0.12em; white-space: nowrap;
  border-right: 1px solid #eee; padding: 6px 8px !important;
}
.td-rec {
  padding: 6px 10px !important; vertical-align: top; cursor: pointer;
  border-right: 1px solid #f0f0ee;
  transition: background 0.1s;
}
.td-rec:last-child { border-right: 0; }
.td-rec:hover:not(.rec-na) { background: #f0f5ff; }
.td-rec.rec-na    { color: #ccc; text-align: center; cursor: default; }
.td-rec.rec-empty { color: #ccc; text-align: center; }
.td-rec.rec-dirty { background: #fffbeb; }
.td-rec.rec-sel   { background: #dbeafe !important; }
.rec-time {
  display: block; font-family: var(--mono); font-size: 13px; font-weight: 600;
  color: #0a0a0a; cursor: pointer; border-bottom: 1px dashed #999;
  transition: color 0.12s, border-color 0.12s; white-space: nowrap;
}
.rec-time:hover { color: #1d4ed8; border-bottom-color: #1d4ed8; }
.rec-who  { display: block; font-size: 11px; color: #888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.rec-when { display: block; font-size: 10px; color: #bbb; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.rc-matrix tbody tr.gender-m { border-bottom: 1px dashed #eee; }
.rc-matrix tbody tr.gender-w { border-bottom: 1px solid #e8e8e4; }

/* ── Inputs ── */
.inp {
  width: 100%; height: 32px; padding: 0 8px; border: 0;
  background: transparent; font-family: var(--sans); font-size: 13px;
  color: #0a0a0a; outline: none;
  transition: background 0.1s;
}
.inp:focus { background: #eff6ff; border-radius: 2px; }
.inp::placeholder { color: #ccc; }
.inp-time { font-family: var(--mono); }
.inp-date { font-family: var(--mono); }
.inp-year { font-family: var(--mono); }

/* ── Nationality button ── */
.inp-nat {
  display: block; width: 100%; height: 32px; padding: 0 8px;
  border: 0; background: transparent; text-align: left; cursor: pointer;
  font-family: var(--mono); font-size: 12.5px; font-weight: 700; color: #0a0a0a;
  transition: background 0.1s; border-radius: 2px;
}
.inp-nat:hover { background: #eff6ff; }

/* ── Country modal ── */
.cm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 400;
  display: flex; align-items: center; justify-content: center;
}
.cm-box {
  background: #fff; border-radius: 6px; box-shadow: 0 16px 48px rgba(0,0,0,0.2);
  width: 480px; max-width: 95vw; display: flex; flex-direction: column;
  max-height: 80vh;
}
.cm-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px; border-bottom: 1px solid #eee;
  font-size: 14px; font-weight: 600; color: #0a0a0a; flex-shrink: 0;
}
.cm-head button {
  border: 0; background: transparent; font-size: 17px; color: #aaa;
  cursor: pointer; padding: 0 4px;
}
.cm-search {
  flex-shrink: 0; height: 40px; padding: 0 16px;
  border: 0; border-bottom: 1px solid #eee;
  font-family: var(--sans); font-size: 13.5px; outline: none; width: 100%;
}
.cm-list { overflow-y: auto; flex: 1; }
.cm-item {
  display: grid; grid-template-columns: 32px 1fr 1fr 52px;
  align-items: center; gap: 8px; width: 100%;
  padding: 8px 16px; border: 0; background: transparent;
  font-family: var(--sans); font-size: 13px; text-align: left;
  cursor: pointer; transition: background 0.1s; color: #222;
}
.cm-item:hover  { background: #f5f5f3; }
.cm-item.active { background: #eff6ff; }
.ci-flag { font-size: 18px; }
.ci-ko   { font-size: 13px; color: #0a0a0a; }
.ci-en   { font-size: 11.5px; color: #888; }
.ci-code { font-size: 11px; font-weight: 700; color: #555; text-align: right; }

/* ── Edit panel ── */
.ep-panel {
  width: 300px; flex-shrink: 0;
  border-left: 1px solid #e0e0e0; background: #fff;
  display: flex; flex-direction: column;
  position: sticky; top: 0; max-height: 100vh; overflow: hidden;
  box-shadow: -4px 0 16px rgba(0,0,0,0.06);
  animation: ep-slide-in 0.18s ease;
}
@keyframes ep-slide-in {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
.ep-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 16px 12px; border-bottom: 1px solid #eee; flex-shrink: 0;
  background: #0a1d3a;
}
.ep-rt   { font-size: 15px; font-weight: 700; color: #fff; }
.ep-rt .rt-code { color: #93c5fd; }
.ep-sub  { font-size: 11px; color: #94a3b8; margin-top: 3px; }
.ep-close {
  border: 0; background: transparent; color: #94a3b8;
  font-size: 18px; cursor: pointer; padding: 0; line-height: 1;
  flex-shrink: 0; margin-top: 2px;
}
.ep-close:hover { color: #fff; }
.ep-body { flex: 1; overflow-y: auto; padding: 12px 16px; }
.ep-field { margin-bottom: 12px; }
.ep-field label {
  display: block; font-size: 10.5px; font-weight: 600; color: #888;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;
}
.ep-inp {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid #e0e0e0; border-radius: 3px;
  font-family: var(--sans); font-size: 13px; color: #0a0a0a;
  background: #fff; outline: none; box-sizing: border-box;
  transition: border-color 0.15s;
}
.ep-inp:focus { border-color: #3b82f6; }
.ep-inp-mono { font-family: var(--mono); }
.ep-nat-row { display: flex; gap: 6px; align-items: center; }
.ep-nat-btn {
  flex: 1; height: 34px; padding: 0 10px;
  border: 1px solid #e0e0e0; border-radius: 3px; background: #fff;
  font-family: var(--mono); font-size: 13px; color: #0a0a0a;
  text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: border-color 0.15s;
}
.ep-nat-btn:hover { border-color: #3b82f6; }
.ep-flag { font-size: 16px; }
.ep-nat-code { font-weight: 700; }
.ep-nat-clear {
  height: 34px; width: 34px; border: 1px solid #e0e0e0; border-radius: 3px;
  background: #fff; color: #aaa; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ep-nat-clear:hover { color: #ef4444; border-color: #ef4444; }
.ep-foot {
  padding: 12px 16px; border-top: 1px solid #eee; display: flex; gap: 8px;
  flex-shrink: 0;
}
.ep-btn-save {
  flex: 1; height: 36px; background: #0a1d3a; color: #fff; border: 0;
  font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 3px;
  transition: background 0.15s;
}
.ep-btn-save:hover { background: #1e3a5f; }
.ep-btn-cancel {
  height: 36px; padding: 0 16px; border: 1px solid #ddd; background: #fff;
  font-size: 13px; color: #555; cursor: pointer; border-radius: 3px;
}
.ep-btn-cancel:hover { background: #f5f5f3; }

/* ── Time trigger ── */
.td-time .time-trigger {
  cursor: pointer;
  border-bottom: 1px dashed #999;
  transition: color 0.12s, border-color 0.12s;
}
.td-time .time-trigger:hover {
  color: #1d4ed8;
  border-bottom-color: #1d4ed8;
}
</style>
