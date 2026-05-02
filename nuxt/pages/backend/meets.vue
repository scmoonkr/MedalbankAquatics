<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>대회 관리</h1>
      <div class="head-actions">
        <button class="btn-danger" :disabled="!checkedIds.length" @click="deleteChecked">
          선택 삭제 ({{ checkedIds.length }})
        </button>
      </div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="col-chk">
              <input type="checkbox" :checked="allChecked" @change="toggleAll" />
            </th>
            <th class="col-id">meet_id</th>
            <th class="col-label">대회명</th>
            <th class="col-date">날짜</th>
            <th class="col-loc">장소</th>
            <th class="col-comp">competition_id</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in list" :key="m.meet_id"
            :class="{ selected: checkedIds.includes(m.meet_id), editing: editing?.meet_id === m.meet_id }"
            @click.stop="openEdit(m)">
            <td class="col-chk" @click.stop>
              <input type="checkbox" :value="m.meet_id" v-model="checkedIds" />
            </td>
            <td class="col-id">{{ m.meet_id }}</td>
            <td class="col-label">{{ m.label }}</td>
            <td class="col-date">{{ fmtDate(m.date) }}</td>
            <td class="col-loc">{{ m.location }}</td>
            <td class="col-comp">{{ m.competition_id }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 편집 패널 -->
    <div v-if="editing" class="edit-panel" @click.stop>
      <div class="edit-header">
        <span>대회 #{{ editing.meet_id }}</span>
        <button class="close-btn" @click="editing = null">✕</button>
      </div>
      <div class="edit-body">
        <div class="field-row">
          <label>meet_id</label>
          <input :value="editing.meet_id" disabled />
        </div>
        <div class="field-row">
          <label>대회명</label>
          <input v-model="editing.label" />
        </div>
        <div class="field-row">
          <label>short</label>
          <input v-model="editing.short" placeholder="예: 2026.04" />
        </div>
        <div class="field-row">
          <label>날짜</label>
          <input v-model="editDate" type="date" />
        </div>
        <div class="field-row">
          <label>장소</label>
          <input v-model="editing.location" />
        </div>
        <div class="field-row">
          <label>competition_id</label>
          <input v-model="editing.competition_id" />
        </div>
      </div>
      <div class="edit-footer">
        <button class="btn-danger" @click="deleteOne(editing.meet_id)">삭제</button>
        <button class="btn-primary" @click="save">저장</button>
      </div>
    </div>
    <div v-if="editing" class="overlay" @click="editing = null" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: false })
useHead({ title: '대회 관리 — 백엔드' })

const { data, refresh } = await useFetch<any[]>('/api/admin/meets')
const list = computed(() => data.value ?? [])

const checkedIds = ref<number[]>([])
const editing    = ref<any>(null)
const editDate   = ref('')

const allChecked = computed(() =>
  list.value.length > 0 && checkedIds.value.length === list.value.length)

function toggleAll(e: Event) {
  checkedIds.value = (e.target as HTMLInputElement).checked
    ? list.value.map(m => m.meet_id)
    : []
}

function openEdit(m: any) {
  editing.value = { ...m }
  editDate.value = m.date ? new Date(m.date).toISOString().slice(0, 10) : ''
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('ko-KR') : ''
}

async function save() {
  const { meet_id } = editing.value
  await $fetch(`/api/admin/meets/${meet_id}`, {
    method: 'PUT',
    body: {
      label:          editing.value.label,
      short:          editing.value.short,
      date:           editDate.value || null,
      location:       editing.value.location,
      competition_id: editing.value.competition_id,
    },
  })
  editing.value = null
  await refresh()
}

async function deleteOne(id: number) {
  if (!confirm('삭제하시겠습니까?')) return
  await $fetch(`/api/admin/meets/${id}`, { method: 'DELETE' })
  editing.value = null
  checkedIds.value = checkedIds.value.filter(i => i !== id)
  await refresh()
}

async function deleteChecked() {
  if (!confirm(`${checkedIds.value.length}건을 삭제하시겠습니까?`)) return
  await Promise.all(checkedIds.value.map(id =>
    $fetch(`/api/admin/meets/${id}`, { method: 'DELETE' })))
  checkedIds.value = []
  await refresh()
}
</script>

<style scoped>
.admin-shell { min-height: 100vh; background: #0d1117; color: #e6edf3; font-family: var(--font-sans, sans-serif); padding: 32px; }
.admin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
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
.col-chk  { width: 36px; }
.col-id   { width: 80px; font-variant-numeric: tabular-nums; }
.col-label { }
.col-date { width: 100px; }
.col-loc  { width: 140px; }
.col-comp { width: 120px; color: #8b949e; }
input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #388bfd; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 100; }
.edit-panel { position: fixed; right: 0; top: 0; bottom: 0; width: 340px; background: #161b22; border-left: 1px solid #30363d; z-index: 101; display: flex; flex-direction: column; }
.edit-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #30363d; font-weight: 600; }
.close-btn { background: none; border: none; color: #8b949e; font-size: 18px; cursor: pointer; }
.close-btn:hover { color: #e6edf3; }
.edit-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.field-row { display: flex; align-items: center; gap: 12px; }
.field-row label { width: 100px; flex-shrink: 0; font-size: 12px; color: #8b949e; }
.field-row input {
  flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  color: #e6edf3; padding: 6px 10px; font-size: 13px; font-family: inherit;
}
.field-row input:focus { outline: none; border-color: #388bfd; }
.field-row input:disabled { opacity: 0.5; cursor: not-allowed; }
.edit-footer { padding: 16px 20px; border-top: 1px solid #30363d; display: flex; justify-content: space-between; gap: 10px; }
.btn-primary { padding: 8px 20px; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; }
.btn-primary:hover { background: #2ea043; }
.btn-danger { padding: 8px 20px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 13px; cursor: pointer; }
.btn-danger:hover { background: #3a1a1a; }
.btn-danger:disabled { opacity: 0.4; cursor: default; }
</style>
