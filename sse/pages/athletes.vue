<template>
  <div>
    <!-- METRICS -->
    <div class="metrics-4">
      <div class="metric">
        <div class="metric-label">상장 선수</div>
        <div class="metric-val" style="color:var(--ink);">24명</div>
        <div class="metric-sub" style="color:var(--ink-muted);">시즌 1 기준</div>
      </div>
      <div class="metric">
        <div class="metric-label">주간 상승</div>
        <div class="metric-val up">16명</div>
        <div class="metric-sub up">▲ 전체의 67%</div>
      </div>
      <div class="metric">
        <div class="metric-label">주간 하락</div>
        <div class="metric-val down">6명</div>
        <div class="metric-sub down">▼ 결석·부상 포함</div>
      </div>
      <div class="metric">
        <div class="metric-label">이번 주 PB</div>
        <div class="metric-val blue">5명</div>
        <div class="metric-sub blue">최고 +30%</div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="filter-bar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          class="search-input"
          type="text"
          placeholder="선수 이름 검색..."
        >
      </div>
      <select v-model="gradeFilter" class="filter-select">
        <option value="">등급 전체</option>
        <option value="대형주">🥇 대형주</option>
        <option value="중형주">📈 중형주</option>
        <option value="중소형주">🌱 중소형주</option>
        <option value="스타트업">🚀 스타트업</option>
      </select>
      <select v-model="sortBy" class="filter-select">
        <option value="price">주가 높은순</option>
        <option value="change">상승률 높은순</option>
        <option value="record">기록 빠른순</option>
        <option value="index">지수 높은순</option>
      </select>
      <button class="ipo-btn">+ IPO 신청</button>
    </div>

    <!-- TAB PILLS -->
    <div class="tab-pills">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tp"
        :class="{ act: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}<span class="tp-cnt">{{ tab.count }}</span>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-wrap">
      <div class="table-head">
        <div class="th">#</div>
        <div class="th">선수</div>
        <div class="th">등급</div>
        <div class="th">주가 <span class="th-sort act desc"></span></div>
        <div class="th">주간 변동</div>
        <div class="th">기록</div>
        <div class="th">종합 지수</div>
        <div class="th">투자</div>
      </div>

      <div>
        <div
          v-for="p in visiblePlayers"
          :key="p.rank"
          class="tr"
          :class="{ me: p.me }"
          @click="openDrawer(p)"
        >
          <div class="td-rank" :class="p.rankClass">{{ p.rank }}</div>
          <div class="td-player">
            <div class="pl-av" :style="{ background: p.avBg, color: p.avFg }">{{ p.letter }}</div>
            <div>
              <div class="pl-name">
                {{ p.name }}
                <span v-if="p.me" class="pl-me">나</span>
                <span v-if="p.isNew" class="pl-new">신규</span>
              </div>
              <div class="pl-sub">{{ p.sub }}</div>
            </div>
          </div>
          <div class="td"><span class="grade-badge" :class="p.gradeClass">{{ p.grade }}</span></div>
          <div class="td mono" style="font-weight:500;" :style="p.me ? { color: 'var(--blue)' } : {}">{{ p.price }}</div>
          <div class="td mono" style="font-weight:500;" :class="p.isUp ? 'up' : 'down'">
            {{ p.isUp ? '▲' : '▼' }} {{ p.changePct }}%
          </div>
          <div class="td mono">{{ p.record }}</div>
          <div class="td">
            <div class="index-bar-wrap">
              <div class="index-bar">
                <div class="index-fill" :style="{ width: p.index + '%', background: p.indexColor }"></div>
              </div>
              <span class="index-score">{{ p.index }}</span>
            </div>
          </div>
          <div class="td">
            <button
              v-if="p.self"
              class="invest-btn-sm"
              style="color:var(--ink-muted);border-color:var(--border);"
              @click.stop
            >본인</button>
            <button
              v-else
              class="invest-btn-sm"
              :class="{ invested: p.invested }"
              @click.stop="invest(p)"
            >{{ p.invested ? '투자중' : '투자하기' }}</button>
          </div>
        </div>
      </div>

      <!-- PAGINATION -->
      <div class="pagination">
        <div class="page-info">1–8 / 24명 표시 중</div>
        <div class="page-btns">
          <button class="page-btn">‹</button>
          <button class="page-btn" :class="{ act: page === 1 }" @click="page = 1">1</button>
          <button class="page-btn" :class="{ act: page === 2 }" @click="page = 2">2</button>
          <button class="page-btn" :class="{ act: page === 3 }" @click="page = 3">3</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>

    <!-- DETAIL DRAWER -->
    <div class="drawer-backdrop" :class="{ open: drawerOpen }" @click="closeDrawer"></div>
    <div class="drawer" :class="{ open: drawerOpen }">
      <div v-if="selected" class="drawer-head">
        <div class="drawer-av" :style="{ background: selected.avBg, color: selected.avFg }">{{ selected.letter }}</div>
        <div>
          <div class="drawer-name">{{ selected.name }}</div>
          <div class="drawer-sub">{{ selected.age }} · {{ selected.grade }}</div>
        </div>
        <button class="drawer-close" @click="closeDrawer">✕</button>
      </div>
      <div v-if="selected" class="drawer-body">
        <div class="drawer-price">
          <div class="dp-label">현재 주가</div>
          <div class="dp-price">{{ selected.price }} 코인</div>
          <div class="dp-change">{{ selected.isUp ? '▲' : '▼' }} {{ selected.isUp ? '+' : '-' }}{{ selected.changePct }}% 이번 주</div>
        </div>
        <div class="drawer-section">
          <div class="ds-title">기본 정보</div>
          <div class="ds-row"><span class="ds-label">현재 기록</span><span class="ds-val">{{ selected.record }}</span></div>
          <div class="ds-row"><span class="ds-label">종합 지수</span><span class="ds-val">{{ selected.index }}점</span></div>
          <div class="ds-row"><span class="ds-label">등급</span><span class="ds-val">{{ selected.grade }}</span></div>
          <div class="ds-row"><span class="ds-label">IPO 공모가</span><span class="ds-val">1,000 코인</span></div>
        </div>
        <div class="drawer-section">
          <div class="ds-title">지수 구성</div>
          <div class="index-row-d"><div class="ir-label">현재 실적</div><div class="ir-track"><div class="ir-fill" style="width:75%;background:var(--blue);"></div></div><div class="ir-val">75</div></div>
          <div class="index-row-d"><div class="ir-label">성장성</div><div class="ir-track"><div class="ir-fill" style="width:60%;background:var(--teal);"></div></div><div class="ir-val">60</div></div>
          <div class="index-row-d"><div class="ir-label">훈련 투자</div><div class="ir-track"><div class="ir-fill" style="width:90%;background:var(--amber);"></div></div><div class="ir-val">90</div></div>
          <div class="index-row-d"><div class="ir-label">시장 지위</div><div class="ir-track"><div class="ir-fill" style="width:70%;background:var(--purple);"></div></div><div class="ir-val">70</div></div>
        </div>
        <div class="drawer-section">
          <div class="ds-title">최근 이벤트</div>
          <div class="ds-row"><span class="ds-label">PB 달성 (5월 10일)</span><span class="ds-val up">+30%</span></div>
          <div class="ds-row"><span class="ds-label">대회 출전 (4월 20일)</span><span class="ds-val up">+10%</span></div>
        </div>
        <NuxtLink class="drawer-invest-btn" to="/my-stock">
          {{ selected.invested ? '✓ 투자중 · 추가 투자하기' : '이 선수에게 투자하기 →' }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '선수 목록 — Medalbank SSE' })

interface Player {
  rank: string
  rankClass: string
  letter: string
  avBg: string
  avFg: string
  name: string
  sub: string
  age: string
  me?: boolean
  isNew?: boolean
  self?: boolean
  grade: string
  gradeClass: string
  price: string
  isUp: boolean
  changePct: number
  record: string
  index: number
  indexColor: string
  invested: boolean
}

const players = reactive<Player[]>([
  { rank: '1', rankClass: 'g', letter: '최', avBg: '#FDF4E3', avFg: '#B06A00', name: '최○○', sub: '34세 · 개근 11주', age: '34세', grade: '대형주', gradeClass: 'gb-large', price: '2,100', isUp: true, changePct: 30, record: '32.1초', index: 88, indexColor: 'var(--blue)', invested: true },
  { rank: '2', rankClass: 's', letter: '박', avBg: '#F1EFE8', avFg: '#5F5E5A', name: '박○○', sub: '42세 · 개근 20주', age: '42세', grade: '중형주', gradeClass: 'gb-mid', price: '1,890', isUp: true, changePct: 8, record: '43.8초', index: 72, indexColor: 'var(--teal)', invested: false },
  { rank: '3', rankClass: 'b', letter: '이', avBg: '#E4F5F2', avFg: '#0A7A6A', name: '이○○', sub: '15세 · IPO 3주차', age: '15세', isNew: true, grade: '중형주', gradeClass: 'gb-mid', price: '1,405', isUp: true, changePct: 15, record: '40.2초', index: 70, indexColor: 'var(--teal)', invested: true },
  { rank: '4', rankClass: '', letter: '강', avBg: '#E8F2FC', avFg: '#0D4F8B', name: '강○○', sub: '28세 · 개근 6주', age: '28세', grade: '중형주', gradeClass: 'gb-mid', price: '1,460', isUp: true, changePct: 5, record: '41.5초', index: 65, indexColor: 'var(--blue)', invested: false },
  { rank: '5', rankClass: 'me', letter: '김', avBg: '#E8F2FC', avFg: '#0D4F8B', name: '김○○', sub: '25세 · 개근 11주', age: '25세', me: true, self: true, grade: '중형주', gradeClass: 'gb-mid', price: '1,440', isUp: true, changePct: 20, record: '45.8초', index: 70, indexColor: 'var(--blue)', invested: false },
  { rank: '6', rankClass: '', letter: '정', avBg: '#FBEAF0', avFg: '#9B2C6C', name: '정○○', sub: '38세 · 결석 3주', age: '38세', grade: '중소형주', gradeClass: 'gb-small', price: '980', isUp: false, changePct: 5, record: '47.3초', index: 52, indexColor: 'var(--amber)', invested: false },
  { rank: '7', rankClass: '', letter: '강', avBg: '#E1F5EE', avFg: '#085041', name: '강○○', sub: '19세 · 패스트트랙', age: '19세', grade: '중소형주', gradeClass: 'gb-small', price: '870', isUp: false, changePct: 10, record: '49.1초', index: 48, indexColor: 'var(--amber)', invested: true },
  { rank: '8', rankClass: '', letter: '윤', avBg: '#F0EEFF', avFg: '#5B21B6', name: '윤○○', sub: '12세 · IPO 2주차', age: '12세', isNew: true, grade: '스타트업', gradeClass: 'gb-startup', price: '700', isUp: true, changePct: 5, record: '54.6초', index: 62, indexColor: 'var(--purple)', invested: true },
])

const tabs = [
  { key: 'all', label: '전체', count: 24 },
  { key: 'up', label: '📈 상승', count: 16 },
  { key: 'down', label: '📉 하락', count: 6 },
  { key: 'invested', label: '💼 내 투자', count: 5 },
  { key: 'new', label: '✨ 신규 IPO', count: 2 },
]

const search = ref('')
const gradeFilter = ref('')
const sortBy = ref('price')
const activeTab = ref('all')
const page = ref(1)

const visiblePlayers = computed(() =>
  players.filter((p) => {
    if (search.value && !p.name.toLowerCase().includes(search.value.toLowerCase())) return false
    if (gradeFilter.value && p.grade !== gradeFilter.value) return false
    if (activeTab.value === 'up' && !p.isUp) return false
    if (activeTab.value === 'down' && p.isUp) return false
    if (activeTab.value === 'invested' && !p.invested) return false
    if (activeTab.value === 'new' && !p.isNew) return false
    return true
  }),
)

function invest(p: Player) {
  p.invested = true
}

const drawerOpen = ref(false)
const selected = ref<Player | null>(null)

function openDrawer(p: Player) {
  selected.value = p
  drawerOpen.value = true
}
function closeDrawer() {
  drawerOpen.value = false
}
</script>

<style scoped>
/* METRICS */
.metrics-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.blue { color: var(--blue); }

/* SEARCH & FILTER BAR */
.filter-bar { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--ink-muted); }
.search-input { width: 100%; padding: 8px 10px 8px 32px; font-size: 13px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-soft); color: var(--ink); font-family: var(--sans); outline: none; }
.search-input:focus { border-color: var(--blue); }
.filter-select { font-size: 12px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-soft); color: var(--ink-soft); font-family: var(--sans); cursor: pointer; outline: none; }
.filter-select:focus { border-color: var(--blue); }
.ipo-btn { font-size: 12px; font-weight: 500; color: #fff; background: var(--blue); border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-family: var(--sans); white-space: nowrap; }

/* TAB PILLS */
.tab-pills { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.tp { font-size: 12px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); color: var(--ink-soft); cursor: pointer; background: var(--surface); transition: all 0.12s; }
.tp:hover { background: var(--surface-soft); }
.tp.act { background: var(--blue); color: #fff; border-color: var(--blue); }
.tp-cnt { font-size: 10px; font-family: var(--mono); margin-left: 4px; opacity: 0.8; }

/* TABLE */
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.table-head { display: grid; grid-template-columns: 40px 1fr 72px 90px 90px 90px 100px 90px; gap: 0; background: var(--surface-alt); border-bottom: 1px solid var(--border); padding: 10px 16px; }
.th { font-size: 10px; color: var(--ink-muted); font-weight: 600; letter-spacing: 0.04em; display: flex; align-items: center; gap: 3px; cursor: pointer; user-select: none; }
.th:hover { color: var(--ink-soft); }
.th-sort { font-size: 10px; color: var(--ink-muted); }
.th-sort.asc::after { content: '▲'; }
.th-sort.desc::after { content: '▼'; }
.th-sort.act { color: var(--blue); }

.tr { display: grid; grid-template-columns: 40px 1fr 72px 90px 90px 90px 100px 90px; gap: 0; padding: 10px 16px; border-bottom: 1px solid var(--border-light); align-items: center; cursor: pointer; transition: background 0.1s; }
.tr:last-child { border-bottom: none; }
.tr:hover { background: var(--surface-soft); }
.tr.me { background: var(--blue-pale); }
.tr.me:hover { background: #E0EDFA; }

.td-rank { font-size: 12px; font-weight: 500; font-family: var(--mono); text-align: center; color: var(--ink-muted); }
.td-rank.g { color: #B06A00; }
.td-rank.s { color: #5A6B7B; }
.td-rank.b { color: #7B5E3A; }
.td-rank.me { color: var(--blue); }

.td-player { display: flex; align-items: center; gap: 10px; }
.pl-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.pl-name { font-size: 13px; font-weight: 500; color: var(--ink); }
.pl-sub { font-size: 10px; color: var(--ink-muted); margin-top: 1px; }
.pl-me { font-size: 9px; color: var(--blue); font-weight: 500; margin-left: 4px; }
.pl-new { font-size: 9px; color: var(--teal); background: var(--teal-light); border-radius: 4px; padding: 1px 5px; margin-left: 4px; }

.td { font-size: 12px; color: var(--ink); }
.td.mono { font-family: var(--mono); }

.grade-badge { font-size: 10px; padding: 3px 8px; border-radius: 5px; font-weight: 500; display: inline-block; }
.gb-large { background: var(--blue-light); color: var(--blue); }
.gb-mid { background: var(--teal-light); color: var(--teal); }
.gb-small { background: var(--amber-light); color: var(--amber); }
.gb-startup { background: var(--purple-light); color: var(--purple); }

.index-bar-wrap { display: flex; align-items: center; gap: 6px; }
.index-bar { flex: 1; height: 5px; background: var(--surface-alt); border-radius: 3px; overflow: hidden; max-width: 60px; }
.index-fill { height: 100%; border-radius: 3px; }
.index-score { font-size: 11px; font-family: var(--mono); color: var(--ink-muted); }

.invest-btn-sm { font-size: 11px; padding: 5px 12px; border-radius: 6px; border: 1px solid var(--blue); color: var(--blue); background: none; cursor: pointer; font-family: var(--sans); transition: all 0.12s; white-space: nowrap; }
.invest-btn-sm:hover { background: var(--blue-light); }
.invest-btn-sm.invested { background: var(--blue-light); color: var(--blue); border-color: var(--blue-light); }

/* PAGINATION */
.pagination { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-top: 1px solid var(--border-light); }
.page-info { font-size: 12px; color: var(--ink-muted); }
.page-btns { display: flex; gap: 4px; }
.page-btn { font-size: 12px; padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--ink-soft); cursor: pointer; font-family: var(--sans); }
.page-btn:hover { background: var(--surface-soft); }
.page-btn.act { background: var(--blue); color: #fff; border-color: var(--blue); }

/* DETAIL DRAWER */
.drawer-backdrop { position: fixed; inset: 0; background: rgba(15,25,35,0.3); z-index: 200; display: none; }
.drawer-backdrop.open { display: block; }
.drawer { position: fixed; top: 0; right: -420px; width: 420px; bottom: 0; background: var(--surface); border-left: 1px solid var(--border); z-index: 201; transition: right 0.25s ease; overflow-y: auto; }
.drawer.open { right: 0; }
.drawer-head { padding: 20px 24px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 14px; }
.drawer-av { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; flex-shrink: 0; }
.drawer-name { font-size: 16px; font-weight: 500; color: var(--ink); }
.drawer-sub { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }
.drawer-close { margin-left: auto; font-size: 18px; cursor: pointer; color: var(--ink-muted); background: none; border: none; padding: 4px 8px; }
.drawer-body { padding: 20px 24px; }
.drawer-price { background: var(--blue); border-radius: 10px; padding: 16px 18px; margin-bottom: 18px; }
.dp-label { font-size: 10px; color: rgba(255,255,255,0.6); margin-bottom: 4px; letter-spacing: 0.04em; }
.dp-price { font-family: var(--mono); font-size: 28px; font-weight: 500; color: #fff; }
.dp-change { font-size: 13px; color: #4ADE80; font-family: var(--mono); margin-top: 3px; }
.drawer-section { margin-bottom: 18px; }
.ds-title { font-size: 11px; font-weight: 600; color: var(--ink-muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }
.ds-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--border-light); }
.ds-row:last-child { border-bottom: none; }
.ds-label { font-size: 12px; color: var(--ink-soft); }
.ds-val { font-size: 13px; font-weight: 500; color: var(--ink); font-family: var(--mono); }
.drawer-invest-btn { display: block; width: 100%; text-align: center; font-size: 14px; font-weight: 500; color: #fff; background: var(--blue); border: none; border-radius: 10px; padding: 13px; cursor: pointer; font-family: var(--sans); }
.index-row-d { display: grid; grid-template-columns: 100px 1fr 40px; gap: 8px; align-items: center; margin-bottom: 8px; }
.ir-label { font-size: 11px; color: var(--ink-soft); }
.ir-track { height: 6px; background: var(--surface-alt); border-radius: 4px; overflow: hidden; }
.ir-fill { height: 100%; border-radius: 4px; }
.ir-val { font-size: 11px; font-family: var(--mono); color: var(--ink-muted); text-align: right; }
</style>
