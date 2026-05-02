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

        <div class="section-label">이미지 업로드</div>
        <div class="upload-area" @dragover.prevent @drop.prevent="onDrop">
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFileChange" />
          <button class="btn-upload" @click="fileInput?.click()">파일 선택</button>
          <span class="upload-hint">또는 파일을 여기에 드래그</span>
        </div>

        <div v-if="uploadFiles.length" class="upload-queue">
          <div v-for="(f, i) in uploadFiles" :key="i" class="upload-item">
            <img :src="f.preview" class="upload-thumb" />
            <span class="upload-name">{{ f.file.name }}</span>
            <button class="remove-btn" @click="uploadFiles.splice(i, 1)">✕</button>
          </div>
        </div>

        <div v-if="uploading" class="upload-progress">
          업로드 중... {{ uploadDone }}/{{ uploadFiles.length }}
        </div>
        <div v-if="uploadResults.length" class="upload-results">
          <div v-for="r in uploadResults" :key="r.image_id" class="result-item">
            <img :src="r.urls.thumb" class="upload-thumb" />
            <span>image_id: {{ r.image_id }}</span>
          </div>
        </div>

        <button v-if="uploadFiles.length && !uploading"
          class="btn-primary btn-full" @click="doUpload">
          {{ uploadFiles.length }}장 업로드
        </button>
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

const checkedIds    = ref<number[]>([])
const editing       = ref<any>(null)
const editDate      = ref('')
const fileInput     = ref<HTMLInputElement | null>(null)
const uploadFiles   = ref<{ file: File, preview: string }[]>([])
const uploading     = ref(false)
const uploadDone    = ref(0)
const uploadResults = ref<any[]>([])

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
  uploadFiles.value = []
  uploadResults.value = []
}

function addFiles(files: FileList | null) {
  if (!files) return
  for (const file of Array.from(files)) {
    const preview = URL.createObjectURL(file)
    uploadFiles.value.push({ file, preview })
  }
}

function onFileChange(e: Event) {
  addFiles((e.target as HTMLInputElement).files)
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e: DragEvent) {
  addFiles(e.dataTransfer?.files ?? null)
}

async function doUpload() {
  if (!uploadFiles.value.length || !editing.value) return
  uploading.value = true
  uploadDone.value = 0
  uploadResults.value = []

  const fd = new FormData()
  fd.append('meet_id', String(editing.value.meet_id))
  fd.append('date', editDate.value)
  for (const { file } of uploadFiles.value) fd.append('files', file)

  try {
    const res = await $fetch<any>('/api/admin/upload-images', { method: 'POST', body: fd })
    uploadResults.value = res.results
    uploadFiles.value = []
  } finally {
    uploading.value = false
  }
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
.section-label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 6px; border-top: 1px solid #30363d; }
.upload-area { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px dashed #30363d; border-radius: 6px; }
.btn-upload { padding: 6px 14px; background: #21262d; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-upload:hover { background: #30363d; }
.upload-hint { font-size: 11px; color: #8b949e; }
.upload-queue { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
.upload-item { display: flex; align-items: center; gap: 8px; padding: 4px; background: #21262d; border-radius: 4px; }
.upload-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
.upload-name { flex: 1; font-size: 11px; color: #8b949e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.remove-btn { background: none; border: none; color: #8b949e; cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 4px; }
.remove-btn:hover { color: #f85149; }
.upload-progress { font-size: 12px; color: #8b949e; text-align: center; padding: 8px; }
.upload-results { display: flex; flex-wrap: wrap; gap: 6px; }
.result-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; color: #8b949e; }
.result-item .upload-thumb { width: 48px; height: 48px; }
.btn-full { width: 100%; justify-content: center; }
</style>
