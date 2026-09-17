<template>
  <div class="ib-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Images BB</div>
        <div class="be-page-sub">
          imagesAiden · ImgBB 업로더
          <template v-if="competition.competitionName"> · {{ competition.competitionName }}</template>
        </div>
      </div>
      <div class="ib-tabs">
        <button :class="{ active: tab === 'upload'  }" @click="tab = 'upload'">업로드</button>
        <button :class="{ active: tab === 'gallery' }" @click="switchToGallery">갤러리</button>
      </div>
    </div>

    <!-- 대회 선택 + 영법 -->
    <div class="be-filters">
      <div class="ib-search">
        <input
          v-model="competitionQuery"
          class="be-search"
          placeholder="대회명 검색… (2자 이상)"
          @input="searchCompetitions"
        />
        <div v-if="competitionResults.length" class="ib-suggest">
          <button
            v-for="c in competitionResults" :key="c.competitionID"
            class="ib-suggest-item"
            @click="pickCompetition(c)"
          >
            {{ c.competitionName }}<span class="ib-suggest-year">({{ (c.datetime || '').slice(0, 4) }})</span>
          </button>
        </div>
      </div>

      <select v-model="style" class="be-sel" @change="onStyleChange">
        <option v-for="s in STYLES" :key="s.label" :value="s.value">{{ s.label }}</option>
      </select>

      <div class="be-filter-actions">
        <span v-if="competition.competitionID" class="ib-cid">cid {{ competition.competitionID }}</span>
        <button class="be-reset" @click="resetCompetition">Reset</button>
      </div>
    </div>

    <!-- ── 업로드 ───────────────────────────────────────────── -->
    <template v-if="tab === 'upload'">
      <div
        class="ib-drop"
        :class="{ over: isDragOver }"
        @click="fileRef?.click()"
        @dragenter.prevent
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="onDrop"
      >
        <svg viewBox="0 0 24 24" class="ib-drop-icon">
          <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9" />
          <path d="M15 13l-3-3-3 3" /><path d="M12 10v12" />
        </svg>
        <div class="ib-drop-title">클릭하거나 파일을 드래그하여 업로드</div>
        <div class="ib-drop-sub">PNG · JPG · GIF · WEBP (파일당 최대 {{ MAX_FILE_MB }}MB)</div>
        <input ref="fileRef" type="file" multiple accept="image/*" style="display:none" @change="onFileSelect" />
      </div>

      <div v-if="files.length" class="ib-upload-bar">
        <div class="ib-upload-info">
          {{ files.length }}개 · {{ formatSize(totalSize) }}
          <template v-if="uploading"> · {{ uploadedCount + failedCount }}/{{ files.length }} 처리됨</template>
          <template v-else-if="uploadedCount || failedCount">
            · 성공 {{ uploadedCount }} · 실패 {{ failedCount }}
          </template>
        </div>
        <div class="ib-upload-actions">
          <button class="be-reset" :disabled="uploading" @click="clearAllFiles">모두 지우기</button>
          <button class="be-add"   :disabled="!canUpload" @click="uploadAllImages">
            {{ uploading ? '업로드 중…' : `모든 이미지 업로드 (${files.length}개)` }}
          </button>
        </div>
      </div>

      <div v-if="uploading" class="ib-progress"><div class="ib-progress-fill" :style="{ width: uploadProgress + '%' }"></div></div>

      <div v-if="files.length" class="ib-grid">
        <div v-for="(f, i) in files" :key="f.key" class="ib-card" :class="f.status">
          <img :src="f.preview" :alt="f.file.name" class="ib-card-img" />
          <div class="ib-card-meta">
            <div class="ib-card-name" :title="f.file.name">{{ f.file.name }}</div>
            <div class="ib-card-size">{{ formatSize(f.file.size) }}</div>
          </div>
          <div v-if="f.status" class="ib-card-badge" :class="f.status">
            {{ f.status === 'success' ? '완료' : '실패' }}
          </div>
          <button v-if="!uploading" class="ib-card-rm" @click.stop="removeFile(i)">✕</button>
        </div>
      </div>
      <div v-else class="be-empty">업로드할 이미지를 선택하세요.</div>
    </template>

    <!-- ── 갤러리 ───────────────────────────────────────────── -->
    <template v-else>
      <div v-if="galleryFiles.length" class="ib-gallery">
        <div v-for="(file, index) in galleryFiles" :key="file.imageID" class="ib-gallery-cell">
          <img
            :src="file.medium || file.url"
            :alt="file.name"
            :class="{ portrait: isPortrait(file) }"
            loading="lazy"
            @click="openLightbox(index)"
          />
        </div>
      </div>
      <div v-else class="be-empty">{{ galleryLoading ? '불러오는 중…' : '대회를 선택하면 등록된 이미지를 보여줍니다.' }}</div>
    </template>

    <!-- Lightbox -->
    <div v-if="lightbox.open" class="ib-lb" @click="closeLightbox">
      <a
        v-if="lightboxOriginal"
        :href="lightboxOriginal" target="_blank" download
        class="ib-lb-save" @click.stop
      >원본 저장하기</a>

      <div class="ib-lb-stage" @click.stop>
        <img :src="lightboxMedium" :alt="`Image ${lightbox.index + 1}`" />
        <button class="ib-lb-close" @click="closeLightbox">✕</button>
        <button v-if="lightbox.index > 0" class="ib-lb-prev" @click="prevImage">‹</button>
        <button v-if="lightbox.index < galleryFiles.length - 1" class="ib-lb-next" @click="nextImage">›</button>
        <div class="ib-lb-count">{{ lightbox.index + 1 }} / {{ galleryFiles.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Images BB — 메달뱅크 Backend' })

const imgbbKey = useRuntimeConfig().public.imgbbKey as string

const MAX_FILE_MB   = 32
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

// 원본 imagesBB/index.vue 의 style 필터와 동일. 하이라이트·기타는 한글 그대로 저장한다.
const STYLES = [
  { value: '',                 label: '영법 전체' },
  { value: 'freestyle',        label: '자유형'     },
  { value: 'backstroke',       label: '배영'       },
  { value: 'breaststroke',     label: '평영'       },
  { value: 'butterfly',        label: '접영'       },
  { value: '하이라이트',        label: '하이라이트' },
  { value: '기타',              label: '기타'       },
]

interface CompetitionName {
  id:              string
  competitionID:   number
  competitionName: string
  datetime?:       string
}
interface GalleryFile {
  imageID: number
  name:    string
  style:   string
  url:     string
  medium:  string
  thumb:   string
  width:   number
  height:  number
}
interface PendingFile {
  key:     string
  file:    File
  preview: string
  status:  '' | 'success' | 'error'
}

const tab   = ref<'upload' | 'gallery'>('upload')
const style = ref('breaststroke')

// ── 대회 검색 ─────────────────────────────────────────────────────
const competition        = reactive<Partial<CompetitionName>>({})
const competitionQuery   = ref('')
const competitionResults = ref<CompetitionName[]>([])

async function searchCompetitions() {
  if (competitionQuery.value.length < 2) { competitionResults.value = []; return }
  competitionResults.value = await $fetch<CompetitionName[]>('/api/backend/competitions', {
    params: { name: competitionQuery.value },
  })
}
function pickCompetition(c: CompetitionName) {
  Object.assign(competition, c)
  competitionQuery.value   = c.competitionName
  competitionResults.value = []
  if (tab.value === 'gallery') loadGallery()
}
function resetCompetition() {
  for (const k of Object.keys(competition)) delete (competition as any)[k]
  competitionQuery.value   = ''
  competitionResults.value = []
  galleryFiles.value       = []
}
function onStyleChange() {
  if (tab.value === 'gallery') loadGallery()
}
function switchToGallery() {
  tab.value = 'gallery'
  if (competition.competitionID && !galleryFiles.value.length) loadGallery()
}

// ── 파일 선택 ─────────────────────────────────────────────────────
const fileRef    = ref<HTMLInputElement | null>(null)
const files      = ref<PendingFile[]>([])
const isDragOver = ref(false)
const uploading  = ref(false)

const totalSize     = computed(() => files.value.reduce((n, f) => n + f.file.size, 0))
const uploadedCount = computed(() => files.value.filter(f => f.status === 'success').length)
const failedCount   = computed(() => files.value.filter(f => f.status === 'error').length)
const canUpload     = computed(() => !uploading.value && files.value.length > 0)
const uploadProgress = computed(() =>
  files.value.length ? ((uploadedCount.value + failedCount.value) / files.value.length) * 100 : 0
)

function fileKey(f: File) { return `${f.name}-${f.size}-${f.lastModified}` }

function addFiles(incoming: File[]) {
  const errors: string[] = []
  for (const file of incoming) {
    if (!ALLOWED_TYPES.includes(file.type)) { errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`); continue }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { errors.push(`${file.name}: 파일 크기가 ${MAX_FILE_MB}MB를 초과합니다.`); continue }
    const key = fileKey(file)
    if (files.value.some(f => f.key === key)) { errors.push(`${file.name}: 이미 선택된 파일입니다.`); continue }
    files.value.push({ key, file, preview: URL.createObjectURL(file), status: '' })
  }
  if (errors.length) alert(errors.join('\n'))
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) addFiles(Array.from(target.files))
  target.value = ''
}
function onDrop(event: DragEvent) {
  isDragOver.value = false
  addFiles(Array.from(event.dataTransfer?.files || []))
}
function removeFile(i: number) {
  URL.revokeObjectURL(files.value[i].preview)
  files.value.splice(i, 1)
}
function clearAllFiles() {
  files.value.forEach(f => URL.revokeObjectURL(f.preview))
  files.value = []
}

function formatSize(bytes: number) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// ── 업로드 ────────────────────────────────────────────────────────
async function uploadToImgbb(name: string, file: File) {
  const form = new FormData()
  form.append('name', name)
  form.append('image', file)
  const res = await $fetch<any>(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: 'POST', body: form })
  if (!res?.data) throw new Error(res?.error?.message || '이미지 업로드에 실패했습니다.')
  return res.data
}

async function uploadAllImages() {
  if (!competition.competitionID) { alert('대회를 선택하세요'); return }
  if (!imgbbKey) { alert('IMGBB_KEY 가 설정되지 않았습니다.'); return }
  if (!files.value.length || uploading.value) return

  uploading.value = true
  files.value.forEach(f => { f.status = '' })
  try {
    for (const item of files.value) {
      const name = `aiden-${competition.competitionID}-${style.value || 'etc'}-${item.file.name}`
      try {
        const img = await uploadToImgbb(name, item.file)
        // 갤러리가 읽는 imagesAiden 컬렉션에 메타를 남긴다.
        await $fetch('/api/backend/images', { method: 'POST', body: {
          competitionID:   competition.competitionID,
          competitionName: competition.competitionName,
          style:           style.value,
          name:            item.file.name,
          imgbbID:         img.id,
          hash:            (img.delete_url || '').split('/').pop(),
          url:             img.url,
          medium:          img.medium?.url || img.display_url || img.url,
          thumb:           img.thumb?.url  || img.url,
          width:           img.width,
          height:          img.height,
          size:            img.size,
        } })
        item.status = 'success'
      } catch (e) {
        console.error('업로드 중 오류:', e)
        item.status = 'error'
      }
    }
  } finally {
    uploading.value = false
  }
}

// ── 갤러리 ────────────────────────────────────────────────────────
const galleryFiles   = ref<GalleryFile[]>([])
const galleryLoading = ref(false)

async function loadGallery() {
  if (!competition.competitionID) { galleryFiles.value = []; return }
  galleryLoading.value = true
  try {
    galleryFiles.value = await $fetch<GalleryFile[]>('/api/backend/images', {
      params: {
        competitionID: competition.competitionID,
        ...(style.value ? { style: style.value } : {}),
      },
    })
  } finally {
    galleryLoading.value = false
  }
}

function isPortrait(file: GalleryFile) { return file?.height > file?.width }

// ── Lightbox ──────────────────────────────────────────────────────
const lightbox = reactive({ open: false, index: 0 })

const lightboxMedium   = computed(() => galleryFiles.value[lightbox.index]?.medium || galleryFiles.value[lightbox.index]?.url || '')
const lightboxOriginal = computed(() => galleryFiles.value[lightbox.index]?.url || '')

function openLightbox(index: number) {
  lightbox.index = index
  lightbox.open  = true
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lightbox.open  = false
  lightbox.index = 0
  document.body.style.overflow = ''
}
function nextImage() { if (lightbox.index < galleryFiles.value.length - 1) lightbox.index++ }
function prevImage() { if (lightbox.index > 0) lightbox.index-- }

function onKeydown(event: KeyboardEvent) {
  if (!lightbox.open) return
  if (event.key === 'Escape')     closeLightbox()
  if (event.key === 'ArrowLeft')  prevImage()
  if (event.key === 'ArrowRight') nextImage()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  files.value.forEach(f => URL.revokeObjectURL(f.preview))
})
</script>

<style scoped>
.ib-root { font-family: var(--sans); }

.be-page-head  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.be-page-title { font-size: 20px; font-weight: 700; color: #0a0a0a; }
.be-page-sub   { font-size: 12px; color: #aaa; margin-top: 2px; }

.ib-tabs { display: flex; gap: 2px; }
.ib-tabs button {
  height: 30px; padding: 0 14px; font-size: 12px; cursor: pointer;
  border: 1px solid #ddd; background: #fff; color: #777; transition: background 0.12s, color 0.12s;
}
.ib-tabs button:first-child { border-radius: 3px 0 0 3px; }
.ib-tabs button:last-child  { border-radius: 0 3px 3px 0; border-left: 0; }
.ib-tabs button:hover  { background: #f0f0f0; }
.ib-tabs button.active { background: #0a1d3a; border-color: #0a1d3a; color: #fff; }

/* ── Filters ── */
.be-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 12px 0; border-bottom: 1px solid #e8e8e4; margin-bottom: 16px;
}
.ib-search { position: relative; }
.be-search { height: 34px; padding: 0 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px; width: 320px; outline: none; }
.be-sel    { height: 34px; padding: 0 8px;  border: 1px solid #ddd; border-radius: 3px; font-size: 12.5px; background: #fff; outline: none; }
.be-search:focus, .be-sel:focus { border-color: #0a1d3a; }

.ib-suggest {
  position: absolute; top: 38px; left: 0; z-index: 20;
  width: 420px; max-height: 300px; overflow-y: auto;
  background: #fff; border: 1px solid #ddd; border-radius: 3px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}
.ib-suggest-item {
  display: block; width: 100%; text-align: left;
  padding: 8px 12px; font-size: 12.5px; color: #222;
  border: 0; border-bottom: 1px solid #f0f0ee; background: #fff; cursor: pointer;
}
.ib-suggest-item:last-child { border-bottom: 0; }
.ib-suggest-item:hover      { background: #f5f5f3; }
.ib-suggest-year { color: #aaa; font-family: var(--mono); font-size: 11px; margin-left: 6px; }

.be-filter-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.ib-cid { font-family: var(--mono); font-size: 11px; color: #1e40af; background: #dbeafe; padding: 4px 8px; border-radius: 3px; }
.be-reset, .be-add { height: 34px; padding: 0 14px; font-size: 12px; cursor: pointer; border-radius: 3px; transition: background 0.15s; }
.be-reset { border: 1px solid #ddd;     background: #fff;     color: #666; }
.be-reset:hover:not(:disabled) { background: #f0f0f0; }
.be-add   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.be-add:hover:not(:disabled) { background: #1a3560; }
.be-reset:disabled, .be-add:disabled { opacity: 0.45; cursor: not-allowed; }

.be-empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

/* ── Dropzone ── */
.ib-drop {
  border: 2px dashed #ddd; border-radius: 6px; padding: 36px 20px;
  text-align: center; cursor: pointer; transition: border-color 0.15s, background 0.15s;
  margin-bottom: 16px;
}
.ib-drop:hover   { border-color: #bbb; }
.ib-drop.over    { border-color: #3b82f6; background: #eff6ff; }
.ib-drop-icon    { width: 40px; height: 40px; stroke: #ccc; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.ib-drop-title   { font-size: 14px; color: #666; margin-top: 10px; }
.ib-drop-sub     { font-size: 11.5px; color: #aaa; margin-top: 4px; }

/* ── Upload bar ── */
.ib-upload-bar   { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.ib-upload-info  { font-size: 12px; color: #777; }
.ib-upload-actions { display: flex; gap: 8px; }
.ib-progress      { height: 3px; background: #eee; border-radius: 2px; overflow: hidden; margin-bottom: 14px; }
.ib-progress-fill { height: 100%; background: #3b82f6; transition: width 0.25s; }

/* ── Pending grid ── */
.ib-grid { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.ib-card { position: relative; border: 1px solid #eee; border-radius: 4px; overflow: hidden; background: #fff; }
.ib-card.success { border-color: #86efac; }
.ib-card.error   { border-color: #fca5a5; }
.ib-card-img  { width: 100%; height: 120px; object-fit: cover; display: block; background: #f5f5f3; }
.ib-card-meta { padding: 6px 8px; }
.ib-card-name { font-size: 11.5px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ib-card-size { font-family: var(--mono); font-size: 10.5px; color: #aaa; margin-top: 2px; }
.ib-card-badge {
  position: absolute; top: 6px; left: 6px;
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px;
}
.ib-card-badge.success { background: #dcfce7; color: #166534; }
.ib-card-badge.error   { background: #fee2e2; color: #991b1b; }
.ib-card-rm {
  position: absolute; top: 6px; right: 6px;
  width: 20px; height: 20px; border: 0; border-radius: 50%;
  background: rgba(0,0,0,0.5); color: #fff; font-size: 11px; cursor: pointer; line-height: 1;
}
.ib-card-rm:hover { background: rgba(0,0,0,0.75); }

/* ── Gallery ── */
.ib-gallery { display: grid; gap: 4px; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
.ib-gallery-cell { background: #0d0d0d; overflow: hidden; }
.ib-gallery-cell img {
  width: 100%; height: 140px; object-fit: cover; display: block;
  cursor: pointer; transition: opacity 0.2s;
}
.ib-gallery-cell img.portrait { object-fit: contain; }
.ib-gallery-cell img:hover    { opacity: 0.85; }

/* ── Lightbox ── */
.ib-lb {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.9);
  display: flex; align-items: center; justify-content: center;
}
.ib-lb-stage { position: relative; max-width: 100%; max-height: 100%; }
.ib-lb-stage img { max-width: 100vw; max-height: 100vh; object-fit: contain; display: block; }
.ib-lb-close, .ib-lb-prev, .ib-lb-next {
  position: absolute; border: 0; background: transparent;
  color: #fff; cursor: pointer; transition: color 0.15s;
}
.ib-lb-close { top: 16px; right: 16px; font-size: 22px; }
.ib-lb-prev  { left: 16px;  top: 50%; transform: translateY(-50%); font-size: 40px; }
.ib-lb-next  { right: 16px; top: 50%; transform: translateY(-50%); font-size: 40px; }
.ib-lb-close:hover, .ib-lb-prev:hover, .ib-lb-next:hover { color: #bbb; }
.ib-lb-count {
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  color: #fff; background: rgba(0,0,0,0.5); font-family: var(--mono);
  font-size: 12px; padding: 4px 12px; border-radius: 3px;
}
.ib-lb-save {
  position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 310;
  background: #fff; color: #0a0a0a; border-radius: 3px;
  padding: 8px 16px; font-size: 13px; font-weight: 600; text-decoration: none;
  box-shadow: 0 4px 14px rgba(0,0,0,0.3); opacity: 0.85; transition: opacity 0.2s;
}
.ib-lb-save:hover { opacity: 1; }
</style>
