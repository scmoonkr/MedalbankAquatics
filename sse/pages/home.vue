<template>
  <div>
    <!-- MY STOCK HERO -->
    <div class="my-hero">
      <div class="mh-left">
        <div class="mh-label">내 현재 주가</div>
        <div class="mh-price">1,440 <span style="font-size:16px;opacity:.7;">코인</span></div>
        <div class="mh-change">▲ +240 · +20.0% 이번 주</div>
        <div class="mh-stats">
          <div class="mh-stat"><span class="mh-stat-label">현재 기록</span><span class="mh-stat-val">45.8초</span></div>
          <div class="mh-stat"><span class="mh-stat-label">출석률</span><span class="mh-stat-val">92%</span></div>
          <div class="mh-stat"><span class="mh-stat-label">종합 지수</span><span class="mh-stat-val">70.3점</span></div>
          <div class="mh-stat"><span class="mh-stat-label">보유 코인</span><span class="mh-stat-val">3,240</span></div>
          <div class="mh-stat"><span class="mh-stat-label">시즌 순위</span><span class="mh-stat-val">5위</span></div>
        </div>
      </div>
      <div class="mh-chart">
        <svg viewBox="0 0 160 60" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(255,255,255,0.2)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          <path d="M0,50 L20,46 L40,42 L55,45 L70,34 L88,26 L105,30 L120,20 L135,12 L150,6 L160,2 L160,60 L0,60Z" fill="url(#gh)"/>
          <path d="M0,50 L20,46 L40,42 L55,45 L70,34 L88,26 L105,30 L120,20 L135,12 L150,6 L160,2" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="160" cy="2" r="3" fill="#4ADE80"/>
        </svg>
      </div>
    </div>

    <!-- METRICS -->
    <div class="dash-grid-4">
      <div class="metric"><div class="metric-label">이번 주 PB</div><div class="metric-val">45.8초</div><div class="metric-sub up">▲ -0.7초 향상</div></div>
      <div class="metric"><div class="metric-label">출석 연속</div><div class="metric-val">11주</div><div class="metric-sub" style="color:var(--blue);">🔥 개근 중</div></div>
      <div class="metric"><div class="metric-label">이번 주 배당</div><div class="metric-val">+340</div><div class="metric-sub up">▲ 최○○ 스폰서</div></div>
      <div class="metric"><div class="metric-label">투자자 순위</div><div class="metric-val">3위</div><div class="metric-sub up">▲ 지난주 +1위</div></div>
    </div>

    <!-- JOURNAL -->
    <div class="journal-widget">
      <div class="jw-head">
        <div class="jw-title">📓 이번 주 훈련 일지</div>
        <NuxtLink class="jw-btn" to="/journal">오늘 기록하기</NuxtLink>
      </div>
      <div class="jw-days">
        <div class="jw-day"><div class="jw-day-label">월</div><div class="jw-circle jc-done">✓</div></div>
        <div class="jw-day"><div class="jw-day-label">화</div><div class="jw-circle jc-done">✓</div></div>
        <div class="jw-day"><div class="jw-day-label">수</div><div class="jw-circle jc-done">✓</div></div>
        <div class="jw-day"><div class="jw-day-label">목</div><div class="jw-circle jc-today">오늘</div></div>
        <div class="jw-day"><div class="jw-day-label">금</div><div class="jw-circle jc-empty">-</div></div>
        <div class="jw-day"><div class="jw-day-label">토</div><div class="jw-circle jc-empty">-</div></div>
        <div class="jw-day"><div class="jw-day-label">일</div><div class="jw-circle jc-empty">-</div></div>
      </div>
    </div>

    <!-- SEASON RANK + INVESTOR RANK -->
    <div class="dash-grid-2">
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">📊 시즌 랭킹</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="mini-tabs">
              <div class="mini-tab act">주가</div>
              <div class="mini-tab">상승률</div>
              <div class="mini-tab">성실도</div>
            </div>
            <NuxtLink class="panel-more" to="/rankings">전체</NuxtLink>
          </div>
        </div>
        <div class="panel-body">
          <div class="rr"><span class="rr-n g">1</span><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">최</div><span class="rr-nm">최○○</span><span class="rr-vl">2,100</span><span class="rr-cg up">▲30%</span></div>
          <div class="rr"><span class="rr-n s">2</span><div class="av av-sm" style="background:#F1EFE8;color:#5F5E5A;">박</div><span class="rr-nm">박○○</span><span class="rr-vl">1,890</span><span class="rr-cg up">▲8%</span></div>
          <div class="rr"><span class="rr-n b">3</span><div class="av av-sm" style="background:#E4F5F2;color:#0A7A6A;">이</div><span class="rr-nm">이○○</span><span class="rr-vl">1,405</span><span class="rr-cg up">▲15%</span></div>
          <div class="rr"><span class="rr-n">4</span><div class="av av-sm" style="background:#E8F2FC;color:#0D4F8B;">강</div><span class="rr-nm">강○○</span><span class="rr-vl">1,460</span><span class="rr-cg up">▲5%</span></div>
          <div class="rr rr-me"><span class="rr-n" style="color:var(--blue);">5</span><div class="av av-sm" style="background:#E8F2FC;color:#0D4F8B;">김</div><span class="rr-nm">김○○<span class="rr-me-tag">나</span></span><span class="rr-vl" style="color:var(--blue);">1,440</span><span class="rr-cg up">▲20%</span></div>
          <div class="rr"><span class="rr-n">6</span><div class="av av-sm" style="background:#FDF0EE;color:#C0392B;">정</div><span class="rr-nm">정○○</span><span class="rr-vl">980</span><span class="rr-cg down">▼5%</span></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">⭐ 투자자 랭킹</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="mini-tabs">
              <div class="mini-tab act-purple">수익률</div>
              <div class="mini-tab">발굴</div>
            </div>
            <NuxtLink class="panel-more" to="/investor-ranking">전체</NuxtLink>
          </div>
        </div>
        <div class="panel-body">
          <div class="rr"><span class="rr-n g">1</span><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">박</div><span class="rr-nm">박○○</span><span class="rr-vl up">+58%</span><span class="rr-cg muted">+1,240</span></div>
          <div class="rr"><span class="rr-n s">2</span><div class="av av-sm" style="background:#F1EFE8;color:#5F5E5A;">이</div><span class="rr-nm">이○○</span><span class="rr-vl up">+42%</span><span class="rr-cg muted">+920</span></div>
          <div class="rr rr-me" style="background:var(--purple-light);"><span class="rr-n" style="color:var(--purple);">3</span><div class="av av-sm" style="background:#E8F2FC;color:#0D4F8B;">김</div><span class="rr-nm">김○○<span class="rr-me-tag" style="color:var(--purple);">나</span></span><span class="rr-vl" style="color:var(--purple);">+13%</span><span class="rr-cg muted">+680</span></div>
          <div class="rr"><span class="rr-n">4</span><div class="av av-sm" style="background:#E4F5F2;color:#0A7A6A;">최</div><span class="rr-nm">최○○</span><span class="rr-vl up">+22%</span><span class="rr-cg muted">+420</span></div>
          <div class="rr"><span class="rr-n">5</span><div class="av av-sm" style="background:#FDF0EE;color:#C0392B;">정</div><span class="rr-nm">정○○</span><span class="rr-vl up">+9%</span><span class="rr-cg muted">+180</span></div>
          <div class="rr"><span class="rr-n">6</span><div class="av av-sm" style="background:#FDF0EE;color:#C0392B;">강</div><span class="rr-nm">강○○</span><span class="rr-vl down">-8%</span><span class="rr-cg muted">-120</span></div>
        </div>
      </div>
    </div>

    <!-- NOTICE + CONTEST + PORTFOLIO -->
    <div class="dash-grid-3">
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">📢 최근 공시</div>
          <NuxtLink class="panel-more" to="/notifications">전체 5개 →</NuxtLink>
        </div>
        <div class="panel-body">
          <div class="nr"><div class="nr-dot" style="background:var(--teal);"></div><div class="nr-body"><div class="nr-text">최○○ PB 달성<span class="nr-tag tag-green">+30%</span></div><div class="nr-time">1시간 전</div></div></div>
          <div class="nr"><div class="nr-dot" style="background:var(--blue);"></div><div class="nr-body"><div class="nr-text">전국마스터즈 명단 확정<span class="nr-tag tag-blue">대회</span></div><div class="nr-time">3시간 전</div></div></div>
          <div class="nr"><div class="nr-dot" style="background:var(--amber);"></div><div class="nr-body"><div class="nr-text">주간 코인 +180 적립<span class="nr-tag tag-blue">코인</span></div><div class="nr-time">5시간 전</div></div></div>
          <div class="nr"><div class="nr-dot" style="background:var(--purple);"></div><div class="nr-body"><div class="nr-text">이○○ 신규 IPO 상장<span class="nr-tag tag-purple">IPO</span></div><div class="nr-time">어제 14:22</div></div></div>
          <div class="nr"><div class="nr-dot" style="background:var(--red);"></div><div class="nr-body"><div class="nr-text">강○○ 무단 결석<span class="nr-tag tag-red">-10%</span></div><div class="nr-time">어제 09:15</div></div></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">🏅 대회 현황</div>
          <NuxtLink class="panel-more" to="/contests">전체 →</NuxtLink>
        </div>
        <div class="panel-body">
          <div class="ce featured-ce">
            <div class="ce-top"><span class="ce-name">전국마스터즈 수영대회</span><span class="ce-dday">D-7</span></div>
            <div class="ce-meta"><span class="ce-date">2026.05.29</span><span class="ce-players">출전 8명</span></div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:6px;">
              <div class="ce-avatars">
                <div class="ce-av" style="background:#FDF4E3;color:#B06A00;">최</div>
                <div class="ce-av" style="background:#E8F2FC;color:#0D4F8B;">김</div>
                <div class="ce-av" style="background:#E4F5F2;color:#0A7A6A;">이</div>
                <div class="ce-av" style="background:#F1EFE8;color:#5F5E5A;">+5</div>
              </div>
              <span class="invest-link">투자하기 →</span>
            </div>
            <div class="ce-time">⏱ 투자 가능 48시간 남음</div>
          </div>
          <div class="ce">
            <div class="ce-top"><span class="ce-name">경기도 마스터즈 대회</span><span class="ce-dday">D-23</span></div>
            <div class="ce-meta"><span class="ce-date">2026.06.14</span><span class="ce-players">출전 5명</span></div>
          </div>
          <div class="ce">
            <div class="ce-top"><span class="ce-name">전국 어린이 수영대회</span><span class="ce-dday">D-45</span></div>
            <div class="ce-meta"><span class="ce-date">2026.07.05</span><span class="ce-players">출전 4명</span></div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">💼 내 포트폴리오</div>
          <NuxtLink class="panel-more" to="/portfolio">전체 →</NuxtLink>
        </div>
        <div class="panel-body">
          <div class="pr"><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">최</div><span class="pr-name">최○○</span><span class="pr-grade pg-sponsor">스폰서</span><div class="pr-bar"><div class="pr-bar-fill" style="width:75%;background:var(--teal);"></div></div><span class="pr-profit up">+180</span></div>
          <div class="pr"><div class="av av-sm" style="background:#E4F5F2;color:#0A7A6A;">이</div><span class="pr-name">이○○</span><span class="pr-grade pg-support">서포터</span><div class="pr-bar"><div class="pr-bar-fill" style="width:50%;background:var(--teal);"></div></div><span class="pr-profit up">+60</span></div>
          <div class="pr"><div class="av av-sm" style="background:#F1EFE8;color:#5F5E5A;">박</div><span class="pr-name">박○○</span><span class="pr-grade pg-support">서포터</span><div class="pr-bar"><div class="pr-bar-fill" style="width:35%;background:var(--teal);"></div></div><span class="pr-profit up">+35</span></div>
          <div class="pr"><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">강</div><span class="pr-name">강○○</span><span class="pr-grade pg-personal">개인</span><div class="pr-bar"><div class="pr-bar-fill" style="width:25%;background:var(--red);"></div></div><span class="pr-profit down">-30</span></div>
          <div class="pr"><div class="av av-sm" style="background:#F0EEFF;color:#5B21B6;">윤</div><span class="pr-name">윤○○</span><span class="pr-grade pg-personal">개인</span><div class="pr-bar"><div class="pr-bar-fill" style="width:15%;background:var(--teal);"></div></div><span class="pr-profit up">+10</span></div>
        </div>
      </div>
    </div>

    <!-- COIN BAR -->
    <div class="coin-bar">
      <span style="font-size:20px;color:var(--amber);">🪙</span>
      <div style="flex:1;">
        <div style="font-size:10px;color:var(--ink-muted);margin-bottom:2px;">보유 코인</div>
        <div style="font-size:16px;font-weight:500;font-family:var(--mono);">3,240 코인</div>
        <div style="font-size:10px;color:var(--ink-muted);">투자 중 1,850 · 가용 1,390</div>
      </div>
      <NuxtLink class="btn btn-solid" to="/athletes" style="font-size:12px;padding:8px 18px;">선수에게 투자하기 →</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '홈 — Medalbank SSE' })
</script>

<style scoped>
/* ── MY HERO ── */
.my-hero {
  background: var(--blue); border-radius: 14px; padding: 20px 24px;
  margin-bottom: 18px; display: grid;
  grid-template-columns: 1fr auto; gap: 20px; align-items: center;
}
.mh-label  { font-size: 10px; color: rgba(255,255,255,.6); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
.mh-price  { font-family: var(--mono); font-size: 32px; font-weight: 500; color: #fff; margin-bottom: 4px; }
.mh-change { font-size: 13px; color: #4ADE80; font-family: var(--mono); margin-bottom: 14px; }
.mh-stats  { display: flex; gap: 20px; flex-wrap: wrap; }
.mh-stat   { display: flex; flex-direction: column; }
.mh-stat-label { font-size: 10px; color: rgba(255,255,255,.55); margin-bottom: 2px; }
.mh-stat-val   { font-size: 13px; font-weight: 500; color: #fff; font-family: var(--mono); }
.mh-chart  { width: 180px; height: 60px; }
.mh-chart svg { width: 100%; height: 100%; }

/* ── JOURNAL WIDGET ── */
.journal-widget { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; }
.jw-head  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.jw-title { font-size: 13px; font-weight: 500; color: var(--ink); display: flex; align-items: center; gap: 6px; }
.jw-btn   { font-size: 11px; color: var(--blue); border: 1px solid var(--blue); border-radius: 6px; padding: 4px 12px; background: none; cursor: pointer; font-family: var(--sans); }
.jw-days  { display: flex; gap: 6px; }
.jw-day   { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.jw-day-label { font-size: 10px; color: var(--ink-muted); }
.jw-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; }
.jc-done  { background: var(--blue); color: #fff; }
.jc-today { background: var(--teal); color: #fff; }
.jc-empty { background: var(--surface-alt); color: var(--ink-muted); }

/* ── RANK ROWS ── */
.rr { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-light); }
.rr:last-child { border-bottom: none; }
.rr.rr-me { background: var(--blue-pale); margin: 0 -14px; padding: 7px 14px; }
.rr-n  { font-size: 11px; font-weight: 500; width: 16px; text-align: center; font-family: var(--mono); color: var(--ink-muted); }
.rr-n.g { color: var(--amber); }
.rr-n.s { color: var(--ink-soft); }
.rr-n.b { color: #7B5E3A; }
.rr-nm  { font-size: 12px; color: var(--ink); flex: 1; }
.rr-me-tag { font-size: 9px; color: var(--blue); margin-left: 4px; font-weight: 500; }
.rr-vl  { font-size: 12px; font-family: var(--mono); color: var(--ink); font-weight: 500; }
.rr-cg  { font-size: 11px; font-family: var(--mono); min-width: 40px; text-align: right; }

/* MINI TABS */
.mini-tabs { display: flex; gap: 4px; }
.mini-tab { font-size: 10px; padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border); color: var(--ink-muted); cursor: pointer; background: var(--surface); font-family: var(--sans); }
.mini-tab.act { background: var(--blue); color: #fff; border-color: var(--blue); }
.mini-tab.act-purple { background: var(--purple); color: #fff; border-color: var(--purple); }
.panel-more { font-size: 11px; color: var(--blue); cursor: pointer; }

/* NOTICE */
.nr { display: flex; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-light); align-items: flex-start; cursor: pointer; }
.nr:last-child { border-bottom: none; }
.nr:hover { opacity: .8; }
.nr-dot  { width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.nr-body { flex: 1; }
.nr-text { font-size: 12px; color: var(--ink); line-height: 1.4; }
.nr-time { font-size: 10px; color: var(--ink-muted); margin-top: 2px; font-family: var(--mono); }
.nr-tag  { font-size: 9px; padding: 1px 6px; border-radius: 4px; margin-left: 4px; vertical-align: middle; }
.tag-green  { background: var(--teal-light);   color: var(--teal); }
.tag-blue   { background: var(--blue-light);   color: var(--blue); }
.tag-purple { background: var(--purple-light); color: var(--purple); }
.tag-red    { background: var(--red-light);    color: var(--red); }

/* CONTEST */
.ce { padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.ce:last-child { border-bottom: none; }
.featured-ce { border-left: 2px solid var(--blue); padding-left: 10px; margin-left: -14px; }
.ce-top  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.ce-name { font-size: 12px; font-weight: 500; color: var(--ink); }
.ce-dday { font-size: 10px; font-family: var(--mono); color: var(--amber); font-weight: 500; }
.ce-meta { display: flex; gap: 10px; margin-bottom: 6px; }
.ce-date    { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }
.ce-players { font-size: 11px; color: var(--blue); }
.ce-time    { font-size: 10px; color: var(--amber); margin-top: 5px; }
.ce-avatars { display: flex; }
.ce-av { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--surface); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 500; margin-left: -5px; }
.ce-av:first-child { margin-left: 0; }
.invest-link { font-size: 11px; color: var(--blue); margin-left: auto; cursor: pointer; font-weight: 500; }

/* PORTFOLIO */
.pr { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-light); }
.pr:last-child { border-bottom: none; }
.pr-name  { font-size: 12px; color: var(--ink); flex: 1; }
.pr-grade { font-size: 9px; padding: 1px 6px; border-radius: 4px; }
.pg-sponsor  { background: var(--blue-light);  color: var(--blue); }
.pg-support  { background: var(--teal-light);  color: var(--teal); }
.pg-personal { background: var(--amber-light); color: var(--amber); }
.pr-bar { width: 50px; height: 4px; background: var(--surface-alt); border-radius: 2px; overflow: hidden; }
.pr-bar-fill { height: 100%; border-radius: 2px; }
.pr-profit { font-size: 12px; font-family: var(--mono); font-weight: 500; min-width: 40px; text-align: right; }

/* COIN BAR */
.coin-bar { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 14px; }
.coin-bar .btn-solid { white-space: nowrap; }

/* GRIDS */
.dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr;       gap: 14px; margin-bottom: 14px; }
.dash-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr;   gap: 14px; margin-bottom: 14px; }
.dash-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 14px; }
.panel-head { padding: 11px 14px; }
.panel-body { padding: 8px 12px; }

@media (max-width: 1024px) {
  .dash-grid-3 { grid-template-columns: 1fr 1fr; }
  .dash-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .mh-chart { width: 120px; }
  .mh-stats { gap: 12px; }
}
@media (max-width: 720px) {
  .my-hero { grid-template-columns: 1fr; padding: 16px; gap: 10px; }
  .mh-chart { display: none; }
  .mh-price { font-size: 26px; }
  .dash-grid-2, .dash-grid-3, .dash-grid-4 { grid-template-columns: 1fr; }
  .coin-bar { flex-wrap: wrap; }
  .coin-bar .btn-solid { width: 100%; justify-content: center; }
}
</style>
