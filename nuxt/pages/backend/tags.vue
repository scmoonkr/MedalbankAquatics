<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>태그 관리</h1>
      <span class="head-meta">{{ tags.length }}개 태그 · {{ totalImages }}장</span>
    </header>

    <!-- 태그 목록 -->
    <div class="tag-list">
      <button v-for="t in tags" :key="t.name" type="button"
        class="tag-chip" :class="{ active: selectedTag === t.name }"
        @click="selectTag(t.name)">
        <span class="tag-name">{{ t.name }}</span>
        <span class="tag-count">{{ t.count }}</span>
      </button>
    </div>

    <!-- 선택된 태그 이미지 -->
    <template v-if="selectedTag">
      <div class="section-head">
        <label class="all-check">
          <input type="checkbox" v-model="allChecked" />
        </label>
        <span class="section-title">{{ selectedTag }}</span>
        <span class="section-count">{{ filteredImages.length }}장</span>
        <button v-if="checkedIds.length" class="btn-exclude" @click="exclude">
          제외하기 ({{ checkedIds.length }})
        </button>
      </div>

      <div class="img-grid">
        <button v-for="img in filteredImages" :key="img.image_id"
          type="button" class="grid-tile" :class="{ selected: checkedIds.includes(img.image_id) }"
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

    <div v-else class="empty-state">태그를 선택하면 이미지를 볼 수 있습니다.</div>

    <!-- 편집 패널 (images.vue와 동일) -->
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'backend' })
useHead({ title: '태그 관리 — 백엔드' })

const { data, refresh } = useFetch<any[]>('/api/admin/images')
const list = computed(() => data.value ?? [])

const selectedTag = ref<string | null>(null)
const editing     = ref<any>(null)
const checkedIds  = ref<number[]>([])

const allChecked = computed({
  get: () => filteredImages.value.length > 0 && filteredImages.value.every(i => checkedIds.value.includes(i.image_id)),
  set: (val: boolean) => {
    const ids = filteredImages.value.map(i => i.image_id)
    if (val) checkedIds.value = [...new Set([...checkedIds.value, ...ids])]
    else     checkedIds.value = checkedIds.value.filter(id => !ids.includes(id))
  },
})

const tags = computed(() => {
  const map = new Map<string, number>()
  for (const img of list.value) {
    for (const t of (img.tags ?? [])) {
      map.set(t, (map.get(t) ?? 0) + 1)
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const totalImages = computed(() => list.value.length)

const filteredImages = computed(() =>
  selectedTag.value
    ? list.value.filter(img => (img.tags ?? []).includes(selectedTag.value))
    : []
)

function selectTag(name: string) {
  selectedTag.value = selectedTag.value === name ? null : name
  checkedIds.value = []
}

async function exclude() {
  if (!selectedTag.value || !checkedIds.value.length) return
  if (!confirm(`${checkedIds.value.length}장에서 "${selectedTag.value}" 태그를 제외하시겠습니까?`)) return
  await $fetch('/api/admin/images/bulk-tags', {
    method: 'POST',
    body: { image_ids: checkedIds.value, tags: selectedTag.value, action: 'remove' },
  })
  checkedIds.value = []
  await refresh()
}

function openEdit(img: any) {
  editing.value = { ...img, tagsInput: (img.tags ?? []).join(', ') }
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
      tags: (editing.value.tagsInput ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
    },
  })
  editing.value = null
  await refresh()
}
</script>

<style scoped>
.admin-shell { min-height: 100vh; background: #0d1117; color: #e6edf3; font-family: var(--font-sans, sans-serif); padding: 32px; }
.admin-head { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.admin-head h1 { font-size: 20px; font-weight: 600; }
.head-meta { font-size: 12px; color: #8b949e; }

/* ── 태그 목록 ── */
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
.tag-chip { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: #161b22; border: 1px solid #30363d; border-radius: 20px; color: #8b949e; font-size: 13px; cursor: pointer; transition: color 0.15s, border-color 0.15s, background 0.15s; }
.tag-chip:hover { color: #e6edf3; border-color: #8b949e; }
.tag-chip.active { color: #388bfd; border-color: #388bfd; background: #1c2a3a; }
.tag-count { font-size: 11px; color: #484f58; font-variant-numeric: tabular-nums; }
.tag-chip.active .tag-count { color: #388bfd; opacity: 0.7; }

/* ── 섹션 헤더 ── */
.section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; }
.section-count { font-size: 12px; color: #8b949e; }
.all-check { display: flex; align-items: center; cursor: pointer; }
.all-check input { width: 15px; height: 15px; cursor: pointer; accent-color: #388bfd; }
.btn-exclude { margin-left: auto; padding: 6px 16px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-exclude:hover { background: #3a1a1a; }

/* ── 이미지 그리드 ── */
.img-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
@media (max-width: 1400px) { .img-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 900px)  { .img-grid { grid-template-columns: repeat(3, 1fr); } }
.grid-tile { position: relative; background: #161b22; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; cursor: pointer; padding: 0; display: flex; flex-direction: column; transition: border-color 0.15s; text-align: left; }
.grid-tile:hover { border-color: #8b949e; }
.grid-tile.selected { border-color: #388bfd; background: #1c2a3a; }
.grid-chk { position: absolute; top: 6px; left: 6px; z-index: 2; }
.grid-chk input { width: 14px; height: 14px; cursor: pointer; accent-color: #388bfd; }
.grid-img { width: 100%; aspect-ratio: 3/2; object-fit: cover; display: block; background: #21262d; }
.grid-img.no-img { display: flex; align-items: center; justify-content: center; color: #8b949e; font-size: 12px; }
.grid-meta { display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; gap: 6px; }
.grid-id { font-size: 11px; color: #8b949e; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.grid-info { font-size: 11px; color: #e6edf3; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── 빈 상태 ── */
.empty-state { color: #484f58; font-size: 13px; padding: 48px 0; text-align: center; }

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
.field-row label { width: 60px; flex-shrink: 0; font-size: 12px; color: #8b949e; }
.field-row input { flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #e6edf3; padding: 6px 10px; font-size: 13px; font-family: inherit; }
.field-row input:focus { outline: none; border-color: #388bfd; }
.field-row input:disabled { opacity: 0.5; cursor: not-allowed; }
.edit-footer { padding: 16px 20px; border-top: 1px solid #30363d; display: flex; justify-content: space-between; gap: 10px; }
.btn-primary { padding: 8px 20px; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; }
.btn-primary:hover { background: #2ea043; }
.btn-danger { padding: 8px 20px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 13px; cursor: pointer; }
.btn-danger:hover { background: #3a1a1a; }
</style>
