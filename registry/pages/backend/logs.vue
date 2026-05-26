<template>
  <div>
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Logs</div>
        <div class="be-page-sub">logs collection · {{ total }} entries</div>
      </div>
    </div>

    <div class="be-filters">
      <select v-model="typeFilter" @change="page = 1">
        <option value="">All Types</option>
        <option v-for="t in TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <div class="be-filter-actions">
        <button class="be-reset" @click="reset">Reset</button>
      </div>
    </div>

    <div v-if="pending" class="be-empty">Loading…</div>
    <div v-else-if="!rows.length" class="be-empty">No data.</div>
    <template v-else>
      <div class="be-table-wrap">
        <table class="be-table">
          <thead>
            <tr>
              <th class="c-time">Time</th>
              <th class="c-type">Type</th>
              <th class="c-detail">Detail</th>
              <th class="c-user">User</th>
              <th class="c-email">Email</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td class="mono dim small">{{ fmtTime(r.time) }}</td>
              <td><span class="log-tag" :class="`log-${r.type}`">{{ r.type }}</span></td>
              <td class="small">{{ detail(r) }}</td>
              <td class="dim small">{{ r.name ?? '—' }}</td>
              <td class="dim small">{{ r.email ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="be-pagination">
        <button :disabled="page <= 1" @click="page--">‹ Prev</button>
        <span>{{ page }} / {{ pages }}</span>
        <button :disabled="page >= pages" @click="page++">Next ›</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })

const TYPES = [
  { value: 'pageview', label: 'pageview' },
  { value: 'search',   label: 'search' },
  { value: 'submit',   label: 'submit' },
  { value: 'login',    label: 'login' },
  { value: 'logout',   label: 'logout' },
]

const typeFilter = ref('')
const page = ref(1)

const query = computed(() => ({ type: typeFilter.value, page: page.value }))
const { data, pending } = useFetch('/api/backend/logs', { query, watch: [query] })

const rows  = computed(() => data.value?.rows  ?? [])
const total = computed(() => data.value?.total ?? 0)
const pages = computed(() => data.value?.pages ?? 1)

function reset() { typeFilter.value = ''; page.value = 1 }

function fmtTime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  const date = d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
  const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  return `${date} ${time}`
}

function detail(r: any): string {
  if (r.type === 'pageview') return r.path ?? '—'
  if (r.type === 'search')   return Array.isArray(r.query) ? r.query.join(', ') : (r.query ?? '—')
  if (r.type === 'submit')   return [r.name, r.category, r.discipline, r.distance, r.course].filter(Boolean).join(' · ')
  if (r.type === 'login')    return r.userId ?? '—'
  if (r.type === 'logout')   return r.userId ?? '—'
  return '—'
}
</script>

<style scoped>
.be-page-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
}
.be-page-title { font-size: 22px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.01em; }
.be-page-sub   { font-size: 12px; color: #888; letter-spacing: 0.06em; margin-top: 2px; }

.be-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.be-filters select {
  height: 34px; padding: 0 10px; border: 1px solid #ddd; background: #fff;
  font-family: var(--sans); font-size: 12.5px; color: #333; border-radius: 3px; outline: none;
}
.be-filters select:focus { border-color: #0a1d3a; }
.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset {
  height: 34px; padding: 0 14px; border: 1px solid #ddd; background: #fff;
  font-size: 12px; color: #666; cursor: pointer; border-radius: 3px; transition: background 0.15s;
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

td.dim   { color: #888; }
td.mono  { font-family: var(--mono); font-size: 12.5px; }
td.small { font-size: 12px; }

.c-time  { width: 130px; white-space: nowrap; }
.c-type  { width: 90px; }
.c-user  { width: 100px; }
.c-email { width: 180px; word-break: break-all; }

.log-tag {
  display: inline-block; padding: 1px 7px; border-radius: 3px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
  background: #e8e8e8; color: #444;
}
.log-pageview { background: #e8f0fb; color: #2a5cbf; }
.log-search   { background: #e8f8ee; color: #1a7a3e; }
.log-submit   { background: #fff4e0; color: #a05f00; }
.log-login    { background: #f0e8ff; color: #6020b0; }
.log-logout   { background: #f5f5f5; color: #666; }

.be-pagination {
  display: flex; align-items: center; gap: 12px; justify-content: center;
  margin-top: 16px; font-size: 13px; color: #666;
}
.be-pagination button {
  padding: 6px 14px; border: 1px solid #ddd; background: #fff;
  font-size: 12px; cursor: pointer; border-radius: 3px; transition: background 0.15s;
}
.be-pagination button:hover:not(:disabled) { background: #f0f0f0; }
.be-pagination button:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
