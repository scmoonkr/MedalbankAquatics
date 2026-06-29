<template>
  <div>
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Times</div>
        <div class="be-page-sub">mergedTimes collection · {{ filtered.length }} / {{ rows.length }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <select v-model="f.tier">
        <option value="">All Tiers</option>
        <option value="masters">masters</option>
        <option value="elite">elite</option>
      </select>
      <select v-model="f.gender">
        <option value="">All Genders</option>
        <option value="men">men</option>
        <option value="women">women</option>
      </select>
      <select v-model="f.group">
        <option value="">All Groups</option>
        <option v-for="v in GROUP_ORDER" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="f.discipline">
        <option value="">All Disciplines</option>
        <option v-for="v in DISCIPLINE_ORDER" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="f.course">
        <option value="">All Courses</option>
        <option v-for="v in COURSE_ORDER" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="f.distance">
        <option value="">All Distances</option>
        <option v-for="v in DISTANCE_ORDER" :key="v" :value="v">{{ v }}</option>
      </select>
      <input v-model="f.q" placeholder="Search name / meet…" class="be-search" />
      <div class="be-filter-actions">
        <button class="be-reset" @click="resetFilters">Reset</button>
        <button class="be-add" @click="openCreate">신규 추가</button>
        <button class="be-save" @click="saveCSV">Save CSV</button>
      </div>
    </div>

    <div v-if="pending" class="be-empty">Loading…</div>
    <div v-else-if="!rows.length" class="be-empty">No data.</div>
    <template v-else>
      <div class="be-table-wrap">
        <table class="be-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Gender</th>
              <th>Discipline</th>
              <th>Dist</th>
              <th>Course</th>
              <th>Round</th>
              <th>Group</th>
              <th>Name</th>
              <th>Sido</th>
              <th>Team</th>
              <th>Time</th>
              <th>Date</th>
              <th>Competition</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in paged" :key="r.id"
              class="row-clickable"
              :class="{ active: panel.open && panel.id === r.id }"
              @click="openPanel(r)">
              <td class="num">{{ (page - 1) * PER + i + 1 }}</td>
              <td class="dim">{{ r.gender }}</td>
              <td class="disc">{{ r.discipline }}</td>
              <td class="mono dim">{{ r.distance }}</td>
              <td class="mono dim">{{ r.course }}</td>
              <td class="dim small">{{ r.round }}</td>
              <td class="dim small">{{ r.group }}<span v-if="r.isMasters" class="masters-tag">M</span></td>
              <td class="bold">{{ r.name }}</td>
              <td class="dim small">{{ r.sido }}</td>
              <td class="dim small">{{ r.team }}</td>
              <td class="mono bold">{{ normTime(r.time) }}</td>
              <td class="dim mono small">{{ r.datetime }}</td>
              <td class="meet">{{ r.competitionName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="be-pagination">
        <button :disabled="page <= 1" @click="page--">← Prev</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++">Next →</button>
      </div>
    </template>

    <!-- Edit panel -->
    <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
      <div class="ep-panel" @click.stop>
        <div class="ep-head">
          <div>
            <div class="ep-title">{{ panel.id ? 'Edit Time' : '신규 기록 추가' }}</div>
            <div class="ep-sub">{{ panel.id || 'new' }}</div>
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
              <label>소속 · team</label>
              <input v-model="panel.form.team" class="ep-inp" />
            </div>

            <div class="ep-field">
              <label>성인 · isAdult</label>
              <select v-model="panel.form.isAdult" class="ep-inp">
                <option :value="false">false</option>
                <option :value="true">true</option>
              </select>
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
                <option value=""></option>
                <option v-for="g in ALL_GROUPS" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>연령대 · ageGroup</label>
              <input v-model="panel.form.ageGroup" class="ep-inp" />
            </div>
            
            <div class="ep-field">
              <label>기록 · time (mm:ss.dd)</label>
              <input v-model="panel.form.time" class="ep-inp mono" placeholder="00:00.00" />
            </div>
            <div class="ep-field">
              <label>순위 · rank</label>
              <input v-model="panel.form.rank" class="ep-inp mono" placeholder="" />
            </div>
            <div class="ep-field">
              <label>종목 · discipline</label>
              <select v-model="panel.form.discipline" class="ep-inp">
                <option v-for="d in DISCIPLINE_ORDER" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>거리 · distance</label>
              <select v-model="panel.form.distance" class="ep-inp">
                <option v-for="d in DISTANCE_ORDER" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            
            <div class="ep-field">
              <label>코스 · course</label>
              <select v-model="panel.form.course" class="ep-inp">
                <option v-for="c in COURSE_ORDER" :key="c" :value="c">{{ c }}</option>
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
              <label>상태 · status</label>
              <select v-model="panel.form.status" class="ep-inp">
                <option value="">기록</option>
                <option value="DNS">DNS</option>
                <option value="DQ">DQ</option>
                <option value="번외">번외</option>
              </select>
            </div>
            <div class="ep-field">
              <label>일자 · datetime</label>
              <input v-model="panel.form.datetime" class="ep-inp mono" placeholder="YYYY-MM-DD" />
            </div>

            <div class="ep-field">
              <label>시도 · sido</label>
              <input v-model="panel.form.sido" class="ep-inp" />
            </div>
            <div class="ep-field">
              <label>수영장 · pool</label>
              <input v-model="panel.form.pool" class="ep-inp" />
            </div>
            <div class="ep-field ep-field-wide">
              <label>대회명 · competitionName</label>
              <input v-model="panel.form.competitionName" class="ep-inp" />
            </div>
          </div>
        </div>

        <div class="ep-actions">
          <button v-if="panel.id" class="btn-delete" @click="deleteRow">삭제</button>
          <div v-else></div>
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
useHead({ title: 'Times — 메달뱅크 Backend' })

const PER = 100
const page = ref(1)
const f = reactive({ tier: '', gender: '', group: '', discipline: '', course: '', distance: '', q: '' })

// Domain-correct filter option orders (alphabetical sort would put 1500M before 200M).
const COURSE_ORDER     = ['LCM', 'SCM']
const DISTANCE_ORDER   = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M']
const DISCIPLINE_ORDER = ['FR', 'BA', 'BR', 'FL', 'IM']
// All group values that may appear in a record (used by the edit panel select).
const ALL_GROUPS = ['유년부', '초등부', '중등부', '고등부', '일반부', '성인부']
// Adult group label swaps with tier: elite→'일반부', masters→'성인부'.
const GROUP_ORDER = computed(() => {
  const kids = ['유년부', '초등부', '중등부', '고등부']
  if (f.tier === 'elite')   return [...kids, '일반부']
  if (f.tier === 'masters') return [...kids, '성인부']
  return [...kids, '일반부', '성인부']
})
// When the user flips tier, swap the equivalent adult group so the filter stays sensible.
watch(() => f.tier, (newTier) => {
  if (newTier === 'elite'   && f.group === '성인부') f.group = '일반부'
  else if (newTier === 'masters' && f.group === '일반부') f.group = '성인부'
})

interface TimeDoc {
  id: string; gender: string; discipline: string; distance: string; course: string
  group: string; isMasters: boolean; isAdult: boolean; round: string
  name: string; sido: string; team: string; pool: string; time: string; datetime: string; competitionName: string
  rank: number | null; ageGroup: string; status: string
}

// All structural filters go to the server (limit 2000 reflects current slice).
const serverQuery = computed(() => ({
  tier:       f.tier,
  gender:     f.gender,
  group:      f.group,
  discipline: f.discipline,
  course:     f.course,
  distance:   f.distance,
}))
const { data, pending, refresh } = useFetch<TimeDoc[]>('/api/backend/times', {
  query: serverQuery,
  key: () => `times:${Date.now()}:${Math.random()}`,
})
const rows = computed(() => data.value ?? [])

// ── edit panel ──────────────────────────────────────────────────
type EditForm = {
  name: string; time: string; sido: string; team: string; pool: string; datetime: string; competitionName: string;
  gender: string; group: string; ageGroup: string; discipline: string; distance: string; course: string;
  isMasters: boolean; isAdult: boolean; rank: string; status: string;
}
const panel = reactive({
  open: false,
  id:   '',
  form: {
    name: '', time: '', sido: '', team: '', pool: '', datetime: '', competitionName: '',
    gender: '', group: '', ageGroup: '', discipline: '', distance: '', course: '',
    isMasters: false, isAdult: true, rank: '', status: '',
  } as EditForm,
})

function openPanel(r: TimeDoc) {
  if (!r.id) return
  panel.open = true
  panel.id   = r.id
  panel.form.name            = r.name === '—' ? '' : r.name
  panel.form.time            = r.time === '—' ? '' : r.time
  panel.form.sido            = r.sido === '—' ? '' : r.sido
  panel.form.team            = r.team === '—' ? '' : r.team
  panel.form.datetime        = r.datetime === '—' ? '' : r.datetime
  panel.form.competitionName = r.competitionName === '—' ? '' : r.competitionName
  panel.form.gender          = r.gender === '—' ? '' : r.gender
  panel.form.group           = r.group === '—' ? '' : r.group
  panel.form.discipline      = r.discipline === '—' ? '' : r.discipline
  panel.form.distance        = r.distance === '—' ? '' : r.distance
  panel.form.course          = r.course === '—' ? '' : r.course
  panel.form.pool            = r.pool === '—' ? '' : (r.pool ?? '')
  panel.form.ageGroup        = r.ageGroup ?? ''
  panel.form.isMasters       = r.isMasters
  panel.form.isAdult         = r.isAdult
  panel.form.rank            = r.rank == null ? '' : String(r.rank)
  panel.form.status          = r.status ?? ''
}
function openCreate() {
  panel.open = true
  panel.id   = ''
  Object.assign(panel.form, {
    name: '', time: '', sido: '', team: '', pool: '', datetime: '', competitionName: '',
    gender: 'men', group: '', ageGroup: '', discipline: 'FR', distance: '50M', course: 'LCM',
    isMasters: false, isAdult: true, rank: '', status: '',
  } as EditForm)
}
function closePanel() {
  panel.open = false
  panel.id   = ''
}
async function saveRow() {
  const rankStr = String(panel.form.rank).trim()
  const body = {
    ...panel.form,
    rank: rankStr !== '' && !isNaN(Number(rankStr)) ? Number(rankStr) : null,
  }
  if (panel.id) {
    await $fetch(`/api/backend/times/${panel.id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/backend/times', { method: 'POST', body })
  }
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

// Only the search box filters client-side (keystroke-sensitive, applied on the server-returned slice).
const filtered = computed(() => {
  if (!f.q) return rows.value
  const q = f.q.toLowerCase()
  return rows.value.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.competitionName.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PER, page.value * PER))
watch(filtered, () => { page.value = 1 })

function resetFilters() {
  f.tier = ''; f.gender = ''; f.group = ''
  f.discipline = ''; f.course = ''; f.distance = ''
  f.q = ''
}

function parseTime(t: string): number {
  if (!t || t === '—') return Infinity
  const parts = t.split(':')
  if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1])
  return parseFloat(t)
}

function csvCell(v: string) {
  return /[,"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

const VALID_GROUPS = new Set(['초등부', '중등부', '고등부', '일반부'])

async function saveCSV() {
  const allData = await $fetch<TimeDoc[]>('/api/backend/times-all')

  const groups = new Map<string, TimeDoc[]>()
  for (const r of allData) {
    if (!VALID_GROUPS.has(r.group)) continue
    if (r.gender !== 'men' && r.gender !== 'women') continue
    const tier = r.isMasters ? 'masters' : 'elite'
    const key = `${tier}|||${r.discipline}|||${r.gender}|||${r.group}|||${r.distance}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  const lines: string[] = ['Tier,Discipline,Gender,Group,Distance,Rank,Name,Sido,Team,Time,Date,Competition']

  for (const [key, list] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const [tier, discipline, gender, group, distance] = key.split('|||')
    const bestByName = new Map<string, TimeDoc>()
    const compsByName = new Map<string, Set<string>>()
    for (const r of list) {
      if (!r.time || r.time === '—' || parseTime(r.time) === Infinity) continue
      const ex = bestByName.get(r.name)
      if (!ex || parseTime(r.time) < parseTime(ex.time)) bestByName.set(r.name, r)
      if (!compsByName.has(r.name)) compsByName.set(r.name, new Set())
      if (r.competitionName && r.competitionName !== '—') compsByName.get(r.name)!.add(r.competitionName)
    }
    const top100 = [...bestByName.values()]
      .sort((a, b) => parseTime(a.time) - parseTime(b.time))
      .slice(0, 100)
    top100.forEach((r, i) => {
      const comps = [...(compsByName.get(r.name) ?? [])].join(' / ')
      lines.push([tier, discipline, gender, group, distance, i + 1, r.name, r.sido, r.team, r.time, r.datetime, comps].map(String).map(csvCell).join(','))
    })
  }

  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `times_top100_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.be-page-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
}
.be-page-title { font-size: 22px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.01em; }
.be-page-sub { font-size: 12px; color: #888; letter-spacing: 0.06em; margin-top: 2px; }

.be-filters {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
}
.be-filters select, .be-search {
  height: 34px; padding: 0 10px; border: 1px solid #ddd; background: #fff;
  font-family: var(--sans); font-size: 12.5px; color: #333; border-radius: 3px;
  outline: none;
}
.be-filters select:focus, .be-search:focus { border-color: #0a1d3a; }
.be-search { width: 220px; }
.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset {
  height: 34px; padding: 0 14px; border: 1px solid #ddd; background: #fff;
  font-size: 12px; color: #666; cursor: pointer; border-radius: 3px;
  transition: background 0.15s;
}
.be-reset:hover { background: #f0f0f0; }
.be-save {
  height: 34px; padding: 0 14px; border: 1px solid #0a1d3a; background: #0a1d3a;
  font-size: 12px; color: #fff; cursor: pointer; border-radius: 3px;
  transition: background 0.15s;
}
.be-save:hover { background: #1a3560; }
.be-add {
  height: 34px; padding: 0 14px; border: 1px solid #0a1d3a; background: #fff;
  font-size: 12px; color: #0a1d3a; cursor: pointer; border-radius: 3px;
  transition: background 0.15s;
}
.be-add:hover { background: #eef2f8; }

.be-empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

.be-table-wrap { overflow-x: auto; border: 1px solid #e0e0e0; border-radius: 4px; background: #fff; }
.be-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.be-table thead th {
  padding: 10px 12px; background: #f8f8f6; border-bottom: 1px solid #e8e8e4;
  font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: #888; text-align: left; white-space: nowrap;
}
.be-table tbody tr { border-bottom: 1px solid #f0f0ee; transition: background 0.1s; }
.be-table tbody tr:last-child { border-bottom: 0; }
.be-table tbody tr:hover { background: #fafaf8; }
.be-table tbody td { padding: 8px 12px; vertical-align: middle; color: #222; }

td.num   { color: #bbb; font-size: 11px; width: 40px; }
td.dim   { color: #888; }
td.bold  { font-weight: 600; }
td.mono  { font-family: var(--mono); font-size: 12.5px; }
td.small { font-size: 12px; }
td.disc  { font-family: var(--mono); font-size: 12.5px; color: #555; white-space: nowrap; }
td.meet  { font-size: 12px; color: #555; max-width: 200px; }

.masters-tag {
  display: inline-block; margin-left: 5px; padding: 1px 5px;
  background: #dbeafe; color: #1e40af; font-size: 9px; font-weight: 700;
  border-radius: 2px; letter-spacing: 0.05em;
}

.be-pagination {
  display: flex; align-items: center; gap: 12px; justify-content: center;
  margin-top: 16px; font-size: 13px; color: #666;
}
.be-pagination button {
  padding: 6px 14px; border: 1px solid #ddd; background: #fff;
  font-size: 12px; cursor: pointer; border-radius: 3px;
  transition: background 0.15s;
}
.be-pagination button:hover:not(:disabled) { background: #f0f0f0; }
.be-pagination button:disabled { opacity: 0.35; cursor: not-allowed; }

/* Row click target */
.be-table tbody tr.row-clickable { cursor: pointer; }
.be-table tbody tr.row-clickable.active { background: #eef2f8; }

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
.btn-delete, .btn-cancel {
  height: 34px; padding: 0 16px; font-size: 12.5px; cursor: pointer;
  border-radius: 3px; transition: background 0.15s;
}
.btn-delete { border: 1px solid #b91c1c; background: #fff; color: #b91c1c; }
.btn-delete:hover { background: #fef2f2; }
.btn-cancel { border: 1px solid #ddd; background: #fff; color: #555; }
.btn-cancel:hover { background: #f5f5f5; }
.ep-actions .btn-save {
  height: 34px; padding: 0 16px; font-size: 12.5px; cursor: pointer;
  border-radius: 3px; transition: background 0.15s;
  border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff;
}
.ep-actions .btn-save:hover { background: #1a3560; }
</style>
