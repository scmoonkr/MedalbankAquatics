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

    <div class="filter-bar">
      <select v-model="locationFilter" class="filter-select">
        <option value="">전체 장소</option>
        <option v-for="loc in locationOptions" :key="loc" :value="loc">{{ loc }}</option>
      </select>
      <select v-model="monthFilter" class="filter-select">
        <option value="">전체 월</option>
        <optgroup v-for="g in monthGrouped" :key="g.year" :label="g.year">
          <option v-for="mo in g.months" :key="mo" :value="mo">{{ mo.slice(5) }}월</option>
        </optgroup>
      </select>
      <span class="filter-count">{{ filteredList.length }}건</span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="col-chk">
              <input type="checkbox" v-model="allChecked" />
            </th>
            <th class="col-id">meet_id</th>
            <th class="col-label">대회명</th>
            <th class="col-date">날짜</th>
            <th class="col-loc">장소</th>
            <th class="col-comp">competition_id</th>
            <th class="col-tags">tags</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in filteredList" :key="m.meet_id"
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
            <td class="col-tags">{{ (m.tags ?? []).join(', ') }}</td>
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
        <div class="field-row">
          <label>categories</label>
          <input v-model="editing.categoryInput" placeholder="cat1, cat2, ..." />
        </div>
        <div class="field-row">
          <label>tags</label>
          <input v-model="editing.tagsInput" placeholder="tag1, tag2, ..." />
        </div>

        <div class="section-label-row">
          <span class="section-label">이미지 업로드</span>
          <button v-if="(uploadedRecordCount + legacyRecordCount) > 0" class="record-clear-btn" :disabled="uploading"
            @click="clearUploadRecord"
            :title="`이 대회 ${uploadedRecordCount}장 + 이전 ${legacyRecordCount}장 = ${uploadedRecordCount + legacyRecordCount}장 지우기`">
            기록 {{ uploadedRecordCount + legacyRecordCount }}장 지우기
          </button>
        </div>

        <!-- 업로드 버튼 행 -->
        <div class="upload-area" @dragover.prevent @drop.prevent="onDrop">
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFileChange" />
          <input ref="dirInput" type="file" accept="image/*" multiple hidden webkitdirectory @change="onDirInputChange" />
          <button class="btn-upload" :disabled="uploading" @click="fileInput?.click()">파일 선택</button>
          <button class="btn-upload btn-upload-dir" :disabled="uploading" @click="selectDirectory">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
              <path d="M1 4.5C1 3.67 1.67 3 2.5 3H6l1.5 2H13.5C14.33 5 15 5.67 15 6.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V4.5Z"/>
            </svg>
            폴더 선택
          </button>
          <span class="upload-hint">또는 드래그</span>
        </div>

        <!-- 이전 폴더 재연결 (FSA, 권한 만료 시) -->
        <div v-if="pendingRestoreName && !dirHandle" class="reconnect-row">
          <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" class="dir-icon">
            <path d="M1 4.5C1 3.67 1.67 3 2.5 3H6l1.5 2H13.5C14.33 5 15 5.67 15 6.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V4.5Z"/>
          </svg>
          <span class="reconnect-name">이전: {{ pendingRestoreName }}/</span>
          <button class="reconnect-btn" @click="reconnectDir">재연결</button>
          <button class="reconnect-x" @click="forgetRestore" title="잊기">✕</button>
        </div>

        <!-- 폴더 모드 정보 카드 -->
        <div v-if="dirHandle" class="dir-card">
          <div class="dir-card-top">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" class="dir-icon">
              <path d="M1 4.5C1 3.67 1.67 3 2.5 3H6l1.5 2H13.5C14.33 5 15 5.67 15 6.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V4.5Z"/>
            </svg>
            <span class="dir-name">{{ dirName }}/</span>
            <button class="dir-clear" @click="clearDir" :disabled="uploading" title="폴더 해제">✕</button>
          </div>
          <div class="dir-stats">
            <span class="stat-item pending">대기 <strong>{{ dirPending.length }}</strong>장</span>
            <span class="stat-sep">·</span>
            <span class="stat-item done">완료 <strong>{{ dirDoneCount }}</strong>장</span>
            <span v-if="dirSkipped" class="stat-sep">·</span>
            <span v-if="dirSkipped" class="stat-item skipped">스킵 <strong>{{ dirSkipped }}</strong>장 (기록됨)</span>
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
          <div class="progress-row">
            <span class="progress-text">{{ uploadDone }} / {{ uploadTotal }}장 완료</span>
            <button class="btn-cancel" @click="cancelUpload" :disabled="cancelling">
              {{ cancelling ? '취소 중…' : '취소' }}
            </button>
          </div>
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
definePageMeta({ ssr: false, layout: 'backend' })
useHead({ title: '대회 관리 — 백엔드' })

const BATCH_SIZE = 20
const IMAGE_RE   = /\.(jpe?g|png|gif|webp|tiff?|bmp)$/i

const { data, refresh } = await useFetch<any[]>('/api/admin/meets')
const list = computed(() => data.value ?? [])

const checkedIds      = ref<number[]>([])
const editing         = ref<any>(null)
const editDate        = ref('')
const locationFilter  = ref('')
const monthFilter     = ref('')
const fileInput     = ref<HTMLInputElement | null>(null)
const dirInput      = ref<HTMLInputElement | null>(null)

// ── 파일 모드 ────────────────────────────────────────────────────────────────
const uploadFiles   = ref<{ file: File; preview: string }[]>([])

// ── 폴더 모드 ────────────────────────────────────────────────────────────────
const dirHandle     = ref<any>(null)   // FileSystemDirectoryHandle (HTTPS only)
const dirFallback   = ref(false)       // webkitdirectory fallback
const dirName       = ref('')
const dirPending    = ref<any[]>([])   // FileSystemFileHandle[] or File[]
const dirDoneCount  = ref(0)
const dirSkipped    = ref(0)           // localStorage 기록으로 스킵된 수

// ── FSA 핸들 복원 (Chrome/Edge: IndexedDB로 meet_id별 폴더 핸들 영속화) ──────
const pendingRestoreHandle = ref<any>(null)
const pendingRestoreName   = ref('')

// ── 공통 진행 상태 ───────────────────────────────────────────────────────────
const uploading     = ref(false)
const uploadAborted = ref(false)
let   uploadAC: AbortController | null = null
const uploadDone    = ref(0)
const uploadTotal   = ref(0)
const uploadResults = ref<any[]>([])
const cancelling    = ref(false)

// ── localStorage 업로드 기록 카운트 ────────────────────────────────────────
const uploadedRecordCount = ref(0)   // 현재 meet_id 신규 스킴 기록 수
const legacyRecordCount   = ref(0)   // master 구 스킴(mb_dir_uploaded) 전체 누적 수

// ── 필터 옵션 ────────────────────────────────────────────────────────────────
const locationOptions = computed(() => {
  const s = new Set<string>()
  for (const m of list.value) if (m.location) s.add(m.location)
  return [...s].sort()
})

const monthOptions = computed(() => {
  const s = new Set<string>()
  for (const m of list.value) {
    if (m.date) {
      const mo = String(m.date).slice(0, 7)
      if (mo) s.add(mo)
    }
  }
  return [...s].sort().reverse()
})

const monthGrouped = computed(() => {
  const groups = new Map<string, string[]>()
  for (const mo of monthOptions.value) {
    const year = mo.slice(0, 4)
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(mo)
  }
  return [...groups.entries()]
    .map(([year, months]) => ({ year, months }))
    .sort((a, b) => b.year.localeCompare(a.year))
})

const filteredList = computed(() => {
  let items = list.value
  if (locationFilter.value) items = items.filter(m => m.location === locationFilter.value)
  if (monthFilter.value)    items = items.filter(m => String(m.date ?? '').startsWith(monthFilter.value))
  return items
})

// ── 체크박스 ─────────────────────────────────────────────────────────────────
const allChecked = computed({
  get: () => filteredList.value.length > 0 && filteredList.value.every(m => checkedIds.value.includes(m.meet_id)),
  set: (val: boolean) => {
    const ids = filteredList.value.map(m => m.meet_id)
    if (val) checkedIds.value = [...new Set([...checkedIds.value, ...ids])]
    else     checkedIds.value = checkedIds.value.filter(id => !ids.includes(id))
  },
})

// ── 편집 패널 열기 ────────────────────────────────────────────────────────────
async function openEdit(m: any) {
  editing.value = {
    ...m,
    tagsInput:     (m.tags ?? []).join(', '),
    categoryInput: (Array.isArray(m.category) ? m.category : m.category ? [m.category] : []).join(', '),
  }
  editDate.value = m.date ? new Date(m.date).toISOString().slice(0, 10) : ''
  resetUpload()
  refreshUploadedCount()
  await tryRestoreDirHandle()
}

function openNew() {
  editing.value = { label: '', short: '', location: '', competition_id: '', tagsInput: '', categoryInput: '' }
  editDate.value = ''
  resetUpload()
  uploadedRecordCount.value = 0
  legacyRecordCount.value   = countLegacyRecords()
}

function clearForm() {
  editing.value = { label: '', short: '', location: '', competition_id: '', tagsInput: '', categoryInput: '' }
  editDate.value = ''
  resetUpload()
  uploadedRecordCount.value = 0
  legacyRecordCount.value   = countLegacyRecords()
}

function resetUpload() {
  uploadAborted.value = true
  uploadAC?.abort()
  uploadAC = null
  uploadFiles.value = []
  uploadResults.value = []
  dirHandle.value = null
  dirFallback.value = false
  dirName.value = ''
  dirPending.value = []
  dirDoneCount.value = 0
  dirSkipped.value = 0
  uploading.value = false
  cancelling.value = false
  uploadDone.value = 0
  uploadTotal.value = 0
  pendingRestoreHandle.value = null
  pendingRestoreName.value = ''
}

// ── 파일 모드 ────────────────────────────────────────────────────────────────
function addFiles(files: FileList | null) {
  if (!files) return
  dirHandle.value = null  // 폴더 모드 해제
  const uploadedSet = getUploadedSet(editing.value?.meet_id)
  let skipped = 0
  for (const file of Array.from(files)) {
    if (!IMAGE_RE.test(file.name)) continue
    if (uploadedSet.has(file.name)) { skipped++; continue }
    uploadFiles.value.push({ file, preview: URL.createObjectURL(file) })
  }
  if (skipped > 0) alert(`이미 업로드된 ${skipped}장은 제외했습니다. (재업로드하려면 "기록 지우기")`)
}

function onFileChange(e: Event) {
  addFiles((e.target as HTMLInputElement).files)
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e: DragEvent) { addFiles(e.dataTransfer?.files ?? null) }

async function doFileUpload() {
  if (!uploadFiles.value.length || !editing.value || uploading.value) return
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

// ── localStorage 업로드 기록 (meet_id 단위) ─────────────────────────────────
function recordKey(meetId: number | string) { return `meet_uploaded_${meetId}` }

function getUploadedSet(meetId: number | string | undefined): Set<string> {
  if (!meetId) return new Set()
  try {
    const raw = localStorage.getItem(recordKey(meetId))
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveUploadedSet(meetId: number | string, set: Set<string>) {
  try { localStorage.setItem(recordKey(meetId), JSON.stringify([...set])) } catch {}
}

function markUploaded(meetId: number | string | undefined, names: string[]) {
  if (!meetId || !names.length) return
  const set = getUploadedSet(meetId)
  for (const n of names) set.add(n)
  saveUploadedSet(meetId, set)
  uploadedRecordCount.value = set.size
}

function refreshUploadedCount() {
  uploadedRecordCount.value = getUploadedSet(editing.value?.meet_id).size
  legacyRecordCount.value   = countLegacyRecords()
}

const LEGACY_LS_KEY = 'mb_dir_uploaded'

function countLegacyRecords(): number {
  try {
    const map = JSON.parse(localStorage.getItem(LEGACY_LS_KEY) ?? '{}')
    let n = 0
    for (const k of Object.keys(map)) n += (map[k]?.length ?? 0)
    return n
  } catch { return 0 }
}

async function clearUploadRecord() {
  if (uploading.value) return
  const id  = editing.value?.meet_id
  const cur = uploadedRecordCount.value
  const leg = legacyRecordCount.value
  if (cur === 0 && leg === 0) return
  const parts: string[] = []
  if (cur > 0) parts.push(`이 대회(#${id})의 기록 ${cur}장`)
  if (leg > 0) parts.push(`이전 폴더-기준 기록 ${leg}장`)
  if (!confirm(`${parts.join(' + ')}을 지우시겠습니까?`)) return

  try { if (id) localStorage.removeItem(recordKey(id)) } catch {}
  try { localStorage.removeItem(LEGACY_LS_KEY) } catch {}
  uploadedRecordCount.value = 0
  legacyRecordCount.value   = 0

  // 폴더가 열려 있으면 재스캔(FSA) 또는 재선택 안내(Safari)
  if (dirHandle.value) {
    if (!dirFallback.value) {
      await rescanDir()
    } else {
      clearDir()
      alert('업로드 기록을 지웠습니다. 폴더를 다시 선택해 주세요.')
    }
  }
}

// ── IndexedDB: FileSystemDirectoryHandle 영속화 (Chrome/Edge) ───────────────
const IDB_NAME  = 'meet-uploads'
const IDB_STORE = 'dir-handles'

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

async function idbSet(meetId: number | string, value: any) {
  if (typeof indexedDB === 'undefined') return
  try {
    const db = await openIDB()
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(value, String(meetId))
      tx.oncomplete = () => res()
      tx.onerror    = () => rej(tx.error)
    })
    db.close()
  } catch (e) { console.warn('idbSet failed', e) }
}

async function idbGet(meetId: number | string): Promise<any> {
  if (typeof indexedDB === 'undefined') return null
  try {
    const db = await openIDB()
    const handle = await new Promise<any>((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(String(meetId))
      req.onsuccess = () => res(req.result)
      req.onerror   = () => rej(req.error)
    })
    db.close()
    return handle ?? null
  } catch { return null }
}

async function idbDelete(meetId: number | string) {
  if (typeof indexedDB === 'undefined') return
  try {
    const db = await openIDB()
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).delete(String(meetId))
      tx.oncomplete = () => res()
      tx.onerror    = () => rej(tx.error)
    })
    db.close()
  } catch {}
}

async function verifyPermission(handle: any, request = false): Promise<boolean> {
  if (!handle?.queryPermission) return false
  const opts = { mode: 'read' as const }
  try {
    if ((await handle.queryPermission(opts)) === 'granted') return true
    if (request && (await handle.requestPermission(opts)) === 'granted') return true
  } catch {}
  return false
}

// ── 폴더 핸들 복원 / 재연결 / 적용 / 재스캔 ─────────────────────────────────
async function tryRestoreDirHandle() {
  const id = editing.value?.meet_id
  if (!id) return
  const handle = await idbGet(id)
  if (!handle) return
  if (await verifyPermission(handle, false)) {
    await applyDirHandle(handle)
  } else {
    pendingRestoreHandle.value = handle
    pendingRestoreName.value   = handle.name ?? '(이전 폴더)'
  }
}

async function reconnectDir() {
  if (!pendingRestoreHandle.value) return
  if (await verifyPermission(pendingRestoreHandle.value, true)) {
    await applyDirHandle(pendingRestoreHandle.value)
    pendingRestoreHandle.value = null
    pendingRestoreName.value   = ''
  } else {
    alert('폴더 권한이 거부되었습니다.')
  }
}

function forgetRestore() {
  if (!editing.value?.meet_id) return
  idbDelete(editing.value.meet_id)
  pendingRestoreHandle.value = null
  pendingRestoreName.value   = ''
}

async function applyDirHandle(handle: any) {
  dirHandle.value     = handle
  dirFallback.value   = false
  dirName.value       = handle.name ?? ''
  dirPending.value    = []
  dirDoneCount.value  = 0
  dirSkipped.value    = 0
  uploadFiles.value   = []
  uploadResults.value = []
  await rescanDir()
}

async function rescanDir() {
  if (!dirHandle.value || dirFallback.value) return
  const handle = dirHandle.value
  dirPending.value   = []
  dirDoneCount.value = 0
  dirSkipped.value   = 0
  const uploadedSet = getUploadedSet(editing.value?.meet_id)
  for await (const [name, h] of (handle as any).entries()) {
    if (h.kind !== 'file' || !IMAGE_RE.test(name)) continue
    if (uploadedSet.has(name)) { dirSkipped.value++; continue }
    dirPending.value.push(h)
  }
  dirDoneCount.value = dirSkipped.value
}

function cancelUpload() {
  if (!uploading.value) return
  cancelling.value = true
  uploadAborted.value = true
  uploadAC?.abort()
}

// ── 폴더 모드 ────────────────────────────────────────────────────────────────
async function selectDirectory() {
  if (typeof (window as any).showDirectoryPicker === 'function') {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'read' })
      await applyDirHandle(handle)
      pendingRestoreHandle.value = null
      pendingRestoreName.value   = ''
      // meet_id별 IndexedDB에 핸들 저장 (다음 세션에서 복원)
      if (editing.value?.meet_id) await idbSet(editing.value.meet_id, handle)
    } catch (e: any) {
      if (e.name !== 'AbortError') alert('폴더 접근 실패: ' + e.message)
    }
  } else {
    dirInput.value?.click()
  }
}

function onDirInputChange(e: Event) {
  const all = Array.from((e.target as HTMLInputElement).files ?? [])
    .filter(f => IMAGE_RE.test(f.name))
  if (!all.length) return

  const uploadedSet = getUploadedSet(editing.value?.meet_id)
  const pending: File[] = []
  let skipped = 0
  for (const f of all) {
    if (uploadedSet.has(f.name)) { skipped++; continue }
    pending.push(f)
  }

  const rel = (all[0] as any).webkitRelativePath as string
  dirHandle.value     = true
  dirFallback.value   = true
  dirDoneCount.value  = uploadedSet.size
  dirSkipped.value    = skipped
  uploadFiles.value   = []
  uploadResults.value = []
  dirName.value    = rel ? rel.split('/')[0] : '선택된 폴더'
  dirPending.value = pending

  if (dirInput.value) dirInput.value.value = ''
}

function clearDir() {
  dirHandle.value = null
  dirFallback.value = false
  dirName.value = ''
  dirPending.value = []
  dirDoneCount.value = 0
  dirSkipped.value = 0
  // meet_id의 IndexedDB 핸들도 해제
  if (editing.value?.meet_id) idbDelete(editing.value.meet_id)
}

async function doDirUpload() {
  if (!dirPending.value.length || !editing.value || !dirHandle.value || uploading.value) return
  uploading.value   = true
  cancelling.value  = false
  uploadDone.value  = 0
  uploadTotal.value = dirPending.value.length
  uploadResults.value = []

  uploadAborted.value = false
  uploadAC = new AbortController()
  const pending = [...dirPending.value]
  const meetId  = editing.value.meet_id

  const completedNames = new Set<string>()

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    if (uploadAborted.value) break
    const batch = pending.slice(i, i + BATCH_SIZE)

    const batchItems: { file: File }[] = []
    for (const h of batch) {
      if (uploadAborted.value) break
      const file = dirFallback.value ? (h as File) : await h.getFile()
      batchItems.push({ file })
    }
    if (uploadAborted.value) break

    const fd = new FormData()
    fd.append('meet_id', String(meetId ?? 0))
    fd.append('date', editDate.value)
    for (const { file } of batchItems) fd.append('files', file)

    try {
      const res = await $fetch<any>('/api/admin/upload-images', {
        method: 'POST', body: fd,
        signal: uploadAC?.signal,
      })
      uploadResults.value.push(...res.results)
      const names = batchItems.map(({ file }) => file.name)
      markUploaded(meetId, names)
      for (const n of names) completedNames.add(n)
      dirDoneCount.value += names.length
    } catch (e: any) {
      if (uploadAborted.value || e?.name === 'AbortError') break
      console.error(`Batch ${i}–${i + BATCH_SIZE} 실패`, e)
    }

    uploadDone.value = Math.min(i + BATCH_SIZE, pending.length)
  }

  uploadAC = null
  // 완료 항목을 pending에서 제거
  if (dirFallback.value) {
    dirPending.value = dirPending.value.filter(f => !completedNames.has((f as File).name))
  } else {
    // FSA: localStorage 기록 기준으로 재스캔
    await rescanDir()
  }
  uploading.value  = false
  cancelling.value = false
}

// ── 저장 / 삭제 ──────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return d ? String(d).slice(0, 10) : ''
}

watch(editing, (val) => { if (!val) resetUpload() }, { flush: 'sync' })

watch(editDate, (val) => {
  if (editing.value && val && val.length >= 7) {
    editing.value.short = val.slice(0, 7)
  }
})

async function save() {
  const { meet_id } = editing.value
  const body = {
    label:          editing.value.label ?? '',
    short:          editing.value.short ?? '',
    date:           editDate.value || null,
    location:       editing.value.location ?? '',
    competition_id: editing.value.competition_id ?? '',
    tags:           (editing.value.tagsInput ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
    category:       (editing.value.categoryInput ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
  }
  try {
    if (meet_id) {
      await $fetch(`/api/admin/meets/${meet_id}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/admin/meets', { method: 'POST', body })
    }
    editing.value = null
    await refresh()
  } catch (e: any) {
    alert('저장 실패: ' + (e?.data?.message ?? e?.message ?? '알 수 없는 오류'))
  }
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
.admin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.filter-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.filter-select { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; padding: 6px 10px; font-size: 12px; cursor: pointer; }
.filter-select:focus { outline: none; border-color: #388bfd; }
.filter-count { font-size: 12px; color: #8b949e; font-variant-numeric: tabular-nums; white-space: nowrap; margin-left: 4px; }
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
.col-tags { width: 160px; color: #8b949e; font-size: 12px; }
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
.section-label-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 6px; border-top: 1px solid #30363d; }
.section-label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em; }
.record-clear-btn { background: transparent; border: 1px solid #30363d; border-radius: 4px; color: #8b949e; font-size: 10px; padding: 3px 8px; cursor: pointer; white-space: nowrap; }
.record-clear-btn:hover:not(:disabled) { border-color: #f85149; color: #f85149; }
.record-clear-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-upload:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-upload:disabled:hover { background: #21262d; }
.dir-clear:disabled { opacity: 0.4; cursor: not-allowed; }

.reconnect-row { display: flex; align-items: center; gap: 7px; padding: 6px 12px; background: #0d1117; border: 1px dashed #388bfd; border-radius: 6px; font-size: 11px; }
.reconnect-name { flex: 1; color: #8b949e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.reconnect-btn { background: #21262d; border: 1px solid #388bfd; border-radius: 4px; color: #58a6ff; font-size: 11px; padding: 3px 10px; cursor: pointer; }
.reconnect-btn:hover { background: rgba(56,139,253,0.1); }
.reconnect-x { background: none; border: none; color: #8b949e; cursor: pointer; font-size: 13px; line-height: 1; padding: 0 2px; }
.reconnect-x:hover { color: #f85149; }

.stat-item.skipped strong { color: #8b949e; }

.progress-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.btn-cancel { background: transparent; border: 1px solid #f85149; border-radius: 4px; color: #f85149; font-size: 11px; padding: 3px 10px; cursor: pointer; white-space: nowrap; }
.btn-cancel:hover:not(:disabled) { background: rgba(248,81,73,0.1); }
.btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

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
