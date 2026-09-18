<template>
  <div>
    <!-- TABS -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ act: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </div>

    <!-- METRICS -->
    <div class="metrics-4">
      <div class="metric">
        <div class="metric-label">종합 지수</div>
        <div class="metric-val" style="color:var(--blue);">70.3</div>
        <div class="metric-sub up">▲ +2.1 이번 주</div>
      </div>
      <div class="metric">
        <div class="metric-label">현재 기록</div>
        <div class="metric-val">45.8<span style="font-size:14px;color:var(--ink-muted);">초</span></div>
        <div class="metric-sub up">▲ PB −0.7초</div>
      </div>
      <div class="metric">
        <div class="metric-label">출석률</div>
        <div class="metric-val">92<span style="font-size:14px;color:var(--ink-muted);">%</span></div>
        <div class="metric-sub blue">🔥 11주 연속</div>
      </div>
      <div class="metric">
        <div class="metric-label">현재 주가</div>
        <div class="metric-val" style="color:var(--blue);">1,440</div>
        <div class="metric-sub up">▲ +20% 주간</div>
      </div>
    </div>

    <!-- INDEX OVERVIEW -->
    <div class="index-overview">
      <div class="io-head">
        <div>
          <div style="font-size:11px;color:var(--ink-muted);margin-bottom:6px;letter-spacing:0.04em;">종합 지수 TOTAL INDEX</div>
          <div class="io-score-wrap">
            <div class="io-score">70.3</div>
            <div class="io-score-max">/ 100점</div>
            <div class="io-score-change">▲ +2.1 이번 주</div>
          </div>
        </div>
        <div class="io-rank-badges">
          <div class="io-badge io-badge-blue">시즌 랭킹 5위 / 24명</div>
          <div class="io-badge io-badge-amber">중형주 · 나이 보정 적용</div>
        </div>
      </div>
      <div class="io-bars">
        <div v-for="bar in indexBars" :key="bar.label" class="io-bar-row">
          <div class="io-bar-label">
            <span class="io-dot" :style="{ background: bar.color }"></span>{{ bar.label }}<span class="io-bar-weight">{{ bar.weight }}</span>
          </div>
          <div class="io-track"><div class="io-fill" :style="{ width: bar.fill, background: bar.color }"></div></div>
          <div class="io-score-val" :style="{ color: bar.color }">{{ bar.score }}</div>
          <div class="io-contrib" :class="{ down: bar.negative }">{{ bar.contrib }}</div>
        </div>
      </div>
    </div>

    <!-- MAIN 2 COL -->
    <div class="two-col">

      <!-- CHART PANEL -->
      <div class="panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">주가 추이</div>
            <div class="panel-sub">최근 12주 · PB 마킹 포함</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="tab-btn act" style="font-size:11px;padding:4px 10px;border-bottom:none;border:1px solid var(--border);border-radius:6px;">12주</button>
            <button class="tab-btn" style="font-size:11px;padding:4px 10px;border-bottom:none;border:1px solid var(--border);border-radius:6px;">시즌</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="chart-wrap">
            <svg viewBox="0 0 480 120" preserveAspectRatio="none" fill="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0D4F8B" stop-opacity="0.12"/>
                  <stop offset="100%" stop-color="#0D4F8B" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- grid lines -->
              <line x1="0" y1="24" x2="480" y2="24" stroke="#EAF1F8" stroke-width="1"/>
              <line x1="0" y1="60" x2="480" y2="60" stroke="#EAF1F8" stroke-width="1"/>
              <line x1="0" y1="96" x2="480" y2="96" stroke="#EAF1F8" stroke-width="1"/>
              <text x="484" y="27" font-size="9" fill="#8A99A8" font-family="monospace">1,600</text>
              <text x="484" y="63" font-size="9" fill="#8A99A8" font-family="monospace">1,200</text>
              <text x="484" y="99" font-size="9" fill="#8A99A8" font-family="monospace">800</text>
              <!-- area + line -->
              <path d="M0,100 L40,96 L80,90 L120,85 L160,88 L200,76 L240,68 L280,72 L320,58 L360,44 L400,36 L440,26 L480,18 L480,120 L0,120Z" fill="url(#cg)"/>
              <path d="M0,100 L40,96 L80,90 L120,85 L160,88 L200,76 L240,68 L280,72 L320,58 L360,44 L400,36 L440,26 L480,18" stroke="#0D4F8B" stroke-width="1.8" stroke-linecap="round"/>
              <!-- PB marker -->
              <circle cx="320" cy="58" r="5" fill="#0A7A6A"/>
              <line x1="320" y1="20" x2="320" y2="52" stroke="#0A7A6A" stroke-width="1" stroke-dasharray="3,2"/>
              <rect x="300" y="10" width="38" height="14" rx="4" fill="#0A7A6A"/>
              <text x="303" y="21" font-size="9" fill="#fff" font-family="monospace" font-weight="500">PB 달성</text>
              <!-- current dot -->
              <circle cx="480" cy="18" r="4" fill="#0D4F8B"/>
              <circle cx="480" cy="18" r="8" fill="#0D4F8B" fill-opacity="0.2"/>
            </svg>
          </div>
          <div class="chart-labels">
            <span class="chart-label">3월 1주</span>
            <span class="chart-label">4월</span>
            <span class="chart-label">5월</span>
            <span class="chart-label">현재</span>
          </div>
        </div>
      </div>

      <!-- RADAR -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">지수 레이더</div>
            <div class="panel-sub">6개 카테고리 시각화</div>
          </div>
          <div class="panel-body">
            <div class="radar-wrap">
              <svg viewBox="0 0 200 200" width="180" height="180" fill="none">
                <!-- Pentagon grid -->
                <polygon points="100,15 171,58 171,142 100,185 29,142 29,58" fill="none" stroke="#EAF1F8" stroke-width="1"/>
                <polygon points="100,35 155,68 155,132 100,165 45,132 45,68" fill="none" stroke="#EAF1F8" stroke-width="1"/>
                <polygon points="100,55 139,78 139,122 100,145 61,122 61,78" fill="none" stroke="#EAF1F8" stroke-width="1"/>
                <polygon points="100,75 123,88 123,112 100,125 77,112 77,88" fill="none" stroke="#EAF1F8" stroke-width="1"/>
                <!-- axis lines -->
                <line x1="100" y1="15" x2="100" y2="185" stroke="#EAF1F8" stroke-width="1"/>
                <line x1="100" y1="100" x2="171" y2="58" stroke="#EAF1F8" stroke-width="1"/>
                <line x1="100" y1="100" x2="171" y2="142" stroke="#EAF1F8" stroke-width="1"/>
                <line x1="100" y1="100" x2="100" y2="185" stroke="#EAF1F8" stroke-width="1"/>
                <line x1="100" y1="100" x2="29" y2="142" stroke="#EAF1F8" stroke-width="1"/>
                <line x1="100" y1="100" x2="29" y2="58" stroke="#EAF1F8" stroke-width="1"/>
                <!-- Data shape -->
                <polygon points="100,27 157,69 163,137 100,158 44,129 52,64" fill="#0D4F8B" fill-opacity="0.15" stroke="#0D4F8B" stroke-width="1.5"/>
                <!-- labels -->
                <text x="100" y="10" text-anchor="middle" font-size="9" fill="#5A6B7B" font-family="Pretendard,sans-serif">현재 실적</text>
                <text x="178" y="56" text-anchor="start" font-size="9" fill="#5A6B7B" font-family="Pretendard,sans-serif">성장성</text>
                <text x="178" y="148" text-anchor="start" font-size="9" fill="#5A6B7B" font-family="Pretendard,sans-serif">훈련 투자</text>
                <text x="100" y="196" text-anchor="middle" font-size="9" fill="#5A6B7B" font-family="Pretendard,sans-serif">시장 지위</text>
                <text x="22" y="148" text-anchor="end" font-size="9" fill="#5A6B7B" font-family="Pretendard,sans-serif">이벤트</text>
                <text x="22" y="56" text-anchor="end" font-size="9" fill="#5A6B7B" font-family="Pretendard,sans-serif">리스크</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3 DETAIL PANELS -->
    <div class="three-col">

      <!-- 현재 실적 -->
      <div class="panel">
        <div class="panel-head" style="border-left:3px solid var(--blue);">
          <div>
            <div class="panel-title">현재 실적</div>
            <div class="panel-sub">75점 × 30% = +22.5</div>
          </div>
          <div style="font-size:20px;font-weight:500;color:var(--blue);font-family:var(--mono);">75</div>
        </div>
        <div class="panel-body">
          <div class="detail-row">
            <div class="dr-label">현재 기록 (50m 평영)</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:75%;background:var(--blue);"></div></div>
              <div class="dr-val">45.8초</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">PB 달성률</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:80%;background:var(--blue);"></div></div>
              <div class="dr-val up">80%</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">기록 향상률</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:65%;background:var(--blue);"></div></div>
              <div class="dr-val up">+1.5%</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">기록 안정성 (변동계수)</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:80%;background:var(--blue);"></div></div>
              <div class="dr-val up">1.8%</div>
            </div>
          </div>
          <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-light);">
            <div style="font-size:10px;color:var(--ink-muted);margin-bottom:6px;">동일 연령대 비교</div>
            <div class="compare-bar">
              <div class="cb-row">
                <div class="cb-label">나의 기록</div>
                <div class="cb-track"><div class="cb-fill-me" style="width:75%;"></div><div class="cb-fill-avg" style="left:55%;"></div></div>
                <div class="cb-val">45.8초</div>
              </div>
            </div>
            <div style="font-size:10px;color:var(--ink-muted);margin-top:4px;">│ 동일 연령 평균: 48.2초</div>
          </div>
        </div>
      </div>

      <!-- 성장성 -->
      <div class="panel">
        <div class="panel-head" style="border-left:3px solid var(--teal);">
          <div>
            <div class="panel-title">성장성</div>
            <div class="panel-sub">60점 × 25% = +15.0</div>
          </div>
          <div style="font-size:20px;font-weight:500;color:var(--teal);font-family:var(--mono);">60</div>
        </div>
        <div class="panel-body">
          <div class="detail-row">
            <div class="dr-label">나이 보정 지수 <span style="font-size:9px;color:var(--ink-muted);">(25세)</span></div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:55%;background:var(--teal);"></div></div>
              <div class="dr-val" style="color:var(--teal);">55점</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">세계 기록 대비 여력</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:60%;background:var(--teal);"></div></div>
              <div class="dr-val">+19.1초</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">주당 훈련 시간</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:70%;background:var(--teal);"></div></div>
              <div class="dr-val">7h/주</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">시즌 출전 계획</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:60%;background:var(--teal);"></div></div>
              <div class="dr-val">3대회</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">영법 다양성</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:50%;background:var(--teal);"></div></div>
              <div class="dr-val">2영법</div>
            </div>
          </div>
          <div style="margin-top:10px;padding:8px;background:var(--teal-light);border-radius:6px;font-size:11px;color:var(--teal);">
            💡 15세 선수 대비 낮은 나이 보정 — 기록 향상이 더 중요한 시기
          </div>
        </div>
      </div>

      <!-- 훈련 투자 -->
      <div class="panel">
        <div class="panel-head" style="border-left:3px solid var(--amber);">
          <div>
            <div class="panel-title">훈련 투자</div>
            <div class="panel-sub">90점 × 20% = +18.0</div>
          </div>
          <div style="font-size:20px;font-weight:500;color:var(--amber);font-family:var(--mono);">90</div>
        </div>
        <div class="panel-body">
          <div class="detail-row">
            <div class="dr-label">아카데미 출석률</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:92%;background:var(--amber);"></div></div>
              <div class="dr-val amber">92%</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">연속 출석</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:85%;background:var(--amber);"></div></div>
              <div class="dr-val amber">11주</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">훈련 일지 성실도</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:90%;background:var(--amber);"></div></div>
              <div class="dr-val amber">18일/월</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="dr-label">전지훈련 참가</div>
            <div class="dr-bar-wrap">
              <div class="dr-bar"><div class="dr-fill" style="width:0%;background:var(--amber);"></div></div>
              <div class="dr-val" style="color:var(--ink-muted);">0회</div>
            </div>
          </div>
          <div style="margin-top:10px;padding:8px;background:var(--amber-light);border-radius:6px;font-size:11px;color:var(--amber);">
            🔥 전지훈련 참가 시 +20점 추가 가능 — 시즌 내 기회 있음
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM 2 COL -->
    <div class="two-col">

      <!-- 시장 지위 + 이벤트 -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">시장 지위 · 특별 이벤트</div>
          <div class="panel-sub">시장 지위 70점 · 이벤트 30점</div>
        </div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
            <div>
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:8px;letter-spacing:0.04em;">시장 지위</div>
              <div class="detail-row" style="padding:5px 0;">
                <div class="dr-label" style="font-size:11px;">연령대 랭킹</div>
                <div class="dr-val purple">3위</div>
              </div>
              <div class="detail-row" style="padding:5px 0;">
                <div class="dr-label" style="font-size:11px;">투자자 수</div>
                <div class="dr-val purple">8명</div>
              </div>
              <div class="detail-row" style="padding:5px 0;">
                <div class="dr-label" style="font-size:11px;">국제 대회</div>
                <div class="dr-val" style="color:var(--ink-muted);">미출전</div>
              </div>
            </div>
            <div>
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:8px;letter-spacing:0.04em;">이벤트 이력</div>
              <div class="ev-item" style="padding:4px 0;">
                <div class="ev-icon" style="background:var(--teal-light);width:22px;height:22px;font-size:11px;">🏅</div>
                <div class="ev-body"><div class="ev-title" style="font-size:11px;">대회 PB 달성</div><div class="ev-time">5월 10일</div></div>
                <div class="ev-val up" style="font-size:11px;">+30%</div>
              </div>
              <div class="ev-item" style="padding:4px 0;">
                <div class="ev-icon" style="background:var(--blue-light);width:22px;height:22px;font-size:11px;">🏊</div>
                <div class="ev-body"><div class="ev-title" style="font-size:11px;">대회 출전 완주</div><div class="ev-time">4월 20일</div></div>
                <div class="ev-val up" style="font-size:11px;">+10%</div>
              </div>
            </div>
          </div>
          <div style="padding:10px;background:var(--purple-light);border-radius:8px;font-size:11px;color:var(--purple);">
            ⭐ 국제 대회 출전 시 +30점 · 국가대표 선발 시 +50점 추가 가능
          </div>
        </div>
      </div>

      <!-- 리스크 + 주간 변동 -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">리스크 · 주간 기록 변동</div>
          <div class="panel-sub">리스크 −2점 · 이번 주 기준</div>
        </div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
            <div>
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:8px;letter-spacing:0.04em;">리스크 항목</div>
              <div class="detail-row" style="padding:5px 0;">
                <div class="dr-label" style="font-size:11px;">부상 이력</div>
                <span class="risk-tag rt-warn">1회</span>
              </div>
              <div class="detail-row" style="padding:5px 0;">
                <div class="dr-label" style="font-size:11px;">멘탈 안정성</div>
                <span class="risk-tag rt-ok">안정</span>
              </div>
              <div class="detail-row" style="padding:5px 0;">
                <div class="dr-label" style="font-size:11px;">훈련 공백</div>
                <span class="risk-tag rt-ok">0주</span>
              </div>
              <div class="detail-row" style="padding:5px 0;">
                <div class="dr-label" style="font-size:11px;">도핑</div>
                <span class="risk-tag rt-ok">클린</span>
              </div>
            </div>
            <div>
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:8px;letter-spacing:0.04em;">이번 주 기록 변동</div>
              <table class="rec-table" style="font-size:11px;">
                <tbody>
                  <tr><td>기록</td><td class="mono">45.8초</td><td class="up">−0.7</td></tr>
                  <tr><td>출석</td><td class="mono">출석</td><td class="up">+5%</td></tr>
                  <tr><td>안정성</td><td class="mono">1.8%</td><td class="up">안정</td></tr>
                  <tr><td>주가</td><td class="mono">1,440</td><td class="up">+20%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style="padding:10px;background:var(--red-light);border-radius:8px;font-size:11px;color:var(--red);">
            ⚠️ 부상 이력 1회 감점 중 · 6개월 경과 후 자동 해제 예정
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '수영 지수 — Medalbank SSE' })

const tabs = [
  { id: 'all', label: '전체 지수' },
  { id: 'perf', label: '현재 실적' },
  { id: 'growth', label: '성장성' },
  { id: 'train', label: '훈련 투자' },
  { id: 'market', label: '시장 지위' },
  { id: 'risk', label: '리스크' },
]
const activeTab = ref('all')

const indexBars = [
  { label: '현재 실적', weight: '×30%', fill: '75%', color: 'var(--blue)', score: '75점', contrib: '+22.5', negative: false },
  { label: '성장성', weight: '×25%', fill: '60%', color: 'var(--teal)', score: '60점', contrib: '+15.0', negative: false },
  { label: '훈련 투자', weight: '×20%', fill: '90%', color: 'var(--amber)', score: '90점', contrib: '+18.0', negative: false },
  { label: '시장 지위', weight: '×15%', fill: '70%', color: 'var(--purple)', score: '70점', contrib: '+10.5', negative: false },
  { label: '특별 이벤트', weight: '×10%', fill: '30%', color: 'var(--pink)', score: '30점', contrib: '+3.0', negative: false },
  { label: '리스크 감점', weight: '', fill: '10%', color: 'var(--red)', score: '−2점', contrib: '−2.0', negative: true },
]
</script>

<style scoped>
/* METRICS */
.metrics-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.metric-val { font-size: 22px; }
.blue { color: var(--blue); }
.amber { color: var(--amber); }
.purple { color: var(--purple); }

/* INDEX OVERVIEW CARD */
.index-overview { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
.io-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.io-score-wrap { display: flex; align-items: baseline; gap: 10px; }
.io-score { font-family: var(--mono); font-size: 48px; font-weight: 500; color: var(--blue); }
.io-score-max { font-size: 16px; color: var(--ink-muted); }
.io-score-change { font-size: 13px; color: var(--teal); background: var(--teal-light); border-radius: 6px; padding: 3px 10px; font-family: var(--mono); }
.io-rank-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.io-badge { font-size: 11px; padding: 4px 12px; border-radius: 6px; font-family: var(--mono); }
.io-badge-blue { background: var(--blue-light); color: var(--blue); }
.io-badge-amber { background: var(--amber-light); color: var(--amber); }

.io-bars { display: flex; flex-direction: column; gap: 12px; }
.io-bar-row { display: grid; grid-template-columns: 120px 1fr 48px 52px; gap: 12px; align-items: center; }
.io-bar-label { font-size: 12px; color: var(--ink-soft); display: flex; align-items: center; gap: 6px; }
.io-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.io-bar-weight { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }
.io-track { background: var(--surface-alt); border-radius: 6px; height: 8px; overflow: hidden; }
.io-fill { height: 100%; border-radius: 6px; transition: width 0.8s ease; }
.io-score-val { font-size: 13px; font-weight: 500; font-family: var(--mono); text-align: right; }
.io-contrib { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); text-align: right; }

/* TWO / THREE COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }

/* CHART */
.chart-wrap { height: 120px; position: relative; margin-bottom: 12px; }
.chart-wrap svg { width: 100%; height: 100%; }
.chart-labels { display: flex; justify-content: space-between; }
.chart-label { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }

/* RECORD TABLE */
.rec-table { width: 100%; border-collapse: collapse; }
.rec-table td { font-size: 12px; padding: 8px 8px; border-bottom: 1px solid var(--border-light); color: var(--ink); }
.rec-table tr:last-child td { border-bottom: none; }
.rec-table td.mono { font-family: var(--mono); }
.rec-table td.up { color: var(--teal); font-family: var(--mono); }
.rec-table td.down { color: var(--red); font-family: var(--mono); }

/* RADAR */
.radar-wrap { display: flex; align-items: center; justify-content: center; padding: 8px 0; }

/* EVENT LIST */
.ev-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-light); align-items: flex-start; }
.ev-item:last-child { border-bottom: none; }
.ev-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
.ev-body { flex: 1; }
.ev-title { font-size: 12px; color: var(--ink); margin-bottom: 2px; }
.ev-time { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }
.ev-val { font-size: 12px; font-family: var(--mono); font-weight: 500; white-space: nowrap; }

/* DETAIL ROWS */
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.detail-row:last-child { border-bottom: none; }
.dr-label { font-size: 12px; color: var(--ink-soft); }
.dr-val { font-size: 13px; font-weight: 500; color: var(--ink); font-family: var(--mono); }
.dr-val.purple { color: var(--purple); }
.dr-val.amber { color: var(--amber); }
.dr-bar-wrap { display: flex; align-items: center; gap: 8px; }
.dr-bar { width: 80px; height: 5px; background: var(--surface-alt); border-radius: 3px; overflow: hidden; }
.dr-fill { height: 100%; border-radius: 3px; }

/* RISK TAG */
.risk-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 8px; border-radius: 4px; }
.rt-ok { background: var(--teal-light); color: var(--teal); }
.rt-warn { background: var(--amber-light); color: var(--amber); }
.rt-danger { background: var(--red-light); color: var(--red); }

/* COMPARISON */
.compare-bar { display: flex; flex-direction: column; gap: 10px; }
.cb-row { display: grid; grid-template-columns: 90px 1fr 50px; gap: 8px; align-items: center; }
.cb-label { font-size: 11px; color: var(--ink-soft); }
.cb-track { position: relative; height: 16px; background: var(--surface-alt); border-radius: 4px; overflow: hidden; }
.cb-fill-me { height: 100%; border-radius: 4px; background: var(--blue); opacity: 0.85; }
.cb-fill-avg { position: absolute; top: 0; height: 100%; width: 2px; background: var(--ink-muted); }
.cb-val { font-size: 11px; font-family: var(--mono); color: var(--ink); text-align: right; }

@media (max-width: 1024px) {
  .metrics-4 { grid-template-columns: repeat(2, 1fr); }
  .three-col { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .metrics-4, .two-col { grid-template-columns: 1fr; }
  .io-bar-row { grid-template-columns: 100px 1fr 44px 48px; }
}
</style>
