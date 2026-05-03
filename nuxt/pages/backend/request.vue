<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>촬영요청 관리</h1>
      <div class="head-actions">
        <button class="btn-secondary" @click="openNew">신규 추가</button>
        <span class="head-sep" />
        <button class="btn-danger" :disabled="!checkedIds.length" @click="deleteChecked">
          선택 삭제 ({{ checkedIds.length }})
        </button>
      </div>
    </header>

    <!-- 필터 바 -->
    <div class="filter-bar">
      <div class="btn-group">
        <button :class="{ active: statusFilter === '' }"         @click="statusFilter = ''">전체</button>
        <button :class="{ active: statusFilter === 'review' }"   @click="statusFilter = 'review'">검토중</button>
        <button :class="{ active: statusFilter === 'approved' }" @click="statusFilter = 'approved'">승인</button>
        <button :class="{ active: statusFilter === 'rejected' }" @click="statusFilter = 'rejected'">거절</button>
        <button :class="{ active: statusFilter === 'done' }"     @click="statusFilter = 'done'">완료</button>
      </div>
      <select v-model="teamFilter" class="filter-select">
        <option value="">전체 소속</option>
        <option v-for="t in teamOptions" :key="t" :value="t">{{ t }}</option>
      </select>
      <MeetGroupSelect v-model="meetFilter" :groups="meetGrouped" class="filter-select" />
      <select v-model="monthFilter" class="filter-select">
        <option value="">전체 월</option>
        <option v-for="mo in monthOptions" :key="mo" :value="mo">{{ mo }}</option>
      </select>
      <span class="filter-count">{{ filteredList.length }}건</span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="col-chk">
              <input type="checkbox" :checked="allChecked" @change="toggleAll" />
            </th>
            <th class="col-status">상태</th>
            <th class="col-name">이름</th>
            <th class="col-team">소속</th>
            <th class="col-meet">대회</th>
            <th class="col-msg">내용</th>
            <th class="col-date">신청일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredList" :key="r.request_id"
            :class="{ selected: checkedIds.includes(r.request_id), editing: editing?.request_id === r.request_id }"
            @click.stop="openEdit(r)">
            <td class="col-chk" @click.stop>
              <input type="checkbox" :value="r.request_id" v-model="checkedIds" />
            </td>
            <td class="col-status">
              <span class="badge" :class="r.status">{{ statusLabel(r.status) }}</span>
            </td>
            <td class="col-name">{{ r.name }}</td>
            <td class="col-team">{{ r.team }}</td>
            <td class="col-meet">{{ r.meet }}</td>
            <td class="col-msg truncate">{{ r.message }}</td>
            <td class="col-date">{{ fmtDate(r.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 편집 패널 -->
    <div v-if="editing" class="edit-panel" @click.stop>
      <div class="edit-header">
        <span>{{ editing.request_id ? `요청 #${editing.request_id}` : '신규 요청' }}</span>
        <div class="header-actions">
          <button class="clear-btn" @click="clearForm">지우기</button>
          <button class="close-btn" @click="editing = null">✕</button>
        </div>
      </div>
      <div class="edit-body">
        <div class="field-row">
          <label>상태</label>
          <select v-model="editing.status">
            <option value="review">검토중</option>
            <option value="approved">승인</option>
            <option value="rejected">거절</option>
            <option value="done">완료</option>
          </select>
        </div>
        <div class="field-row">
          <label>이름</label>
          <input v-model="editing.name" />
        </div>
        <div class="field-row">
          <label>소속</label>
          <input v-model="editing.team" />
        </div>
        <div class="field-row">
          <label>이메일</label>
          <input v-model="editing.email" />
        </div>
        <div class="field-row">
          <label>대회</label>
          <input v-model="editing.meet" />
        </div>
        <div class="field-row">
          <label>날짜</label>
          <input v-model="editing.date" />
        </div>
        <div class="field-row col">
          <label>내용</label>
          <textarea v-model="editing.message" rows="4" />
        </div>
      </div>
      <div class="edit-footer">
        <button v-if="editing.request_id" class="btn-danger" @click="deleteOne(editing.request_id)">삭제</button>
        <button class="btn-primary" @click="save">{{ editing.request_id ? '저장' : '신규 저장' }}</button>
      </div>
    </div>
    <div v-if="editing" class="overlay" @click="editing = null" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: false })
useHead({ title: '촬영요청 관리 — 백엔드' })

const { data, refresh } = await useFetch<any[]>('/api/admin/requests')
const list = computed(() => data.value ?? [])

const checkedIds  = ref<number[]>([])
const editing     = ref<any>(null)
const statusFilter = ref('')
const teamFilter   = ref('')
const meetFilter   = ref('')
const monthFilter  = ref('')

const teamOptions = computed(() => {
  const s = new Set<string>()
  for (const r of list.value) if (r.team) s.add(r.team)
  return [...s].sort()
})

const meetOptions = computed(() => {
  const s = new Set<string>()
  for (const r of list.value) if (r.meet) s.add(r.meet)
  return [...s].sort()
})

const meetGrouped = computed(() => {
  const groups = new Map<string, { value: string; label: string }[]>()
  for (const label of meetOptions.value) {
    const m = label.match(/^(\d{4})/)
    const year = m ? m[1] : '기타'
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push({ value: label, label })
  }
  return [...groups.entries()]
    .map(([year, options]) => ({ year, options }))
    .sort((a, b) => b.year.localeCompare(a.year))
})

const monthOptions = computed(() => {
  const s = new Set<string>()
  for (const r of list.value) {
    const m = String(r.created_at ?? '').slice(0, 7)
    if (m) s.add(m)
  }
  return [...s].sort().reverse()
})

const filteredList = computed(() => {
  let items = list.value
  if (statusFilter.value) items = items.filter(r => r.status === statusFilter.value)
  if (teamFilter.value)   items = items.filter(r => r.team === teamFilter.value)
  if (meetFilter.value)   items = items.filter(r => r.meet === meetFilter.value)
  if (monthFilter.value)  items = items.filter(r => String(r.created_at ?? '').startsWith(monthFilter.value))
  return items
})

const allChecked = computed(() =>
  filteredList.value.length > 0 &&
  filteredList.value.every(r => checkedIds.value.includes(r.request_id)))

function toggleAll(e: Event) {
  const ids = filteredList.value.map(r => r.request_id)
  if ((e.target as HTMLInputElement).checked) {
    checkedIds.value = [...new Set([...checkedIds.value, ...ids])]
  } else {
    checkedIds.value = checkedIds.value.filter(id => !ids.includes(id))
  }
}

function openEdit(r: any) {
  editing.value = { ...r }
}

function openNew() {
  editing.value = { status: 'review', name: '', team: '', email: '', meet: '', date: '', message: '' }
}

function clearForm() {
  editing.value = { status: 'review', name: '', team: '', email: '', meet: '', date: '', message: '' }
}

function statusLabel(s: string) {
  return { review: '검토중', approved: '승인', rejected: '거절', done: '완료' }[s] ?? s
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('ko-KR') : ''
}

async function save() {
  const { request_id, ...body } = editing.value
  if (request_id) {
    await $fetch(`/api/admin/requests/${request_id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/admin/requests', { method: 'POST', body })
  }
  editing.value = null
  await refresh()
}

async function deleteOne(id: number) {
  if (!confirm('삭제하시겠습니까?')) return
  await $fetch(`/api/admin/requests/${id}`, { method: 'DELETE' })
  editing.value = null
  checkedIds.value = checkedIds.value.filter(i => i !== id)
  await refresh()
}

async function deleteChecked() {
  if (!confirm(`${checkedIds.value.length}건을 삭제하시겠습니까?`)) return
  await Promise.all(checkedIds.value.map(id =>
    $fetch(`/api/admin/requests/${id}`, { method: 'DELETE' })))
  checkedIds.value = []
  await refresh()
}
</script>

<style scoped>
.admin-shell { min-height: 100vh; background: #0d1117; color: #e6edf3; font-family: var(--font-sans, sans-serif); padding: 32px; }
.admin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.admin-head h1 { font-size: 20px; font-weight: 600; }
.table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #30363d; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead tr { background: #161b22; border-bottom: 1px solid #30363d; }
th { padding: 10px 12px; text-align: left; color: #8b949e; font-weight: 500; white-space: nowrap; }
tbody tr { border-bottom: 1px solid #21262d; cursor: pointer; transition: background 0.15s; }
tbody tr:hover { background: #161b22; }
tbody tr.selected { background: #1c2a3a; }
tbody tr.editing { background: #1a2332; outline: 1px solid #388bfd; }
td { padding: 10px 12px; vertical-align: middle; }
.col-chk { width: 36px; }
.col-status { width: 72px; }
.col-name { width: 80px; }
.col-team { width: 100px; }
.col-meet { width: 140px; }
.col-msg { max-width: 260px; }
.col-date { width: 90px; color: #8b949e; font-size: 11px; }
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #388bfd; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge.review   { background: #2d333b; color: #8b949e; }
.badge.approved { background: #1a3a2a; color: #3fb950; }
.badge.rejected { background: #3a1a1a; color: #f85149; }
.badge.done     { background: #1a2a3a; color: #58a6ff; }

/* 편집 패널 */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 100; }
.edit-panel { position: fixed; right: 0; top: 0; bottom: 0; width: 360px; background: #161b22; border-left: 1px solid #30363d; z-index: 101; display: flex; flex-direction: column; }
.edit-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #30363d; font-weight: 600; }
.close-btn { background: none; border: none; color: #8b949e; font-size: 18px; cursor: pointer; line-height: 1; }
.close-btn:hover { color: #e6edf3; }
.edit-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.field-row { display: flex; align-items: center; gap: 12px; }
.field-row.col { flex-direction: column; align-items: stretch; }
.field-row label { width: 56px; flex-shrink: 0; font-size: 12px; color: #8b949e; }
.field-row.col label { width: auto; margin-bottom: 4px; }
.field-row input, .field-row select, .field-row textarea {
  flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  color: #e6edf3; padding: 6px 10px; font-size: 13px; font-family: inherit;
}
.field-row input:focus, .field-row select:focus, .field-row textarea:focus {
  outline: none; border-color: #388bfd;
}
.edit-footer { padding: 16px 20px; border-top: 1px solid #30363d; display: flex; justify-content: space-between; gap: 10px; }

.btn-primary { padding: 8px 20px; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; }
.btn-primary:hover { background: #2ea043; }
.btn-danger { padding: 8px 20px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 13px; cursor: pointer; }
.btn-danger:hover { background: #3a1a1a; }
.btn-danger:disabled { opacity: 0.4; cursor: default; }
.btn-secondary { padding: 8px 20px; background: transparent; border: 1px solid #388bfd; border-radius: 6px; color: #388bfd; font-size: 13px; cursor: pointer; }
.btn-secondary:hover { background: rgba(56,139,253,0.1); }
.filter-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.btn-group { display: flex; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; }
.btn-group button { padding: 6px 14px; background: none; border: 0; color: #8b949e; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s; white-space: nowrap; }
.btn-group button:not(:last-child) { border-right: 1px solid #30363d; }
.btn-group button:hover { background: #21262d; color: #e6edf3; }
.btn-group button.active { background: #21262d; color: #e6edf3; }
.filter-select { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; padding: 6px 10px; font-size: 12px; cursor: pointer; }
.filter-select:focus { outline: none; border-color: #388bfd; }
.filter-count { font-size: 12px; color: #8b949e; font-variant-numeric: tabular-nums; white-space: nowrap; margin-left: 4px; }
.head-actions { display: flex; align-items: center; gap: 10px; }
.head-sep { display: inline-block; width: 1px; height: 20px; background: #30363d; margin: 0 8px; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.clear-btn { background: none; border: 1px solid #30363d; border-radius: 4px; color: #8b949e; font-size: 11px; padding: 3px 8px; cursor: pointer; letter-spacing: 0.04em; }
.clear-btn:hover { border-color: #8b949e; color: #e6edf3; }
</style>
