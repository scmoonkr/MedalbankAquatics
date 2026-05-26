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
                          role="button"
                          tabindex="0"
                          @click="goTimeView('M', s, pair.distance, rt.code)"
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
                          role="button"
                          tabindex="0"
                          @click="goTimeView('W', s, pair.distance, rt.code)"
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
useHead({ title: 'The Canon — 메달뱅크 · Medalbank' })

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

const router = useRouter()

function goTimeView(gender: string, stroke: string, distance: number, type: string) {
  const r = rec(gender, stroke, distance, type)
  if (!r?.time) return
  router.push({
    path: '/timeView',
    query: {
      gender,
      stroke,
      distance:  String(distance),
      course:    'LCM',
      time:      r.time,
      athlete:   r.athlete  || undefined,
      year:      r.year     ? String(r.year)  : undefined,
      meet:      r.venue    || undefined,
    },
  })
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

/* ── Responsive (cannon 전용) ─── */
@media (max-width: 1024px) {
  .canon-jumps { padding: 16px 0; gap: 22px; }
  .canon-jumps a { font-size: 15px; }
  .page-body section.canon-section { padding: 24px 0 40px; }
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
}
</style>
