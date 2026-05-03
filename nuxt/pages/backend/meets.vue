<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>대회 관리</h1>
      <div class="head-actions">
        <button class="btn-secondary" @click="openNew">신규 추가</button>
        <span class="head-sep" />
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
        <span>{{ editing.meet_id ? `대회 #${editing.meet_id}` : '신규 대회' }}</span>
        <div class="header-actions">
          <button class="clear-btn" @click="clearForm" title="지우기">지우기</button>
          <button class="close-btn" @click="editing = null">✕</button>
        </div>
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

        <!-- 업로드 버튼 행 -->
        <div class="upload-area" @dragover.prevent @drop.prevent="onDrop">
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFileChange" />
          <button class="btn-upload" @click="fileInput?.click()">파일 선택</button>
          <button class="btn-upload btn-upload-dir" @click="selectDirectory">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
              <path d="M1 4.5C1 3.67 1.67 3 2.5 3H6l1.5 2H13.5C14.33 5 15 5.67 15 6.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V4.5Z"/>
            </svg>
            폴더 선택
          </button>
          <span class="upload-hint">또는 드래그</span>
        </div>

        <!-- 폴더 모드 정보 카드 -->
        <div v-if="dirHandle" class="dir-card">
          <div class="dir-card-top">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" class="dir-icon">
              <path d="M1 4.5C1 3.67 1.67 3 2.5 3H6l1.5 2H13.5C14.33 5 15 5.67 15 6.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V4.5Z"/>
            </svg>
            <span class="dir-name">{{ dirName }}/</span>
            <button class="dir-clear" @click="clearDir" title="폴더 해제">✕</button>
          </div>
          <div class="dir-stats">
            <span class="stat-item pending">대기 <strong>{{ dirPending.length }}</strong>장</span>
            <span class="stat-sep">·</span>
            <span class="stat-item done">완료 <strong>{{ dirDoneCount }}</strong>장 (uploaded/)</span>
          </div>
        </div>

        <!-- 파일 모드 큐 (개별 파일 선택 시) -->
        <div v-if="uploadFiles.length" class="upload-queue">
          <div v-for="(f, i) in uploadFiles" :key="i" class="upload-item">
            <img :src="f.preview" class="upload-thumb" />
            <span class="upload-name">{{ f.file.name }}</span>
            <button class="remove-btn" @click="uploadFiles.splice(i, 1)">✕</button>
          </div>
        </div>

        <!-- 진행 표시 -->
        <div v-if="uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadTotal ? `${Math.round(uploadDone / uploadTotal * 100)}%` : '0%' }" />
          </div>
          <span class="progress-text">{{ uploadDone }} / {{ uploadTotal }}장 완료</span>
        </div>

        <!-- 결과 -->
        <div v-if="uploadResults.length && !uploading" class="upload-results">
          <div v-for="r in uploadResults.slice(-20)" :key="r.image_id" class="result-item">
            <img :src="r.urls.thumb" class="upload-thumb" />
            <span>{{ r.image_id }}</span>
          </div>
          <div v-if="uploadResults.length > 20" class="result-more">+{{ uploadResults.length - 20 }}장 더</div>
        </div>

        <!-- 업로드 실행 버튼 -->
        <button v-if="(uploadFiles.length || dirPending.length) && !uploading"
          class="btn-primary btn-full" @click="dirHandle ? doDirUpload() : doFileUpload()">
          {{ dirHandle ? dirPending.length : uploadFiles.length }}장 업로드
        </button>
      </div>
      <div class="edit-footer">
        <button v-if="editing.meet_id" class="btn-danger" @click="deleteOne(editing.meet_id)">삭제</button>
        <button class="btn-primary" @click="save">{{ editing.meet_id ? '저장' : '신규 저장' }}</button>
      </div>
    </div>
    <div v-if="editing" class="overlay" @click="editing = null" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: false })
useHead({ title: '대회 관리 — 백엔드' })

const BATCH_SIZE = 20
const IMAGE_RE   = /\.(jpe?g|png|gif|webp|tiff?|bmp)$/i

const { data, refresh } = await useFetch<any[]>('/api/admin/meets')
const list = computed(() => data.value ?? [])

const checkedIds    = ref<number[]>([])
const editing       = ref<any>(null)
const editDate      = ref('')
const fileInput     = ref<HTMLInputElement | null>(null)

// ── 파일 모드 ────────────────────────────────────────────────────────────────
const uploadFiles   = ref<{ file: File; preview: string }[]>([])

// ── 폴더 모드 ────────────────────────────────────────────────────────────────
const dirHandle     = ref<any>(null)   // FileSystemDirectoryHandle
const dirName       = ref('')
const dirPending    = ref<any[]>([])   // FileSystemFileHandle[]
const dirDoneCount  = ref(0)

// ── 공통 진행 상태 ───────────────────────────────────────────────────────────
const uploading     = ref(false)
const uploadDone    = ref(0)
const uploadTotal   = ref(0)
const uploadResults = ref<any[]>([])

// ── 체크박스 ─────────────────────────────────────────────────────────────────
const allChecked = computed(() =>
  list.value.length > 0 && checkedIds.value.length === list.value.length)

function toggleAll(e: Event) {
  checkedIds.value = (e.target as HTMLInputElement).checked
    ? list.value.map(m => m.meet_id) : []
}

// ── 편집 패널 열기 ────────────────────────────────────────────────────────────
function openEdit(m: any) {
  editing.value = { ...m }
  editDate.value = m.date ? new Date(m.date).toISOString().slice(0, 10) : ''
  resetUpload()
}

function openNew() {
  editing.value = { label: '', short: '', location: '', competition_id: '' }
  editDate.value = ''
  resetUpload()
}

function clearForm() {
  editing.value = { label: '', short: '', location: '', competition_id: '' }
  editDate.value = ''
  resetUpload()
}

function resetUpload() {
  uploadFiles.value = []
  uploadResults.value = []
  dirHandle.value = null
  dirName.value = ''
  dirPending.value = []
  dirDoneCount.value = 0
  uploading.value = false
  uploadDone.value = 0
  uploadTotal.value = 0
}

// ── 파일 모드 ────────────────────────────────────────────────────────────────
function addFiles(files: FileList | null) {
  if (!files) return
  dirHandle.value = null  // 폴더 모드 해제
  for (const file of Array.from(files)) {
    if (!IMAGE_RE.test(file.name)) continue
    uploadFiles.value.push({ file, preview: URL.createObjectURL(file) })
  }
}

function onFileChange(e: Event) {
  addFiles((e.target as HTMLInputElement).files)
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e: DragEvent) { addFiles(e.dataTransfer?.files ?? null) }

async function doFileUpload() {
  if (!uploadFiles.value.length || !editing.value) return
  uploading.value = true
  uploadDone.value = 0
  uploadTotal.value = uploadFiles.value.length
  uploadResults.value = []

  const fd = new FormData()
  fd.append('meet_id', String(editing.value.meet_id))
  fd.append('date', editDate.value)
  for (const { file } of uploadFiles.value) fd.append('files', file)

  try {
    const res = await $fetch<any>('/api/admin/upload-images', { method: 'POST', body: fd })
    uploadResults.value = res.results
    uploadFiles.value = []
    uploadDone.value = uploadTotal.value
  } finally {
    uploading.value = false
  }
}

// ── 폴더 모드 ────────────────────────────────────────────────────────────────
async function selectDirectory() {
  try {
    const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    dirHandle.value  = handle
    dirName.value    = handle.name
    dirPending.value = []
    dirDoneCount.value = 0
    uploadFiles.value = []
    uploadResults.value = []

    // uploaded/ 서브폴더에 이미 처리된 파일 수 집계
    try {
      const uploadedDir = await handle.getDirectoryHandle('uploaded')
      for await (const [, h] of (uploadedDir as any).entries()) {
        if (h.kind === 'file') dirDoneCount.value++
      }
    } catch {}

    // 루트에서 이미지 파일 수집 (uploaded/ 제외)
    for await (const [name, h] of (handle as any).entries()) {
      if (h.kind === 'file' && IMAGE_RE.test(name)) {
        dirPending.value.push(h)
      }
    }
  } catch (e: any) {
    if (e.name !== 'AbortError') alert('폴더 접근 실패: ' + e.message)
  }
}

function clearDir() {
  dirHandle.value = null
  dirName.value = ''
  dirPending.value = []
  dirDoneCount.value = 0
}

async function doDirUpload() {
  if (!dirPending.value.length || !editing.value || !dirHandle.value) return
  uploading.value  = true
  uploadDone.value = 0
  uploadTotal.value = dirPending.value.length
  uploadResults.value = []

  const uploadedDir = await (dirHandle.value as any).getDirectoryHandle('uploaded', { create: true })
  const pending = [...dirPending.value]

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE)

    // 파일 읽기
    const batchItems: { file: File; handle: any }[] = []
    for (const h of batch) {
      const file = await h.getFile()
      batchItems.push({ file, handle: h })
    }

    // 서버 업로드
    const fd = new FormData()
    fd.append('meet_id', String(editing.value.meet_id))
    fd.append('date', editDate.value)
    for (const { file } of batchItems) fd.append('files', file)

    try {
      const res = await $fetch<any>('/api/admin/upload-images', { method: 'POST', body: fd })
      uploadResults.value.push(...res.results)

      // uploaded/ 로 이동 (복사 후 원본 삭제)
      for (const { file, handle } of batchItems) {
        try {
          const newHandle = await (uploadedDir as any).getFileHandle(file.name, { create: true })
          const writable  = await newHandle.createWritable()
          await writable.write(await handle.getFile())
          await writable.close()
          await (dirHandle.value as any).removeEntry(file.name)
          dirDoneCount.value++
        } catch {}
      }
    } catch (e) {
      console.error(`Batch ${i}–${i + BATCH_SIZE} 실패`, e)
    }

    uploadDone.value = Math.min(i + BATCH_SIZE, pending.length)
  }

  dirPending.value = []
  uploading.value  = false
}

// ── 저장 / 삭제 ──────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('ko-KR') : ''
}

async function save() {
  const { meet_id } = editing.value
  const body = {
    label:          editing.value.label,
    short:          editing.value.short,
    date:           editDate.value || null,
    location:       editing.value.location,
    competition_id: editing.value.competition_id,
  }
  if (meet_id) {
    await $fetch(`/api/admin/meets/${meet_id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/admin/meets', { method: 'POST', body })
  }
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
.header-actions { display: flex; align-items: center; gap: 10px; }
.close-btn { background: none; border: none; color: #8b949e; font-size: 18px; cursor: pointer; }
.close-btn:hover { color: #e6edf3; }
.clear-btn { background: none; border: 1px solid #30363d; border-radius: 4px; color: #8b949e; font-size: 11px; padding: 3px 8px; cursor: pointer; }
.clear-btn:hover { border-color: #8b949e; color: #e6edf3; }
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

/* ── 업로드 영역 ── */
.section-label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 6px; border-top: 1px solid #30363d; }
.upload-area { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px dashed #30363d; border-radius: 6px; flex-wrap: wrap; }
.btn-upload { padding: 5px 12px; background: #21262d; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; font-size: 12px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
.btn-upload:hover { background: #30363d; }
.btn-upload-dir { border-color: #388bfd; color: #58a6ff; }
.btn-upload-dir:hover { background: rgba(56,139,253,0.1); }
.upload-hint { font-size: 11px; color: #8b949e; margin-left: 4px; }

/* ── 폴더 카드 ── */
.dir-card { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
.dir-card-top { display: flex; align-items: center; gap: 7px; }
.dir-icon { color: #8b949e; flex-shrink: 0; }
.dir-name { flex: 1; font-size: 12px; color: #e6edf3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dir-clear { background: none; border: none; color: #8b949e; cursor: pointer; font-size: 14px; line-height: 1; padding: 0 2px; flex-shrink: 0; }
.dir-clear:hover { color: #f85149; }
.dir-stats { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.stat-item { color: #8b949e; }
.stat-item.pending strong { color: #f0a040; }
.stat-item.done strong { color: #3fb950; }
.stat-sep { color: #30363d; }

/* ── 파일 큐 ── */
.upload-queue { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
.upload-item { display: flex; align-items: center; gap: 8px; padding: 4px; background: #21262d; border-radius: 4px; }
.upload-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
.upload-name { flex: 1; font-size: 11px; color: #8b949e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.remove-btn { background: none; border: none; color: #8b949e; cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 4px; }
.remove-btn:hover { color: #f85149; }

/* ── 진행 표시 ── */
.upload-progress { display: flex; flex-direction: column; gap: 6px; }
.progress-bar { width: 100%; height: 4px; background: #21262d; border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: #388bfd; border-radius: 2px; transition: width 0.3s ease; }
.progress-text { font-size: 11px; color: #8b949e; text-align: center; font-variant-numeric: tabular-nums; }

/* ── 결과 ── */
.upload-results { display: flex; flex-wrap: wrap; gap: 6px; }
.result-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; color: #8b949e; }
.result-item .upload-thumb { width: 48px; height: 48px; }
.result-more { font-size: 11px; color: #8b949e; align-self: center; padding: 4px 8px; background: #21262d; border-radius: 4px; }

.btn-primary { padding: 8px 20px; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; }
.btn-primary:hover { background: #2ea043; }
.btn-danger { padding: 8px 20px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 13px; cursor: pointer; }
.btn-danger:hover { background: #3a1a1a; }
.btn-danger:disabled { opacity: 0.4; cursor: default; }
.btn-secondary { padding: 8px 20px; background: transparent; border: 1px solid #388bfd; border-radius: 6px; color: #388bfd; font-size: 13px; cursor: pointer; }
.btn-secondary:hover { background: rgba(56,139,253,0.1); }
.head-actions { display: flex; align-items: center; gap: 10px; }
.head-sep { display: inline-block; width: 1px; height: 20px; background: #30363d; margin: 0 8px; }
.btn-full { width: 100%; display: block; text-align: center; }
</style>
