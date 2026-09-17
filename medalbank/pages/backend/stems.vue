<template>
  <div class="st-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Stems</div>
        <div class="be-page-sub">stems collection · {{ rows.length }} entries</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <input v-model="f.stem" class="be-search" placeholder="Stem 검색… (2자 이상)" @input="onSearchInput" />
      <div class="be-filter-actions">
        <button class="be-reset" @click="resetFilters">Reset</button>
        <button class="be-add"   @click="openNew">+ 추가</button>
      </div>
    </div>

    <!-- Table + Drawer -->
    <div class="st-body">
      <div class="st-content">
        <table v-if="rows.length" class="be-table">
          <thead>
            <tr>
              <th>stemID</th>
              <th>stem</th>
              <th>competitions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in rows" :key="r.id"
              :class="{ active: panel.open && panel.id === r.id }"
              @click="openPanel(r)"
            >
              <td class="td-mono td-dim">{{ r.stemID }}</td>
              <td class="td-name">{{ r.stem }}</td>
              <td class="td-dim">
                <span class="cnt-tag">{{ (r.competitions || []).length }}</span>
                <span class="td-ellipsis">{{ (r.competitions || []).join(' · ') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="be-empty">{{ loading ? '불러오는 중…' : '일치하는 stem이 없습니다.' }}</div>
      </div>

      <!-- Drawer -->
      <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
        <div class="ep-panel" @click.stop>
          <div class="ep-head">
            <div>
              <div class="ep-title">{{ panel.id ? (panel.form.stem || '—') : '새 stem' }}</div>
              <div class="ep-sub">{{ panel.id ? `stemID ${panel.form.stemID}` : '수동 등록' }}</div>
            </div>
            <button class="ep-close" @click="closePanel">✕</button>
          </div>

          <div class="ep-body">
            <div class="ep-field">
              <label>stemID</label>
              <input :value="panel.form.stemID || '자동'" class="ep-inp ep-inp-mono ep-readonly" readonly />
            </div>

            <div class="ep-field">
              <label>stem <span class="ep-req">*</span></label>
              <input v-model="panel.form.stem" class="ep-inp" placeholder="stem" />
            </div>

            <div class="ep-divider"></div>

            <div class="ep-field">
              <label>competitions <span class="ep-hint">읽기 전용</span></label>
              <textarea
                :value="(panel.form.competitions || []).join('\n')"
                class="ep-inp ep-area ep-readonly"
                rows="12"
                readonly
              ></textarea>
            </div>
          </div>

          <div class="ep-foot">
            <button class="btn-clear" @click="clearForm">지우기</button>
            <div class="ep-foot-right">
              <button v-if="panel.id" class="btn-delete" :disabled="panel.saving" @click="deleteRow">삭제</button>
              <button class="btn-save" :disabled="panel.saving" @click="saveRow">
                {{ panel.saving ? '저장 중…' : '저장' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Stems — 메달뱅크 Backend' })

interface StemRow {
  id:           string
  stemID:       number
  stem:         string
  competitions: string[]
}

const emptyForm = (): StemRow => ({ id: '', stemID: 0, stem: '', competitions: [] })

// ── 필터 ──────────────────────────────────────────────────────────
const f       = reactive({ stem: '' })
const loading = ref(false)

function resetFilters() { f.stem = ''; refresh() }

function onSearchInput() {
  if (f.stem.length && f.stem.length < 2) return
  refresh()
}

// ── 데이터 ────────────────────────────────────────────────────────
const rows = ref<StemRow[]>([])

async function refresh() {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (f.stem) params.stem = f.stem
    rows.value = await $fetch<StemRow[]>('/api/backend/stems', { params })
  } finally {
    loading.value = false
  }
}

// ── Panel ─────────────────────────────────────────────────────────
const panel = reactive({ open: false, id: '', saving: false, form: emptyForm() })

function openPanel(r: StemRow) {
  panel.open = true
  panel.id   = r.id
  panel.saving = false
  panel.form = { ...emptyForm(), ...r }
}
function openNew() {
  panel.open = true
  panel.id   = ''
  panel.saving = false
  panel.form = emptyForm()
}
function closePanel() {
  panel.open = false
  panel.id   = ''
}
function clearForm() {
  panel.form = { ...emptyForm(), id: panel.form.id, stemID: panel.form.stemID }
}

async function saveRow() {
  if (panel.saving) return
  if (!panel.form.stem) { alert('stem을 입력하세요.'); return }
  panel.saving = true
  try {
    const payload = { stem: panel.form.stem }
    if (panel.id) await $fetch(`/api/backend/stems/${panel.id}`, { method: 'PUT', body: payload })
    else          await $fetch('/api/backend/stems', { method: 'POST', body: payload })
    closePanel()
    await refresh()
  } catch (e: any) {
    alert(`저장 실패: ${e?.statusMessage || e?.message || e}`)
  } finally {
    panel.saving = false
  }
}

async function deleteRow() {
  if (!panel.id) return
  if (!confirm(`'${panel.form.stem}' 삭제 하시겠습니까?`)) return
  try {
    await $fetch(`/api/backend/stems/${panel.id}`, { method: 'DELETE' })
    closePanel()
    await refresh()
  } catch (e: any) {
    alert(`삭제 실패: ${e?.statusMessage || e?.message || e}`)
  }
}

onMounted(() => refresh())
</script>

<style scoped>
.st-root { font-family: var(--sans); }

.be-page-head  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.be-page-title { font-size: 20px; font-weight: 700; color: #0a0a0a; }
.be-page-sub   { font-size: 12px; color: #aaa; margin-top: 2px; }

/* ── Filters ── */
.be-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 12px 0; border-bottom: 1px solid #e8e8e4; margin-bottom: 16px;
}
.be-search { height: 34px; padding: 0 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px; width: 260px; outline: none; }
.be-search:focus { border-color: #0a1d3a; }
.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset, .be-add { height: 34px; padding: 0 14px; font-size: 12px; cursor: pointer; border-radius: 3px; transition: background 0.15s; }
.be-reset { border: 1px solid #ddd;     background: #fff;     color: #666; }
.be-reset:hover { background: #f0f0f0; }
.be-add   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.be-add:hover { background: #1a3560; }

/* ── Body ── */
.st-body    { position: relative; }
.st-content { overflow-x: auto; }

/* ── Table ── */
.be-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.be-table thead th {
  padding: 8px 12px; background: #f8f8f6; border-bottom: 2px solid #e0e0e0;
  font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: #aaa; text-align: left; white-space: nowrap;
}
.be-table tbody tr { border-bottom: 1px solid #f0f0ee; cursor: pointer; }
.be-table tbody tr:hover  { background: #f5f5f3; }
.be-table tbody tr.active { background: #dbeafe !important; }
.be-table tbody td { padding: 7px 12px; color: #222; white-space: nowrap; vertical-align: middle; }
.td-name     { font-weight: 500; }
.td-dim      { color: #777; font-size: 12px; }
.td-mono     { font-family: var(--mono); font-size: 11.5px; }
.td-ellipsis { display: inline-block; max-width: 520px; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; }
.be-empty    { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

.cnt-tag {
  display: inline-block; min-width: 20px; text-align: center;
  font-family: var(--mono); font-size: 10.5px; font-weight: 700;
  padding: 2px 6px; margin-right: 8px; border-radius: 3px;
  background: #f1f5f9; color: #475569;
}

/* ── Drawer ── */
.ep-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; justify-content: flex-end; }
.ep-panel {
  width: 380px; max-width: 100%; background: #fff; display: flex; flex-direction: column;
  height: 100vh; overflow: hidden; box-shadow: -4px 0 24px rgba(0,0,0,0.12); animation: ep-in 0.18s ease;
}
@keyframes ep-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }

.ep-head  { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #eee; flex-shrink: 0; background: #0a1d3a; }
.ep-title { font-size: 14px; font-weight: 700; color: #fff; }
.ep-sub   { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.ep-close { border: 0; background: transparent; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0; flex-shrink: 0; }
.ep-close:hover { color: #fff; }

.ep-body  { flex: 1; overflow-y: auto; padding: 16px 20px; }
.ep-field { margin-bottom: 14px; }
.ep-divider { border-top: 1px solid #f0f0f0; margin: 4px 0 16px; }
.ep-field > label {
  display: block; font-size: 10.5px; font-weight: 600; color: #888;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px;
}
.ep-req  { color: #ef4444; }
.ep-hint { color: #bbb; font-weight: 400; text-transform: none; letter-spacing: 0; margin-left: 6px; }
.ep-inp {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid #e0e0e0; border-radius: 3px;
  font-family: var(--sans); font-size: 13px; color: #0a0a0a;
  background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.15s;
}
.ep-inp:focus { border-color: #3b82f6; }
.ep-inp-mono  { font-family: var(--mono); }
.ep-readonly  { background: #f5f5f3; color: #888; cursor: not-allowed; }
.ep-area      { height: auto; padding: 8px 10px; resize: vertical; line-height: 1.5; }

/* ── Footer ── */
.ep-foot { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid #eee; flex-shrink: 0; background: #fafafa; }
.ep-foot-right { display: flex; gap: 8px; }
.btn-clear, .btn-delete, .btn-save { height: 34px; padding: 0 16px; font-size: 12.5px; cursor: pointer; border-radius: 3px; transition: background 0.15s; }
.btn-clear  { border: 1px solid #ddd;     background: #fff; color: #555; }
.btn-clear:hover  { background: #f5f5f5; }
.btn-delete { border: 1px solid #b91c1c; background: #fff; color: #b91c1c; }
.btn-delete:hover { background: #fef2f2; }
.btn-delete:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-save   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.btn-save:hover:not(:disabled) { background: #1a3560; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
