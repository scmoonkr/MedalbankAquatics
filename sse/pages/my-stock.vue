<template>
  <div>
    <!-- PROFILE HERO -->
    <div class="profile-hero">
      <div class="ph-avatar">김</div>
      <div class="ph-info">
        <div class="ph-name">김○○</div>
        <div class="ph-sub">25세 · 중형주 · 상장 38주차 · 50m 평영</div>
        <div class="ph-badges">
          <span class="ph-badge pb-blue">🔥 개근 11주</span>
          <span class="ph-badge pb-green">✓ PB 달성</span>
          <span class="ph-badge pb-amber">📓 일지 30일</span>
          <span class="ph-badge pb-purple">👥 투자자 8명</span>
          <span class="ph-badge" style="background:var(--surface-alt);color:var(--ink-muted);">시즌 5위</span>
        </div>
      </div>
      <div class="ph-price">
        <div class="ph-price-label">현재 주가</div>
        <div><span class="ph-price-val">1,440</span> <span class="ph-price-unit">코인</span></div>
        <div class="ph-price-change">▲ +240 · +20.0% 이번 주</div>
        <div style="font-size:10px;color:var(--ink-muted);margin-top:4px;">IPO 공모가 1,000 → 현재 +44%</div>
      </div>
    </div>

    <!-- INVESTOR INFO -->
    <div class="share-card">
      <div class="sc-left">
        <div class="sc-label">나를 응원하는 투자자</div>
        <div style="display:flex;align-items:center;margin-bottom:8px;">
          <div class="sc-investors">
            <div class="sc-av" style="background:rgba(255,255,255,0.2);">박</div>
            <div class="sc-av" style="background:rgba(255,255,255,0.18);">이</div>
            <div class="sc-av" style="background:rgba(255,255,255,0.16);">정</div>
            <div class="sc-av" style="background:rgba(255,255,255,0.14);">최</div>
            <div class="sc-av" style="background:rgba(255,255,255,0.12);">+4</div>
          </div>
          <div class="sc-cnt">총 8명 투자 중</div>
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);">박○○ — 메인 스폰서 · 지분 18%</div>
      </div>
      <div class="sc-right">
        <div class="sc-stat">
          <div class="sc-stat-val">18%</div>
          <div class="sc-stat-label">최대 보유 지분</div>
        </div>
        <div class="sc-stat">
          <div class="sc-stat-val">2,800</div>
          <div class="sc-stat-label">총 투자 코인</div>
        </div>
        <div class="sc-stat">
          <div class="sc-stat-val" style="color:#4ADE80;">+34%</div>
          <div class="sc-stat-label">투자자 평균 수익률</div>
        </div>
      </div>
    </div>

    <!-- PRICE CHART -->
    <div class="chart-card">
      <div class="chart-head">
        <div class="chart-title">주가 추이</div>
        <div class="period-btns">
          <button
            v-for="p in periods"
            :key="p.key"
            class="pb"
            :class="{ act: activePeriod === p.key }"
            @click="activePeriod = p.key"
          >{{ p.label }}</button>
        </div>
      </div>
      <div class="chart-area">
        <svg viewBox="0 0 680 160" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0D4F8B" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#0D4F8B" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- grid -->
          <line x1="0" y1="32" x2="680" y2="32" stroke="#EAF1F8" stroke-width="1"/>
          <line x1="0" y1="80" x2="680" y2="80" stroke="#EAF1F8" stroke-width="1"/>
          <line x1="0" y1="128" x2="680" y2="128" stroke="#EAF1F8" stroke-width="1"/>
          <text x="684" y="35" font-size="9" fill="#8A99A8" font-family="monospace">1,600</text>
          <text x="684" y="83" font-size="9" fill="#8A99A8" font-family="monospace">1,200</text>
          <text x="684" y="131" font-size="9" fill="#8A99A8" font-family="monospace">800</text>
          <!-- area -->
          <path d="M0,130 L56,124 L112,118 L168,122 L224,108 L280,96 L336,102 L392,88 L448,72 L504,58 L560,46 L616,34 L680,22 L680,160 L0,160Z" fill="url(#cg)"/>
          <!-- line -->
          <path d="M0,130 L56,124 L112,118 L168,122 L224,108 L280,96 L336,102 L392,88 L448,72 L504,58 L560,46 L616,34 L680,22" stroke="#0D4F8B" stroke-width="2" stroke-linecap="round"/>
          <!-- IPO line -->
          <line x1="0" y1="140" x2="680" y2="140" stroke="#D8E4EE" stroke-width="1" stroke-dasharray="4,3"/>
          <text x="4" y="152" font-size="9" fill="#8A99A8" font-family="monospace">IPO 1,000</text>
          <!-- PB event marker -->
          <circle cx="392" cy="88" r="5" fill="#0A7A6A"/>
          <line x1="392" y1="30" x2="392" y2="82" stroke="#0A7A6A" stroke-width="1" stroke-dasharray="3,2"/>
          <rect x="366" y="18" width="52" height="16" rx="4" fill="#0A7A6A"/>
          <text x="370" y="30" font-size="9" fill="#fff" font-family="monospace" font-weight="500">PB 달성</text>
          <!-- contest event -->
          <circle cx="280" cy="96" r="4" fill="#B06A00"/>
          <text x="260" y="14" font-size="9" fill="#B06A00" font-family="monospace">대회</text>
          <line x1="280" y1="16" x2="280" y2="90" stroke="#B06A00" stroke-width="1" stroke-dasharray="3,2"/>
          <!-- current -->
          <circle cx="680" cy="22" r="5" fill="#0D4F8B"/>
          <circle cx="680" cy="22" r="10" fill="#0D4F8B" fill-opacity="0.15"/>
        </svg>
      </div>
      <div class="chart-x">
        <span class="cx-label">3월 1주</span>
        <span class="cx-label">3월 3주</span>
        <span class="cx-label">4월 1주</span>
        <span class="cx-label">4월 3주</span>
        <span class="cx-label">5월 1주</span>
        <span class="cx-label">현재</span>
      </div>
      <div class="chart-event-legend">
        <div class="cel-item"><div class="cel-dot" style="background:var(--teal);"></div> PB 달성</div>
        <div class="cel-item"><div class="cel-dot" style="background:var(--amber);"></div> 대회 출전</div>
        <div class="cel-item"><div class="cel-dot" style="background:var(--border);"></div> IPO 공모가 기준선</div>
      </div>
    </div>

    <!-- INDEX CARD -->
    <div class="index-card">
      <div class="ic-head">
        <div>
          <div style="font-size:11px;color:var(--ink-muted);margin-bottom:5px;letter-spacing:0.04em;">종합 지수 TOTAL INDEX</div>
          <div style="display:flex;align-items:baseline;gap:8px;">
            <span class="ic-score-big">70.3</span>
            <span class="ic-score-max">/ 100점</span>
          </div>
          <span class="ic-change">▲ +2.1 이번 주</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          <div style="font-size:11px;padding:4px 12px;border-radius:5px;background:var(--blue-light);color:var(--blue);font-family:var(--mono);">시즌 5위 / 24명</div>
          <div style="font-size:11px;padding:4px 12px;border-radius:5px;background:var(--amber-light);color:var(--amber);">중형주 · 나이 보정 적용</div>
        </div>
      </div>
      <div class="ic-bars">
        <div v-for="row in indexRows" :key="row.label" class="ic-row">
          <div class="ic-label">
            <span class="ic-dot" :style="{ background: row.color }"></span>{{ row.label }}
            <span v-if="row.weight" class="ic-weight">{{ row.weight }}</span>
          </div>
          <div class="ic-track"><div class="ic-fill" :style="{ width: row.width, background: row.color }"></div></div>
          <div class="ic-val" :class="row.valClass" :style="row.valStyle">{{ row.val }}</div>
          <div class="ic-contrib" :class="row.contribClass">{{ row.contrib }}</div>
        </div>
      </div>
    </div>

    <!-- WEEKLY CHANGE -->
    <div class="week-grid">
      <div class="week-item">
        <div class="wi-label">이번 주 기록</div>
        <div class="wi-val">45.8초</div>
        <div class="wi-chg up">▲ PB −0.7초</div>
      </div>
      <div class="week-item">
        <div class="wi-label">출석 상태</div>
        <div class="wi-val">출석</div>
        <div class="wi-chg up">+5% 반영</div>
      </div>
      <div class="week-item">
        <div class="wi-label">기록 안정성</div>
        <div class="wi-val">1.8%</div>
        <div class="wi-chg up">변동계수 · 안정</div>
      </div>
      <div class="week-item">
        <div class="wi-label">주간 변동률</div>
        <div class="wi-val up">+20%</div>
        <div class="wi-chg up">1,200 → 1,440</div>
      </div>
    </div>

    <!-- 2 COL BOTTOM -->
    <div class="two-col">

      <!-- RECORD DETAIL -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">🏊 기록 현황</div>
          <div style="font-size:11px;color:var(--ink-muted);">50m 평영 기준</div>
        </div>
        <div class="panel-body">
          <div v-for="rec in records" :key="rec.label" class="rec-row">
            <div class="rec-label">{{ rec.label }}</div>
            <div class="rec-right">
              <div class="rec-bar"><div class="rec-fill" :style="{ width: rec.width, background: rec.color }"></div></div>
              <div>
                <div class="rec-val">{{ rec.val }}</div>
                <div class="rec-sub" :class="rec.subClass" :style="rec.subStyle">{{ rec.sub }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EVENT TIMELINE -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">📢 주가 이벤트 이력</div>
          <div style="font-size:11px;color:var(--blue);cursor:pointer;">전체 보기</div>
        </div>
        <div class="panel-body">
          <div class="timeline">
            <div v-for="(ev, i) in timeline" :key="i" class="tl-item">
              <div class="tl-icon" :style="{ background: ev.iconBg }">{{ ev.icon }}</div>
              <div class="tl-body">
                <div class="tl-title">{{ ev.title }}</div>
                <div class="tl-time">{{ ev.time }}</div>
              </div>
              <div class="tl-val" :class="ev.valClass" :style="ev.valStyle">{{ ev.val }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '내 주가 — Medalbank SSE' })

const periods = [
  { key: '1m', label: '1개월' },
  { key: '3m', label: '3개월' },
  { key: 'season', label: '시즌 전체' },
]
const activePeriod = ref('3m')

const indexRows = [
  { label: '현재 실적', weight: '×30%', color: 'var(--blue)', width: '75%', val: '75점', valClass: 'blue', valStyle: '', contrib: '+22.5', contribClass: '' },
  { label: '성장성', weight: '×25%', color: 'var(--teal)', width: '60%', val: '60점', valClass: '', valStyle: 'color:var(--teal);', contrib: '+15.0', contribClass: '' },
  { label: '훈련 투자', weight: '×20%', color: 'var(--amber)', width: '90%', val: '90점', valClass: '', valStyle: 'color:var(--amber);', contrib: '+18.0', contribClass: '' },
  { label: '시장 지위', weight: '×15%', color: 'var(--purple)', width: '70%', val: '70점', valClass: '', valStyle: 'color:var(--purple);', contrib: '+10.5', contribClass: '' },
  { label: '특별 이벤트', weight: '×10%', color: '#9B2C6C', width: '30%', val: '30점', valClass: '', valStyle: 'color:#9B2C6C;', contrib: '+3.0', contribClass: '' },
  { label: '리스크 감점', weight: '', color: 'var(--red)', width: '10%', val: '−2점', valClass: 'down', valStyle: '', contrib: '−2.0', contribClass: 'down' },
]

const records = [
  { label: '현재 기록', width: '75%', color: 'var(--blue)', val: '45.8초', sub: 'PB', subClass: 'up', subStyle: '' },
  { label: '기록 향상률 (주간)', width: '65%', color: 'var(--teal)', val: '+1.5%', sub: '▲ 향상', subClass: 'up', subStyle: '' },
  { label: '변동계수 (4주 기준)', width: '80%', color: 'var(--amber)', val: '1.8%', sub: '안정적', subClass: 'up', subStyle: '' },
  { label: '세계 기록 대비', width: '40%', color: 'var(--purple)', val: '+19.1초', sub: '성장 여력', subClass: '', subStyle: 'color:var(--ink-muted);' },
  { label: '연령대 랭킹', width: '70%', color: 'var(--purple)', val: '3위', sub: '/ 25세', subClass: 'blue', subStyle: '' },
  { label: '시즌 PB 달성 횟수', width: '50%', color: 'var(--teal)', val: '4회', sub: '이번 시즌', subClass: 'up', subStyle: '' },
]

const timeline = [
  { icon: '🏅', iconBg: 'var(--teal-light)', title: 'PB 달성 — 45.8초', time: '2026.05.10 · 인천 오픈 대회', val: '+30%', valClass: 'up', valStyle: '' },
  { icon: '🏊', iconBg: 'var(--blue-light)', title: '대회 출전 완주', time: '2026.04.20 · 춘계 대항전', val: '+10%', valClass: 'up', valStyle: '' },
  { icon: '🔥', iconBg: 'var(--amber-light)', title: '개근 10주 돌파 보너스', time: '2026.04.14', val: '+3%', valClass: '', valStyle: 'color:var(--amber);' },
  { icon: '🏅', iconBg: 'var(--teal-light)', title: 'PB 달성 — 46.5초', time: '2026.03.28 · 훈련 측정', val: '+15%', valClass: 'up', valStyle: '' },
  { icon: '📉', iconBg: 'var(--red-light)', title: '무단 결석', time: '2026.03.07', val: '−10%', valClass: 'down', valStyle: '' },
  { icon: '🚀', iconBg: 'var(--purple-light)', title: 'IPO 상장', time: '2025.11.30 · 공모가 1,000코인', val: '시작', valClass: 'blue', valStyle: '' },
]
</script>

<style scoped>
/* PROFILE HERO */
.profile-hero { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
.ph-avatar { width: 60px; height: 60px; border-radius: 50%; background: var(--blue-light); color: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; flex-shrink: 0; border: 2px solid var(--blue-light); }
.ph-info { flex: 1; }
.ph-name { font-size: 20px; font-weight: 500; color: var(--ink); margin-bottom: 3px; }
.ph-sub { font-size: 12px; color: var(--ink-muted); margin-bottom: 10px; }
.ph-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.ph-badge { font-size: 10px; padding: 3px 10px; border-radius: 5px; font-weight: 500; }
.pb-blue { background: var(--blue-light); color: var(--blue); }
.pb-green { background: var(--teal-light); color: var(--teal); }
.pb-amber { background: var(--amber-light); color: var(--amber); }
.pb-purple { background: var(--purple-light); color: var(--purple); }
.ph-price { text-align: right; }
.ph-price-label { font-size: 10px; color: var(--ink-muted); margin-bottom: 4px; }
.ph-price-val { font-family: var(--mono); font-size: 32px; font-weight: 500; color: var(--blue); }
.ph-price-unit { font-size: 14px; color: var(--ink-muted); }
.ph-price-change { font-size: 13px; color: var(--teal); font-family: var(--mono); margin-top: 3px; }

/* CHART CARD */
.chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
.chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-title { font-size: 14px; font-weight: 500; color: var(--ink); }
.period-btns { display: flex; gap: 4px; }
.pb { font-size: 11px; padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--ink-muted); cursor: pointer; transition: all 0.12s; font-family: var(--sans); }
.pb.act { background: var(--blue); color: #fff; border-color: var(--blue); }
.chart-area { position: relative; height: 160px; margin-bottom: 8px; }
.chart-area svg { width: 100%; height: 100%; }
.chart-x { display: flex; justify-content: space-between; margin-top: 6px; }
.cx-label { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }
.chart-event-legend { display: flex; gap: 14px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light); }
.cel-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--ink-muted); }
.cel-dot { width: 8px; height: 8px; border-radius: 50%; }

/* INDEX CARD */
.index-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
.ic-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.ic-score-big { font-family: var(--mono); font-size: 44px; font-weight: 500; color: var(--blue); }
.ic-score-max { font-size: 16px; color: var(--ink-muted); }
.ic-change { font-size: 12px; color: var(--teal); background: var(--teal-light); border-radius: 5px; padding: 3px 10px; font-family: var(--mono); margin-top: 4px; display: inline-block; }
.ic-bars { display: flex; flex-direction: column; gap: 11px; }
.ic-row { display: grid; grid-template-columns: 130px 1fr 48px 52px; gap: 10px; align-items: center; }
.ic-label { font-size: 12px; color: var(--ink-soft); display: flex; align-items: center; gap: 6px; }
.ic-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ic-weight { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }
.ic-track { background: var(--surface-alt); border-radius: 5px; height: 7px; overflow: hidden; }
.ic-fill { height: 100%; border-radius: 5px; transition: width 1s ease; }
.ic-val { font-size: 13px; font-weight: 500; font-family: var(--mono); text-align: right; }
.ic-contrib { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); text-align: right; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

/* RECORD ROW */
.rec-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--border-light); }
.rec-row:last-child { border-bottom: none; }
.rec-label { font-size: 12px; color: var(--ink-soft); }
.rec-right { display: flex; align-items: center; gap: 10px; }
.rec-bar { width: 80px; height: 5px; background: var(--surface-alt); border-radius: 3px; overflow: hidden; }
.rec-fill { height: 100%; border-radius: 3px; }
.rec-val { font-size: 13px; font-weight: 500; color: var(--ink); font-family: var(--mono); min-width: 60px; text-align: right; }
.rec-sub { font-size: 10px; font-family: var(--mono); }

/* EVENT TIMELINE */
.timeline { display: flex; flex-direction: column; gap: 0; }
.tl-item { display: flex; gap: 12px; padding: 10px 0; position: relative; }
.tl-item::before { content: ''; position: absolute; left: 14px; top: 32px; bottom: -10px; width: 1px; background: var(--border-light); }
.tl-item:last-child::before { display: none; }
.tl-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; position: relative; z-index: 1; }
.tl-body { flex: 1; }
.tl-title { font-size: 12px; font-weight: 500; color: var(--ink); margin-bottom: 2px; }
.tl-time { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }
.tl-val { font-size: 12px; font-weight: 500; font-family: var(--mono); }

/* SHARE / INVESTOR CARD */
.share-card { background: var(--blue); border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
.sc-label { font-size: 10px; color: rgba(255,255,255,0.6); margin-bottom: 4px; letter-spacing: 0.04em; }
.sc-investors { display: flex; margin-bottom: 8px; }
.sc-av { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #fff; margin-left: -6px; }
.sc-av:first-child { margin-left: 0; }
.sc-cnt { font-size: 13px; color: rgba(255,255,255,0.8); margin-left: 8px; align-self: center; }
.sc-right { display: flex; gap: 20px; }
.sc-stat { text-align: center; }
.sc-stat-val { font-size: 20px; font-weight: 500; color: #fff; font-family: var(--mono); }
.sc-stat-label { font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 2px; }

/* WEEKLY CHANGE */
.week-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 20px; }
.week-item { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
.wi-label { font-size: 11px; color: var(--ink-muted); margin-bottom: 4px; }
.wi-val { font-size: 16px; font-weight: 500; font-family: var(--mono); margin-bottom: 2px; }
.wi-chg { font-size: 11px; font-family: var(--mono); }

/* status colors (page-local, matches global vocabulary) */
.up { color: var(--teal); }
.down { color: var(--red); }
.blue { color: var(--blue); }

@media (max-width: 1024px) {
  .week-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .profile-hero { flex-direction: column; align-items: flex-start; }
  .ph-price { text-align: left; }
  .share-card { flex-direction: column; align-items: flex-start; gap: 14px; }
  .two-col { grid-template-columns: 1fr; }
  .week-grid { grid-template-columns: 1fr 1fr; }
}
</style>
