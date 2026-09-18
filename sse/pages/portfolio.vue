<template>
  <div>
    <!-- SUMMARY HERO -->
    <div class="summary-hero">
      <div style="position:relative;z-index:1;">
        <div class="sh-label">총 보유 코인</div>
        <div class="sh-total">3,240 <span style="font-size:18px;opacity:0.7;">코인</span></div>
        <div class="sh-sub">투자 중 1,850 · 가용 1,390</div>
        <div class="sh-stats">
          <div class="sh-stat"><span class="sh-stat-label">투자 선수</span><span class="sh-stat-val">5명</span></div>
          <div class="sh-stat"><span class="sh-stat-label">시즌 총 수익</span><span class="sh-stat-val" style="color:#4ADE80;">+680</span></div>
          <div class="sh-stat"><span class="sh-stat-label">평균 수익률</span><span class="sh-stat-val" style="color:#4ADE80;">+13%</span></div>
          <div class="sh-stat"><span class="sh-stat-label">투자자 순위</span><span class="sh-stat-val">3위</span></div>
        </div>
      </div>
      <div class="sh-deco"></div>
      <div class="sh-deco2"></div>
      <div class="sh-right">
        <div class="sh-badge">펀드매니저 등급</div>
        <NuxtLink class="invest-new-btn" to="/athletes">+ 신규 투자하기</NuxtLink>
      </div>
    </div>

    <!-- METRICS -->
    <div class="metrics-3">
      <div class="metric">
        <div class="metric-label">이번 주 배당 수익</div>
        <div class="metric-val up">+340</div>
        <div class="metric-sub up">최○○ 스폰서 · +180 최대</div>
      </div>
      <div class="metric">
        <div class="metric-label">분산 투자 보너스</div>
        <div class="metric-val up">+5%</div>
        <div class="metric-sub blue">5명 이상 투자 달성</div>
      </div>
      <div class="metric">
        <div class="metric-label">스폰서 등급 선수</div>
        <div class="metric-val" style="color:var(--ink);">1명</div>
        <div class="metric-sub" style="color:var(--ink-muted);">최○○ · 지분 12%</div>
      </div>
    </div>

    <!-- COIN BALANCE BAR -->
    <div class="coin-balance-card">
      <div class="cb-icon">🪙</div>
      <div class="cb-info">
        <div class="cb-label">코인 자산 현황</div>
        <div class="cb-total">3,240 코인</div>
        <div class="cb-breakdown">
          <div class="cb-seg">투자 중 <strong>1,850</strong></div>
          <div class="cb-seg">가용 <strong>1,390</strong></div>
          <div class="cb-seg">이번 달 적립 <strong style="color:var(--teal);">+680</strong></div>
        </div>
        <div class="cb-track">
          <div class="cb-invested" style="width:57%;"></div>
          <div class="cb-free" style="width:43%;"></div>
        </div>
      </div>
      <div class="cb-actions">
        <NuxtLink class="cb-btn" to="/athletes">투자하기 →</NuxtLink>
        <button class="cb-btn-out">코인 사용처</button>
      </div>
    </div>

    <!-- HOLDINGS TABLE -->
    <div class="holdings-card">
      <div class="hc-head">
        <div class="hc-title">보유 선수 현황</div>
        <div class="hc-actions">
          <button
            class="hc-btn"
            :class="{ active: sortMode === 'profit' }"
            @click="sortMode = 'profit'"
          >수익률순</button>
          <button
            class="hc-btn"
            :class="{ active: sortMode === 'date' }"
            @click="sortMode = 'date'"
          >투자일순</button>
        </div>
      </div>
      <div class="tbl-head">
        <div class="th">선수</div>
        <div class="th">등급</div>
        <div class="th">투자 코인</div>
        <div class="th">현재 주가</div>
        <div class="th">지분율</div>
        <div class="th">수익률</div>
        <div class="th">관리</div>
      </div>

      <div class="tbl-row" v-for="(h, i) in holdings" :key="i">
        <div class="td-player">
          <div class="pl-av" :style="{ background: h.avBg, color: h.avColor }">{{ h.initial }}</div>
          <div>
            <div class="pl-name">{{ h.name }}</div>
            <div class="pl-sub">{{ h.sub }}</div>
          </div>
        </div>
        <div class="td"><span class="grade-badge" :class="h.gradeClass">{{ h.grade }}</span></div>
        <div class="td mono" style="font-weight:500;">{{ h.invest }}</div>
        <div class="td mono" style="font-weight:500;">{{ h.price }}</div>
        <div class="td mono">{{ h.share }}</div>
        <div class="td">
          <div class="profit-wrap">
            <div class="profit-bar"><div class="profit-fill" :style="{ width: h.profitWidth, background: h.profitColor }"></div></div>
            <span class="profit-val" :class="h.profitDir">{{ h.profit }}</span>
          </div>
        </div>
        <div class="td">
          <button
            class="sell-btn"
            :disabled="h.sold"
            :style="h.sold ? 'color:var(--ink-muted);border-color:var(--border);' : ''"
            @click="sell(h)"
          >{{ h.sold ? '매도 완료' : '매도' }}</button>
        </div>
      </div>
    </div>

    <!-- 2 COL -->
    <div class="two-col">

      <!-- DISTRIBUTION -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">📊 등급별 분산 현황</div>
          <div style="font-size:11px;color:var(--ink-muted);">투자 1,850 코인 기준</div>
        </div>
        <div class="panel-body">
          <div class="donut-wrap" style="margin-bottom:16px;">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="46" fill="none" stroke="#EEF5FB" stroke-width="16"/>
              <!-- 대형주 32% -->
              <circle cx="60" cy="60" r="46" fill="none" stroke="#0D4F8B" stroke-width="16"
                stroke-dasharray="92.8 196.5" stroke-dashoffset="0" transform="rotate(-90 60 60)"/>
              <!-- 중형주 40% -->
              <circle cx="60" cy="60" r="46" fill="none" stroke="#0A7A6A" stroke-width="16"
                stroke-dasharray="116.2 173.1" stroke-dashoffset="-92.8" transform="rotate(-90 60 60)"/>
              <!-- 중소형주 16% -->
              <circle cx="60" cy="60" r="46" fill="none" stroke="#B06A00" stroke-width="16"
                stroke-dasharray="46.5 242.8" stroke-dashoffset="-209" transform="rotate(-90 60 60)"/>
              <!-- 스타트업 11% -->
              <circle cx="60" cy="60" r="46" fill="none" stroke="#5B21B6" stroke-width="16"
                stroke-dasharray="32.0 257.3" stroke-dashoffset="-255.5" transform="rotate(-90 60 60)"/>
              <text x="60" y="56" text-anchor="middle" font-size="11" fill="#5A6B7B" font-family="Pretendard,sans-serif">투자 중</text>
              <text x="60" y="70" text-anchor="middle" font-size="13" fill="#0F1923" font-weight="500" font-family="monospace">1,850</text>
            </svg>
            <div class="donut-legend">
              <div class="dl-item">
                <div class="dl-dot" style="background:var(--blue);"></div>
                <div class="dl-name">대형주 (최○○)</div>
                <div class="dl-val">600</div>
                <div class="dl-pct">32%</div>
              </div>
              <div class="dl-item">
                <div class="dl-dot" style="background:var(--teal);"></div>
                <div class="dl-name">중형주 (이○○ + 박○○)</div>
                <div class="dl-val">750</div>
                <div class="dl-pct">41%</div>
              </div>
              <div class="dl-item">
                <div class="dl-dot" style="background:var(--amber);"></div>
                <div class="dl-name">중소형주 (강○○)</div>
                <div class="dl-val">300</div>
                <div class="dl-pct">16%</div>
              </div>
              <div class="dl-item">
                <div class="dl-dot" style="background:var(--purple);"></div>
                <div class="dl-name">스타트업 (윤○○)</div>
                <div class="dl-val">200</div>
                <div class="dl-pct">11%</div>
              </div>
            </div>
          </div>
          <div class="dist-list">
            <div class="dist-item">
              <div class="di-label"><div class="di-dot" style="background:var(--blue);"></div>대형주</div>
              <div class="di-track"><div class="di-fill" style="width:32%;background:var(--blue);"></div></div>
              <div class="di-val">600코인</div>
            </div>
            <div class="dist-item">
              <div class="di-label"><div class="di-dot" style="background:var(--teal);"></div>중형주</div>
              <div class="di-track"><div class="di-fill" style="width:41%;background:var(--teal);"></div></div>
              <div class="di-val">750코인</div>
            </div>
            <div class="dist-item">
              <div class="di-label"><div class="di-dot" style="background:var(--amber);"></div>중소형주</div>
              <div class="di-track"><div class="di-fill" style="width:16%;background:var(--amber);"></div></div>
              <div class="di-val">300코인</div>
            </div>
            <div class="dist-item">
              <div class="di-label"><div class="di-dot" style="background:var(--purple);"></div>스타트업</div>
              <div class="di-track"><div class="di-fill" style="width:11%;background:var(--purple);"></div></div>
              <div class="di-val">200코인</div>
            </div>
            <div class="dist-item">
              <div class="di-label"><div class="di-dot" style="background:var(--border);"></div>가용 코인</div>
              <div class="di-track"><div class="di-fill" style="width:43%;background:var(--border);"></div></div>
              <div class="di-val">1,390코인</div>
            </div>
          </div>
          <div class="dist-total">
            <span>5명 투자 · 펀드매니저 등급 🏅</span>
            <span style="font-family:var(--mono);font-weight:500;">총 3,240코인</span>
          </div>
        </div>
      </div>

      <!-- COIN LEDGER -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">🪙 최근 코인 내역</div>
          <div style="font-size:11px;color:var(--blue);cursor:pointer;">전체 보기</div>
        </div>
        <div class="panel-body">
          <div class="ledger-list">
            <div class="ledger-item" v-for="(l, i) in ledger" :key="i">
              <div class="ledger-icon" :style="{ background: l.iconBg }">{{ l.icon }}</div>
              <div class="ledger-body">
                <div class="ledger-desc">{{ l.desc }}</div>
                <div class="ledger-time">{{ l.time }}</div>
              </div>
              <div class="ledger-amount" :class="l.dir">{{ l.amount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '내 포트폴리오 — Medalbank SSE' })

const sortMode = ref<'profit' | 'date'>('profit')

interface Holding {
  initial: string
  avBg: string
  avColor: string
  name: string
  sub: string
  grade: string
  gradeClass: string
  invest: string
  price: string
  share: string
  profitWidth: string
  profitColor: string
  profit: string
  profitDir: 'up' | 'down'
  sold: boolean
}

const holdings = ref<Holding[]>([
  { initial: '최', avBg: '#FDF4E3', avColor: '#B06A00', name: '최○○', sub: '34세 · 대형주 · 스폰서', grade: '스폰서', gradeClass: 'gb-s', invest: '600', price: '2,100', share: '12%', profitWidth: '100%', profitColor: 'var(--teal)', profit: '+180', profitDir: 'up', sold: false },
  { initial: '이', avBg: '#E4F5F2', avColor: '#0A7A6A', name: '이○○', sub: '15세 · 중형주 · 서포터', grade: '서포터', gradeClass: 'gb-su', invest: '400', price: '1,405', share: '7%', profitWidth: '67%', profitColor: 'var(--teal)', profit: '+60', profitDir: 'up', sold: false },
  { initial: '박', avBg: '#F1EFE8', avColor: '#5F5E5A', name: '박○○', sub: '42세 · 중형주 · 서포터', grade: '서포터', gradeClass: 'gb-su', invest: '350', price: '1,890', share: '6%', profitWidth: '50%', profitColor: 'var(--teal)', profit: '+35', profitDir: 'up', sold: false },
  { initial: '강', avBg: '#E1F5EE', avColor: '#085041', name: '강○○', sub: '19세 · 중소형주 · 개인', grade: '개인', gradeClass: 'gb-p', invest: '300', price: '870', share: '4%', profitWidth: '30%', profitColor: 'var(--red)', profit: '−30', profitDir: 'down', sold: false },
  { initial: '윤', avBg: '#F0EEFF', avColor: '#5B21B6', name: '윤○○', sub: '12세 · 스타트업 · 개인', grade: '개인', gradeClass: 'gb-p', invest: '200', price: '700', share: '3%', profitWidth: '17%', profitColor: 'var(--teal)', profit: '+10', profitDir: 'up', sold: false },
])

function sell(h: Holding) {
  if (h.sold) return
  if (confirm('이 선수의 지분을 매도하시겠습니까?')) {
    h.sold = true
  }
}

const ledger = [
  { icon: '💰', iconBg: 'var(--teal-light)', desc: '최○○ 배당 수익 (PB +30%)', time: '오늘 09:12 · 스폰서 1.5× 보정', amount: '+180', dir: 'up' },
  { icon: '📋', iconBg: 'var(--blue-light)', desc: '주간 참가비 코인 적립', time: '2일 전 · 출석+측정+일지', amount: '+180', dir: 'up' },
  { icon: '💰', iconBg: 'var(--teal-light)', desc: '이○○ 배당 수익 (+15%)', time: '4일 전 · 서포터 1.2× 보정', amount: '+60', dir: 'up' },
  { icon: '🎯', iconBg: 'var(--amber-light)', desc: '분산 투자 보너스 (5명 달성)', time: '1주 전', amount: '+50', dir: 'up' },
  { icon: '📤', iconBg: 'var(--red-light)', desc: '강○○ 투자 (개인)', time: '1주 전', amount: '−300', dir: 'down' },
  { icon: '📤', iconBg: 'var(--red-light)', desc: '윤○○ 투자 (IPO 당일)', time: '2주 전', amount: '−200', dir: 'down' },
  { icon: '📋', iconBg: 'var(--blue-light)', desc: '주간 참가비 코인 적립', time: '2주 전', amount: '+180', dir: 'up' },
]
</script>

<style scoped>
.blue { color: var(--blue); }
.amber { color: var(--amber); }

/* SUMMARY HERO */
.summary-hero { background: var(--blue); border-radius: 14px; padding: 22px 26px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; position: relative; overflow: hidden; }
.sh-deco { position: absolute; top: -30px; right: -30px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.05); }
.sh-deco2 { position: absolute; bottom: -50px; right: 120px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.04); }
.sh-label { font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
.sh-total { font-family: var(--mono); font-size: 36px; font-weight: 500; color: #fff; margin-bottom: 3px; }
.sh-sub { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 16px; }
.sh-stats { display: flex; gap: 20px; position: relative; z-index: 1; }
.sh-stat { display: flex; flex-direction: column; }
.sh-stat-label { font-size: 10px; color: rgba(255,255,255,0.55); margin-bottom: 3px; }
.sh-stat-val { font-size: 15px; font-weight: 500; color: #fff; font-family: var(--mono); }
.sh-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; position: relative; z-index: 1; }
.sh-badge { font-size: 11px; background: rgba(255,255,255,0.15); color: #fff; border-radius: 6px; padding: 5px 14px; font-family: var(--mono); }
.invest-new-btn { font-size: 13px; font-weight: 500; background: #fff; color: var(--blue); border: none; border-radius: 8px; padding: 9px 20px; cursor: pointer; font-family: var(--sans); }

/* METRICS */
.metrics-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }

/* COIN BALANCE BAR */
.coin-balance-card { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
.cb-icon { font-size: 24px; color: var(--amber); }
.cb-info { flex: 1; }
.cb-label { font-size: 11px; color: var(--ink-muted); margin-bottom: 4px; }
.cb-total { font-size: 18px; font-weight: 500; color: var(--ink); font-family: var(--mono); margin-bottom: 6px; }
.cb-breakdown { display: flex; gap: 14px; }
.cb-seg { font-size: 11px; color: var(--ink-soft); }
.cb-seg strong { font-family: var(--mono); color: var(--ink); }
.cb-track { width: 100%; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; margin-top: 6px; display: flex; }
.cb-invested { height: 100%; background: var(--blue); }
.cb-free { height: 100%; background: var(--teal-light); }
.cb-actions { display: flex; flex-direction: column; gap: 8px; }
.cb-btn { font-size: 12px; font-weight: 500; color: #fff; background: var(--blue); border: none; border-radius: 8px; padding: 8px 18px; cursor: pointer; font-family: var(--sans); white-space: nowrap; text-align: center; }
.cb-btn-out { font-size: 12px; color: var(--ink-soft); background: none; border: 1px solid var(--border); border-radius: 8px; padding: 7px 18px; cursor: pointer; font-family: var(--sans); white-space: nowrap; }

/* HOLDINGS TABLE */
.holdings-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
.hc-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border-light); }
.hc-title { font-size: 13px; font-weight: 500; color: var(--ink); }
.hc-actions { display: flex; gap: 8px; }
.hc-btn { font-size: 11px; padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border); background: none; color: var(--ink-soft); cursor: pointer; font-family: var(--sans); }
.hc-btn.active { background: var(--blue); color: #fff; border-color: var(--blue); }
.tbl-head { display: grid; grid-template-columns: 1fr 72px 80px 80px 80px 90px 80px; gap: 0; padding: 9px 20px; background: var(--surface-alt); border-bottom: 1px solid var(--border-light); }
.th { font-size: 10px; color: var(--ink-muted); font-weight: 600; letter-spacing: 0.04em; }
.tbl-row { display: grid; grid-template-columns: 1fr 72px 80px 80px 80px 90px 80px; gap: 0; padding: 11px 20px; border-bottom: 1px solid var(--border-light); align-items: center; cursor: pointer; transition: background 0.1s; }
.tbl-row:last-child { border-bottom: none; }
.tbl-row:hover { background: var(--surface-soft); }
.td-player { display: flex; align-items: center; gap: 10px; }
.pl-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.pl-name { font-size: 13px; font-weight: 500; color: var(--ink); }
.pl-sub { font-size: 10px; color: var(--ink-muted); margin-top: 1px; }
.td { font-size: 12px; color: var(--ink); }
.td.mono { font-family: var(--mono); }
.grade-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; }
.gb-s { background: var(--blue-light); color: var(--blue); }
.gb-su { background: var(--teal-light); color: var(--teal); }
.gb-p { background: var(--amber-light); color: var(--amber); }
.profit-wrap { display: flex; align-items: center; gap: 6px; }
.profit-bar { width: 44px; height: 4px; background: var(--surface-alt); border-radius: 2px; overflow: hidden; }
.profit-fill { height: 100%; border-radius: 2px; }
.profit-val { font-size: 12px; font-family: var(--mono); font-weight: 500; }
.sell-btn { font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border); background: none; color: var(--ink-muted); cursor: pointer; font-family: var(--sans); transition: all 0.12s; }
.sell-btn:hover { border-color: var(--red); color: var(--red); }
.sell-btn:disabled { cursor: default; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

/* DISTRIBUTION */
.dist-list { display: flex; flex-direction: column; gap: 10px; }
.dist-item { display: grid; grid-template-columns: 90px 1fr 60px; gap: 8px; align-items: center; }
.di-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-soft); }
.di-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.di-track { height: 7px; background: var(--surface-alt); border-radius: 4px; overflow: hidden; }
.di-fill { height: 100%; border-radius: 4px; }
.di-val { font-size: 11px; font-family: var(--mono); color: var(--ink-muted); text-align: right; }
.dist-total { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-soft); }

/* DONUT CHART */
.donut-wrap { display: flex; align-items: center; gap: 20px; }
.donut-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.dl-item { display: flex; align-items: center; gap: 8px; }
.dl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dl-name { font-size: 11px; color: var(--ink-soft); flex: 1; }
.dl-val { font-size: 11px; font-family: var(--mono); color: var(--ink); }
.dl-pct { font-size: 10px; color: var(--ink-muted); }

/* COIN LEDGER */
.ledger-list { display: flex; flex-direction: column; gap: 0; }
.ledger-item { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border-light); }
.ledger-item:last-child { border-bottom: none; }
.ledger-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
.ledger-body { flex: 1; }
.ledger-desc { font-size: 12px; color: var(--ink); margin-bottom: 2px; }
.ledger-time { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }
.ledger-amount { font-size: 13px; font-family: var(--mono); font-weight: 500; white-space: nowrap; }

@media (max-width: 720px) {
  .metrics-3 { grid-template-columns: 1fr; }
  .two-col { grid-template-columns: 1fr; }
  .summary-hero { grid-template-columns: 1fr; }
}
</style>
