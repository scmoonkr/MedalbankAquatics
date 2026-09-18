<template>
  <div>
    <!-- METRICS -->
    <div class="metrics-4">
      <div class="metric">
        <div class="metric-label">이번 달 입력</div>
        <div class="metric-val blue">18일</div>
        <div class="metric-sub up">🔥 연속 7일 중</div>
      </div>
      <div class="metric">
        <div class="metric-label">누적 거리</div>
        <div class="metric-val" style="color:var(--ink);">42.5<span style="font-size:13px;color:var(--ink-muted);">km</span></div>
        <div class="metric-sub" style="color:var(--ink-muted);">이번 달</div>
      </div>
      <div class="metric">
        <div class="metric-label">평균 훈련 강도</div>
        <div class="metric-val" style="color:var(--ink);font-size:16px;">보통</div>
        <div class="metric-sub" style="color:var(--ink-muted);">최근 2주 기준</div>
      </div>
      <div class="metric">
        <div class="metric-label">일지 코인 적립</div>
        <div class="metric-val amber">+180</div>
        <div class="metric-sub amber">이번 달 누적</div>
      </div>
    </div>

    <!-- WRITE FORM -->
    <div class="write-card">
      <div class="wc-head">
        <div class="wc-title">✏️ 오늘 훈련 기록 <span class="wc-date">2026.05.22 (목)</span></div>
        <div class="wc-coin-hint">🪙 저장 시 +10 코인 적립</div>
      </div>
      <div class="wc-body">
        <div class="form-grid">
          <div class="form-item">
            <label class="form-label">장소</label>
            <select class="form-select">
              <option>실내 수영장</option>
              <option>실외 수영장</option>
              <option>개인 훈련</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">거리 (m)</label>
            <input v-model="dist" class="form-input" type="number" placeholder="예: 2000">
          </div>
          <div class="form-item">
            <label class="form-label">시간 (분)</label>
            <input v-model="dur" class="form-input" type="number" placeholder="예: 60">
          </div>
          <div class="form-item">
            <label class="form-label">훈련 내용</label>
            <select class="form-select">
              <option>드릴 위주</option>
              <option>체력 훈련</option>
              <option>스피드</option>
              <option>혼합</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">강도</label>
            <select class="form-select">
              <option>가볍게</option>
              <option selected>보통</option>
              <option>힘들게</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">컨디션</label>
            <div class="condition-wrap">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ on: n <= condition }"
                @click="condition = n"
              >★</span>
            </div>
          </div>
        </div>
        <div class="memo-wrap">
          <div class="memo-label">
            훈련 메모
            <span class="memo-pub-tag">👁 투자자에게 공개됩니다</span>
          </div>
          <textarea v-model="memo" class="memo-textarea" placeholder="오늘 훈련 내용, 컨디션, 특이사항을 자유롭게 적어보세요. 투자자들이 볼 수 있습니다."></textarea>
        </div>
        <div class="wc-footer">
          <button
            class="save-btn"
            :class="{ saved }"
            :disabled="saved"
            @click="saveJournal"
          >{{ saved ? '✓ 저장 완료 · +10 코인 적립' : '저장하기 →' }}</button>
        </div>
      </div>
    </div>

    <!-- CALENDAR + RECENT -->
    <div class="two-col">

      <!-- CALENDAR -->
      <div class="calendar-card">
        <div class="cal-head">
          <div class="cal-title">5월 훈련 달력</div>
          <div class="cal-nav">
            <button class="cal-nav-btn">‹</button>
            <span class="cal-month">2026년 5월</span>
            <button class="cal-nav-btn">›</button>
          </div>
        </div>
        <div class="cal-grid">
          <div v-for="d in dow" :key="'dow-' + d" class="cal-dow">{{ d }}</div>
          <div
            v-for="(cell, i) in calDays"
            :key="'cd-' + i"
            class="cal-day"
            :class="cell.cls"
            :title="cell.title"
          >{{ cell.n }}</div>
        </div>
        <div class="cal-legend">
          <div class="cl-item"><div class="cl-dot" style="background:var(--blue);"></div> 훈련 기록</div>
          <div class="cl-item"><div class="cl-dot" style="background:var(--teal);"></div> PB 달성</div>
          <div class="cl-item"><div class="cl-dot" style="background:var(--surface-alt);border:1px solid var(--border);"></div> 미기록</div>
          <div class="cl-item"><div class="cl-today-dot"></div> 오늘</div>
        </div>
      </div>

      <!-- RECENT ENTRIES -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">📋 최근 훈련 기록</div>
          <div style="font-size:11px;color:var(--blue);cursor:pointer;">전체 보기</div>
        </div>
        <div class="panel-body">
          <div
            v-for="(e, i) in entries"
            :key="'e-' + i"
            class="entry-item"
            :style="e.highlight ? 'border:1px solid var(--teal-light);background:var(--teal-light);' : ''"
          >
            <div class="ei-top">
              <div class="ei-date" :style="e.highlight ? 'color:var(--teal);' : ''">{{ e.date }}</div>
              <span class="ei-badge" :class="e.badgeCls">{{ e.badge }}</span>
            </div>
            <div class="ei-stats">
              <div class="ei-stat">거리 <strong>{{ e.dist }}</strong></div>
              <div class="ei-stat">시간 <strong>{{ e.time }}</strong></div>
              <div class="ei-stat">컨디션 <span class="ei-stars">{{ e.stars }}</span></div>
            </div>
            <div class="ei-memo">{{ e.memo }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- STREAK + BONUS -->
    <div class="two-col">
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">🔥 연속 기록 현황</div>
          <div style="font-size:11px;color:var(--ink-muted);">최근 8주 훈련 밀도</div>
        </div>
        <div class="panel-body">
          <div class="streak-header">
            <span class="streak-num">7일</span>
            <span class="streak-label">현재 연속 입력 중</span>
          </div>
          <div class="streak-grid">
            <div v-for="(s, i) in streakCells" :key="'sc-' + i" class="sc" :class="s"></div>
          </div>
          <div class="streak-scale">
            <span>적음</span>
            <div class="sc s0" style="margin:0;"></div>
            <div class="sc s1" style="margin:0;"></div>
            <div class="sc s2" style="margin:0;"></div>
            <div class="sc s3" style="margin:0;"></div>
            <span>많음</span>
          </div>
          <div class="bonus-section">
            <div class="bonus-title">보너스 현황</div>
            <div class="bonus-row">
              <div>
                <div class="bonus-label">7일 연속 달성</div>
                <div class="bonus-progress up">오늘 달성!</div>
              </div>
              <div class="bonus-val bv-done">+50 코인 🎉</div>
            </div>
            <div class="bonus-row">
              <div>
                <div class="bonus-label">30일 연속</div>
                <div class="bonus-progress" style="color:var(--amber);">D-23 · 계속 이어가세요</div>
              </div>
              <div class="bonus-val bv-next">+300 코인</div>
            </div>
            <div class="bonus-row">
              <div>
                <div class="bonus-label">100일 연속</div>
                <div class="bonus-progress" style="color:var(--ink-muted);">D-93</div>
              </div>
              <div class="bonus-val bv-far">특별 뱃지</div>
            </div>
          </div>
        </div>
      </div>

      <!-- MONTHLY STATS -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">📊 이번 달 훈련 통계</div>
          <div style="font-size:11px;color:var(--ink-muted);">5월 기준</div>
        </div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
            <div style="background:var(--surface-soft);border-radius:8px;padding:12px;">
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:4px;">총 훈련 거리</div>
              <div style="font-size:18px;font-weight:500;font-family:var(--mono);">42.5km</div>
              <div style="font-size:11px;color:var(--teal);">▲ 지난달 대비 +8km</div>
            </div>
            <div style="background:var(--surface-soft);border-radius:8px;padding:12px;">
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:4px;">총 훈련 시간</div>
              <div style="font-size:18px;font-weight:500;font-family:var(--mono);">18.5h</div>
              <div style="font-size:11px;color:var(--teal);">▲ 지난달 대비 +2.5h</div>
            </div>
            <div style="background:var(--surface-soft);border-radius:8px;padding:12px;">
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:4px;">평균 거리/회</div>
              <div style="font-size:18px;font-weight:500;font-family:var(--mono);">2,361m</div>
              <div style="font-size:11px;color:var(--ink-muted);">18회 기록 기준</div>
            </div>
            <div style="background:var(--surface-soft);border-radius:8px;padding:12px;">
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:4px;">일지 코인 적립</div>
              <div style="font-size:18px;font-weight:500;font-family:var(--mono);color:var(--amber);">+180</div>
              <div style="font-size:11px;color:var(--amber);">7일 보너스 예정 +50</div>
            </div>
          </div>
          <div style="border-top:1px solid var(--border-light);padding-top:12px;">
            <div style="font-size:11px;color:var(--ink-muted);margin-bottom:8px;font-weight:600;letter-spacing:0.04em;">강도별 분포</div>
            <div style="display:flex;gap:6px;margin-bottom:6px;">
              <div style="flex:3;background:var(--blue-light);border-radius:4px;padding:5px 8px;text-align:center;font-size:11px;color:var(--blue);">가볍게<br><strong>3회</strong></div>
              <div style="flex:8;background:var(--teal-light);border-radius:4px;padding:5px 8px;text-align:center;font-size:11px;color:var(--teal);">보통<br><strong>9회</strong></div>
              <div style="flex:6;background:var(--amber-light);border-radius:4px;padding:5px 8px;text-align:center;font-size:11px;color:var(--amber);">힘들게<br><strong>6회</strong></div>
            </div>
            <div style="font-size:11px;color:var(--ink-muted);margin-top:8px;">
              평균 컨디션 <strong style="color:var(--ink);font-family:var(--mono);">3.9 / 5.0</strong> ⭐
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '훈련 일지 — Medalbank SSE' })

const dist = ref('')
const dur = ref('')
const memo = ref('')
const condition = ref(3)
const saved = ref(false)

function saveJournal() {
  if (!dist.value || !dur.value) {
    alert('거리와 시간을 입력해주세요.')
    return
  }
  saved.value = true
  setTimeout(() => {
    saved.value = false
    dist.value = ''
    dur.value = ''
    memo.value = ''
  }, 2500)
}

const dow = ['일', '월', '화', '수', '목', '금', '토']

const calDays = [
  { n: 0, cls: 'cd-empty', title: '' },
  { n: 0, cls: 'cd-empty', title: '' },
  { n: 0, cls: 'cd-empty', title: '' },
  { n: 0, cls: 'cd-empty', title: '' },
  { n: 1, cls: 'cd-absent', title: '' },
  { n: 2, cls: 'cd-done', title: '' },
  { n: 3, cls: 'cd-done', title: '' },
  { n: 4, cls: 'cd-absent', title: '' },
  { n: 5, cls: 'cd-done', title: '' },
  { n: 6, cls: 'cd-done', title: '' },
  { n: 7, cls: 'cd-pb', title: 'PB 달성' },
  { n: 8, cls: 'cd-done', title: '' },
  { n: 9, cls: 'cd-done', title: '' },
  { n: 10, cls: 'cd-absent', title: '' },
  { n: 11, cls: 'cd-absent', title: '' },
  { n: 12, cls: 'cd-done', title: '' },
  { n: 13, cls: 'cd-done', title: '' },
  { n: 14, cls: 'cd-done', title: '' },
  { n: 15, cls: 'cd-done', title: '' },
  { n: 16, cls: 'cd-done', title: '' },
  { n: 17, cls: 'cd-absent', title: '' },
  { n: 18, cls: 'cd-absent', title: '' },
  { n: 19, cls: 'cd-done', title: '' },
  { n: 20, cls: 'cd-done', title: '' },
  { n: 21, cls: 'cd-done', title: '' },
  { n: 22, cls: 'cd-today', title: '' },
  { n: 23, cls: 'cd-future', title: '' },
  { n: 24, cls: 'cd-future', title: '' },
  { n: 25, cls: 'cd-future', title: '' },
  { n: 26, cls: 'cd-future', title: '' },
  { n: 27, cls: 'cd-future', title: '' },
  { n: 28, cls: 'cd-future', title: '' },
  { n: 29, cls: 'cd-future', title: '' },
  { n: 30, cls: 'cd-future', title: '' },
  { n: 31, cls: 'cd-future', title: '' },
]

const entries = [
  {
    date: '5월 21일 (수)', badge: '💪 힘들게', badgeCls: 'eb-hard',
    dist: '3,000m', time: '75분', stars: '★★★★',
    memo: '"대회 준비 막바지. 스피드 훈련 집중. 마지막 50m 랩 타임 체크."',
    highlight: false,
  },
  {
    date: '5월 20일 (화)', badge: '🏊 보통', badgeCls: 'eb-normal',
    dist: '2,000m', time: '60분', stars: '★★★',
    memo: '"드릴 위주로 기술 다듬기. 평영 킥 타이밍 교정 중."',
    highlight: false,
  },
  {
    date: '5월 19일 (월)', badge: '🌊 가볍게', badgeCls: 'eb-light',
    dist: '1,500m', time: '45분', stars: '★★★★★',
    memo: '"회복 훈련. 가볍게 몸 풀기. 컨디션 최상."',
    highlight: false,
  },
  {
    date: '5월 7일 (목)', badge: '🏅 PB 달성', badgeCls: 'eb-pb',
    dist: '2,500m', time: '65분', stars: '★★★★★',
    memo: '"45.8초 PB! 드디어 46초 벽 돌파. 최고의 날 🎉"',
    highlight: true,
  },
]

const streakCells = [
  's1','s2','s1','s0','s2','s3','s2',
  's0','s1','s2','s2','s1','s0','s2',
  's2','s3','s2','s1','s3','s2','s0',
  's0','s2','s3','s3','s2','s3','s3',
  's1','s2','s3','s2','s3','s3','s0',
  's0','s3','s3','s2','s3','s3','s3',
  's0','s3','s3','s3','s3','s3','s3',
  's0','s3','s3','s3','s3','s3','s0',
]
</script>

<style scoped>
/* Delta color utilities used on this page */
.blue { color: var(--blue); }
.amber { color: var(--amber); }

/* METRICS */
.metrics-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.metric-val { font-size: 20px; }

/* WRITE FORM */
.write-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 20px; }
.wc-head { padding: 16px 20px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
.wc-title { font-size: 14px; font-weight: 500; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.wc-date { font-size: 12px; color: var(--ink-muted); font-family: var(--mono); }
.wc-coin-hint { font-size: 11px; color: var(--amber); display: flex; align-items: center; gap: 4px; background: var(--amber-light); border-radius: 6px; padding: 4px 10px; }
.wc-body { padding: 18px 20px; }
.form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.form-item { display: flex; flex-direction: column; gap: 5px; }
.form-item .form-label { font-size: 11px; color: var(--ink-soft); font-weight: 500; }
.condition-wrap { display: flex; gap: 4px; margin-top: 2px; }
.star { font-size: 20px; cursor: pointer; color: var(--border); transition: color 0.1s; }
.star.on { color: #F59E0B; }
.memo-wrap { margin-bottom: 14px; }
.memo-label { font-size: 11px; color: var(--ink-soft); font-weight: 500; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
.memo-pub-tag { font-size: 10px; color: var(--blue); background: var(--blue-light); border-radius: 4px; padding: 2px 7px; }
.memo-textarea { width: 100%; padding: 10px 14px; font-size: 13px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-soft); color: var(--ink); font-family: var(--sans); resize: none; height: 72px; outline: none; line-height: 1.6; }
.memo-textarea:focus { border-color: var(--blue); }
.wc-footer { display: flex; justify-content: flex-end; }
.save-btn { font-size: 13px; font-weight: 500; color: #fff; background: var(--blue); border: none; border-radius: 8px; padding: 10px 24px; cursor: pointer; font-family: var(--sans); }
.save-btn:hover { background: var(--blue-mid); }
.save-btn.saved { background: var(--teal); cursor: default; }

/* CALENDAR */
.calendar-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; }
.cal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.cal-title { font-size: 14px; font-weight: 500; color: var(--ink); }
.cal-nav { display: flex; align-items: center; gap: 10px; }
.cal-nav-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; color: var(--ink-soft); }
.cal-month { font-size: 13px; font-weight: 500; color: var(--ink); font-family: var(--mono); }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-dow { font-size: 10px; color: var(--ink-muted); text-align: center; padding: 4px 0 8px; font-weight: 600; }
.cal-day { aspect-ratio: 1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.1s; position: relative; }
.cal-day:hover { background: var(--surface-alt); }
.cd-empty { color: transparent; pointer-events: none; }
.cd-done { background: var(--blue); color: #fff; font-weight: 500; }
.cd-done:hover { background: var(--blue-mid); }
.cd-pb { background: var(--teal); color: #fff; font-weight: 500; }
.cd-today { border: 2px solid var(--blue); color: var(--blue); font-weight: 500; }
.cd-absent { background: var(--surface-alt); color: var(--ink-muted); }
.cd-future { color: var(--ink-muted); }
.cal-legend { display: flex; gap: 16px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-light); }
.cl-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-muted); }
.cl-dot { width: 10px; height: 10px; border-radius: 50%; }
.cl-today-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--blue); }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

/* JOURNAL ENTRY */
.entry-item { padding: 10px; background: var(--surface-soft); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: background 0.1s; }
.entry-item:last-child { margin-bottom: 0; }
.entry-item:hover { background: var(--surface-alt); }
.ei-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.ei-date { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }
.ei-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.eb-pb { background: var(--teal-light); color: var(--teal); }
.eb-hard { background: var(--amber-light); color: var(--amber); }
.eb-normal { background: var(--blue-light); color: var(--blue); }
.eb-light { background: var(--surface-alt); color: var(--ink-muted); border: 1px solid var(--border); }
.ei-stats { display: flex; gap: 12px; margin-bottom: 6px; }
.ei-stat { font-size: 11px; color: var(--ink-muted); }
.ei-stat strong { color: var(--ink); font-family: var(--mono); }
.ei-memo { font-size: 11px; color: var(--ink-soft); font-style: italic; line-height: 1.4; }
.ei-stars { font-size: 12px; color: #F59E0B; }

/* STREAK */
.streak-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
.streak-num { font-size: 32px; font-weight: 500; color: var(--blue); font-family: var(--mono); }
.streak-label { font-size: 13px; color: var(--ink-soft); }
.streak-grid { display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 12px; }
.sc { width: 14px; height: 14px; border-radius: 3px; }
.s0 { background: var(--surface-alt); }
.s1 { background: #B5D4F4; }
.s2 { background: #378ADD; }
.s3 { background: #0D4F8B; }
.streak-scale { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--ink-muted); margin-bottom: 14px; }
.bonus-section { border-top: 1px solid var(--border-light); padding-top: 12px; }
.bonus-title { font-size: 11px; color: var(--ink-muted); margin-bottom: 8px; font-weight: 600; letter-spacing: 0.04em; }
.bonus-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--border-light); }
.bonus-row:last-child { border-bottom: none; }
.bonus-label { font-size: 12px; color: var(--ink-soft); }
.bonus-val { font-size: 12px; font-family: var(--mono); font-weight: 500; }
.bonus-progress { font-size: 10px; color: var(--ink-muted); margin-top: 1px; }
.bv-done { color: var(--teal); }
.bv-next { color: var(--amber); }
.bv-far { color: var(--ink-muted); }

@media (max-width: 960px) {
  .metrics-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .two-col { grid-template-columns: 1fr; }
}
</style>
