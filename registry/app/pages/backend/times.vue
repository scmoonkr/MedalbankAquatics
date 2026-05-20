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
      <select v-model="f.gender">
        <option value="">All Genders</option>
        <option value="men">men</option>
        <option value="women">women</option>
      </select>
      <select v-model="f.discipline">
        <option value="">All Disciplines</option>
        <option v-for="v in opts.disciplines" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="f.distance">
        <option value="">All Distances</option>
        <option v-for="v in opts.distances" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="f.course">
        <option value="">All Courses</option>
        <option v-for="v in opts.courses" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="f.group">
        <option value="">All Groups</option>
        <option v-for="v in opts.groups" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="f.round">
        <option value="">All Rounds</option>
        <option v-for="v in opts.rounds" :key="v" :value="v">{{ v }}</option>
      </select>
      <input v-model="f.q" placeholder="Search name / meet…" class="be-search" />
      <button class="be-reset" @click="resetFilters">Reset</button>
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
            <tr v-for="(r, i) in paged" :key="r.id">
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
              <td class="mono bold">{{ r.time }}</td>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Times — KSR Backend' })

const PER = 100
const page = ref(1)
const f = reactive({ gender: '', discipline: '', distance: '', course: '', group: '', round: '', q: '' })

interface TimeDoc {
  id: string; gender: string; discipline: string; distance: string; course: string
  group: string; isMasters: boolean; round: string
  name: string; sido: string; team: string; time: string; datetime: string; competitionName: string
}

const { data, pending } = await useFetch<TimeDoc[]>('/api/backend/times')
const rows = computed(() => data.value ?? [])

const opts = computed(() => ({
  disciplines: [...new Set(rows.value.map(r => r.discipline))].filter(Boolean).sort(),
  distances:   [...new Set(rows.value.map(r => r.distance))].filter(Boolean).sort(),
  courses:     [...new Set(rows.value.map(r => r.course))].filter(Boolean).sort(),
  groups:      [...new Set(rows.value.map(r => r.group))].filter(Boolean).sort(),
  rounds:      [...new Set(rows.value.map(r => r.round))].filter(Boolean).sort(),
}))

const filtered = computed(() => {
  let list = rows.value
  if (f.gender)     list = list.filter(r => r.gender === f.gender)
  if (f.discipline) list = list.filter(r => r.discipline === f.discipline)
  if (f.distance)   list = list.filter(r => r.distance === f.distance)
  if (f.course)     list = list.filter(r => r.course === f.course)
  if (f.group)      list = list.filter(r => r.group === f.group)
  if (f.round)      list = list.filter(r => r.round === f.round)
  if (f.q) {
    const q = f.q.toLowerCase()
    list = list.filter(r => r.name.toLowerCase().includes(q) || r.competitionName.toLowerCase().includes(q))
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PER, page.value * PER))
watch(filtered, () => { page.value = 1 })

function resetFilters() {
  f.gender = ''; f.discipline = ''; f.distance = ''; f.course = ''
  f.group = ''; f.round = ''; f.q = ''
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
.be-reset {
  height: 34px; padding: 0 14px; border: 1px solid #ddd; background: #fff;
  font-size: 12px; color: #666; cursor: pointer; border-radius: 3px;
  transition: background 0.15s;
}
.be-reset:hover { background: #f0f0f0; }

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
</style>
