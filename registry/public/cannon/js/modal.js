/* KSR · Record Modal (sitewide)
 *
 * Trigger:  `.time-trigger` (시간 텍스트 노드). 호버 시 밑줄, 클릭 시 모달 오픈.
 * Data on trigger element:
 *   data-gender   "M" | "W"
 *   data-stroke   "FR" | "BK" | "BR" | "FL" | "IM"
 *   data-distance number (m)
 *   data-course   "LCM" | "SCM"
 *   data-time     "1:42.00" 또는 "20.91"
 *   data-event-id (optional)
 *
 * 모달 내부에서 사용자는 모든 입력을 자유롭게 편집 가능.
 *
 * 의존성: window.KSR_SCORING (scoring.js)
 */
(() => {
  'use strict';

  const STROKES = [
    { code: 'FR', ko: '자유형'   },
    { code: 'BK', ko: '배영'     },
    { code: 'BR', ko: '평영'     },
    { code: 'FL', ko: '접영'     },
    { code: 'IM', ko: '개인혼영' }
  ];

  const RECORD_TYPES = [
    { code: 'WR',  full: '세계기록'         },
    { code: 'OR',  full: '올림픽기록'       },
    { code: 'AR',  full: '아시아기록'       },
    { code: 'KR',  full: '한국기록'         },
    { code: 'KMR', full: '한국마스터즈기록' }
  ];

  const state = {
    gender:      'M',
    stroke:      'FR',
    distance:    50,
    course:      'LCM',
    time:        null,
    dob:         null,
    eventId:     null,
    attribution: null   // { athlete, nation, year, date, meet, venue } — 원본 클릭 시에만 설정
  };

  const REPORT_URL = 'https://naver.me/xeFYWn8m';

  let modalEl = null;
  let lastFocus = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload  = resolve;
      s.onerror = () => reject(new Error('script load failed: ' + src));
      document.head.appendChild(s);
    });
  }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  function S() { return window.KSR_SCORING; }
  function fmt(s) { return S().formatTime(s); }

  function genderKo(g) { return g === 'M' ? '남자' : g === 'W' ? '여자' : g; }
  function strokeKo(c) { return STROKES.find(s => s.code === c)?.ko || c; }

  function buildModalHTML() {
    return `
<div class="modal-overlay" id="recordModal" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <button class="modal-close" type="button" aria-label="닫기">×</button>
    <button class="pdf-btn" type="button" aria-label="PDF 저장" id="pdfBtn">PDF</button>
    <button class="info-btn" type="button" aria-label="계산 방식 안내" id="infoBtn">i</button>
    <div class="info-popover" id="infoPopover" hidden>
      <p>본 계산은 <strong>World Aquatics Points</strong> 공식을 따릅니다.
      각 종목의 베이스타임은 LCM 세계기록을 기준으로 하며,
      <em>포인트 = 1000 × (베이스타임 ÷ 기록)³</em> 의 정수 부분으로 산출됩니다.
      세계수영연맹이 공식 발간하는 FINA Points 표와 동일한 방식이며,
      수영계 전반에서 가장 보편적으로 쓰이는 비교 척도입니다.</p>
      <p>연령 보정은 <strong>Rowson-style</strong> 단일 계수 모델로,
      각 5세 연령부의 마스터즈 세계기록을 25-29(오픈) 마스터즈 세계기록과 비교한
      근사 비율을 적용합니다. 종목·거리에 따라 실제 비율이 다소 변동하나,
      본 표에서는 평균 계수를 사용하여 큰 그림을 가늠합니다.</p>
      <p>두 방식 모두 어디까지나 <em>참고용 환산</em>이며,
      공식 등재나 인증 기록과는 구분됩니다.</p>
    </div>

    <header class="modal-head">
      <div class="modal-eyebrow">기록 분석 · TIME ANALYSIS</div>
      <h2 id="modalTitle">The <span class="em">Record.</span></h2>
      <div class="modal-sub-line">
        <span class="modal-sub" id="modalSub">—</span>
        <a class="modal-report-inline" id="modalReportInline" href="https://naver.me/xeFYWn8m" target="_blank" rel="noopener" hidden>이 기록에 오류가 있나요? 제보해주세요 →</a>
      </div>
      <div class="modal-attribution" id="modalAttribution" hidden></div>
    </header>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>입력 · INPUTS</h3>
      </div>
      <div class="modal-inputs" id="modalInputs"></div>
    </section>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>권위 기록 비교 · CANON COMPARISON</h3>
        <button class="section-info" type="button" aria-label="설명" aria-controls="info-canon-compare">i</button>
        <div class="section-info-popover" id="info-canon-compare" hidden>
          <p>세계(WR) · 올림픽(OR) · 아시아(AR) · 한국(KR) · 한국마스터즈(KMR)
          <strong>다섯 가지 권위 기록</strong>을 한눈에 비교합니다. 각 기록은
          <strong>World Aquatics · 국제올림픽위원회 · 아시아 수영연맹(AASF) ·
          대한수영연맹</strong>이 공식 공인한 기록입니다.</p>
        </div>
      </div>
      <div class="modal-compare" id="modalCompare"></div>
    </section>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>World Aquatics 포인트 · WA POINTS</h3>
        <button class="section-info" type="button" aria-label="설명" aria-controls="info-wa-points">i</button>
        <div class="section-info-popover" id="info-wa-points" hidden>
          <p><strong>전 세계 수영계의 공식 종합 점수 척도</strong>입니다.
          World Aquatics(전 FINA)가 정기적으로 발간하는 포인트 표를 따르며,
          종목·거리·코스가 달라도 객관적으로 수행 수준을 비교할 수 있는
          가장 보편적이고 신뢰받는 지표입니다.</p>
          <p>1000점은 세계기록 수준, 800점은 국제 정상권, 500점은 일반 마스터즈 평균대
          정도로 해석됩니다.</p>
        </div>
      </div>
      <div class="modal-points" id="modalPoints"></div>
      <div class="modal-tiers" id="modalTiers"></div>
    </section>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>같은 점수의 다른 종목 · EQUIVALENT EVENTS</h3>
        <button class="section-info" type="button" aria-label="설명" aria-controls="info-equiv">i</button>
        <div class="section-info-popover" id="info-equiv" hidden>
          <p>현재 기록과 <strong>동일한 World Aquatics 포인트</strong>를 받는
          다른 종목의 시간을 함께 보여줍니다. 같은 공식 점수 체계에 근거한 환산이므로
          본인의 주종목 외 영역에서 어느 수준에 위치하는지를 가늠해볼 수 있습니다.</p>
        </div>
      </div>
      <div id="modalEquiv"></div>
    </section>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>유사한 기록 · SIMILAR PERFORMANCES</h3>
        <button class="section-info" type="button" aria-label="설명" aria-controls="info-similar">i</button>
        <div class="section-info-popover" id="info-similar" hidden>
          <p>World Aquatics 포인트가 가장 가까운 다른 기록 20건을 큐레이션합니다.
          같은 영법의 인접 기록 10건과 타 영법의 비슷한 점수대 기록 10건으로 구성됩니다.</p>
          <p>운영 중에는 <strong>KSR 데이터베이스의 검증된 등재 기록</strong>을 참조합니다.
          (본 페이지의 데이터는 담당자 검수를 위한 가상 시드입니다.)</p>
        </div>
      </div>
      <p class="modal-block-note" id="modalSimilarNote">World Aquatics 포인트가 가장 가까운 기록 20건.</p>
      <div id="modalSimilar"></div>
    </section>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>연령 보정 · AGE ADJUSTMENT</h3>
        <button class="section-info" type="button" aria-label="설명" aria-controls="info-age">i</button>
        <div class="section-info-popover" id="info-age" hidden>
          <p><strong>World Aquatics Masters의 연령부별 세계기록 비율</strong>을 기준으로
          한 연령 보정값입니다. 마스터즈 수영계에서 수십 년간 통용되어 온 비교 방식으로,
          동일한 수준의 수행이 다른 연령부에서는 어떤 시간으로 환산되는지 가늠할 수 있게 합니다.</p>
          <p>본 페이지는 종목·거리 평균 계수를 사용한 단일 모델로, 실제 종목별 비율과는
          미세한 차이가 있을 수 있습니다.</p>
        </div>
      </div>
      <div id="modalAge"></div>
    </section>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>단순 속도 계산 · SIMPLE SPEED</h3>
        <button class="section-info" type="button" aria-label="설명" aria-controls="info-speed">i</button>
        <div class="section-info-popover" id="info-speed" hidden>
          <p><strong>거리 ÷ 시간</strong>으로 산출한 평균 속도입니다.
          같은 종목 권위 기록(WR/KR/WMR/KMR)의 평균 속도와 함께 표시되어
          빠르기를 직관적으로 비교할 수 있습니다.</p>
          <p>실제 수영은 스타트·턴·구간별 속도 차이가 크므로 어디까지나
          <em>참고용 평균값</em>입니다.</p>
        </div>
      </div>
      <div id="modalSpeed"></div>
    </section>

    <section class="modal-block">
      <div class="modal-block-head">
        <h3>단순 페이스 계산 · SIMPLE PACE</h3>
        <button class="section-info" type="button" aria-label="설명" aria-controls="info-pace">i</button>
        <div class="section-info-popover" id="info-pace" hidden>
          <p><strong>동일한 속도를 유지했을 때</strong> 각 거리에서 예상되는 시간입니다.
          영법·구간·체력 변동을 고려하지 않은 단순 거리 비례 환산이므로 실제 수영의
          페이스와는 다릅니다.</p>
          <p>어디까지나 빠르기를 가늠하는 <em>참고 지표</em>입니다.</p>
        </div>
      </div>
      <div id="modalPace"></div>
    </section>

    <div class="modal-pdf-credit" style="display:none; padding: 18px 0 0; border-top: 1px solid var(--line); font-family: var(--sans); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--fg-faint);">
      Korean Swimming Registry · medalbankaquatics.com
    </div>

    <footer class="modal-foot">
    </footer>
  </div>
</div>`;
  }

  function initModal() {
    if (modalEl) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = buildModalHTML().trim();
    document.body.appendChild(tmp.firstElementChild);
    modalEl = document.getElementById('recordModal');

    modalEl.querySelector('.modal-close').addEventListener('click', close);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) close();
    });

    document.addEventListener('keydown', (e) => {
      if (modalEl.hidden) return;
      if (e.key === 'Escape') close();
    });

    document.getElementById('infoBtn').addEventListener('click', () => {
      const p = document.getElementById('infoPopover');
      p.hidden = !p.hidden;
    });

    document.getElementById('pdfBtn').addEventListener('click', downloadPdf);

    // Section-level (i) buttons — open one at a time, close on outside click
    modalEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.section-info');
      if (btn) {
        const targetId = btn.getAttribute('aria-controls');
        const target = targetId && document.getElementById(targetId);
        if (!target) return;
        const wasHidden = target.hidden;
        modalEl.querySelectorAll('.section-info-popover').forEach(p => p.hidden = true);
        if (wasHidden) target.hidden = false;
        return;
      }
      // Click outside any section popover → close all
      if (!e.target.closest('.section-info-popover')) {
        modalEl.querySelectorAll('.section-info-popover').forEach(p => p.hidden = true);
      }
    });

    document.addEventListener('click', (e) => {
      const p = document.getElementById('infoPopover');
      if (!p || p.hidden) return;
      if (e.target.closest('#infoBtn') || e.target.closest('#infoPopover')) return;
      p.hidden = true;
    });
  }

  function open(data) {
    initModal();
    Object.assign(state, {
      gender:      data.gender   || 'M',
      stroke:      data.stroke   || 'FR',
      distance:    Number(data.distance) || 50,
      course:      data.course   || 'LCM',
      time:        S().parseTime(data.time),
      dob:         data.dob || null,
      eventId:     data.eventId || null,
      attribution: data.attribution ? Object.assign({}, data.attribution) : null
    });
    lastFocus = document.activeElement;
    render();
    modalEl.hidden = false;
    document.body.classList.add('modal-open');
    setTimeout(() => modalEl.querySelector('.modal-close')?.focus(), 0);
  }

  function close() {
    if (!modalEl || modalEl.hidden) return;
    modalEl.hidden = true;
    document.body.classList.remove('modal-open');
    const ip = document.getElementById('infoPopover');
    if (ip) ip.hidden = true;
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (_) {}
    }
  }

  // ── Render functions ─────────────────────────────────────
  function render() {
    renderHeader();
    renderAttribution();
    renderInputs();
    renderCompare();
    renderPoints();
    renderEquiv();
    renderSimilar();
    renderAge();
    renderSpeed();
    renderPace();
  }

  function renderAttribution() {
    const host = document.getElementById('modalAttribution');
    const reportInline = document.getElementById('modalReportInline');
    const a = state.attribution;
    if (!a || (!a.athlete && !a.meet && !a.venue && !a.date && !a.year)) {
      host.hidden = true;
      host.innerHTML = '';
      if (reportInline) reportInline.hidden = true;
      return;
    }
    const parts = [];
    if (a.athlete) {
      parts.push(`<span class="attr-ath">${esc(a.athlete)}</span>`);
    }
    const meta = [];
    if (state.gender) meta.push(genderKo(state.gender));
    if (a.date || a.year) meta.push(a.date || a.year);
    if (a.meet)  meta.push(a.meet);
    if (a.venue) meta.push(a.venue);
    if (a.nation && !a.meet && !a.venue) meta.push(a.nation);
    if (meta.length) {
      parts.push(`<span class="attr-meta">${meta.map(esc).join(' · ')}</span>`);
    }
    host.hidden = false;
    host.innerHTML = `<div class="attr-body">${parts.join('<span class="attr-sep">·</span>')}</div>`;
    if (reportInline) reportInline.hidden = false;
  }

  function clearAttribution() {
    if (!state.attribution) return;
    // 다음 render 사이클에서 attribution 영역이 사라진다
    state.attribution = null;
  }

  async function renderSimilar() {
    const host = document.getElementById('modalSimilar');
    const note = document.getElementById('modalSimilarNote');
    const strokeName = strokeKo(state.stroke);
    const pts = S().calcPoints(state.gender, state.stroke, state.distance, state.time);
    if (note) {
      note.textContent =
        `World Aquatics 포인트가 가장 가까운 기록 20건 — ${strokeName} 10건 및 타 영법 10건.`;
    }
    if (!pts) {
      host.innerHTML = `<p class="modal-emptynote">기록을 입력하면 유사한 점수의 기록 20건이 표시됩니다.</p>`;
      return;
    }

    host.innerHTML = `<p class="modal-emptynote">불러오는 중…</p>`;

    let data;
    try {
      const athleteParam = state.attribution?.athlete
        ? `&athlete=${encodeURIComponent(state.attribution.athlete)}` : '';
      const res = await fetch(
        `/api/similar?gender=${state.gender}&stroke=${state.stroke}&distance=${state.distance}&course=${state.course}&pts=${pts}${athleteParam}`
      );
      if (!res.ok) throw new Error('fetch failed');
      data = await res.json();
    } catch (e) {
      host.innerHTML = `<p class="modal-emptynote">기록을 불러오는 데 실패했습니다.</p>`;
      return;
    }

    const renderRows = (records) => records.map(r => {
      const eventLabel = `${genderKo(r.gender)} ${strokeKo(r.stroke)} ${r.distance}m · ${r.course}`;
      return `
        <tr>
          <td class="event">${esc(eventLabel)}</td>
          <td class="athlete">${esc(r.athlete)}</td>
          <td class="time">${esc(r.time)}</td>
          <td class="date">${esc(r.date)}</td>
          <td class="pts">${esc(r.points.toLocaleString())}점</td>
        </tr>`;
    }).join('');

    if (!data.same.length && !data.other.length) {
      host.innerHTML = `<p class="modal-emptynote">유사한 기록이 없습니다.</p>`;
      return;
    }

    host.innerHTML = `
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
          <tr class="group-head"><td colspan="5">${esc(strokeName)} (${data.same.length}건)</td></tr>
          ${renderRows(data.same)}
          <tr class="group-head"><td colspan="5">타 영법 (${data.other.length}건)</td></tr>
          ${renderRows(data.other)}
        </tbody>
      </table>`;
  }

  function renderHeader() {
    const titleEn = `${strokeNameEn(state.stroke)} ${state.distance}m`;
    const titleKo = `${genderKo(state.gender)} ${strokeKo(state.stroke)}`;
    document.getElementById('modalTitle').innerHTML =
      `${esc(titleKo)} <span class="em">${esc(state.distance)}m.</span>`;
    document.getElementById('modalSub').textContent =
      `${esc(state.course)} · ${fmt(state.time)}`;
  }

  function strokeNameEn(code) {
    return { FR:'Freestyle', BK:'Backstroke', BR:'Breaststroke',
             FL:'Butterfly', IM:'Individual Medley' }[code] || code;
  }

  function renderInputs() {
    const dists = S().availableDistances(state.gender, state.stroke);
    const host = document.getElementById('modalInputs');
    host.innerHTML = `
      <div class="modal-filter-row">
        <span class="modal-filter-label">성별</span>
        <div class="modal-chip-row">
          <button class="modal-chip ${state.gender==='M'?'active':''}" data-key="gender" data-val="M">남자</button>
          <button class="modal-chip ${state.gender==='W'?'active':''}" data-key="gender" data-val="W">여자</button>
        </div>
      </div>
      <div class="modal-filter-row">
        <span class="modal-filter-label">영법</span>
        <div class="modal-chip-row">
          ${STROKES.map(s => `
            <button class="modal-chip ${state.stroke===s.code?'active':''}" data-key="stroke" data-val="${s.code}">${esc(s.ko)}</button>
          `).join('')}
        </div>
      </div>
      <div class="modal-filter-row">
        <span class="modal-filter-label">거리</span>
        <div class="modal-chip-row">
          ${dists.map(d => `
            <button class="modal-chip ${Number(state.distance)===d?'active':''}" data-key="distance" data-val="${d}">${d}m</button>
          `).join('')}
        </div>
      </div>
      <div class="modal-filter-row">
        <span class="modal-filter-label">코스</span>
        <div class="modal-chip-row">
          <button class="modal-chip active" data-key="course" data-val="LCM" disabled>LCM</button>
        </div>
      </div>
      <div class="modal-filter-row">
        <span class="modal-filter-label">기록</span>
        <div class="modal-input-col">
          <input type="text" class="modal-time-input" id="modalTimeInput"
                 value="${esc(fmt(state.time))}" placeholder="00:00.00" inputmode="decimal" />
          <span class="modal-hint">콜론 없이 숫자만 입력해도 정리돼요</span>
        </div>
      </div>
      <div class="modal-filter-row">
        <span class="modal-filter-label">생년월일</span>
        <div class="modal-input-col">
          <input type="date" class="modal-date-input" id="modalDobInput"
                 value="${esc(state.dob || '')}" />
          <span class="modal-hint">입력 시 연령 보정 표가 함께 표시됩니다 (만 25세 이상)</span>
        </div>
      </div>
    `;

    host.querySelectorAll('.modal-chip').forEach(chip => {
      if (chip.disabled) return;
      chip.addEventListener('click', () => {
        const key = chip.dataset.key;
        const raw = chip.dataset.val;
        const val = key === 'distance' ? Number(raw) : raw;
        if (state[key] === val) return;
        state[key] = val;
        // If gender or stroke changed, ensure distance is still valid for new combo
        if (key === 'gender' || key === 'stroke') {
          const valid = S().availableDistances(state.gender, state.stroke);
          if (!valid.includes(state.distance)) state.distance = valid[0];
        }
        clearAttribution();   // 더 이상 원본 기록이 아니므로 attribution 제거
        render();
      });
    });

    const timeInput = document.getElementById('modalTimeInput');
    timeInput.addEventListener('change', (e) => {
      const parsed = S().parseTime(e.target.value);
      if (parsed != null && parsed > 0 && parsed !== state.time) {
        state.time = parsed;
        clearAttribution();
      }
      render();
    });

    const dobInput = document.getElementById('modalDobInput');
    dobInput.addEventListener('change', (e) => {
      state.dob = e.target.value || null;
      render();
    });
  }

  function renderCompare() {
    const host = document.getElementById('modalCompare');
    const records = S().compareRecords(state.gender, state.stroke, state.distance, state.course);

    if (!records) {
      host.innerHTML = `<p class="modal-emptynote">이 종목의 권위 기록 데이터가 아직 준비되지 않았습니다. WR/OR/AR/KR/WMR/KMR 정보를 채워 넣으면 자동으로 비교됩니다.</p>`;
      return;
    }

    const rows = RECORD_TYPES.map(t => {
      const r = records[t.code];
      if (!r || !r.time) {
        return `
          <div class="row empty">
            <span class="lbl">${t.code}</span>
            <span class="full">${esc(t.full)}</span>
            <span class="time">—</span>
            <span class="diff"></span>
            <span class="credit"></span>
          </div>`;
      }
      const diff = S().diffString(state.time, r.time);
      const creditParts = [r.holder, r.nation, r.year, r.ageGroup].filter(Boolean);
      const credit = creditParts.join(' · ');
      return `
        <div class="row">
          <span class="lbl">${t.code}</span>
          <span class="full">${esc(t.full)}</span>
          <span class="time">${fmt(r.time)}</span>
          <span class="diff">${esc(diff)}</span>
          <span class="credit">${esc(credit)}</span>
        </div>`;
    }).join('');

    host.innerHTML = rows;
  }

  function renderPoints() {
    const pts = S().calcPoints(state.gender, state.stroke, state.distance, state.time);
    const labelKo = `${state.distance}m ${strokeKo(state.stroke)} · ${state.course} · ${genderKo(state.gender)} · ${fmt(state.time)}`;
    document.getElementById('modalPoints').innerHTML = `
      <div class="laurel left">❲</div>
      <div class="content">
        <div class="label">WORLD AQUATICS 포인트</div>
        <div class="value">${pts != null ? esc(pts.toLocaleString()) : '—'}<span class="unit">점</span></div>
        <div class="sub">${esc(labelKo)}</div>
      </div>
      <div class="laurel right">❳</div>
    `;

    const tierTargets = [1000, 900, 800];
    const tierHtml = tierTargets.map(target => {
      const t = S().timeForPoints(state.gender, state.stroke, state.distance, target);
      return `
        <div class="modal-tier">
          <div class="label">${target}점 기준</div>
          <div class="value">${t ? esc(fmt(t)) : '—'}</div>
        </div>`;
    }).join('');

    const cutTime = S().timeForPoints(state.gender, state.stroke, state.distance, 1000);
    const cutDiff = (state.time != null && cutTime != null) ? state.time - cutTime : null;
    const cutHtml = `
      <div class="modal-tier">
        <div class="label">1000점까지</div>
        <div class="value">${cutDiff != null
          ? (cutDiff >= 0 ? '+' : '−') + Math.abs(cutDiff).toFixed(2) + '초'
          : '—'}</div>
      </div>`;

    document.getElementById('modalTiers').innerHTML = tierHtml + cutHtml;
  }

  function renderEquiv() {
    const pts = S().calcPoints(state.gender, state.stroke, state.distance, state.time);
    const rows = S().EQUIV_GRID.map(row => `
      <tr>
        ${row.map(([stroke, distance]) => {
          const eqTime = pts ? S().timeForPoints(state.gender, stroke, distance, pts) : null;
          const base   = S().basetime(state.gender, stroke, distance);
          const isSame = stroke === state.stroke && Number(distance) === Number(state.distance);
          return `
            <td class="${isSame ? 'current' : ''}">
              <div class="event">${esc(strokeKo(stroke))} ${distance}m</div>
              <div class="time">${eqTime ? esc(fmt(eqTime)) : '—'}</div>
              <div class="base">1000점 기준 ${base ? esc(fmt(base)) : '—'}</div>
            </td>`;
        }).join('')}
      </tr>
    `).join('');

    document.getElementById('modalEquiv').innerHTML = `
      <div class="modal-equiv">
        <table class="modal-equiv-table">
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function renderAge() {
    const host = document.getElementById('modalAge');
    if (!state.dob) {
      host.innerHTML = `<p class="modal-emptynote">생년월일을 입력하면 본인 연령 그룹 기준의 등가 시간 표가 모든 연령부에 대해 표시됩니다.</p>`;
      return;
    }
    const myGroup = S().ageGroupFromDob(state.dob);
    if (!myGroup) {
      host.innerHTML = `<p class="modal-emptynote">연령 보정은 만 25세 이상에서 적용됩니다.</p>`;
      return;
    }

    // 본인 그룹 기준으로 다른 그룹의 "등가 시간"을 구한다.
    //   T_Y = T_X × (factor_X / factor_Y)
    // 본인보다 어린 그룹은 더 빠른 시간(작은 숫자)이 등가가 되고,
    // 본인보다 나이 많은 그룹은 더 느린 시간이 등가가 된다.
    const myFactor = S().AGE_GROUP_FACTORS[myGroup];
    const actualPts = S().calcPoints(state.gender, state.stroke, state.distance, state.time);
    const openFactor = S().AGE_GROUP_FACTORS["25-29"];
    const openTime  = state.time * (myFactor / openFactor);
    const openPts   = S().calcPoints(state.gender, state.stroke, state.distance, openTime);

    const groupRows = Object.entries(S().AGE_GROUP_FACTORS).map(([g, fY]) => {
      const relFactor = myFactor / fY;
      const adjTime   = state.time * relFactor;
      const isMine    = g === myGroup;
      return `
        <tr class="${isMine ? 'mine' : ''}">
          <td class="grp">${esc(g)}${isMine ? ' <span class="mark">현재</span>' : ''}</td>
          <td class="factor">×${relFactor.toFixed(4)}</td>
          <td class="adj">${esc(fmt(adjTime))}</td>
        </tr>`;
    }).join('');

    host.innerHTML = `
      <div class="modal-age-summary">
        <div class="age-block">
          <div class="label">본인 연령 그룹</div>
          <div class="value">${esc(myGroup)}</div>
        </div>
        <div class="age-block">
          <div class="label">실제 기록</div>
          <div class="value mono">${esc(fmt(state.time))}</div>
          <div class="sub">현재 WA 포인트 ${actualPts != null ? esc(actualPts.toLocaleString()) : '—'}점</div>
        </div>
        <div class="age-block">
          <div class="label">25-29 등가 시간</div>
          <div class="value mono">${esc(fmt(openTime))}</div>
          <div class="sub">오픈 등가 WA 포인트 ${openPts != null ? esc(openPts.toLocaleString()) : '—'}점</div>
        </div>
      </div>
      <p class="modal-age-caption">같은 수준의 실적을 다른 연령부의 등가 실적으로 환산한 표입니다.</p>
      <table class="modal-age-table">
        <thead>
          <tr><th>연령 그룹</th><th>환산 계수</th><th>등가 시간</th></tr>
        </thead>
        <tbody>${groupRows}</tbody>
      </table>
    `;
  }

  function renderSpeed() {
    const host = document.getElementById('modalSpeed');
    const distance = Number(state.distance);
    if (!distance || !state.time || state.time <= 0) {
      host.innerHTML = `<p class="modal-emptynote">기록을 입력하면 단순 속도 표가 표시됩니다.</p>`;
      return;
    }

    const ms  = distance / state.time;
    const kmh = ms * 3.6;

    const records = S().compareRecords(state.gender, state.stroke, distance, state.course);
    const COMPARE_CODES = ['WR', 'KR', 'KMR'];
    const compareSpeeds = COMPARE_CODES.map(code => {
      const r = records && records[code];
      if (!r || !r.time) return null;
      const rms = distance / r.time;
      return { code, ms: rms, kmh: rms * 3.6 };
    }).filter(Boolean);

    const compareChips = (unit, accessor) => {
      if (!compareSpeeds.length) {
        return `<span class="speed-compare-empty">비교 기록 없음</span>`;
      }
      return compareSpeeds.map(c => `
        <span class="speed-compare-chip">
          <span class="lbl">${esc(c.code)}</span>
          <span class="val">${accessor(c).toFixed(2)}<span class="u">${unit}</span></span>
        </span>`).join('');
    };

    host.innerHTML = `
      <div class="modal-speed">
        <div class="speed-row">
          <div class="speed-mine">
            <span class="label">속도</span>
            <span class="value">${ms.toFixed(2)}<span class="unit">m/s</span></span>
          </div>
          <div class="speed-compare">${compareChips('m/s', c => c.ms)}</div>
        </div>
        <div class="speed-row">
          <div class="speed-mine">
            <span class="label">시속</span>
            <span class="value">${kmh.toFixed(2)}<span class="unit">km/h</span></span>
          </div>
          <div class="speed-compare">${compareChips('km/h', c => c.kmh)}</div>
        </div>
      </div>`;
  }

  function renderPace() {
    const host = document.getElementById('modalPace');
    const distance = Number(state.distance);
    if (!distance || !state.time || state.time <= 0) {
      host.innerHTML = `<p class="modal-emptynote">기록을 입력하면 단순 페이스 표가 표시됩니다.</p>`;
      return;
    }

    const PACE_DISTS = [50, 100, 200, 400];
    const paceCells = PACE_DISTS.map(d => {
      const t = state.time * (d / distance);
      const isCurrent = d === distance;
      return `
        <div class="pace-cell ${isCurrent ? 'current' : ''}">
          <div class="label">${d}m</div>
          <div class="value">${esc(fmt(t))}</div>
        </div>`;
    }).join('');

    host.innerHTML = `
      <div class="modal-pace">
        <div class="pace-paces">${paceCells}</div>
        <p class="pace-disclaimer">위 단순 속도와 페이스표는 정확한 지표가 아니며 단순 거리 비례 계산이므로 참고용으로만 사용하세요. 실제 수영은 스타트·턴·영법별 특성 때문에 거리 간 페이스가 선형으로 비례하지 않습니다. 지치지 않고 동일한 속도로 진행했을 때의 시간을 나타내는 표입니다.</p>
      </div>`;
  }

  // ── PDF 저장 (window.print → 브라우저 Save as PDF) ───────
  function downloadPdf() {
    window.print();
  }

  // ── Trigger binding ──────────────────────────────────────
  function handleTriggerClick(e) {
    const trigger = e.target.closest('.time-trigger');
    if (!trigger) return;
    e.preventDefault();
    const d = trigger.dataset;
    const attribution = (d.athlete || d.meet || d.venue || d.date || d.year) ? {
      athlete: d.athlete || null,
      nation:  d.nation  || null,
      year:    d.year    || null,
      date:    d.date    || null,
      meet:    d.meet    || null,
      venue:   d.venue   || null
    } : null;
    open({
      gender:      d.gender,
      stroke:      d.stroke,
      distance:    d.distance,
      course:      d.course,
      time:        d.time || trigger.textContent,
      eventId:     d.eventId,
      attribution: attribution
    });
  }

  function handleTriggerKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const trigger = e.target.closest('.time-trigger');
    if (!trigger) return;
    e.preventDefault();
    trigger.click();
  }

  document.addEventListener('click', handleTriggerClick);
  document.addEventListener('keydown', handleTriggerKey);

  // Expose for programmatic open from other scripts
  window.KSR_MODAL = { open, close };
})();
