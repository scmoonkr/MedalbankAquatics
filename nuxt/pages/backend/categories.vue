<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>카테고리 관리</h1>
      <span class="head-meta">{{ categories.length }}개 카테고리 · {{ totalImages }}장</span>
      <div class="head-actions">
        <button class="btn-secondary" @click="openUpload">이미지 추가</button>
      </div>
    </header>

    <!-- 카테고리 목록 -->
    <div class="tag-list">
      <button v-for="c in categories" :key="c.name" type="button"
        class="tag-chip" :class="{ active: selectedCategory === c.name }"
        @click="selectCategory(c.name)">
        <span class="tag-name">{{ c.name }}</span>
        <span class="tag-count">{{ c.count }}</span>
      </button>
      <span v-if="!categories.length" class="empty-inline">카테고리 없음</span>
    </div>

    <!-- 선택된 카테고리 이미지 -->
    <template v-if="selectedCategory">
      <div class="section-head">
        <span class="section-title">{{ selectedCategory }}</span>
        <span class="section-count">{{ filteredImages.length }}장</span>
      </div>

      <div class="img-grid">
        <button v-for="img in filteredImages" :key="img.image_id"
          type="button" class="grid-tile"
          :class="{ selected: checkedIds.includes(img.image_id) }"
          @click.stop="openEdit(img)">
          <div class="grid-chk" @click.stop>
            <input type="checkbox" :value="img.image_id" v-model="checkedIds" @click.stop />
          </div>
          <img v-if="img.urls?.thumb" :src="img.urls.thumb" class="grid-img" />
          <div v-else class="grid-img no-img">—</div>
          <div class="grid-meta">
            <span class="grid-id">#{{ img.image_id }}</span>
            <span class="grid-info">{{ img.athlete_name }}</span>
          </div>
        </button>
      </div>
    </template>

    <div v-else class="empty-state">카테고리를 선택하면 이미지를 볼 수 있습니다.</div>

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
          <label>athlete</label>
          <input :value="editing.athlete_name" disabled />
        </div>
        <div class="field-row">
          <label>meet</label>
          <input :value="editing.meet_label" disabled />
        </div>
        <div class="field-row">
          <label>category</label>
          <input v-model="editing.categoryInput" placeholder="cat1, cat2, ..." />
        </div>
        <div class="field-row">
          <label>tags</label>
          <input v-model="editing.tagsInput" placeholder="tag1, tag2, ..." />
        </div>
      </div>
      <div class="edit-footer">
        <button class="btn-danger" @click="editing = null">취소</button>
        <button class="btn-primary" @click="save">저장</button>
      </div>
    </div>
    <div v-if="editing" class="overlay" @click="editing = null" />

    <!-- 업로드 패널 -->
    <div v-if="uploadPanel" class="edit-panel" @click.stop>
      <div class="edit-header">
        <span>이미지 추가</span>
        <button class="close-btn" @click="closeUpload">✕</button>
      </div>
      <div class="edit-body">
        <div class="field-row">
          <label>category</label>
          <input v-model="upCategory" placeholder="카테고리 1개" />
        </div>
        <div class="field-row">
          <label>tags</label>
          <input v-model="upTags" placeholder="tag1, tag2, ..." />
        </div>
        <div class="field-row">
          <label>date</label>
          <input v-model="upDate" type="date" />
        </div>

        <div class="section-label">이미지 업로드</div>

        <div class="upload-area" @dragover.prevent @drop.prevent="onDrop">
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFileChange" />
          <input ref="dirInput" type="file" accept="image/*" multiple hidden webkitdirectory @change="onDirInputChange" />
          <button class="btn-upload" @click="fileInput?.click()">파일 선택</button>
          <button class="btn-upload btn-upload-dir" @click="selectDirectory">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
              <path d="M1 4.5C1 3.67 1.67 3 2.5 3H6l1.5 2H13.5C14.33 5 15 5.67 15 6.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V4.5Z"/>
            </svg>
            폴더 선택
          </button>
          <span class="upload-hint">또는 드래그</span>
        </div>

        <!-- 폴더 카드 -->
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
            <span class="stat-item done">완료 <strong>{{ dirDoneCount }}</strong>장</span>
          </div>
        </div>

        <!-- 파일 큐 -->
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

        <!-- 업로드 실행 -->
        <button v-if="(uploadFiles.length || dirPending.length) && !uploading"
          class="btn-primary btn-full" @click="dirHandle ? doDirUpload() : doFileUpload()">
          {{ dirHandle ? dirPending.length : uploadFiles.length }}장 업로드
        </button>
      </div>
    </div>
    <div v-if="uploadPanel" class="overlay" @click="closeUpload" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'backend' })
useHead({ title: '카테고리 관리 — 백엔드' })

const BATCH_SIZE = 20
const IMAGE_RE   = /\.(jpe?g|png|gif|webp|tiff?|bmp)$/i

const { data, refresh } = await useFetch<any[]>('/api/admin/images')
const list = computed(() => data.value ?? [])

const selectedCategory = ref<string | null>(null)
const checkedIds       = ref<number[]>([])
const editing          = ref<any>(null)

// ── 업로드 패널 상태 ──────────────────────────────────────────────────────────
const uploadPanel   = ref(false)
const upCategory    = ref('')
const upTags        = ref('')
const upDate        = ref('')
const fileInput     = ref<HTMLInputElement | null>(null)
const dirInput      = ref<HTMLInputElement | null>(null)
const uploadFiles   = ref<{ file: File; preview: string }[]>([])
const dirHandle     = ref<any>(null)
const dirFallback   = ref(false)
const dirName       = ref('')
const dirPending    = ref<any[]>([])
const dirDoneCount  = ref(0)
const uploading     = ref(false)
const uploadDone    = ref(0)
const uploadTotal   = ref(0)
const uploadResults = ref<any[]>([])

// ── 카테고리 목록 ─────────────────────────────────────────────────────────────
const categories = computed(() => {
  const map = new Map<string, number>()
  for (const img of list.value)
    for (const c of (img.category ?? [])) map.set(c, (map.get(c) ?? 0) + 1)
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const totalImages = computed(() => list.value.length)

const filteredImages = computed(() =>
  selectedCategory.value
    ? list.value.filter(img => (img.category ?? []).includes(selectedCategory.value))
    : []
)

function selectCategory(name: string) {
  selectedCategory.value = selectedCategory.value === name ? null : name
  checkedIds.value = []
}

// ── 편집 ─────────────────────────────────────────────────────────────────────
function openEdit(img: any) {
  editing.value = {
    ...img,
    categoryInput: (img.category ?? []).join(', '),
    tagsInput:     (img.tags     ?? []).join(', '),
  }
}

async function save() {
  const { image_id } = editing.value
  await $fetch(`/api/admin/images/${image_id}`, {
    method: 'PUT',
    body: {
      athlete_id:   editing.value.athlete_id,
      meet_id:      editing.value.meet_id,
      date:         editing.value.date,
      consent_date: editing.value.consent_date || null,
      urls:         editing.value.urls,
      tags:     (editing.value.tagsInput     ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
      category: (editing.value.categoryInput ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
    },
  })
  editing.value = null
  await refresh()
}

// ── 업로드 패널 ───────────────────────────────────────────────────────────────
function openUpload() {
  upCategory.value    = selectedCategory.value ?? ''
  upTags.value        = ''
  upDate.value        = ''
  uploadFiles.value   = []
  uploadResults.value = []
  dirHandle.value     = null
  dirFallback.value   = false
  dirName.value       = ''
  dirPending.value    = []
  dirDoneCount.value  = 0
  uploading.value     = false
  uploadDone.value    = 0
  uploadTotal.value   = 0
  uploadPanel.value   = true
}

function closeUpload() {
  uploadPanel.value = false
}

function addFiles(files: FileList | null) {
  if (!files) return
  dirHandle.value = null
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
  if (!uploadFiles.value.length) return
  uploading.value   = true
  uploadDone.value  = 0
  uploadTotal.value = uploadFiles.value.length
  uploadResults.value = []

  const fd = new FormData()
  fd.append('category_prefix', upCategory.value.trim())
  fd.append('category',        upCategory.value.trim())
  fd.append('tags',            upTags.value)
  fd.append('date',            upDate.value)
  for (const { file } of uploadFiles.value) fd.append('files', file)

  try {
    const res = await $fetch<any>('/api/admin/upload-images', { method: 'POST', body: fd })
    uploadResults.value = res.results
    uploadFiles.value   = []
    uploadDone.value    = uploadTotal.value
    await refresh()
  } finally {
    uploading.value = false
  }
}

async function selectDirectory() {
  if (typeof (window as any).showDirectoryPicker === 'function') {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
      dirHandle.value     = handle
      dirFallback.value   = false
      dirName.value       = handle.name
      dirPending.value    = []
      dirDoneCount.value  = 0
      uploadFiles.value   = []
      uploadResults.value = []
      try {
        const uploadedDir = await handle.getDirectoryHandle('uploaded')
        for await (const [, h] of (uploadedDir as any).entries())
          if (h.kind === 'file') dirDoneCount.value++
      } catch {}
      for await (const [name, h] of (handle as any).entries())
        if (h.kind === 'file' && IMAGE_RE.test(name)) dirPending.value.push(h)
    } catch (e: any) {
      if (e.name !== 'AbortError') alert('폴더 접근 실패: ' + e.message)
    }
  } else {
    dirInput.value?.click()
  }
}

function onDirInputChange(e: Event) {
  const all = Array.from((e.target as HTMLInputElement).files ?? []).filter(f => IMAGE_RE.test(f.name))
  if (!all.length) return
  const pending = all.filter(f => !(f as any).webkitRelativePath.includes('/uploaded/'))
  const done    = all.filter(f =>  (f as any).webkitRelativePath.includes('/uploaded/'))
  dirHandle.value    = true
  dirFallback.value  = true
  dirDoneCount.value = done.length
  uploadFiles.value  = []
  uploadResults.value = []
  const rel = (all[0] as any).webkitRelativePath as string
  dirName.value    = rel ? rel.split('/')[0] : '선택된 폴더'
  dirPending.value = pending
  if (dirInput.value) dirInput.value.value = ''
}

function clearDir() {
  dirHandle.value = null
  dirName.value   = ''
  dirPending.value   = []
  dirDoneCount.value = 0
}

async function doDirUpload() {
  if (!dirPending.value.length || !dirHandle.value) return
  uploading.value   = true
  uploadDone.value  = 0
  uploadTotal.value = dirPending.value.length
  uploadResults.value = []

  const pending = [...dirPending.value]
  let uploadedDir: any = null
  if (!dirFallback.value) {
    uploadedDir = await (dirHandle.value as any).getDirectoryHandle('uploaded', { create: true })
  }

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE)
    const batchItems: { file: File; handle: any }[] = []
    for (const h of batch) {
      const file = dirFallback.value ? (h as File) : await h.getFile()
      batchItems.push({ file, handle: dirFallback.value ? null : h })
    }

    const fd = new FormData()
    fd.append('category_prefix', upCategory.value.trim())
    fd.append('category',        upCategory.value.trim())
    fd.append('tags',            upTags.value)
    fd.append('date',            upDate.value)
    for (const { file } of batchItems) fd.append('files', file)

    try {
      const res = await $fetch<any>('/api/admin/upload-images', { method: 'POST', body: fd })
      uploadResults.value.push(...res.results)

      if (!dirFallback.value && uploadedDir) {
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
      }
    } catch (e) {
      console.error(`Batch ${i}–${i + BATCH_SIZE} 실패`, e)
    }

    uploadDone.value = Math.min(i + BATCH_SIZE, pending.length)
  }

  dirPending.value = []
  uploading.value  = false
  await refresh()
}
</script>

<style scoped>
.admin-shell { min-height: 100vh; background: #0d1117; color: #e6edf3; font-family: var(--font-sans, sans-serif); padding: 32px; }
.admin-head { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.admin-head h1 { font-size: 20px; font-weight: 600; }
.head-meta { font-size: 12px; color: #8b949e; }
.head-actions { margin-left: auto; }

/* ── 카테고리 목록 ── */
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
.tag-chip { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: #161b22; border: 1px solid #30363d; border-radius: 20px; color: #8b949e; font-size: 13px; cursor: pointer; transition: color 0.15s, border-color 0.15s, background 0.15s; }
.tag-chip:hover { color: #e6edf3; border-color: #8b949e; }
.tag-chip.active { color: #a371f7; border-color: #a371f7; background: #2a1a3a; }
.tag-count { font-size: 11px; color: #484f58; font-variant-numeric: tabular-nums; }
.tag-chip.active .tag-count { color: #a371f7; opacity: 0.7; }
.empty-inline { font-size: 12px; color: #484f58; padding: 6px 0; }

/* ── 섹션 헤더 ── */
.section-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.section-title { font-size: 16px; font-weight: 600; }
.section-count { font-size: 12px; color: #8b949e; }

/* ── 이미지 그리드 ── */
.img-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
@media (max-width: 1400px) { .img-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 900px)  { .img-grid { grid-template-columns: repeat(3, 1fr); } }
.grid-tile { position: relative; background: #161b22; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; cursor: pointer; padding: 0; display: flex; flex-direction: column; transition: border-color 0.15s; text-align: left; }
.grid-tile:hover { border-color: #8b949e; }
.grid-tile.selected { border-color: #a371f7; background: #2a1a3a; }
.grid-chk { position: absolute; top: 6px; left: 6px; z-index: 2; }
.grid-chk input { width: 14px; height: 14px; cursor: pointer; accent-color: #a371f7; }
.grid-img { width: 100%; aspect-ratio: 3/2; object-fit: cover; display: block; background: #21262d; }
.grid-img.no-img { display: flex; align-items: center; justify-content: center; color: #8b949e; font-size: 12px; }
.grid-meta { display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; gap: 6px; }
.grid-id { font-size: 11px; color: #8b949e; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.grid-info { font-size: 11px; color: #e6edf3; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── 빈 상태 ── */
.empty-state { color: #484f58; font-size: 13px; padding: 48px 0; text-align: center; }

/* ── 패널 공통 ── */
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
.field-row label { width: 60px; flex-shrink: 0; font-size: 12px; color: #8b949e; }
.field-row input { flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; padding: 6px 10px; font-size: 13px; font-family: inherit; }
.field-row input:focus { outline: none; border-color: #a371f7; }
.field-row input:disabled { opacity: 0.5; cursor: not-allowed; }
.edit-footer { padding: 16px 20px; border-top: 1px solid #30363d; display: flex; justify-content: space-between; gap: 10px; }

/* ── 업로드 영역 ── */
.section-label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 6px; border-top: 1px solid #30363d; }
.upload-area { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px dashed #30363d; border-radius: 6px; flex-wrap: wrap; }
.btn-upload { padding: 5px 12px; background: #21262d; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; font-size: 12px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
.btn-upload:hover { background: #30363d; }
.btn-upload-dir { border-color: #a371f7; color: #a371f7; }
.btn-upload-dir:hover { background: rgba(163,113,247,0.1); }
.upload-hint { font-size: 11px; color: #8b949e; margin-left: 4px; }
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
.upload-queue { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
.upload-item { display: flex; align-items: center; gap: 8px; padding: 4px; background: #21262d; border-radius: 4px; }
.upload-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
.upload-name { flex: 1; font-size: 11px; color: #8b949e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.remove-btn { background: none; border: none; color: #8b949e; cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 4px; }
.remove-btn:hover { color: #f85149; }
.upload-progress { display: flex; flex-direction: column; gap: 6px; }
.progress-bar { width: 100%; height: 4px; background: #21262d; border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: #a371f7; border-radius: 2px; transition: width 0.3s ease; }
.progress-text { font-size: 11px; color: #8b949e; text-align: center; font-variant-numeric: tabular-nums; }
.upload-results { display: flex; flex-wrap: wrap; gap: 6px; }
.result-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; color: #8b949e; }
.result-item .upload-thumb { width: 48px; height: 48px; }
.result-more { font-size: 11px; color: #8b949e; align-self: center; padding: 4px 8px; background: #21262d; border-radius: 4px; }

/* ── 버튼 ── */
.btn-primary { padding: 8px 20px; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; }
.btn-primary:hover { background: #2ea043; }
.btn-danger { padding: 8px 20px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 13px; cursor: pointer; }
.btn-danger:hover { background: #3a1a1a; }
.btn-secondary { padding: 8px 20px; background: transparent; border: 1px solid #a371f7; border-radius: 6px; color: #a371f7; font-size: 13px; cursor: pointer; }
.btn-secondary:hover { background: rgba(163,113,247,0.1); }
.btn-full { width: 100%; display: block; text-align: center; }
</style>
