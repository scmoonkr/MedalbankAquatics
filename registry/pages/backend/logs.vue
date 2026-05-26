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
        <table class="be-table lg-table">
          <thead>
            <tr>
              <th class="c-time">Time</th>
              <th class="c-type">Type</th>
              <th class="c-detail">Detail</th>
              <th class="c-user">User</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td class="mono dim small">{{ fmtTime(r.time) }}</td>
              <td>
                <span class="log-tag" :class="`log-${r.type}`">{{ r.type }}</span>
              </td>
              <td class="small detail-cell">{{ detail(r) }}</td>
              <td class="dim small">{{ r.name ?? r.userId ?? '—' }}</td>
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
  if (r.type === 'login')    return `${r.name ?? ''} (${r.userId ?? ''})`
  if (r.type === 'logout')   return `${r.name ?? ''} (${r.userId ?? ''})`
  return '—'
}
</script>

<style scoped>
.lg-table .c-time   { width: 140px; white-space: nowrap; }
.lg-table .c-type   { width: 90px; }
.lg-table .c-user   { width: 160px; }
.lg-table .detail-cell { word-break: break-all; }

.log-tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: lowercase;
  background: #e8e8e8;
  color: #444;
}
.log-pageview { background: #e8f0fb; color: #2a5cbf; }
.log-search   { background: #e8f8ee; color: #1a7a3e; }
.log-submit   { background: #fff4e0; color: #a05f00; }
.log-login    { background: #f0e8ff; color: #6020b0; }
.log-logout   { background: #f5f5f5; color: #666; }

.be-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  justify-content: center;
  font-size: 13px;
  color: #666;
}
.be-pagination button {
  background: none;
  border: 1px solid #ddd;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.be-pagination button:disabled { opacity: 0.35; cursor: default; }
.be-pagination button:not(:disabled):hover { border-color: #999; }
</style>
