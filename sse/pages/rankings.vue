<template>
  <div>
    <!-- SEASON BANNER -->
    <div class="season-banner">
      <div class="sb-deco1"></div><div class="sb-deco2"></div>
      <div class="sbn-left">
        <div class="sbn-eyebrow">2026 시즌 1 · 진행 중</div>
        <div class="sbn-title">평영인의 밤까지</div>
        <div class="sbn-sub">2026년 1월 1일 — 12월 31일 · 22주 경과</div>
      </div>
      <div class="sbn-right">
        <div class="sbn-stat"><div class="sbn-val">24명</div><div class="sbn-label">참여 선수</div></div>
        <div class="sbn-stat"><div class="sbn-val">22주</div><div class="sbn-label">경과</div></div>
        <div class="sbn-dday">
          <div class="sbn-dday-val">D-223</div>
          <div class="sbn-dday-label">평영인의 밤</div>
        </div>
      </div>
    </div>

    <!-- D-DAY PROGRESS -->
    <div class="dday-card">
      <div class="dc-head">
        <div class="dc-title">시즌 진행률</div>
        <div class="dc-badge">42% 경과</div>
      </div>
      <div class="dc-track"><div class="dc-fill"></div></div>
      <div class="dc-labels">
        <span>시즌 시작 · 1월 1일</span>
        <span>현재 · 5월 22일</span>
        <span>평영인의 밤 · 12월 31일</span>
      </div>
    </div>

    <!-- MAIN TABS -->
    <div class="main-tab-bar">
      <button class="mtab act">🏊 선수 랭킹</button>
      <NuxtLink class="mtab" to="/investor-ranking">⭐ 투자자 랭킹</NuxtLink>
    </div>

    <!-- PLAYER SECTION -->
    <div>
      <div class="sub-tabs">
        <div
          v-for="(tab, i) in subTabs"
          :key="tab"
          class="stab"
          :class="{ act: activeSub === i }"
          @click="activeSub = i"
        >{{ tab }}</div>
      </div>

      <div class="metrics-4">
        <div class="metric">
          <div class="metric-label">1위 선수</div>
          <div class="metric-val" style="color:var(--amber);font-size:16px;">최○○</div>
          <div class="metric-sub amber">2,100 코인</div>
        </div>
        <div class="metric">
          <div class="metric-label">내 순위</div>
          <div class="metric-val blue">5위</div>
          <div class="metric-sub up">▲ 지난주 대비 +2위</div>
        </div>
        <div class="metric">
          <div class="metric-label">시즌 최고 상승률</div>
          <div class="metric-val up">+30%</div>
          <div class="metric-sub" style="color:var(--ink-muted);">최○○ 이번 주</div>
        </div>
        <div class="metric">
          <div class="metric-label">PB 달성 선수</div>
          <div class="metric-val" style="color:var(--ink);">5명</div>
          <div class="metric-sub" style="color:var(--ink-muted);">이번 주 기준</div>
        </div>
      </div>

      <!-- PODIUM -->
      <div class="podium-wrap">
        <div class="pod">
          <div class="pod-av" style="background:#D3D1C7;color:#2C2C2A;">박</div>
          <div class="pod-name">박○○</div>
          <div class="pod-val">1,890</div>
          <div class="pod-block p2-block"><div class="pod-medal">🥈</div><div class="pod-rank">2</div></div>
        </div>
        <div class="pod">
          <div class="pod-av" style="background:#FDF4E3;color:#B06A00;">최</div>
          <div class="pod-name">최○○</div>
          <div class="pod-val">2,100</div>
          <div class="pod-block p1-block"><div class="pod-medal">🥇</div><div class="pod-rank">1</div></div>
        </div>
        <div class="pod">
          <div class="pod-av" style="background:#E4F5F2;color:#0A7A6A;">이</div>
          <div class="pod-name">이○○</div>
          <div class="pod-val">1,405</div>
          <div class="pod-block p3-block"><div class="pod-medal">🥉</div><div class="pod-rank">3</div></div>
        </div>
      </div>

      <!-- MY RANK -->
      <div class="my-rank-card">
        <div class="mr-rank">5위</div>
        <div class="mr-av">김</div>
        <div class="mr-info">
          <div class="mr-name">김○○ <span class="mr-badge">나</span></div>
          <div class="mr-sub">25세 · 중형주 · 개근 11주</div>
        </div>
        <div style="font-size:11px;color:var(--teal);background:var(--teal-light);border-radius:5px;padding:3px 10px;margin-right:8px;">▲ 지난주 대비 +2위</div>
        <div class="mr-stats">
          <div class="mr-stat">
            <div class="mr-stat-val" style="color:var(--blue);">1,440</div>
            <div class="mr-stat-label">현재 주가</div>
          </div>
          <div class="mr-stat">
            <div class="mr-stat-val up">+20%</div>
            <div class="mr-stat-label">주간 변동</div>
          </div>
        </div>
      </div>

      <!-- RANK TABLE -->
      <div class="rank-table-wrap">
        <div class="rt-head">
          <div class="th" style="text-align:center;">#</div>
          <div class="th">선수</div>
          <div class="th">주가</div>
          <div class="th">주간 변동</div>
          <div class="th">PB 횟수</div>
          <div class="th">특이사항</div>
          <div class="th">순위 변동</div>
        </div>

        <div
          v-for="row in playerRows"
          :key="row.rank"
          class="rt-row"
          :class="{ me: row.me }"
        >
          <div class="rn" :class="row.rankCls">{{ row.rank }}</div>
          <div class="td-pl">
            <div class="pl-av" :style="`background:${row.avBg};color:${row.avColor};`">{{ row.avLetter }}</div>
            <div>
              <div class="pl-name">{{ row.name }}<span v-if="row.me" class="pl-me-tag">나</span></div>
              <div class="pl-sub">{{ row.sub }}</div>
            </div>
          </div>
          <div class="td mono" style="font-weight:500;" :style="row.priceStyle">{{ row.price }}</div>
          <div class="td mono" :class="row.change.cls" style="font-weight:500;">{{ row.change.text }}</div>
          <div class="td"><span class="badge-small bs-pb">{{ row.pb }}</span></div>
          <div v-if="row.note.kind === 'streak'" class="td"><span class="badge-small bs-streak">{{ row.note.text }}</span></div>
          <div v-else class="td" :class="'note-' + row.note.kind" style="font-size:11px;">{{ row.note.text }}</div>
          <div :class="row.rc.cls">{{ row.rc.text }}</div>
        </div>
      </div>

      <!-- AWARDS GRID -->
      <div class="awards-grid">
        <div v-for="card in awards" :key="card.title" class="award-card">
          <div class="aw-head"><div class="aw-icon">{{ card.icon }}</div><div class="aw-title">{{ card.title }}</div></div>
          <div class="aw-list">
            <div v-for="(item, i) in card.items" :key="i" class="aw-item">
              <div class="aw-rank">{{ item.medal }}</div>
              <div class="aw-av" :style="`background:${item.avBg};color:${item.avColor};`">{{ item.avLetter }}</div>
              <div class="aw-name">{{ item.name }} <span v-if="item.me" style="font-size:9px;color:var(--blue);">나</span></div>
              <div class="aw-val" :class="item.valCls">{{ item.val }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '시즌 랭킹 — Medalbank SSE' })

const subTabs = ['주가 순위', '상승률 순위', '훈련 성실도', 'PB 달성', '대회 성적']
const activeSub = ref(0)

const playerRows = [
  { rank: 1, rankCls: 'g', avBg: '#FDF4E3', avColor: '#B06A00', avLetter: '최', name: '최○○', sub: '34세 · 대형주', price: '2,100', priceStyle: '', change: { text: '▲ 30%', cls: 'up' }, pb: '8회', note: { kind: 'streak', text: '개근 11주' }, rc: { cls: 'arr-same', text: '— 유지' }, me: false },
  { rank: 2, rankCls: 's', avBg: '#D3D1C7', avColor: '#2C2C2A', avLetter: '박', name: '박○○', sub: '42세 · 중형주', price: '1,890', priceStyle: '', change: { text: '▲ 8%', cls: 'up' }, pb: '5회', note: { kind: 'streak', text: '개근 20주' }, rc: { cls: 'arr-up', text: '▲ +1위' }, me: false },
  { rank: 3, rankCls: 'b', avBg: '#E4F5F2', avColor: '#0A7A6A', avLetter: '이', name: '이○○', sub: '15세 · 중형주', price: '1,405', priceStyle: '', change: { text: '▲ 15%', cls: 'up' }, pb: '3회', note: { kind: 'growth', text: '성장주 ⭐' }, rc: { cls: 'arr-up', text: '▲ +4위' }, me: false },
  { rank: 4, rankCls: '', avBg: '#E8F2FC', avColor: '#0D4F8B', avLetter: '강', name: '강○○', sub: '28세 · 중형주', price: '1,460', priceStyle: '', change: { text: '▲ 5%', cls: 'up' }, pb: '5회', note: { kind: 'muted', text: '—' }, rc: { cls: 'arr-down', text: '▼ -1위' }, me: false },
  { rank: 5, rankCls: 'me', avBg: '#E8F2FC', avColor: '#0D4F8B', avLetter: '김', name: '김○○', sub: '25세 · 중형주', price: '1,440', priceStyle: 'color:var(--blue);', change: { text: '▲ 20%', cls: 'up' }, pb: '4회', note: { kind: 'streak', text: '개근 11주' }, rc: { cls: 'arr-up', text: '▲ +2위' }, me: true },
  { rank: 6, rankCls: '', avBg: '#FBEAF0', avColor: '#9B2C6C', avLetter: '정', name: '정○○', sub: '38세 · 중소형주', price: '980', priceStyle: '', change: { text: '▼ 5%', cls: 'down' }, pb: '2회', note: { kind: 'absent', text: '결석 3주' }, rc: { cls: 'arr-down', text: '▼ -2위' }, me: false },
  { rank: 7, rankCls: '', avBg: '#E1F5EE', avColor: '#085041', avLetter: '강(2)', name: '강○○', sub: '19세 · 중소형주', price: '870', priceStyle: '', change: { text: '▼ 10%', cls: 'down' }, pb: '2회', note: { kind: 'muted', text: '패스트트랙' }, rc: { cls: 'arr-same', text: '— 유지' }, me: false },
  { rank: 8, rankCls: '', avBg: '#F0EEFF', avColor: '#5B21B6', avLetter: '윤', name: '윤○○', sub: '12세 · 스타트업', price: '700', priceStyle: '', change: { text: '▲ 5%', cls: 'up' }, pb: '1회', note: { kind: 'growth', text: '성장주 ⭐' }, rc: { cls: 'arr-up', text: '▲ +1위' }, me: false },
]

const awards = [
  {
    icon: '📈', title: '주간 상승률 TOP 3', items: [
      { medal: '🥇', avBg: '#FDF4E3', avColor: '#B06A00', avLetter: '최', name: '최○○', val: '+30%', valCls: 'up', me: false },
      { medal: '🥈', avBg: '#E8F2FC', avColor: '#0D4F8B', avLetter: '김', name: '김○○', val: '+20%', valCls: 'up', me: true },
      { medal: '🥉', avBg: '#E4F5F2', avColor: '#0A7A6A', avLetter: '이', name: '이○○', val: '+15%', valCls: 'up', me: false },
    ],
  },
  {
    icon: '🔥', title: '훈련 성실도 TOP 3', items: [
      { medal: '🥇', avBg: '#D3D1C7', avColor: '#2C2C2A', avLetter: '박', name: '박○○', val: '개근 20주', valCls: 'blue', me: false },
      { medal: '🥈', avBg: '#E8F2FC', avColor: '#0D4F8B', avLetter: '김', name: '김○○', val: '개근 11주', valCls: 'blue', me: true },
      { medal: '🥉', avBg: '#FDF4E3', avColor: '#B06A00', avLetter: '최', name: '최○○', val: '개근 11주', valCls: 'blue', me: false },
    ],
  },
  {
    icon: '🏅', title: '시즌 PB 달성 TOP 3', items: [
      { medal: '🥇', avBg: '#FDF4E3', avColor: '#B06A00', avLetter: '최', name: '최○○', val: '8회', valCls: 'up', me: false },
      { medal: '🥈', avBg: '#E8F2FC', avColor: '#0D4F8B', avLetter: '강', name: '강○○', val: '5회', valCls: 'up', me: false },
      { medal: '🥉', avBg: '#E8F2FC', avColor: '#0D4F8B', avLetter: '김', name: '김○○', val: '4회', valCls: 'up', me: true },
    ],
  },
  {
    icon: '🏆', title: '대회 성적 TOP 3', items: [
      { medal: '🥇', avBg: '#FDF4E3', avColor: '#B06A00', avLetter: '최', name: '최○○', val: '1위 ×2', valCls: 'up', me: false },
      { medal: '🥈', avBg: '#E4F5F2', avColor: '#0A7A6A', avLetter: '이', name: '이○○', val: '2위 ×1', valCls: 'up', me: false },
      { medal: '🥉', avBg: '#D3D1C7', avColor: '#2C2C2A', avLetter: '박', name: '박○○', val: '3위 ×2', valCls: 'up', me: false },
    ],
  },
]
</script>

<style scoped>
/* local color helpers (tokens are global) */
.blue { color: var(--blue); }
.amber { color: var(--amber); }

/* SEASON BANNER */
.season-banner { background: var(--ink); border-radius: 14px; padding: 20px 26px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; }
.sb-deco1 { position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.04); }
.sb-deco2 { position: absolute; bottom: -50px; left: 200px; width: 120px; height: 120px; border-radius: 50%; background: rgba(13,79,139,0.3); }
.sbn-left { position: relative; z-index: 1; }
.sbn-eyebrow { font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
.sbn-title { font-family: var(--serif); font-size: 22px; color: #fff; margin-bottom: 4px; }
.sbn-sub { font-size: 12px; color: rgba(255,255,255,0.6); }
.sbn-right { display: flex; gap: 24px; position: relative; z-index: 1; }
.sbn-stat { text-align: center; }
.sbn-val { font-size: 20px; font-weight: 500; color: #fff; font-family: var(--mono); }
.sbn-label { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.sbn-dday { background: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 16px; text-align: center; }
.sbn-dday-val { font-size: 24px; font-weight: 500; color: #fff; font-family: var(--mono); }
.sbn-dday-label { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px; }

/* D-DAY PROGRESS */
.dday-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
.dc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.dc-title { font-size: 13px; font-weight: 500; color: var(--ink); }
.dc-badge { font-size: 11px; background: var(--amber-light); color: var(--amber); border-radius: 5px; padding: 3px 10px; font-family: var(--mono); }
.dc-track { height: 8px; background: var(--surface-alt); border-radius: 5px; overflow: hidden; margin-bottom: 10px; }
.dc-fill { height: 100%; background: linear-gradient(90deg, var(--blue), var(--blue-mid)); border-radius: 5px; width: 42%; }
.dc-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }

/* MAIN TAB (선수/투자자) */
.main-tab-bar { display: flex; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
.mtab { font-size: 14px; padding: 10px 20px; color: var(--ink-muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: var(--sans); margin-bottom: -1px; transition: all 0.15s; }
.mtab:hover { color: var(--ink-soft); }
.mtab.act { color: var(--blue); border-bottom-color: var(--blue); font-weight: 500; }

/* SUB TAB */
.sub-tabs { display: flex; gap: 6px; margin-bottom: 16px; }
.stab { font-size: 12px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); color: var(--ink-soft); cursor: pointer; background: var(--surface); transition: all 0.12s; }
.stab:hover { background: var(--surface-soft); }
.stab.act { background: var(--blue); color: #fff; border-color: var(--blue); }

/* METRICS */
.metrics-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.metrics-4 .metric { padding: 12px 16px; }
.metrics-4 .metric-val { font-size: 20px; margin-bottom: 2px; }
.metric-sub { font-size: 11px; }

/* PODIUM */
.podium-wrap { display: flex; align-items: flex-end; justify-content: center; gap: 12px; margin-bottom: 24px; height: 160px; }
.pod { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.pod-av { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 600; border: 2.5px solid rgba(255,255,255,0.5); }
.pod-name { font-size: 12px; font-weight: 500; color: var(--ink); }
.pod-val { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }
.pod-block { border-radius: 8px 8px 0 0; width: 90px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; }
.pod-rank { font-size: 20px; font-weight: 500; color: #fff; }
.pod-medal { font-size: 18px; }
.p1-block { background: linear-gradient(180deg, #D4A017, #B06A00); height: 90px; }
.p2-block { background: linear-gradient(180deg, #9AAAB4, #5A6B7B); height: 68px; }
.p3-block { background: linear-gradient(180deg, #C9986A, #7B5E3A); height: 50px; }

/* MY RANK CARD */
.my-rank-card { background: var(--surface); border: 1.5px solid var(--blue); border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 14px; }
.mr-rank { font-size: 24px; font-weight: 500; color: var(--blue); font-family: var(--mono); min-width: 36px; }
.mr-av { width: 38px; height: 38px; border-radius: 50%; background: var(--blue-light); color: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; flex-shrink: 0; }
.mr-info { flex: 1; }
.mr-name { font-size: 14px; font-weight: 500; color: var(--ink); }
.mr-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
.mr-badge { font-size: 10px; background: var(--blue-light); color: var(--blue); border-radius: 5px; padding: 2px 8px; margin-left: 6px; }
.mr-stats { display: flex; gap: 20px; }
.mr-stat { text-align: right; }
.mr-stat-val { font-size: 15px; font-weight: 500; font-family: var(--mono); color: var(--ink); }
.mr-stat-label { font-size: 10px; color: var(--ink-muted); }

/* RANK TABLE */
.rank-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
.rt-head { display: grid; grid-template-columns: 44px 1fr 72px 80px 80px 80px 72px; gap: 0; background: var(--surface-alt); border-bottom: 1px solid var(--border); padding: 9px 18px; }
.th { font-size: 10px; color: var(--ink-muted); font-weight: 600; letter-spacing: 0.04em; }
.rt-row { display: grid; grid-template-columns: 44px 1fr 72px 80px 80px 80px 72px; gap: 0; padding: 10px 18px; border-bottom: 1px solid var(--border-light); align-items: center; cursor: pointer; transition: background 0.1s; }
.rt-row:last-child { border-bottom: none; }
.rt-row:hover { background: var(--surface-soft); }
.rt-row.me { background: var(--blue-pale); }
.rt-row.me:hover { background: #E0EDFA; }
.rn { font-size: 13px; font-weight: 500; font-family: var(--mono); text-align: center; color: var(--ink-muted); }
.rn.g { color: var(--amber); }
.rn.s { color: var(--ink-soft); }
.rn.b { color: #7B5E3A; }
.rn.me { color: var(--blue); }
.td-pl { display: flex; align-items: center; gap: 10px; }
.pl-av { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.pl-name { font-size: 13px; font-weight: 500; color: var(--ink); }
.pl-sub { font-size: 10px; color: var(--ink-muted); }
.pl-me-tag { font-size: 9px; color: var(--blue); margin-left: 4px; }
.td { font-size: 12px; color: var(--ink); }
.td.mono { font-family: var(--mono); }
.td.up { color: var(--teal); }
.td.down { color: var(--red); }
.note-growth { color: var(--purple); }
.note-muted { color: var(--ink-muted); }
.note-absent { color: var(--red); }
.badge-small { font-size: 9px; padding: 2px 7px; border-radius: 4px; }
.bs-pb { background: var(--teal-light); color: var(--teal); }
.bs-streak { background: var(--amber-light); color: var(--amber); }
.arr-up { color: var(--teal); font-size: 11px; font-family: var(--mono); }
.arr-down { color: var(--red); font-size: 11px; font-family: var(--mono); }
.arr-same { color: var(--ink-muted); font-size: 11px; font-family: var(--mono); }

/* AWARDS GRID */
.awards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.award-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
.aw-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.aw-icon { font-size: 18px; }
.aw-title { font-size: 13px; font-weight: 500; color: var(--ink); }
.aw-list { display: flex; flex-direction: column; gap: 6px; }
.aw-item { display: flex; align-items: center; gap: 8px; padding: 7px 9px; background: var(--surface-soft); border-radius: 7px; }
.aw-rank { font-size: 14px; width: 22px; text-align: center; }
.aw-av { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; flex-shrink: 0; }
.aw-name { font-size: 12px; color: var(--ink); flex: 1; }
.aw-val { font-size: 12px; font-weight: 500; font-family: var(--mono); }
.aw-val.up { color: var(--teal); }
.aw-val.blue { color: var(--blue); }

@media (max-width: 960px) {
  .metrics-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .season-banner { flex-direction: column; align-items: flex-start; gap: 16px; }
  .awards-grid { grid-template-columns: 1fr; }
  .rt-head { display: none; }
  .rt-row { grid-template-columns: 36px 1fr auto; row-gap: 4px; }
}
</style>
