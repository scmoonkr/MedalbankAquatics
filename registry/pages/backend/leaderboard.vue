<template>
  <div class="lb-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Leaderboard</div>
        <div class="be-page-sub">
          {{ resultsMeta }}
          <span v-if="sheet"> · {{ sheet.total.toLocaleString() }} athletes</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <select v-model="state.division">
        <option v-for="d in DIVISIONS" :key="d.v" :value="d.v">{{ d.label }} · {{ d.sub }}</option>
      </select>
      <select v-model="state.group">
        <option v-for="g in GROUPS" :key="g.v" :value="g.v">{{ groupLabelFor(g.v, state.division) }} · {{ g.sub }}</option>
      </select>
      <select v-model="state.gender">
        <option v-for="g in GENDERS" :key="g.v" :value="g.v">{{ g.label }} · {{ g.sub }}</option>
      </select>
      <select v-model="state.stroke">
        <option v-for="s in STROKES" :key="s.v" :value="s.v">{{ s.label }} · {{ s.sub }}</option>
      </select>
      <select v-model="state.course">
        <option v-for="c in COURSES" :key="c.v" :value="c.v">{{ c.label }}</option>
      </select>
      <select v-model.number="state.distance">
        <option v-for="d in availableDistances" :key="d" :value="d">{{ d }}m</option>
      </select>
    </div>

    <!-- Table / empty / loading -->
    <div v-if="pending && !sheet" class="be-empty">Loading…</div>
    <div v-else-if="!sheet || sheet.total === 0" class="be-empty">No data.</div>
    <template v-else>
      <div class="be-table-wrap">
        <table class="be-table lb-table">
          <thead>
            <tr>
              <th class="c-rank">Rank</th>
              <th class="c-name">Name</th>
              <th class="c-group">Group</th>
              <th class="c-city">City</th>
              <th class="c-team">Team</th>
              <th class="c-date">Date</th>
              <th class="c-meet">Meet</th>
              <th class="c-time">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in sheet.ranks" :key="r.id"
              class="row-clickable"
              :class="{ active: panel.open && panel.id === r.id }"
              @click="openPanel(r)">
              <td class="rank mono">{{ r.rank }}</td>
              <td class="bold">{{ r.name }}</td>
              <td class="dim small">{{ r.group || '—' }}</td>
              <td class="dim small">{{ r.city }}</td>
              <td class="dim small">{{ r.team }}</td>
              <td class="dim mono small">{{ r.date }}</td>
              <td class="dim small">{{ r.meet_full }}</td>
              <td class="mono bold">{{ normTime(r.time) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Edit panel -->
    <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
      <div class="ep-panel" @click.stop>
        <div class="ep-head">
          <div>
            <div class="ep-title">Edit Time · Rank {{ panel.rank }}</div>
            <div class="ep-sub">{{ panel.id }}</div>
          </div>
          <button class="ep-close" @click="closePanel">✕</button>
        </div>

        <div class="ep-body">
          <div class="ep-grid">
            <div class="ep-field">
              <label>이름 · name</label>
              <input v-model="panel.form.name" class="ep-inp" />
            </div>
            <div class="ep-field">
              <label>기록 · time (mm:ss.dd)</label>
              <input v-model="panel.form.time" class="ep-inp mono" placeholder="00:00.00" />
            </div>
            <div class="ep-field">
              <label>시도 · sido</label>
              <input v-model="panel.form.sido" class="ep-inp" />
            </div>
            <div class="ep-field">
              <label>소속 · team</label>
              <input v-model="panel.form.team" class="ep-inp" />
            </div>
            <div class="ep-field">
              <label>일자 · datetime</label>
              <input v-model="panel.form.datetime" class="ep-inp mono" placeholder="YYYY-MM-DD" />
            </div>
            <div class="ep-field ep-field-wide">
              <label>대회명 · competitionName</label>
              <input v-model="panel.form.competitionName" class="ep-inp" />
            </div>
            <div class="ep-field">
              <label>성별 · gender</label>
              <select v-model="panel.form.gender" class="ep-inp">
                <option value="men">men</option>
                <option value="women">women</option>
              </select>
            </div>
            <div class="ep-field">
              <label>그룹 · group</label>
              <select v-model="panel.form.group" class="ep-inp">
                <option v-for="g in DB_GROUPS" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>종목 · discipline</label>
              <select v-model="panel.form.discipline" class="ep-inp">
                <option v-for="d in DB_DISCIPLINES" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>거리 · distance</label>
              <select v-model="panel.form.distance" class="ep-inp">
                <option v-for="d in DB_DISTANCES" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>코스 · course</label>
              <select v-model="panel.form.course" class="ep-inp">
                <option v-for="c in DB_COURSES" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>마스터즈 · isMasters</label>
              <select v-model="panel.form.isMasters" class="ep-inp">
                <option :value="false">false (elite)</option>
                <option :value="true">true (masters)</option>
              </select>
            </div>
            <div class="ep-field">
              <label>라운드 · round</label>
              <input v-model="panel.form.round" class="ep-inp" />
            </div>
          </div>
        </div>

        <div class="ep-actions">
          <button class="btn-delete" @click="deleteRow">삭제</button>
          <div class="ep-actions-right">
            <button class="btn-cancel" @click="closePanel">취소</button>
            <button class="btn-save" @click="saveRow">저장</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Leaderboard — 메달뱅크 Backend' })

// ── taxonomies (frontend filter values) ────────────────────────
const DIVISIONS = [
  { v: 'all',     label: '전체',     sub: 'ALL' },
  { v: 'elite',   label: '전문체육', sub: 'ELITE' },
  { v: 'masters', label: '마스터즈', sub: 'MASTERS' },
]
const GROUPS = [
  { v: 'all',   labels: { all: '전체',   elite: '전체',   masters: '전체'   }, sub: 'ALL'   },
  { v: 'adult', labels: { all: '성인',   elite: '일반부', masters: '성인부' }, sub: 'ADULT' },
  { v: 'high',  labels: { all: '고등부', elite: '고등부', masters: '고등부' }, sub: 'HIGH'  },
  { v: 'mid',   labels: { all: '중등부', elite: '중등부', masters: '중등부' }, sub: 'MID'   },
  { v: 'elem',  labels: { all: '초등부', elite: '초등부', masters: '초등부' }, sub: 'ELEM'  },
  { v: 'youth', labels: { all: '유년부', elite: '유년부', masters: '유년부' }, sub: 'YOUTH' },
]
const GENDERS = [
  { v: 'm', label: '남자', sub: 'MEN'   },
  { v: 'f', label: '여자', sub: 'WOMEN' },
]
const STROKES = [
  { v: 'free',   label: '자유형',   sub: 'FREE'   },
  { v: 'back',   label: '배영',     sub: 'BACK'   },
  { v: 'breast', label: '평영',     sub: 'BREAST' },
  { v: 'fly',    label: '접영',     sub: 'FLY'    },
  { v: 'im',     label: '개인혼영', sub: 'IM'     },
]
const COURSES = [
  { v: 'lcm', label: 'LCM' },
  { v: 'scm', label: 'SCM' },
]

// ── raw DB enum values (for edit panel selects) ─────────────────
const DB_GROUPS      = ['유년부', '초등부', '중등부', '고등부', '성인부', '일반부']
const DB_DISCIPLINES = ['FR', 'BK', 'BR', 'FL', 'IM']
const DB_DISTANCES   = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M']
const DB_COURSES     = ['LCM', 'SCM']

// ── state ──────────────────────────────────────────────────────
const state = reactive({
  division: 'elite',
  group:    'all',
  gender:   'm',
  stroke:   'breast',
  distance: 50,
  course:   'lcm',
})

function groupLabelFor(gv: string, dv: string): string {
  const g = GROUPS.find(x => x.v === gv)
  if (!g) return gv
  return (g.labels as Record<string, string>)[dv] ?? (g.labels as Record<string, string>).all ?? gv
}

const availableDistances = computed(() => {
  const { stroke, division, course } = state
  const base = [50, 100, 200]
  const free  = stroke === 'free' ? [400, 800, 1500] : []
  const im400 = stroke === 'im'   ? [400] : []
  const m25   = (division === 'masters' && course === 'scm') ? [25] : []
  return [...new Set([...m25, ...base, ...free, ...im400])].sort((a, b) => a - b)
})
watch(availableDistances, (dists) => {
  if (!dists.includes(state.distance)) state.distance = dists.includes(100) ? 100 : dists[0]
})

const resultsMeta = computed(() => {
  const dL    = DIVISIONS.find(d => d.v === state.division)?.label ?? state.division
  const gPart = state.group === 'all' ? '' : ` · ${groupLabelFor(state.group, state.division)}`
  const sL    = STROKES.find(s => s.v === state.stroke)?.label ?? state.stroke
  const genL  = state.gender === 'm' ? '남자' : '여자'
  return `${dL}${gPart} · ${genL} ${sL} ${state.distance}m ${state.course.toUpperCase()}`
})

// ── fetch single event page ─────────────────────────────────────
type EventRank = {
  rank: number; id: string;
  name: string; city: string; team: string; date: string; time: string; meet: string; meet_full: string;
  gender: string; group: string; discipline: string; distance: string; course: string;
  isMasters: boolean; round: string;
}
type SheetResponse = { page: number; pageSize: number; total: number; ranks: EventRank[] }

const fetchQuery = computed(() => ({
  division: state.division,
  group:    state.group,
  gender:   state.gender,
  stroke:   state.stroke,
  distance: state.distance,
  course:   state.course,
  page:     1,
}))
const { data: sheet, pending, refresh } = useFetch<SheetResponse>('/api/sheet', {
  query: fetchQuery,
  key: () => `lb:${Date.now()}:${Math.random()}`,
})

// ── edit panel ──────────────────────────────────────────────────
type EditForm = {
  name: string; time: string; sido: string; team: string; datetime: string; competitionName: string;
  gender: string; group: string; discipline: string; distance: string; course: string;
  isMasters: boolean; round: string;
}
const panel = reactive({
  open: false,
  id:   '',
  rank: 0,
  form: {
    name: '', time: '', sido: '', team: '', datetime: '', competitionName: '',
    gender: '', group: '', discipline: '', distance: '', course: '',
    isMasters: false, round: '',
  } as EditForm,
})

function openPanel(r: EventRank) {
  if (!r.id) return
  panel.open = true
  panel.id   = r.id
  panel.rank = r.rank
  panel.form.name            = r.name === '—' ? '' : r.name
  panel.form.time            = r.time === '—' ? '' : r.time
  panel.form.sido            = r.city === '—' ? '' : r.city
  panel.form.team            = r.team === '—' ? '' : r.team
  panel.form.datetime        = r.date === '—' ? '' : r.date
  panel.form.competitionName = r.meet_full === '—' ? '' : r.meet_full
  panel.form.gender          = r.gender
  panel.form.group           = r.group
  panel.form.discipline      = r.discipline
  panel.form.distance        = r.distance
  panel.form.course          = r.course
  panel.form.isMasters       = r.isMasters
  panel.form.round           = r.round
}
function closePanel() {
  panel.open = false
  panel.id   = ''
}

async function saveRow() {
  if (!panel.id) return
  await $fetch(`/api/backend/times/${panel.id}`, { method: 'PUT', body: { ...panel.form } })
  closePanel()
  await refresh()
}
async function deleteRow() {
  if (!panel.id) return
  if (!confirm('이 기록을 삭제하시겠습니까?')) return
  await $fetch(`/api/backend/times/${panel.id}`, { method: 'DELETE' })
  closePanel()
  await refresh()
}
</script>

<style scoped>
.lb-root { font-family: var(--sans); }

.be-page-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 16px; gap: 16px; flex-wrap: wrap;
}
.be-page-title { font-size: 22px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.01em; }
.be-page-sub { font-size: 12px; color: #888; letter-spacing: 0.04em; margin-top: 2px; }

.be-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.be-filters select {
  height: 34px; padding: 0 10px; border: 1px solid #ddd; background: #fff;
  font-family: var(--sans); font-size: 12.5px; color: #333; border-radius: 3px; outline: none;
}
.be-filters select:focus { border-color: #0a1d3a; }

.be-empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

.be-table-wrap { overflow-x: auto; border: 1px solid #e0e0e0; border-radius: 4px; background: #fff; }
.be-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.be-table thead th {
  padding: 10px 12px; background: #f8f8f6; border-bottom: 1px solid #e8e8e4;
  font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: #888; text-align: left; white-space: nowrap;
}
.be-table tbody tr { border-bottom: 1px solid #f0f0ee; }
.be-table tbody tr:last-child { border-bottom: 0; }
.be-table tbody tr.row-clickable { cursor: pointer; }
.be-table tbody tr.row-clickable:hover { background: #fafaf8; }
.be-table tbody tr.row-clickable.active { background: #eef2f8; }
.be-table tbody td { padding: 8px 12px; vertical-align: middle; color: #222; }

td.rank { color: #999; width: 50px; }
td.dim  { color: #888; }
td.bold { font-weight: 600; }
td.mono { font-family: var(--mono); font-size: 12.5px; }
td.small { font-size: 12px; }

/* Edit panel */
.ep-backdrop {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.32);
  display: flex; justify-content: flex-end; z-index: 200;
}
.ep-panel {
  width: 480px; max-width: 100%; background: #fff;
  display: flex; flex-direction: column; overflow: hidden;
}
.ep-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #eee;
}
.ep-title { font-size: 14px; font-weight: 600; color: #0a0a0a; }
.ep-sub { font-size: 10.5px; color: #888; font-family: var(--mono); margin-top: 4px; word-break: break-all; }
.ep-close {
  width: 28px; height: 28px; border: none; background: transparent;
  font-size: 16px; color: #888; cursor: pointer; border-radius: 3px;
}
.ep-close:hover { background: #f0f0f0; color: #333; }

.ep-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
.ep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
.ep-field { display: flex; flex-direction: column; gap: 4px; }
.ep-field-wide { grid-column: 1 / -1; }
.ep-field label { font-size: 11px; color: #666; letter-spacing: 0.04em; }
.ep-inp {
  height: 34px; padding: 0 10px; border: 1px solid #ddd; background: #fff;
  font-family: var(--sans); font-size: 13px; color: #222; border-radius: 3px; outline: none;
}
.ep-inp:focus { border-color: #0a1d3a; }
.ep-inp.mono { font-family: var(--mono); }

.ep-actions {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; border-top: 1px solid #eee; background: #fafafa;
}
.ep-actions-right { display: flex; gap: 8px; }
.btn-delete, .btn-save, .btn-cancel {
  height: 34px; padding: 0 16px; font-size: 12.5px; cursor: pointer;
  border-radius: 3px; transition: background 0.15s;
}
.btn-delete { border: 1px solid #b91c1c; background: #fff; color: #b91c1c; }
.btn-delete:hover { background: #fef2f2; }
.btn-cancel { border: 1px solid #ddd; background: #fff; color: #555; }
.btn-cancel:hover { background: #f5f5f5; }
.btn-save { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.btn-save:hover { background: #1a3560; }
</style>
