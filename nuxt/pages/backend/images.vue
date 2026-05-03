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

    <!-- 필터 바 -->
    <div class="filter-bar">
      <!-- 동의 필터 -->
      <div class="btn-group">
        <button :class="{ active: consentFilter === 'all' }"     @click="consentFilter = 'all'">전체</button>
        <button :class="{ active: consentFilter === 'yes' }"     @click="consentFilter = 'yes'">동의</button>
        <button :class="{ active: consentFilter === 'no' }"      @click="consentFilter = 'no'">비동의</button>
      </div>

      <!-- 대회 필터 -->
      <MeetGroupSelect v-model="meetFilter" :groups="meetGrouped" as-number class="filter-select" />

      <!-- 월별 필터 -->
      <select v-model="monthFilter" class="filter-select">
        <option value="">전체 월</option>
        <option v-for="mo in monthOptions" :key="mo" :value="mo">{{ mo }}</option>
      </select>

      <span class="filter-count">{{ filteredList.length }}장</span>

      <!-- 뷰 토글 -->
      <div class="view-toggle">
        <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="리스트">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
            <line x1="2" y1="4" x2="14" y2="4"/>
            <line x1="2" y1="8" x2="14" y2="8"/>
            <line x1="2" y1="12" x2="14" y2="12"/>
          </svg>
        </button>
        <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="그리드">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="2" y="2" width="5" height="5" rx="1"/>
            <rect x="9" y="2" width="5" height="5" rx="1"/>
            <rect x="2" y="9" width="5" height="5" rx="1"/>
            <rect x="9" y="9" width="5" height="5" rx="1"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 리스트 뷰 -->
    <div v-if="viewMode === 'list'" class="table-wrap">
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
          <tr v-for="img in filteredList" :key="img.image_id"
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

    <!-- 그리드 뷰 -->
    <div v-else class="img-grid">
      <button v-for="img in filteredList" :key="img.image_id"
        class="grid-tile" :class="{ selected: checkedIds.includes(img.image_id), editing: editing?.image_id === img.image_id }"
        @click.stop="openEdit(img)">
        <div class="grid-chk" @click.stop>
          <input type="checkbox" :value="img.image_id" v-model="checkedIds" @click.stop />
        </div>
        <img v-if="img.urls?.thumb" :src="img.urls.thumb" class="grid-img" />
        <div v-else class="grid-img no-img">—</div>
        <div class="grid-meta">
          <span class="grid-id">#{{ img.image_id }}</span>
          <span v-if="img.consent_date" class="grid-info">{{ img.athlete_name }} · {{ img.meet_label }}</span>
          <span class="badge" :class="img.consent_date ? 'approved' : 'review'">
            {{ img.consent_date ? '동의' : '미동의' }}
          </span>
        </div>
      </button>
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

const checkedIds      = ref<number[]>([])
const editing         = ref<any>(null)
const editConsentDate = ref('')
const viewMode        = ref<'list' | 'grid'>('list')
const consentFilter   = ref<'all' | 'yes' | 'no'>('all')
const meetFilter      = ref<number | ''>('')
const monthFilter     = ref('')

// ── Filter options (derived from loaded data) ─────────────────────────────────
const meetOptions = computed(() => {
  const seen = new Map<number, { meet_label: string; meet_short: string }>()
  for (const img of list.value) {
    if (img.meet_id && !seen.has(img.meet_id))
      seen.set(img.meet_id, { meet_label: img.meet_label ?? '', meet_short: img.meet_short ?? '' })
  }
  return [...seen.entries()]
    .map(([meet_id, { meet_label, meet_short }]) => ({ meet_id, meet_label, meet_short }))
    .sort((a, b) => b.meet_id - a.meet_id)
})

const meetGrouped = computed(() => {
  const groups = new Map<string, { value: number; label: string }[]>()
  for (const m of meetOptions.value) {
    const year = m.meet_short?.slice(0, 4) || '기타'
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push({ value: m.meet_id, label: m.meet_label })
  }
  return [...groups.entries()]
    .map(([year, options]) => ({ year, options }))
    .sort((a, b) => b.year.localeCompare(a.year))
})

const monthOptions = computed(() => {
  const months = new Set<string>()
  for (const img of list.value) {
    if (img.date) {
      const m = String(img.date).slice(0, 7)
      if (m) months.add(m)
    }
  }
  return [...months].sort().reverse()
})

// ── Filtered list ─────────────────────────────────────────────────────────────
const filteredList = computed(() => {
  let items = list.value
  if (consentFilter.value === 'yes') items = items.filter(i => !!i.consent_date)
  if (consentFilter.value === 'no')  items = items.filter(i => !i.consent_date)
  if (meetFilter.value !== '')       items = items.filter(i => i.meet_id === meetFilter.value)
  if (monthFilter.value)             items = items.filter(i => String(i.date ?? '').startsWith(monthFilter.value))
  return items
})

const allChecked = computed(() =>
  filteredList.value.length > 0 &&
  filteredList.value.every(i => checkedIds.value.includes(i.image_id)))

function toggleAll(e: Event) {
  const ids = filteredList.value.map(i => i.image_id)
  if ((e.target as HTMLInputElement).checked) {
    checkedIds.value = [...new Set([...checkedIds.value, ...ids])]
  } else {
    checkedIds.value = checkedIds.value.filter(id => !ids.includes(id))
  }
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
.admin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.admin-head h1 { font-size: 20px; font-weight: 600; }
.head-actions { display: flex; align-items: center; gap: 10px; }

/* ── 필터 바 ── */
.filter-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.btn-group { display: flex; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; }
.btn-group button { padding: 6px 14px; background: none; border: 0; color: #8b949e; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s; white-space: nowrap; }
.btn-group button:not(:last-child) { border-right: 1px solid #30363d; }
.btn-group button:hover { background: #21262d; color: #e6edf3; }
.btn-group button.active { background: #21262d; color: #e6edf3; }
.filter-select { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; padding: 6px 10px; font-size: 12px; cursor: pointer; }
.filter-select:focus { outline: none; border-color: #388bfd; }
.filter-count { margin-left: 4px; font-size: 12px; color: #8b949e; font-variant-numeric: tabular-nums; white-space: nowrap; }
.view-toggle { margin-left: auto; display: flex; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; }
.view-toggle button { padding: 6px 10px; background: none; border: 0; color: #8b949e; cursor: pointer; display: flex; align-items: center; transition: background 0.15s, color 0.15s; }
.view-toggle button:not(:last-child) { border-right: 1px solid #30363d; }
.view-toggle button:hover { background: #21262d; color: #e6edf3; }
.view-toggle button.active { background: #21262d; color: #e6edf3; }
.view-toggle svg { width: 16px; height: 16px; }

/* ── 리스트 뷰 ── */
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

/* ── 그리드 뷰 ── */
.img-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
@media (max-width: 1400px) { .img-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 900px) { .img-grid { grid-template-columns: repeat(3, 1fr); } }
.grid-tile { position: relative; background: #161b22; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; cursor: pointer; padding: 0; display: flex; flex-direction: column; transition: border-color 0.15s; text-align: left; }
.grid-tile:hover { border-color: #8b949e; }
.grid-tile.selected { border-color: #388bfd; background: #1c2a3a; }
.grid-tile.editing { border-color: #388bfd; outline: 1px solid #388bfd; }
.grid-chk { position: absolute; top: 6px; left: 6px; z-index: 2; }
.grid-chk input { width: 14px; height: 14px; cursor: pointer; accent-color: #388bfd; }
.grid-img { width: 100%; aspect-ratio: 3/2; object-fit: cover; display: block; background: #21262d; }
.grid-img.no-img { display: flex; align-items: center; justify-content: center; color: #8b949e; font-size: 12px; }
.grid-meta { display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; gap: 6px; }
.grid-id { font-size: 11px; color: #8b949e; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.grid-info { font-size: 11px; color: #e6edf3; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── badges ── */
.badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge.approved { background: #1a3a2a; color: #3fb950; }
.badge.review   { background: #2d333b; color: #8b949e; }

/* ── 편집 패널 ── */
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
