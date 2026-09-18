<template>
  <div>
    <!-- MAIN TABS -->
    <div class="main-tab-bar">
      <button
        class="mtab"
        :class="{ 'act-blue': tab === 'profit' }"
        @click="tab = 'profit'"
      >💰 수익률 랭킹</button>
      <button
        class="mtab"
        :class="{ 'act-purple': tab === 'scout' }"
        @click="tab = 'scout'"
      >🔭 유망주 발굴 랭킹</button>
    </div>

    <!-- ═══ PROFIT TAB ═══ -->
    <div v-show="tab === 'profit'">
      <div class="metrics-4">
        <div class="metric">
          <div class="metric-label">내 총 수익</div>
          <div class="metric-val up">+680</div>
          <div class="metric-sub up">코인 시즌 누적</div>
        </div>
        <div class="metric">
          <div class="metric-label">내 수익률</div>
          <div class="metric-val up">+13%</div>
          <div class="metric-sub" style="color:var(--ink-muted);">투자 선수 5명</div>
        </div>
        <div class="metric">
          <div class="metric-label">최고 수익 선수</div>
          <div class="metric-val blue" style="font-size:16px;">최○○</div>
          <div class="metric-sub up">+180코인 · 스폰서</div>
        </div>
        <div class="metric">
          <div class="metric-label">투자자 순위</div>
          <div class="metric-val blue">3위</div>
          <div class="metric-sub up">▲ 지난주 +1위</div>
        </div>
      </div>

      <!-- PODIUM -->
      <div class="podium-wrap">
        <div class="pod">
          <div class="pod-av" style="background:#D3D1C7;color:#2C2C2A;">이</div>
          <div class="pod-name">이○○</div>
          <div class="pod-val">+42%</div>
          <div class="pod-block p2"><div class="pod-medal">🥈</div><div class="pod-rank">2</div></div>
        </div>
        <div class="pod">
          <div class="pod-av" style="background:#FDF4E3;color:#B06A00;">박</div>
          <div class="pod-name">박○○</div>
          <div class="pod-val">+58%</div>
          <div class="pod-block p1"><div class="pod-medal">🥇</div><div class="pod-rank">1</div></div>
        </div>
        <div class="pod">
          <div class="pod-av" style="background:#E8F2FC;color:#0D4F8B;">김</div>
          <div class="pod-name">김○○</div>
          <div class="pod-val">+13%</div>
          <div class="pod-block p3"><div class="pod-medal">🥉</div><div class="pod-rank">3</div></div>
        </div>
      </div>

      <!-- MY RANK -->
      <div class="my-rank-card mrc-blue">
        <div class="mr-rank blue">3위</div>
        <div class="mr-av" style="background:var(--blue-light);color:var(--blue);">김</div>
        <div class="mr-info">
          <div class="mr-name">김○○ <span class="mr-badge" style="background:var(--blue-light);color:var(--blue);">나</span></div>
          <div class="mr-sub">투자 5명 · 펀드매니저 등급</div>
        </div>
        <div class="rank-delta" style="background:var(--teal-light);color:var(--teal);">▲ 지난주 대비 +1위</div>
        <div class="mr-stats">
          <div class="mr-stat"><div class="mr-stat-val up">+680</div><div class="mr-stat-label">시즌 수익</div></div>
          <div class="mr-stat"><div class="mr-stat-val up">+13%</div><div class="mr-stat-label">수익률</div></div>
        </div>
      </div>

      <!-- RANK TABLE -->
      <div class="rt-wrap">
        <div class="rt-head" :style="profitGrid">
          <div class="th" style="text-align:center;">#</div>
          <div class="th">투자자</div>
          <div class="th">총 수익</div>
          <div class="th">수익률</div>
          <div class="th">투자 선수</div>
          <div class="th">등급</div>
          <div class="th">순위 변동</div>
        </div>
        <div
          v-for="row in profitRows"
          :key="row.rank"
          class="rt-row"
          :class="{ 'me-blue': row.me }"
          :style="profitGrid"
        >
          <div class="rn" :class="row.rnClass">{{ row.rank }}</div>
          <div class="td-pl">
            <div class="pl-av" :style="{ background: row.avBg, color: row.avColor }">{{ row.initial }}</div>
            <div>
              <div class="pl-name">{{ row.name }}<span v-if="row.me" class="pl-me" style="color:var(--blue);">나</span></div>
              <div class="pl-sub">{{ row.role }}</div>
            </div>
          </div>
          <div class="td mono" :class="row.totalClass" style="font-weight:500;" :style="row.me ? { color: 'var(--blue)' } : {}">{{ row.total }}</div>
          <div class="td mono" :class="row.rateClass" style="font-weight:500;">{{ row.rate }}</div>
          <div class="td"><span style="font-size:11px;background:var(--blue-light);color:var(--blue);padding:2px 7px;border-radius:4px;">{{ row.players }}</span></div>
          <div class="td"><span class="grade-tag" :class="row.gradeClass">{{ row.gradeLabel }}</span></div>
          <div :class="row.arrClass">{{ row.arrText }}</div>
        </div>
      </div>

      <!-- PORTFOLIO PROFIT BREAKDOWN -->
      <div class="portfolio-preview">
        <div class="pp-title">💼 내 투자 포트폴리오 수익 내역</div>
        <div class="pp-list">
          <div v-for="p in portfolio" :key="p.name" class="pp-item">
            <div class="pp-av" :style="{ background: p.avBg, color: p.avColor }">{{ p.initial }}</div>
            <div class="pp-name">{{ p.name }} <span :style="{ fontSize: '10px', color: p.tagColor }">{{ p.tag }}</span></div>
            <div class="pp-when">{{ p.invested }}</div>
            <div class="pp-arrow">→</div>
            <div class="pp-now">{{ p.now }}</div>
            <div class="pp-profit" :class="p.profitClass">{{ p.profit }}</div>
          </div>
        </div>
      </div>

      <div class="awards-2">
        <div class="award-card">
          <div class="aw-head"><div class="aw-icon">💰</div><div class="aw-title">수익률 TOP 3</div></div>
          <div class="aw-list">
            <div class="aw-item"><div class="aw-rank">🥇</div><div class="aw-av" style="background:#FDF4E3;color:#B06A00;">박</div><div class="aw-name">박○○</div><div class="aw-val up">+58%</div></div>
            <div class="aw-item"><div class="aw-rank">🥈</div><div class="aw-av" style="background:#D3D1C7;color:#2C2C2A;">이</div><div class="aw-name">이○○</div><div class="aw-val up">+42%</div></div>
            <div class="aw-item"><div class="aw-rank">🥉</div><div class="aw-av" style="background:#E8F2FC;color:#0D4F8B;">김</div><div class="aw-name">김○○ <span style="font-size:9px;color:var(--blue);">나</span></div><div class="aw-val up">+13%</div></div>
          </div>
        </div>
        <div class="award-card">
          <div class="aw-head"><div class="aw-icon">📊</div><div class="aw-title">총 수익 TOP 3</div></div>
          <div class="aw-list">
            <div class="aw-item"><div class="aw-rank">🥇</div><div class="aw-av" style="background:#FDF4E3;color:#B06A00;">박</div><div class="aw-name">박○○</div><div class="aw-val up">+1,240</div></div>
            <div class="aw-item"><div class="aw-rank">🥈</div><div class="aw-av" style="background:#D3D1C7;color:#2C2C2A;">이</div><div class="aw-name">이○○</div><div class="aw-val up">+920</div></div>
            <div class="aw-item"><div class="aw-rank">🥉</div><div class="aw-av" style="background:#E8F2FC;color:#0D4F8B;">김</div><div class="aw-name">김○○ <span style="font-size:9px;color:var(--blue);">나</span></div><div class="aw-val up">+680</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ SCOUT TAB ═══ -->
    <div v-show="tab === 'scout'">

      <div class="scout-explain">
        <div class="se-title">🔭 유망주 발굴 지수란?</div>
        <div class="se-formula">발굴 지수 = 투자 시점 주가 대비 현재 상승률
         × 조기성 보정 (IPO 당일 = 최고점)
         × 보유 지분 비율

→ 단순 수익률이 아닌 "얼마나 먼저 알아봤는가"를 평가</div>
      </div>

      <div class="metrics-4">
        <div class="metric">
          <div class="metric-label">내 발굴 지수</div>
          <div class="metric-val purple">72점</div>
          <div class="metric-sub purple">고수 등급</div>
        </div>
        <div class="metric">
          <div class="metric-label">발굴 순위</div>
          <div class="metric-val purple">2위</div>
          <div class="metric-sub up">▲ 지난 시즌 대비 +15점</div>
        </div>
        <div class="metric">
          <div class="metric-label">조기 투자 선수</div>
          <div class="metric-val" style="color:var(--ink);">2명</div>
          <div class="metric-sub up">IPO 당일 투자</div>
        </div>
        <div class="metric">
          <div class="metric-label">놓친 유망주</div>
          <div class="metric-val down">1명</div>
          <div class="metric-sub down">윤○○ 뒤늦게 투자</div>
        </div>
      </div>

      <!-- PODIUM SCOUT -->
      <div class="podium-wrap">
        <div class="pod">
          <div class="pod-av" style="background:#E8F2FC;color:#0D4F8B;">김</div>
          <div class="pod-name">김○○</div>
          <div class="pod-val">72점</div>
          <div class="pod-block p2"><div class="pod-medal">🥈</div><div class="pod-rank">2</div></div>
        </div>
        <div class="pod">
          <div class="pod-av" style="background:#FDF4E3;color:#B06A00;">박</div>
          <div class="pod-name">박○○</div>
          <div class="pod-val">89점</div>
          <div class="pod-block p1"><div class="pod-medal">🥇</div><div class="pod-rank">1</div></div>
        </div>
        <div class="pod">
          <div class="pod-av" style="background:#D3D1C7;color:#2C2C2A;">이</div>
          <div class="pod-name">이○○</div>
          <div class="pod-val">61점</div>
          <div class="pod-block p3"><div class="pod-medal">🥉</div><div class="pod-rank">3</div></div>
        </div>
      </div>

      <!-- MY RANK SCOUT -->
      <div class="my-rank-card mrc-purple">
        <div class="mr-rank purple">2위</div>
        <div class="mr-av" style="background:var(--purple-light);color:var(--purple);">김</div>
        <div class="mr-info">
          <div class="mr-name">김○○ <span class="mr-badge" style="background:var(--purple-light);color:var(--purple);">나</span></div>
          <div class="mr-sub">발굴 지수 72점 · 고수 등급 · 조기 투자 2명</div>
        </div>
        <div class="rank-delta" style="background:var(--teal-light);color:var(--teal);">▲ 지난 시즌 대비 +15점</div>
        <div class="mr-stats">
          <div class="mr-stat"><div class="mr-stat-val purple">72점</div><div class="mr-stat-label">발굴 지수</div></div>
          <div class="mr-stat"><div class="mr-stat-val up">+40%</div><div class="mr-stat-label">조기 성장률</div></div>
        </div>
      </div>

      <!-- SCOUT RANK TABLE -->
      <div class="rt-wrap">
        <div class="rt-head" :style="scoutGrid">
          <div class="th" style="text-align:center;">#</div>
          <div class="th">투자자</div>
          <div class="th">발굴 지수</div>
          <div class="th">조기 투자</div>
          <div class="th">평균 성장률</div>
          <div class="th">등급</div>
          <div class="th">순위 변동</div>
        </div>
        <div
          v-for="row in scoutRows"
          :key="row.rank"
          class="rt-row"
          :class="{ 'me-purple': row.me }"
          :style="scoutGrid"
        >
          <div class="rn" :class="row.rnClass">{{ row.rank }}</div>
          <div class="td-pl">
            <div class="pl-av" :style="{ background: row.avBg, color: row.avColor }">{{ row.initial }}</div>
            <div>
              <div class="pl-name">{{ row.name }}<span v-if="row.me" class="pl-me" style="color:var(--purple);">나</span></div>
              <div class="pl-sub">{{ row.role }}</div>
            </div>
          </div>
          <div class="td mono purple" style="font-weight:500;">{{ row.score }}</div>
          <div class="td"><span :style="{ fontSize: '11px', background: row.earlyBg, color: row.earlyColor, padding: '2px 7px', borderRadius: '4px' }">{{ row.early }}</span></div>
          <div class="td up mono" style="font-weight:500;">{{ row.growth }}</div>
          <div class="td"><span class="grade-tag" :class="row.gradeClass">{{ row.gradeLabel }}</span></div>
          <div :class="row.arrClass">{{ row.arrText }}</div>
        </div>
      </div>

      <!-- MY SCOUT PICKS DETAIL -->
      <div class="scout-picks">
        <div class="sp-title">🎯 내 조기 발굴 선수 — 투자 시점 분석</div>

        <div class="pick-item">
          <div class="pick-top">
            <div class="pick-player">
              <div class="pick-av" style="background:#E4F5F2;color:#0A7A6A;">이</div>
              <div>
                <div class="pick-name">이○○</div>
                <div class="pick-meta">IPO 당일 투자 · 15세 성장주</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px;color:var(--ink-muted);">발굴 점수</div>
              <div class="pick-score">38점</div>
            </div>
          </div>
          <div class="pick-bars">
            <div class="pick-bar-item">
              <div class="pick-bar-label">조기성</div>
              <div class="pick-bar-track"><div class="pick-bar-fill" style="width:100%;background:var(--purple);"></div></div>
              <div class="pick-bar-val">IPO 당일</div>
            </div>
            <div class="pick-bar-item">
              <div class="pick-bar-label">성장률</div>
              <div class="pick-bar-track"><div class="pick-bar-fill" style="width:80%;background:var(--teal);"></div></div>
              <div class="pick-bar-val">+40%</div>
            </div>
            <div class="pick-bar-item">
              <div class="pick-bar-label">투자 규모</div>
              <div class="pick-bar-track"><div class="pick-bar-fill" style="width:70%;background:var(--blue);"></div></div>
              <div class="pick-bar-val">7% 지분</div>
            </div>
          </div>
          <div class="pick-result">
            <div class="pr-label">투자 시점 1,000코인</div>
            <div class="pr-arrow">→</div>
            <div class="pr-now">현재 1,405코인</div>
            <div class="pr-chg up">+40%</div>
          </div>
        </div>

        <div class="pick-item">
          <div class="pick-top">
            <div class="pick-player">
              <div class="pick-av" style="background:#F0EEFF;color:#5B21B6;">윤</div>
              <div>
                <div class="pick-name">윤○○</div>
                <div class="pick-meta">IPO+3주 투자 · 12세 스타트업</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px;color:var(--ink-muted);">발굴 점수</div>
              <div class="pick-score" style="color:var(--amber);">22점</div>
            </div>
          </div>
          <div class="pick-bars">
            <div class="pick-bar-item">
              <div class="pick-bar-label">조기성</div>
              <div class="pick-bar-track"><div class="pick-bar-fill" style="width:55%;background:var(--purple);"></div></div>
              <div class="pick-bar-val">IPO+3주</div>
            </div>
            <div class="pick-bar-item">
              <div class="pick-bar-label">성장률</div>
              <div class="pick-bar-track"><div class="pick-bar-fill" style="width:25%;background:var(--teal);"></div></div>
              <div class="pick-bar-val">+5%</div>
            </div>
            <div class="pick-bar-item">
              <div class="pick-bar-label">투자 규모</div>
              <div class="pick-bar-track"><div class="pick-bar-fill" style="width:30%;background:var(--blue);"></div></div>
              <div class="pick-bar-val">3% 지분</div>
            </div>
          </div>
          <div class="pick-result">
            <div class="pr-label">투자 시점 700코인</div>
            <div class="pr-arrow">→</div>
            <div class="pr-now">현재 700코인</div>
            <div class="pr-chg up">+5%</div>
          </div>
        </div>
      </div>

      <div class="awards-2">
        <div class="award-card">
          <div class="aw-head"><div class="aw-icon">🔭</div><div class="aw-title">발굴 지수 TOP 3</div></div>
          <div class="aw-list">
            <div class="aw-item"><div class="aw-rank">🥇</div><div class="aw-av" style="background:#FDF4E3;color:#B06A00;">박</div><div class="aw-name">박○○</div><div class="aw-val purple">89점 전설</div></div>
            <div class="aw-item"><div class="aw-rank">🥈</div><div class="aw-av" style="background:#E8F2FC;color:#0D4F8B;">김</div><div class="aw-name">김○○ <span style="font-size:9px;color:var(--blue);">나</span></div><div class="aw-val purple">72점 고수</div></div>
            <div class="aw-item"><div class="aw-rank">🥉</div><div class="aw-av" style="background:#D3D1C7;color:#2C2C2A;">이</div><div class="aw-name">이○○</div><div class="aw-val purple">61점 고수</div></div>
          </div>
        </div>
        <div class="award-card">
          <div class="aw-head"><div class="aw-icon">⚡</div><div class="aw-title">최다 조기 투자</div></div>
          <div class="aw-list">
            <div class="aw-item"><div class="aw-rank">🥇</div><div class="aw-av" style="background:#FDF4E3;color:#B06A00;">박</div><div class="aw-name">박○○</div><div class="aw-val" style="color:var(--teal);">5명</div></div>
            <div class="aw-item"><div class="aw-rank">🥈</div><div class="aw-av" style="background:#D3D1C7;color:#2C2C2A;">이</div><div class="aw-name">이○○</div><div class="aw-val" style="color:var(--teal);">3명</div></div>
            <div class="aw-item"><div class="aw-rank">🥉</div><div class="aw-av" style="background:#E8F2FC;color:#0D4F8B;">김</div><div class="aw-name">김○○ <span style="font-size:9px;color:var(--blue);">나</span></div><div class="aw-val" style="color:var(--teal);">2명</div></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '투자자 랭킹 — Medalbank SSE' })

const tab = ref<'profit' | 'scout'>('profit')

const profitGrid = 'grid-template-columns:40px 1fr 80px 80px 72px 80px 72px;'
const scoutGrid = 'grid-template-columns:40px 1fr 80px 72px 80px 72px 72px;'

const profitRows = [
  { rank: 1, rnClass: 'g', avBg: '#FDF4E3', avColor: '#B06A00', initial: '박', name: '박○○', role: '펀드매니저', total: '+1,240', totalClass: 'up', rate: '+58%', rateClass: 'up', players: '8명', gradeClass: 'gt-legend', gradeLabel: '전설', arrClass: 'arr-same', arrText: '— 유지', me: false },
  { rank: 2, rnClass: 's', avBg: '#D3D1C7', avColor: '#2C2C2A', initial: '이', name: '이○○', role: '서포터', total: '+920', totalClass: 'up', rate: '+42%', rateClass: 'up', players: '6명', gradeClass: 'gt-expert', gradeLabel: '고수', arrClass: 'arr-up', arrText: '▲ +1위', me: false },
  { rank: 3, rnClass: 'me-c-blue', avBg: '#E8F2FC', avColor: '#0D4F8B', initial: '김', name: '김○○', role: '펀드매니저', total: '+680', totalClass: 'up', rate: '+13%', rateClass: 'up', players: '5명', gradeClass: 'gt-expert', gradeLabel: '고수', arrClass: 'arr-up', arrText: '▲ +1위', me: true },
  { rank: 4, rnClass: '', avBg: '#E4F5F2', avColor: '#0A7A6A', initial: '최', name: '최○○', role: '서포터', total: '+420', totalClass: 'up', rate: '+22%', rateClass: 'up', players: '3명', gradeClass: 'gt-mid', gradeLabel: '중급', arrClass: 'arr-down', arrText: '▼ -2위', me: false },
  { rank: 5, rnClass: '', avBg: '#FBEAF0', avColor: '#9B2C6C', initial: '정', name: '정○○', role: '개인투자자', total: '+180', totalClass: 'up', rate: '+9%', rateClass: 'up', players: '2명', gradeClass: 'gt-basic', gradeLabel: '입문', arrClass: 'arr-same', arrText: '— 유지', me: false },
  { rank: 6, rnClass: '', avBg: '#FDF0EE', avColor: '#C0392B', initial: '강', name: '강○○', role: '개인투자자', total: '−120', totalClass: 'down', rate: '-8%', rateClass: 'down', players: '3명', gradeClass: 'gt-basic', gradeLabel: '입문', arrClass: 'arr-down', arrText: '▼ -1위', me: false },
]

const scoutRows = [
  { rank: 1, rnClass: 'g', avBg: '#FDF4E3', avColor: '#B06A00', initial: '박', name: '박○○', role: '슈퍼 스카우터', score: '89점', early: '5명', earlyBg: 'var(--teal-light)', earlyColor: 'var(--teal)', growth: '+52%', gradeClass: 'gt-legend', gradeLabel: '전설', arrClass: 'arr-same', arrText: '— 유지', me: false },
  { rank: 2, rnClass: 'me-c-purple', avBg: '#E8F2FC', avColor: '#0D4F8B', initial: '김', name: '김○○', role: '스카우터', score: '72점', early: '2명', earlyBg: 'var(--teal-light)', earlyColor: 'var(--teal)', growth: '+40%', gradeClass: 'gt-expert', gradeLabel: '고수', arrClass: 'arr-up', arrText: '▲ +1위', me: true },
  { rank: 3, rnClass: 'b', avBg: '#D3D1C7', avColor: '#2C2C2A', initial: '이', name: '이○○', role: '스카우터', score: '61점', early: '3명', earlyBg: 'var(--teal-light)', earlyColor: 'var(--teal)', growth: '+28%', gradeClass: 'gt-expert', gradeLabel: '고수', arrClass: 'arr-same', arrText: '— 유지', me: false },
  { rank: 4, rnClass: '', avBg: '#E4F5F2', avColor: '#0A7A6A', initial: '최', name: '최○○', role: '초보 스카우터', score: '44점', early: '1명', earlyBg: 'var(--amber-light)', earlyColor: 'var(--amber)', growth: '+18%', gradeClass: 'gt-mid', gradeLabel: '중급', arrClass: 'arr-down', arrText: '▼ -1위', me: false },
  { rank: 5, rnClass: '', avBg: '#FBEAF0', avColor: '#9B2C6C', initial: '정', name: '정○○', role: '입문', score: '30점', early: '0명', earlyBg: 'var(--surface-alt)', earlyColor: 'var(--ink-muted)', growth: '+9%', gradeClass: 'gt-basic', gradeLabel: '입문', arrClass: 'arr-same', arrText: '— 유지', me: false },
]

const portfolio = [
  { initial: '최', avBg: '#FDF4E3', avColor: '#B06A00', name: '최○○', tag: '스폰서 12%', tagColor: 'var(--blue)', invested: '600 투자', now: '780코인', profit: '+180', profitClass: 'up' },
  { initial: '이', avBg: '#E4F5F2', avColor: '#0A7A6A', name: '이○○', tag: '서포터 7%', tagColor: 'var(--teal)', invested: '400 투자', now: '460코인', profit: '+60', profitClass: 'up' },
  { initial: '박', avBg: '#F1EFE8', avColor: '#5F5E5A', name: '박○○', tag: '서포터 6%', tagColor: 'var(--teal)', invested: '350 투자', now: '385코인', profit: '+35', profitClass: 'up' },
  { initial: '강', avBg: '#E1F5EE', avColor: '#085041', name: '강○○', tag: '개인 4%', tagColor: 'var(--amber)', invested: '300 투자', now: '270코인', profit: '−30', profitClass: 'down' },
  { initial: '윤', avBg: '#F0EEFF', avColor: '#5B21B6', name: '윤○○', tag: '개인 3%', tagColor: 'var(--amber)', invested: '200 투자', now: '210코인', profit: '+10', profitClass: 'up' },
]
</script>

<style scoped>
/* MAIN TAB BAR */
.main-tab-bar { display: flex; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
.mtab { font-size: 14px; padding: 10px 24px; color: var(--ink-muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: var(--sans); margin-bottom: -1px; transition: all 0.15s; }
.mtab:hover { color: var(--ink-soft); }
.mtab.act-blue { color: var(--blue); border-bottom-color: var(--blue); font-weight: 500; }
.mtab.act-purple { color: var(--purple); border-bottom-color: var(--purple); font-weight: 500; }

.blue { color: var(--blue); }
.purple { color: var(--purple); }

/* METRICS */
.metrics-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.metric-val { font-size: 20px; }

/* PODIUM */
.podium-wrap { display: flex; align-items: flex-end; justify-content: center; gap: 14px; margin-bottom: 24px; height: 170px; }
.pod { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.pod-av { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; border: 2px solid rgba(255,255,255,0.5); }
.pod-name { font-size: 12px; font-weight: 500; color: var(--ink); }
.pod-val { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }
.pod-block { border-radius: 8px 8px 0 0; width: 96px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 3px; }
.pod-rank { font-size: 20px; font-weight: 500; color: #fff; }
.pod-medal { font-size: 18px; }
.p1 { background: linear-gradient(180deg, #D4A017, #B06A00); height: 96px; }
.p2 { background: linear-gradient(180deg, #9AAAB4, #5A6B7B); height: 72px; }
.p3 { background: linear-gradient(180deg, #C9986A, #7B5E3A); height: 54px; }

/* MY RANK CARD */
.my-rank-card { border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 14px; }
.mrc-blue { background: var(--surface); border: 1.5px solid var(--blue); }
.mrc-purple { background: var(--surface); border: 1.5px solid var(--purple); }
.mr-rank { font-size: 24px; font-weight: 500; font-family: var(--mono); min-width: 36px; }
.mr-av { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; flex-shrink: 0; }
.mr-info { flex: 1; }
.mr-name { font-size: 14px; font-weight: 500; color: var(--ink); }
.mr-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
.mr-badge { font-size: 10px; border-radius: 5px; padding: 2px 8px; margin-left: 6px; }
.mr-stats { display: flex; gap: 20px; }
.mr-stat { text-align: right; }
.mr-stat-val { font-size: 15px; font-weight: 500; font-family: var(--mono); }
.mr-stat-label { font-size: 10px; color: var(--ink-muted); }
.rank-delta { font-size: 11px; border-radius: 5px; padding: 3px 10px; margin-right: 8px; }

/* RANK TABLE */
.rt-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
.rt-head { display: grid; gap: 0; background: var(--surface-alt); border-bottom: 1px solid var(--border); padding: 9px 18px; }
.th { font-size: 10px; color: var(--ink-muted); font-weight: 600; letter-spacing: 0.04em; }
.rt-row { display: grid; gap: 0; padding: 11px 18px; border-bottom: 1px solid var(--border-light); align-items: center; cursor: pointer; transition: background 0.1s; }
.rt-row:last-child { border-bottom: none; }
.rt-row:hover { background: var(--surface-soft); }
.rt-row.me-blue { background: #F4F8FD; }
.rt-row.me-purple { background: #F8F6FF; }
.rn { font-size: 13px; font-weight: 500; font-family: var(--mono); text-align: center; }
.rn.g { color: var(--gold, #B06A00); } .rn.s { color: var(--silver, #5A6B7B); } .rn.b { color: var(--bronze, #7B5E3A); }
.rn.me-c-blue { color: var(--blue); } .rn.me-c-purple { color: var(--purple); }
.td-pl { display: flex; align-items: center; gap: 10px; }
.pl-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.pl-name { font-size: 13px; font-weight: 500; color: var(--ink); }
.pl-sub { font-size: 10px; color: var(--ink-muted); }
.pl-me { font-size: 9px; margin-left: 4px; }
.td { font-size: 12px; color: var(--ink); }
.td.mono { font-family: var(--mono); }
.grade-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; }
.gt-legend { background: #FEF3C7; color: #92400E; }
.gt-expert { background: var(--purple-light); color: var(--purple); }
.gt-mid { background: var(--blue-light); color: var(--blue); }
.gt-basic { background: var(--surface-alt); color: var(--ink-muted); }
.arr-up { color: var(--teal); font-size: 11px; font-family: var(--mono); }
.arr-down { color: var(--red); font-size: 11px; font-family: var(--mono); }
.arr-same { color: var(--ink-muted); font-size: 11px; font-family: var(--mono); }

/* SCOUT EXPLAIN */
.scout-explain { background: var(--purple-light); border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; }
.se-title { font-size: 13px; font-weight: 500; color: var(--purple); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
.se-formula { background: rgba(255,255,255,0.6); border-radius: 8px; padding: 10px 14px; font-size: 12px; color: var(--purple); line-height: 1.7; font-family: var(--mono); white-space: pre-line; }

/* PORTFOLIO PREVIEW */
.portfolio-preview { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; margin-bottom: 20px; }
.pp-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.pp-list { display: flex; flex-direction: column; gap: 7px; }
.pp-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--surface-soft); border-radius: 8px; }
.pp-av { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; flex-shrink: 0; }
.pp-name { font-size: 12px; color: var(--ink); flex: 1; }
.pp-when { font-size: 10px; color: var(--ink-muted); }
.pp-arrow { font-size: 11px; color: var(--ink-muted); }
.pp-now { font-size: 12px; font-weight: 500; font-family: var(--mono); }
.pp-profit { font-size: 12px; font-weight: 500; font-family: var(--mono); }

/* SCOUT PICK DETAIL */
.scout-picks { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; margin-bottom: 20px; }
.sp-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 12px; }
.pick-item { background: var(--surface-soft); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; }
.pick-item:last-child { margin-bottom: 0; }
.pick-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.pick-player { display: flex; align-items: center; gap: 8px; }
.pick-av { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
.pick-name { font-size: 13px; font-weight: 500; color: var(--ink); }
.pick-meta { font-size: 10px; color: var(--ink-muted); }
.pick-score { font-size: 15px; font-weight: 500; color: var(--purple); font-family: var(--mono); }
.pick-bars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
.pick-bar-item { font-size: 10px; color: var(--ink-muted); }
.pick-bar-label { margin-bottom: 3px; }
.pick-bar-track { height: 5px; background: var(--surface-alt); border-radius: 3px; overflow: hidden; }
.pick-bar-fill { height: 100%; border-radius: 3px; }
.pick-bar-val { font-size: 10px; color: var(--ink-muted); margin-top: 2px; font-family: var(--mono); }
.pick-result { display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); }
.pr-label { font-size: 11px; color: var(--ink-soft); flex: 1; }
.pr-arrow { font-size: 11px; color: var(--ink-muted); }
.pr-now { font-size: 11px; font-weight: 500; font-family: var(--mono); color: var(--ink); }
.pr-chg { font-size: 12px; font-weight: 500; font-family: var(--mono); }

/* AWARDS */
.awards-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.award-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
.aw-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.aw-icon { font-size: 18px; }
.aw-title { font-size: 13px; font-weight: 500; color: var(--ink); }
.aw-list { display: flex; flex-direction: column; gap: 6px; }
.aw-item { display: flex; align-items: center; gap: 8px; padding: 7px 9px; background: var(--surface-soft); border-radius: 7px; }
.aw-rank { font-size: 14px; width: 22px; text-align: center; }
.aw-av { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; }
.aw-name { font-size: 12px; color: var(--ink); flex: 1; }
.aw-val { font-size: 12px; font-weight: 500; font-family: var(--mono); }

@media (max-width: 720px) {
  .metrics-4 { grid-template-columns: repeat(2, 1fr); }
  .awards-2 { grid-template-columns: 1fr; }
}
</style>
