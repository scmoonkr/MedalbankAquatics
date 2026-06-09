/* 메달뱅크 · The Canon — matrix renderer (LCM 개인전, 남녀 동시 표시)
 *
 * 데이터: window.KSR_CANON
 * 구조: 영법별 섹션 → 거리별 행(2개 서브행 M/W) × 7개 권위 기록 컬럼
 * 토글 없음 (성별 토글·코스 토글 모두 제거됨)
 */
(() => {
  'use strict';

  const STROKE_ORDER = ['FR','BA','BR','FL','IM'];

  let DATA = null;

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  function recordCell(rec, ev) {
    if (!rec || !rec.time) {
      return `<td class="rec empty">—</td>`;
    }
    const time   = esc(rec.time);
    const ath    = esc(rec.athlete || '');
    const nation = rec.nation ? `<span class="nation">${esc(rec.nation)}</span>` : '';
    const year   = rec.year   ? esc(rec.year) : '';
    const venue  = rec.venue  ? esc(rec.venue) : '';
    const when   = [year, venue].filter(Boolean).join(' · ');
    const trigger = ev ? `
      data-gender="${esc(ev.gender)}"
      data-stroke="${esc(ev.stroke)}"
      data-distance="${esc(ev.distance)}"
      data-course="${esc(ev.course)}"
      data-time="${esc(rec.time)}"
      data-event-id="${esc(ev.id)}"
      data-athlete="${esc(rec.athlete || '')}"
      data-nation="${esc(rec.nation || '')}"
      data-year="${esc(rec.year || '')}"
      data-venue="${esc(rec.venue || '')}"
      role="button"
      tabindex="0"` : '';
    return `
      <td class="rec">
        <span class="time time-trigger"${trigger}>${time}</span>
        <span class="who">${ath}${nation}</span>
        <span class="when">${when}</span>
      </td>`;
  }

  function tableHead() {
    const cols = DATA.recordTypes.map(rt =>
      `<th><span class="code">${esc(rt.code)}</span><span class="ko">${esc(rt.ko)}</span></th>`
    ).join('');
    return `
      <thead>
        <tr>
          <th class="c-dist">거리</th>
          <th class="c-gen">성별</th>
          ${cols}
        </tr>
      </thead>`;
  }

  /**
   * Group events by distance, pairing M and W.
   * Returns: [{ distance, men, women }, ...]
   */
  function pairByDistance(events) {
    const map = new Map();
    events.forEach(ev => {
      if (!map.has(ev.distance)) map.set(ev.distance, { distance: ev.distance, men: null, women: null });
      const slot = map.get(ev.distance);
      if (ev.gender === 'M') slot.men   = ev;
      if (ev.gender === 'W') slot.women = ev;
    });
    return [...map.values()].sort((a, b) => a.distance - b.distance);
  }

  function buildEventRows(events) {
    const pairs = pairByDistance(events);
    return pairs.map(({ distance, men, women }) => {
      const cols = DATA.recordTypes.length;
      const menRow = `
        <tr class="gender-m">
          <td class="dist" rowspan="2"><span class="dist-num">${distance}m</span></td>
          <td class="gen">남자</td>
          ${men   ? DATA.recordTypes.map(rt => recordCell(men.records[rt.code], men)).join('')
                 : `<td class="rec empty" colspan="${cols}">—</td>`}
        </tr>`;
      const womenRow = `
        <tr class="gender-w">
          <td class="gen">여자</td>
          ${women ? DATA.recordTypes.map(rt => recordCell(women.records[rt.code], women)).join('')
                 : `<td class="rec empty" colspan="${cols}">—</td>`}
        </tr>`;
      return menRow + womenRow;
    }).join('');
  }

  function buildSection(stroke) {
    const events = DATA.events.filter(e => e.stroke === stroke);
    if (!events.length) return '';
    const sl = DATA.strokeLabels[stroke];
    const distinctDistances = new Set(events.map(e => e.distance)).size;
    return `
      <section class="block canon-section" id="sec-${stroke.toLowerCase()}">
        <div class="block-head">
          <h2>${esc(sl.en)} <span class="em">${esc(sl.ko)}.</span></h2>
          <span class="meta">${distinctDistances} DISTANCES · 남녀</span>
        </div>
        <div class="canon-matrix">
          <table class="canon-table">
            ${tableHead()}
            <tbody>${buildEventRows(events)}</tbody>
          </table>
        </div>
      </section>`;
  }

  function renderMatrix() {
    const host = document.getElementById('canon-host');
    if (!host) return;
    host.innerHTML = STROKE_ORDER.map(buildSection).join('');
  }

  function boot() {
    DATA = window.KSR_CANON;
    if (!DATA) {
      const host = document.getElementById('canon-host');
      if (host) host.innerHTML =
        `<div class="empty-state">데이터가 로드되지 않았습니다. js/canon-data.js를 확인해주세요.</div>`;
      return;
    }
    renderMatrix();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
