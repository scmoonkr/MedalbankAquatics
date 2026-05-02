<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>촬영요청 관리</h1>
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
            <th class="col-status">상태</th>
            <th class="col-name">이름</th>
            <th class="col-team">소속</th>
            <th class="col-meet">대회</th>
            <th class="col-msg">내용</th>
            <th class="col-date">신청일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.request_id"
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
        <span>요청 #{{ editing.request_id }}</span>
        <button class="close-btn" @click="editing = null">✕</button>
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
        <button class="btn-danger" @click="deleteOne(editing.request_id)">삭제</button>
        <button class="btn-primary" @click="save">저장</button>
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

const checkedIds = ref<number[]>([])
const editing    = ref<any>(null)

const allChecked = computed(() =>
  list.value.length > 0 && checkedIds.value.length === list.value.length)

function toggleAll(e: Event) {
  checkedIds.value = (e.target as HTMLInputElement).checked
    ? list.value.map(r => r.request_id)
    : []
}

function openEdit(r: any) {
  editing.value = { ...r }
}

function statusLabel(s: string) {
  return { review: '검토중', approved: '승인', rejected: '거절', done: '완료' }[s] ?? s
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('ko-KR') : ''
}

async function save() {
  const { request_id, ...body } = editing.value
  await $fetch(`/api/admin/requests/${request_id}`, { method: 'PUT', body })
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
</style>
