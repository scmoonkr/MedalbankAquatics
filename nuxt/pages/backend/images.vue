<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>이미지 관리</h1>
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
            <th class="col-img">이미지</th>
            <th class="col-id">image_id</th>
            <th class="col-name">선수</th>
            <th class="col-meet">대회</th>
            <th class="col-consent">consent_date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="img in list" :key="img.image_id"
            :class="{ selected: checkedIds.includes(img.image_id), editing: editing?.image_id === img.image_id }"
            @click.stop="openEdit(img)">
            <td class="col-chk" @click.stop>
              <input type="checkbox" :value="img.image_id" v-model="checkedIds" />
            </td>
            <td class="col-img">
              <img v-if="img.urls?.thumb" :src="img.urls.thumb" class="thumb" />
              <div v-else class="thumb no-img">—</div>
            </td>
            <td class="col-id">{{ img.image_id }}</td>
            <td class="col-name">{{ img.athlete_name }}</td>
            <td class="col-meet">{{ img.meet_label }}</td>
            <td class="col-consent">
              <span v-if="img.consent_date" class="badge approved">{{ fmtDate(img.consent_date) }}</span>
              <span v-else class="badge review">미동의</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 편집 패널 -->
    <div v-if="editing" class="edit-panel" @click.stop>
      <div class="edit-header">
        <span>image #{{ editing.image_id }}</span>
        <button class="close-btn" @click="editing = null">✕</button>
      </div>
      <div class="edit-body">
        <div class="thumb-preview">
          <img v-if="editing.urls?.thumb" :src="editing.urls.thumb" />
          <div v-else class="no-img">이미지 없음</div>
        </div>
        <div class="field-row">
          <label>image_id</label>
          <input :value="editing.image_id" disabled />
        </div>
        <div class="field-row">
          <label>athlete_id</label>
          <input v-model="editing.athlete_id" type="number" />
        </div>
        <div class="field-row">
          <label>선수명</label>
          <input :value="editing.athlete_name" disabled />
        </div>
        <div class="field-row">
          <label>meet_id</label>
          <input v-model="editing.meet_id" type="number" />
        </div>
        <div class="field-row">
          <label>대회명</label>
          <input :value="editing.meet_label" disabled />
        </div>
        <div class="field-row">
          <label>date</label>
          <input v-model="editing.date" type="date" />
        </div>
        <div class="field-row">
          <label>consent_date</label>
          <input v-model="editConsentDate" type="date" placeholder="비워두면 미동의" />
        </div>
        <div class="section-label">URLs</div>
        <div class="field-row">
          <label>thumb</label>
          <input v-model="editing.urls.thumb" placeholder="https://..." />
        </div>
        <div class="field-row">
          <label>preview</label>
          <input v-model="editing.urls.preview" placeholder="https://..." />
        </div>
        <div class="field-row">
          <label>xl</label>
          <input v-model="editing.urls.xl" placeholder="https://..." />
        </div>
        <div class="field-row">
          <label>full</label>
          <input v-model="editing.urls.full" placeholder="https://..." />
        </div>
      </div>
      <div class="edit-footer">
        <button class="btn-danger" @click="deleteOne(editing.image_id)">삭제</button>
        <button class="btn-primary" @click="save">저장</button>
      </div>
    </div>
    <div v-if="editing" class="overlay" @click="editing = null" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: false })
useHead({ title: '이미지 관리 — 백엔드' })

const { data, refresh } = await useFetch<any[]>('/api/admin/images')
const list = computed(() => data.value ?? [])

const checkedIds  = ref<number[]>([])
const editing     = ref<any>(null)
const editConsentDate = ref('')

const allChecked = computed(() =>
  list.value.length > 0 && checkedIds.value.length === list.value.length)

function toggleAll(e: Event) {
  checkedIds.value = (e.target as HTMLInputElement).checked
    ? list.value.map(r => r.image_id)
    : []
}

function openEdit(img: any) {
  editing.value = { ...img, urls: { thumb: '', preview: '', xl: '', full: '', ...img.urls } }
  editConsentDate.value = img.consent_date
    ? new Date(img.consent_date).toISOString().slice(0, 10)
    : ''
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('ko-KR') : ''
}

async function save() {
  const { image_id } = editing.value
  await $fetch(`/api/admin/images/${image_id}`, {
    method: 'PUT',
    body: {
      athlete_id:   editing.value.athlete_id,
      meet_id:      editing.value.meet_id,
      date:         editing.value.date,
      consent_date: editConsentDate.value || null,
      urls:         editing.value.urls,
    },
  })
  editing.value = null
  await refresh()
}

async function deleteOne(id: number) {
  if (!confirm('삭제하시겠습니까?')) return
  await $fetch(`/api/admin/images/${id}`, { method: 'DELETE' })
  editing.value = null
  checkedIds.value = checkedIds.value.filter(i => i !== id)
  await refresh()
}

async function deleteChecked() {
  if (!confirm(`${checkedIds.value.length}건을 삭제하시겠습니까?`)) return
  await Promise.all(checkedIds.value.map(id =>
    $fetch(`/api/admin/images/${id}`, { method: 'DELETE' })))
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
td { padding: 8px 12px; vertical-align: middle; }
.col-chk  { width: 36px; }
.col-img  { width: 96px; }
.col-id   { width: 80px; font-variant-numeric: tabular-nums; }
.col-name { width: 100px; }
.col-meet { }
.col-consent { width: 110px; }
input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #388bfd; }

.thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; display: block; }
.no-img { width: 80px; height: 80px; background: #21262d; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #8b949e; font-size: 11px; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge.approved { background: #1a3a2a; color: #3fb950; }
.badge.review   { background: #2d333b; color: #8b949e; }

/* 편집 패널 */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 100; }
.edit-panel { position: fixed; right: 0; top: 0; bottom: 0; width: 340px; background: #161b22; border-left: 1px solid #30363d; z-index: 101; display: flex; flex-direction: column; }
.edit-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #30363d; font-weight: 600; }
.close-btn { background: none; border: none; color: #8b949e; font-size: 18px; cursor: pointer; }
.close-btn:hover { color: #e6edf3; }
.edit-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.thumb-preview { width: 100%; aspect-ratio: 3/2; background: #21262d; border-radius: 6px; overflow: hidden; margin-bottom: 4px; }
.thumb-preview img { width: 100%; height: 100%; object-fit: cover; }
.thumb-preview .no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #8b949e; font-size: 13px; }
.field-row { display: flex; align-items: center; gap: 12px; }
.field-row label { width: 88px; flex-shrink: 0; font-size: 12px; color: #8b949e; }
.field-row input {
  flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  color: #e6edf3; padding: 6px 10px; font-size: 13px; font-family: inherit;
}
.field-row input:focus { outline: none; border-color: #388bfd; }
.field-row input:disabled { opacity: 0.5; cursor: not-allowed; }
.section-label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 6px; border-top: 1px solid #30363d; }
.edit-footer { padding: 16px 20px; border-top: 1px solid #30363d; display: flex; justify-content: space-between; gap: 10px; }
.btn-primary { padding: 8px 20px; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; }
.btn-primary:hover { background: #2ea043; }
.btn-danger { padding: 8px 20px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 13px; cursor: pointer; }
.btn-danger:hover { background: #3a1a1a; }
.btn-danger:disabled { opacity: 0.4; cursor: default; }
</style>
