<template>
  <div>
    <div class="stub-shell">
      <div class="eyebrow">04 · The Canon · 정전</div>
      <h1>The <span class="em">Canon.</span></h1>
      <p class="lede">
        세계, 올림픽, 아시아, 한국, 마스터즈, 인핸스드 —
        종목마다 인류가 새겨 온 모든 기준점을 한 줄로 모읍니다.
      </p>
      <div class="stub-foot">7 record types · LCM 개인전 · 남녀</div>
    </div>

    <div class="page-body">

      <nav class="canon-jumps" aria-label="영법 점프">
        <a
          v-for="s in STROKE_ORDER"
          :key="s"
          :href="`#sec-${s.toLowerCase()}`"
          :class="{ active: activeHash === `#sec-${s.toLowerCase()}` }"
        >{{ STROKE_LABELS[s].ko }}</a>
      </nav>

      <section
        v-for="s in STROKE_ORDER"
        :key="s"
        :id="`sec-${s.toLowerCase()}`"
        class="block canon-section"
      >
        <div class="block-head">
          <h2>{{ STROKE_LABELS[s].en }} <span class="em">{{ STROKE_LABELS[s].ko }}.</span></h2>
          <span class="meta">{{ distanceCount(s) }} DISTANCES · 남녀</span>
        </div>
        <div class="canon-matrix">
          <table class="canon-table">
            <thead>
              <tr>
                <th class="c-dist">거리</th>
                <th class="c-gen">성별</th>
                <th v-for="rt in RECORD_TYPES" :key="rt.code">
                  <span class="code">{{ rt.code }}</span>
                  <span class="ko">{{ rt.ko }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="pair in pairsByStroke(s)" :key="pair.distance">
                <tr class="gender-m">
                  <td class="dist" rowspan="2"><span class="dist-num">{{ pair.distance }}m</span></td>
                  <td class="gen">남자</td>
                  <template v-if="pair.hasM">
                    <td
                      v-for="rt in RECORD_TYPES"
                      :key="rt.code"
                      :class="['rec', !rec('M', s, pair.distance, rt.code)?.time ? 'empty' : '']"
                    >
                      <template v-if="rec('M', s, pair.distance, rt.code)?.time">
                        <span
                          class="time time-trigger"
                          data-gender="M"
                          :data-stroke="s"
                          :data-distance="pair.distance"
                          data-course="LCM"
                          :data-time="rec('M', s, pair.distance, rt.code)!.time"
                          :data-athlete="rec('M', s, pair.distance, rt.code)!.athlete"
                          :data-nation="rec('M', s, pair.distance, rt.code)!.nation"
                          :data-year="rec('M', s, pair.distance, rt.code)!.year"
                          :data-venue="rec('M', s, pair.distance, rt.code)!.venue"
                          role="button"
                          tabindex="0"
                        >{{ rec('M', s, pair.distance, rt.code)!.time }}</span>
                        <span class="who">
                          {{ rec('M', s, pair.distance, rt.code)!.athlete }}
                          <span v-if="rec('M', s, pair.distance, rt.code)!.nation" class="nation">{{ rec('M', s, pair.distance, rt.code)!.nation }}</span>
                        </span>
                        <span class="when">{{ [rec('M', s, pair.distance, rt.code)!.year, rec('M', s, pair.distance, rt.code)!.venue].filter(Boolean).join(' · ') }}</span>
                      </template>
                      <template v-else>—</template>
                    </td>
                  </template>
                  <td v-else :colspan="RECORD_TYPES.length" class="rec empty">—</td>
                </tr>
                <tr class="gender-w">
                  <td class="gen">여자</td>
                  <template v-if="pair.hasW">
                    <td
                      v-for="rt in RECORD_TYPES"
                      :key="rt.code"
                      :class="['rec', !rec('W', s, pair.distance, rt.code)?.time ? 'empty' : '']"
                    >
                      <template v-if="rec('W', s, pair.distance, rt.code)?.time">
                        <span
                          class="time time-trigger"
                          data-gender="W"
                          :data-stroke="s"
                          :data-distance="pair.distance"
                          data-course="LCM"
                          :data-time="rec('W', s, pair.distance, rt.code)!.time"
                          :data-athlete="rec('W', s, pair.distance, rt.code)!.athlete"
                          :data-nation="rec('W', s, pair.distance, rt.code)!.nation"
                          :data-year="rec('W', s, pair.distance, rt.code)!.year"
                          :data-venue="rec('W', s, pair.distance, rt.code)!.venue"
                          role="button"
                          tabindex="0"
                        >{{ rec('W', s, pair.distance, rt.code)!.time }}</span>
                        <span class="who">
                          {{ rec('W', s, pair.distance, rt.code)!.athlete }}
                          <span v-if="rec('W', s, pair.distance, rt.code)!.nation" class="nation">{{ rec('W', s, pair.distance, rt.code)!.nation }}</span>
                        </span>
                        <span class="when">{{ [rec('W', s, pair.distance, rt.code)!.year, rec('W', s, pair.distance, rt.code)!.venue].filter(Boolean).join(' · ') }}</span>
                      </template>
                      <template v-else>—</template>
                    </td>
                  </template>
                  <td v-else :colspan="RECORD_TYPES.length" class="rec empty">—</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <section class="block">
        <div class="block-head">
          <h2>일곱 줄기의 <span class="em">기준점.</span></h2>
          <span class="meta">RECORD TYPES</span>
        </div>
        <div class="canon-glossary">
          <dl>
            <dt>WR · 세계기록</dt><dd>World Record. World Aquatics가 인정한 인류의 가장 빠른 한 줄.</dd>
            <dt>OR · 올림픽기록</dt><dd>Olympic Record. 올림픽 무대에서 작성된 가장 빠른 기록.</dd>
            <dt>AR · 아시아기록</dt><dd>Asian Record. 아시아 수영연맹(AASF)이 공인한 대륙 최고 기록.</dd>
            <dt>KR · 한국기록</dt><dd>Korean Record. 대한수영연맹 공인 국가 최고 기록.</dd>
            <dt>WMR · 세계마스터즈기록</dt><dd>World Masters Record. World Aquatics Masters 연령부별 세계 최고 기록.</dd>
            <dt>KMR · 한국마스터즈기록</dt><dd>Korea Masters Record. 대한민국 마스터즈 연령부별 한국 최고 기록.</dd>
            <dt>ER · 인핸스드게임기록</dt><dd>Enhanced Games Record. Enhanced Games 무대에서 수립된 기록.</dd>
          </dl>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'The Canon — KSR · Korean Swimming Registry' })

const STROKE_ORDER = ['FR', 'BK', 'BR', 'FL', 'IM'] as const

const RECORD_TYPES = [
  { code: 'WR',  ko: '세계'          },
  { code: 'OR',  ko: '올림픽'        },
  { code: 'AR',  ko: '아시아'        },
  { code: 'KR',  ko: '한국'          },
  { code: 'WMR', ko: '세계 마스터즈' },
  { code: 'KMR', ko: '한국 마스터즈' },
  { code: 'ER',  ko: '인핸스드'      },
]

const STROKE_LABELS: Record<string, { ko: string; en: string }> = {
  FR: { ko: '자유형',   en: 'Freestyle'         },
  BK: { ko: '배영',     en: 'Backstroke'        },
  BR: { ko: '평영',     en: 'Breaststroke'      },
  FL: { ko: '접영',     en: 'Butterfly'         },
  IM: { ko: '개인혼영', en: 'Individual Medley' },
}

const EVENTS = [
  { gender:'M', stroke:'FR', distance:50   }, { gender:'W', stroke:'FR', distance:50   },
  { gender:'M', stroke:'FR', distance:100  }, { gender:'W', stroke:'FR', distance:100  },
  { gender:'M', stroke:'FR', distance:200  }, { gender:'W', stroke:'FR', distance:200  },
  { gender:'M', stroke:'FR', distance:400  }, { gender:'W', stroke:'FR', distance:400  },
  { gender:'M', stroke:'FR', distance:800  }, { gender:'W', stroke:'FR', distance:800  },
  { gender:'M', stroke:'FR', distance:1500 }, { gender:'W', stroke:'FR', distance:1500 },
  { gender:'M', stroke:'BK', distance:50   }, { gender:'W', stroke:'BK', distance:50   },
  { gender:'M', stroke:'BK', distance:100  }, { gender:'W', stroke:'BK', distance:100  },
  { gender:'M', stroke:'BK', distance:200  }, { gender:'W', stroke:'BK', distance:200  },
  { gender:'M', stroke:'BR', distance:50   }, { gender:'W', stroke:'BR', distance:50   },
  { gender:'M', stroke:'BR', distance:100  }, { gender:'W', stroke:'BR', distance:100  },
  { gender:'M', stroke:'BR', distance:200  }, { gender:'W', stroke:'BR', distance:200  },
  { gender:'M', stroke:'FL', distance:50   }, { gender:'W', stroke:'FL', distance:50   },
  { gender:'M', stroke:'FL', distance:100  }, { gender:'W', stroke:'FL', distance:100  },
  { gender:'M', stroke:'FL', distance:200  }, { gender:'W', stroke:'FL', distance:200  },
  { gender:'M', stroke:'IM', distance:200  }, { gender:'W', stroke:'IM', distance:200  },
  { gender:'M', stroke:'IM', distance:400  }, { gender:'W', stroke:'IM', distance:400  },
]

const { data: dbRecords } = await useFetch('/api/canon')

type RecEntry = { time: string; athlete: string; nation: string; year: string | number; venue: string }

function rec(gender: string, stroke: string, distance: number, type: string): RecEntry | null {
  return (dbRecords.value as any)?.[`${gender}-${stroke}-${distance}-${type}`] ?? null
}

function pairsByStroke(stroke: string) {
  const dists = [...new Set(EVENTS.filter(e => e.stroke === stroke).map(e => e.distance))].sort((a, b) => a - b)
  return dists.map(d => ({
    distance: d,
    hasM: EVENTS.some(e => e.stroke === stroke && e.distance === d && e.gender === 'M'),
    hasW: EVENTS.some(e => e.stroke === stroke && e.distance === d && e.gender === 'W'),
  }))
}

function distanceCount(stroke: string) {
  return new Set(EVENTS.filter(e => e.stroke === stroke).map(e => e.distance)).size
}

function parseTimeSec(str: string): number | null {
  if (!str) return null
  const s = str.replace(/^0+:/, '')
  if (s.includes(':')) {
    const [m, sec] = s.split(':')
    return parseInt(m) * 60 + parseFloat(sec)
  }
  return parseFloat(s) || null
}

function injectCompareOverlay() {
  const scoring = (window as any).KSR_SCORING
  if (!scoring || !dbRecords.value) return

  const overlay: Record<string, any> = {}
  for (const [key, rec] of Object.entries(dbRecords.value as Record<string, any>)) {
    // key: "M-FR-50-WR" → overlayKey: "M-FR-50-LCM"
    const parts = key.split('-')
    if (parts.length < 4) continue
    const [gender, stroke, dist, type] = parts
    const overlayKey = `${gender}-${stroke}-${dist}-LCM`
    if (!overlay[overlayKey]) overlay[overlayKey] = {}
    overlay[overlayKey][type] = {
      time:   parseTimeSec(rec.time),
      holder: rec.athlete,
      nation: rec.nation,
      year:   rec.year ? parseInt(String(rec.year)) : null,
      venue:  rec.venue || undefined,
    }
  }

  scoring.injectOverlay(overlay)
}

// hash-based active class for jump nav
const activeHash = ref('')

onMounted(() => {
  const setHash = () => { activeHash.value = window.location.hash }
  setHash()
  window.addEventListener('hashchange', setHash)

  // Load scoring engine then modal (order matters)
  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
      const s = document.createElement('script')
      s.src = src
      s.onload  = () => resolve()
      s.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.body.appendChild(s)
    })
  }

  loadScript('/cannon/js/scoring.js')
    .then(() => loadScript('/cannon/js/modal.js'))
    .then(() => injectCompareOverlay())
    .catch(err => console.error('[cannon] script load error', err))
})

onUnmounted(() => {
  window.removeEventListener('hashchange', () => {})
})
</script>

<style>
/* ── Canon jumps (sticky sub-nav) ─── */
.canon-jumps {
  display: flex; gap: 32px; flex-wrap: wrap; align-items: center;
  padding: 22px 0; margin: 0 0 8px; border-bottom: 0;
  box-shadow: 0 1px 0 var(--line);
  position: sticky; top: var(--topbar-h);
  background: var(--bg); z-index: 50;
}
.canon-jumps a {
  font-family: var(--serif-ko); font-size: 16px; font-weight: 400;
  letter-spacing: -0.01em; color: var(--fg-mute);
  padding: 6px 0; border: 0; background: transparent;
  white-space: nowrap; transition: color 0.18s ease, font-weight 0.18s ease; position: relative;
}
.canon-jumps a:hover { color: var(--fg); }
.canon-jumps a.active { color: var(--fg); font-weight: 700; }

/* ── Canon section ─── */
.page-body section.canon-section {
  padding: 24px 0 56px; border-bottom: 1px solid var(--line);
  scroll-margin-top: calc(var(--topbar-h) + 12px);
}
.canon-section:last-of-type { border-bottom: 0; }

/* ── Matrix / table ─── */
.canon-matrix {
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  border: 1px solid var(--line); background: var(--bg);
}
.canon-table {
  width: 100%; min-width: 1100px; border-collapse: collapse;
  font-family: var(--sans); font-feature-settings: "tnum";
}
.canon-table thead th {
  font-family: var(--sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.24em; text-transform: uppercase; color: var(--fg);
  text-align: left; padding: 14px; border-bottom: 1px solid var(--line);
  border-right: 1px solid var(--line); background: var(--bg-soft);
  white-space: nowrap; vertical-align: top;
}
.canon-table thead th:last-child { border-right: 0; }
.canon-table thead th .code {
  display: block; font-family: var(--sans); font-size: 11px;
  font-weight: 600; letter-spacing: 0.18em; color: var(--fg);
}
.canon-table thead th .ko {
  display: block; margin-top: 4px; font-family: var(--serif-ko);
  font-size: 10.5px; font-weight: 400; letter-spacing: 0;
  text-transform: none; color: var(--fg-faint);
}
.canon-table thead th.c-dist { min-width: 96px; }
.canon-table thead th.c-gen  { min-width: 72px; }
.canon-table tbody tr { border-bottom: 1px solid var(--line); }
.canon-table tbody tr.gender-m { border-bottom: 1px dashed var(--line); }
.canon-table tbody tr.gender-w { border-bottom: 1px solid var(--rule); }
.canon-table tbody tr:last-child { border-bottom: 0; }
.canon-table tbody tr:hover { background: var(--bg-soft); }
.canon-table td { padding: 16px 14px; vertical-align: middle; border-right: 1px solid var(--line); }
.canon-table td:last-child { border-right: 0; }
.canon-table td.dist {
  background: var(--bg); border-right: 1px solid var(--rule);
  vertical-align: middle; text-align: left; white-space: nowrap; padding: 16px 18px;
}
.canon-table tbody tr:hover td.dist { background: var(--bg-soft); }
.canon-table td.dist .dist-num {
  font-family: var(--serif); font-style: italic; font-size: 26px;
  font-weight: 400; letter-spacing: -0.02em; color: var(--fg); line-height: 1;
}
.canon-table td.gen {
  font-family: var(--sans); font-size: 10.5px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--fg-dim); white-space: nowrap; vertical-align: middle;
}
.canon-table td.rec { min-width: 140px; line-height: 1.45; vertical-align: top; padding-top: 14px; }
.canon-table td.rec .time {
  display: block; font-family: var(--mono); font-size: 16px; font-weight: 500;
  color: var(--fg); letter-spacing: -0.01em; font-feature-settings: "tnum";
  margin-bottom: 4px; white-space: nowrap;
}
.canon-table td.rec .who { display: block; font-family: var(--serif-ko); font-size: 12.5px; color: var(--fg-dim); letter-spacing: -0.005em; }
.canon-table td.rec .who .nation {
  display: inline-block; margin-left: 6px; font-family: var(--sans);
  font-size: 9.5px; letter-spacing: 0.18em; color: var(--fg-faint);
}
.canon-table td.rec .when { display: block; margin-top: 4px; font-family: var(--sans); font-size: 10px; letter-spacing: 0.04em; color: var(--fg-faint); }
.canon-table td.rec.empty {
  font-family: var(--serif); font-style: italic; font-size: 22px;
  color: var(--fg-mute); text-align: center; vertical-align: middle; padding: 18px 14px;
}

/* ── Glossary ─── */
.canon-glossary dl { display: grid; grid-template-columns: 220px 1fr; gap: 14px 32px; margin: 0; }
.canon-glossary dt { font-family: var(--sans); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--fg); font-weight: 500; }
.canon-glossary dd { margin: 0; font-family: var(--serif-ko); font-size: 14.5px; line-height: 1.7; color: var(--fg-dim); letter-spacing: -0.005em; }

/* ── Time trigger ─── */
.time-trigger { cursor: pointer; text-decoration: none; text-underline-offset: 5px; text-decoration-thickness: 1px; text-decoration-color: transparent; transition: text-decoration-color 0.15s ease; }
.time-trigger:hover, .time-trigger:focus-visible { text-decoration: underline; text-decoration-color: currentColor; }
.time-trigger:focus-visible { outline: 1px solid var(--fg); outline-offset: 4px; }

/* ── Modal overlay + shell ─── */
body.modal-open { overflow: hidden; }
.modal-overlay { position: fixed; inset: 0; background: rgba(10,10,10,.45); z-index: 1000; overflow-y: auto; padding: 4vh 24px; display: flex; align-items: flex-start; justify-content: center; }
.modal-overlay[hidden] { display: none; }
.modal { background: var(--bg); width: 100%; max-width: 880px; margin: auto; position: relative; border: 1px solid var(--line); padding: 48px 56px 40px; font-family: var(--sans); }
@media (max-width: 760px) {
  .modal-overlay { padding: 0; }
  .modal { border: 0; padding: 28px 22px 32px; min-height: 100vh; max-width: none; }
}
.modal-close { position: absolute; top: 14px; right: 14px; background: transparent; border: 0; width: 36px; height: 36px; font-family: var(--serif); font-size: 26px; color: var(--fg-dim); cursor: pointer; line-height: 1; padding: 0; transition: color .15s; }
.modal-close:hover { color: var(--fg); }
.modal-head { margin-bottom: 8px; }
.modal-eyebrow { font-family: var(--sans); font-size: 10.5px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--fg-faint); margin-bottom: 14px; }
.modal h2 { font-family: var(--serif); font-size: clamp(34px,4.4vw,56px); font-weight: 500; line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 12px; color: var(--fg); }
.modal h2 .em { font-style: italic; color: var(--fg-dim); font-weight: 400; }
.modal .modal-sub-line { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.modal .modal-sub { font-family: var(--mono); font-size: 14px; color: var(--fg-dim); margin: 0; font-feature-settings: "tnum"; letter-spacing: -0.005em; }
.modal-report-inline { font-family: var(--serif); font-style: italic; font-size: 12.5px; color: var(--fg-mute); text-decoration: none; border-bottom: 1px solid var(--line); padding-bottom: 1px; transition: color .18s, border-color .18s; white-space: nowrap; }
.modal-report-inline[hidden] { display: none; }
.modal-report-inline:hover { color: var(--fg-dim); border-bottom-color: var(--fg-mute); }
.modal-attribution { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line); font-family: var(--serif-ko); font-size: 13.5px; line-height: 1.55; color: var(--fg-dim); letter-spacing: -0.005em; opacity: 1; max-height: 180px; overflow: hidden; transition: opacity .28s, max-height .32s, margin .32s, padding .32s, border-color .32s; }
.modal-attribution[hidden] { display: block; opacity: 0; max-height: 0; margin-top: 0; padding-top: 0; border-top-color: transparent; visibility: hidden; }
.modal-attribution .attr-body { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; }
.modal-attribution .attr-ath { font-family: var(--serif-ko); font-size: 17px; font-weight: 700; color: var(--fg); letter-spacing: -0.01em; }
.modal-attribution .attr-meta { font-family: var(--serif-ko); font-size: 13px; color: var(--fg-dim); }
.modal-attribution .attr-sep { color: var(--fg-mute); }
.modal-block { padding: 26px 0; border-bottom: 1px solid var(--line); }
.modal-block:last-of-type { border-bottom: 0; }
.modal-block h3 { font-family: var(--sans); font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--fg-faint); font-weight: 500; margin: 0; }
.modal-block-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; position: relative; }
.section-info { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--fg-mute); background: transparent; font-family: var(--serif); font-style: italic; font-size: 11px; color: var(--fg-mute); cursor: pointer; padding: 0; line-height: 1; transition: color .15s, border-color .15s; flex-shrink: 0; }
.section-info:hover, .section-info:focus-visible { color: var(--fg-dim); border-color: var(--fg-dim); outline: none; }
.section-info-popover { position: absolute; top: calc(100% + 8px); left: 0; background: var(--fg); color: var(--bg); padding: 16px 20px; width: 380px; max-width: calc(100vw - 96px); font-family: var(--serif-ko); font-size: 12.5px; line-height: 1.7; letter-spacing: -0.005em; z-index: 20; }
.section-info-popover[hidden] { display: none; }
.section-info-popover p { margin: 0 0 10px; }
.section-info-popover p:last-child { margin-bottom: 0; }
.section-info-popover strong { color: var(--bg); font-weight: 700; }
.section-info-popover em { font-style: italic; font-family: var(--serif); color: var(--fg-mute); }
.modal-emptynote { font-family: var(--serif-ko); font-size: 13.5px; color: var(--fg-mute); margin: 0; line-height: 1.6; letter-spacing: -0.005em; }
.modal-block-note { font-family: var(--serif-ko); font-size: 12.5px; color: var(--fg-faint); margin: -8px 0 16px; line-height: 1.6; letter-spacing: -0.005em; }
.modal-inputs { display: flex; flex-direction: column; gap: 14px; }
.modal-filter-row { display: flex; align-items: flex-start; gap: 16px; }
.modal-filter-label { font-family: var(--sans); font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fg-faint); min-width: 76px; padding-top: 6px; }
.modal-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.modal-chip { font-family: var(--sans); font-size: 12.5px; letter-spacing: 0.06em; color: var(--fg-mute); background: transparent; border: 0; padding: 4px 0; cursor: pointer; transition: color .15s; }
.modal-chip:hover { color: var(--fg-dim); }
.modal-chip.active { color: var(--fg); font-weight: 700; }
.modal-chip[disabled] { opacity: .4; cursor: default; }
.modal-input-col { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.modal-time-input, .modal-date-input { font-family: var(--mono); font-size: 15px; color: var(--fg); background: transparent; border: 0; border-bottom: 1px solid var(--line); padding: 4px 0; outline: none; width: 100%; max-width: 240px; font-feature-settings: "tnum"; }
.modal-time-input:focus, .modal-date-input:focus { border-bottom-color: var(--fg); }
.modal-hint { font-family: var(--sans); font-size: 10.5px; color: var(--fg-faint); letter-spacing: 0.03em; }
.modal-compare .row { display: grid; grid-template-columns: 52px 1fr 120px 80px 1fr; gap: 0 12px; align-items: baseline; padding: 12px 0; border-bottom: 1px solid var(--line); }
.modal-compare .row:last-child { border-bottom: 0; }
.modal-compare .row.empty { opacity: .55; }
.modal-compare .lbl { font-family: var(--sans); font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--fg-mute); font-weight: 500; }
.modal-compare .full { font-family: var(--serif-ko); font-size: 13px; color: var(--fg-dim); }
.modal-compare .time { font-family: var(--mono); font-size: 14px; color: var(--fg); font-feature-settings: "tnum"; letter-spacing: -0.005em; }
.modal-compare .diff { font-family: var(--mono); font-size: 12px; color: var(--fg-dim); font-feature-settings: "tnum"; }
.modal-compare .credit { font-family: var(--serif-ko); font-size: 11.5px; color: var(--fg-faint); }
.modal-points { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 16px; padding: 24px 32px; border: 1px solid var(--line); background: var(--bg-soft); }
.modal-points .laurel { font-family: var(--serif); font-size: 40px; color: var(--fg-mute); line-height: 1; }
.modal-points .content { min-width: 0; }
.modal-points .label { font-family: var(--sans); font-size: 9.5px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--fg-faint); margin-bottom: 6px; }
.modal-points .value { font-family: var(--serif); font-size: clamp(44px,6vw,72px); font-weight: 500; line-height: 1; letter-spacing: -0.03em; color: var(--fg); }
.modal-points .value .unit { font-family: var(--sans); font-size: 14px; font-weight: 400; letter-spacing: 0.08em; color: var(--fg-dim); margin-left: 6px; }
.modal-points .sub { font-family: var(--serif-ko); font-size: 12px; color: var(--fg-faint); margin-top: 8px; }
.modal-tiers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
.modal-tier { border: 1px solid var(--line); padding: 14px 16px; }
.modal-tier .label { font-family: var(--sans); font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--fg-faint); margin-bottom: 8px; }
.modal-tier .value { font-family: var(--mono); font-size: 18px; color: var(--fg); font-feature-settings: "tnum"; }
.modal-equiv { overflow-x: auto; }
.modal-equiv-table { width: 100%; border-collapse: collapse; }
.modal-equiv-table td { padding: 16px 14px; border: 1px solid var(--line); vertical-align: top; text-align: center; }
.modal-equiv-table td .event { font-family: var(--serif-ko); font-size: 12px; color: var(--fg-faint); letter-spacing: -0.005em; margin-bottom: 6px; }
.modal-equiv-table td .time { font-family: var(--mono); font-size: 18px; color: var(--fg); font-feature-settings: "tnum"; letter-spacing: -0.01em; }
.modal-equiv-table td .base { font-family: var(--sans); font-size: 10px; color: var(--fg-mute); margin-top: 6px; letter-spacing: 0.04em; }
.modal-equiv-table td.current { background: var(--bg-soft); }
.modal-equiv-table td.current .time { color: var(--accent); font-weight: 500; }
.modal-age-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.modal-age-summary .age-block { border: 1px solid var(--line); padding: 14px 16px; }
.modal-age-summary .age-block .label { font-family: var(--sans); font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--fg-faint); margin-bottom: 8px; }
.modal-age-summary .age-block .value { font-family: var(--serif); font-size: 26px; font-weight: 500; color: var(--fg); line-height: 1.1; }
.modal-age-summary .age-block .value.mono { font-family: var(--mono); font-size: 22px; font-feature-settings: "tnum"; }
.modal-age-summary .age-block .sub { font-family: var(--serif-ko); font-size: 11px; color: var(--fg-faint); margin-top: 6px; }
.modal-age-table { width: 100%; border-collapse: collapse; font-family: var(--sans); }
.modal-age-table th, .modal-age-table td { padding: 9px 12px; border-bottom: 1px solid var(--line); font-size: 12.5px; text-align: left; }
.modal-age-table th { font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fg-faint); font-weight: 500; }
.modal-age-table td { color: var(--fg-dim); }
.modal-age-table td.grp { color: var(--fg); font-weight: 500; }
.modal-age-table td.factor { font-family: var(--mono); color: var(--fg-faint); font-feature-settings: "tnum"; }
.modal-age-table td.grp .mark { display: inline-block; margin-left: 8px; font-family: var(--sans); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; background: var(--accent); color: var(--bg); padding: 2px 6px; }
.modal-age-table tr.mine td { background: var(--bg-soft); }
.modal-age-caption { font-family: var(--serif-ko); font-size: 12px; color: var(--fg-faint); margin: 0 0 16px; letter-spacing: -0.005em; }
.modal-speed { display: flex; flex-direction: column; gap: 0; }
.modal-speed .speed-row { display: flex; align-items: center; gap: 24px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.modal-speed .speed-row:last-child { border-bottom: 0; }
.modal-speed .speed-mine { display: flex; align-items: baseline; gap: 10px; min-width: 160px; }
.modal-speed .speed-mine .label { font-family: var(--sans); font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--fg-faint); min-width: 36px; }
.modal-speed .speed-mine .value { font-family: var(--mono); font-size: 26px; color: var(--fg); font-feature-settings: "tnum"; }
.modal-speed .speed-mine .value .unit { font-family: var(--sans); font-size: 11px; color: var(--fg-dim); margin-left: 4px; }
.modal-speed .speed-compare { display: flex; flex-wrap: wrap; gap: 8px; flex: 1; }
.modal-speed .speed-compare-chip { display: inline-flex; align-items: baseline; gap: 6px; border: 1px solid var(--line); padding: 5px 10px; background: var(--bg-soft); }
.modal-speed .speed-compare-chip .lbl { font-family: var(--sans); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fg-mute); }
.modal-speed .speed-compare-chip .val { font-family: var(--mono); font-size: 13px; color: var(--fg-dim); font-feature-settings: "tnum"; }
.modal-speed .speed-compare-chip .val .u { font-family: var(--sans); font-size: 10px; color: var(--fg-faint); margin-left: 2px; }
.modal-speed .speed-compare-empty { font-family: var(--serif-ko); font-size: 12.5px; color: var(--fg-mute); }
.modal-pace { display: flex; flex-direction: column; gap: 16px; }
.modal-pace .pace-paces { display: flex; gap: 12px; flex-wrap: wrap; }
.modal-pace .pace-cell { border: 1px solid var(--line); padding: 14px 18px; text-align: center; min-width: 80px; }
.modal-pace .pace-cell.current { background: var(--bg-soft); border-color: var(--accent); }
.modal-pace .pace-cell .label { font-family: var(--sans); font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fg-faint); margin-bottom: 6px; }
.modal-pace .pace-cell .value { font-family: var(--mono); font-size: 18px; color: var(--fg); font-feature-settings: "tnum"; }
.modal-pace .pace-cell.current .value { color: var(--accent); font-weight: 500; }
.modal-pace .pace-disclaimer { font-family: var(--serif-ko); font-size: 11.5px; color: var(--fg-mute); margin: 0; line-height: 1.65; letter-spacing: -0.005em; }
.modal-foot { padding-top: 20px; position: relative; }
.info-btn { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--fg-mute); background: transparent; font-family: var(--serif); font-style: italic; font-size: 12px; color: var(--fg-mute); cursor: pointer; padding: 0; line-height: 1; transition: color .15s, border-color .15s; }
.info-btn:hover, .info-btn:focus-visible { color: var(--fg-dim); border-color: var(--fg-dim); outline: none; }
.info-popover { position: absolute; bottom: calc(100% + 8px); left: 0; background: var(--fg); color: var(--bg); padding: 20px 24px; width: 480px; max-width: calc(100vw - 96px); font-family: var(--serif-ko); font-size: 13px; line-height: 1.7; letter-spacing: -0.005em; z-index: 20; }
.info-popover[hidden] { display: none; }
.info-popover p { margin: 0 0 12px; }
.info-popover p:last-child { margin-bottom: 0; }
.info-popover strong { color: var(--bg); font-weight: 700; }
.info-popover em { font-style: italic; font-family: var(--serif); color: var(--fg-mute); }
.modal-similar-table { width: 100%; border-collapse: collapse; font-family: var(--sans); font-feature-settings: "tnum"; }
.modal-similar-table th { font-family: var(--sans); font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--fg-faint); font-weight: 500; text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--rule); }
.modal-similar-table th.c-pts { text-align: right; }
.modal-similar-table tbody td { padding: 12px; border-bottom: 1px solid var(--line); font-size: 12.5px; vertical-align: baseline; }
.modal-similar-table tbody tr:last-child td { border-bottom: 0; }
.modal-similar-table td.event { font-family: var(--serif-ko); color: var(--fg-dim); letter-spacing: -0.005em; white-space: nowrap; }
.modal-similar-table td.athlete { font-family: var(--serif-ko); color: var(--fg-dim); }
.modal-similar-table td.time { font-family: var(--mono); color: var(--fg); font-feature-settings: "tnum"; }
.modal-similar-table td.date { font-family: var(--sans); color: var(--fg-faint); font-size: 11.5px; }
.modal-similar-table td.pts { font-family: var(--mono); color: var(--accent); text-align: right; font-feature-settings: "tnum"; }
.modal-similar-table tr.group-head td { background: var(--bg-soft); font-family: var(--sans); font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--fg-faint); padding: 8px 12px; }

/* ── Responsive ─── */
@media (max-width: 1024px) {
  .canon-jumps { padding: 16px 0; gap: 22px; }
  .canon-jumps a { font-size: 15px; }
  .page-body section.canon-section { padding: 24px 0 40px; }
  .modal-tiers { grid-template-columns: repeat(2, 1fr); }
  .modal-age-summary { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .canon-jumps { gap: 18px; padding: 14px 0; overflow-x: auto; flex-wrap: nowrap; }
  .canon-jumps a { font-size: 14px; padding: 4px 0; }
  .canon-table { min-width: 920px; }
  .canon-table td.dist .dist-num { font-size: 20px; }
  .canon-table td.rec { min-width: 124px; }
  .canon-table td.rec .time { font-size: 14.5px; }
  .canon-glossary dl { grid-template-columns: 1fr; gap: 4px 0; }
  .canon-glossary dt { margin-top: 14px; }
  .canon-glossary dt:first-child { margin-top: 0; }
  .modal-compare .row { grid-template-columns: 44px 1fr 100px; }
  .modal-compare .diff { grid-column: 2; }
  .modal-compare .credit { grid-column: 1 / 4; color: var(--fg-mute); font-size: 11px; }
  .modal-points { padding: 28px 16px 24px; grid-template-columns: 1fr; gap: 8px; }
  .modal-points .laurel { display: none; }
  .modal-tiers { grid-template-columns: repeat(2, 1fr); }
  .section-info-popover { width: calc(100vw - 64px); max-width: 380px; }
  .modal-speed .speed-row { flex-wrap: wrap; }
  .modal-speed .speed-mine .value { font-size: 22px; }
  .modal-speed .speed-compare-chip { padding: 4px 9px; }
  .modal-speed .speed-compare-chip .val { font-size: 12.5px; }
  .modal-pace .pace-paces { gap: 8px; }
  .modal-similar-table thead { display: none; }
  .modal-similar-table tbody tr:not(.group-head) { display: grid; grid-template-columns: 1fr 1fr; padding: 10px 0; border-bottom: 1px solid var(--line); }
  .modal-similar-table tbody td { border: 0; padding: 0; }
  .modal-similar-table td.event   { grid-column: 1; grid-row: 1; }
  .modal-similar-table td.athlete { grid-column: 1; grid-row: 2; }
  .modal-similar-table td.time    { grid-column: 2; grid-row: 1; text-align: right; }
  .modal-similar-table td.date    { grid-column: 2; grid-row: 2; text-align: right; }
  .modal-similar-table td.pts     { grid-column: 1 / 3; grid-row: 3; text-align: left; color: var(--accent); margin-top: 4px; }
}
</style>
