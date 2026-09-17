<template>
  <div class="ath-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Athletes</div>
        <div class="be-page-sub">athletes collection · {{ rows.length }} entries</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <input v-model="f.name" class="be-search" placeholder="선수명 검색…" @keyup.enter="search" />
      <select v-model="f.gender" class="be-sel" @change="search">
        <option value="">성별 전체</option>
        <option v-for="g in gendersTable" :key="g.value" :value="g.value">{{ g.label }}</option>
      </select>
      <div class="be-initials">
        <button
          v-for="c in INITIALS" :key="c.value"
          class="be-initial" :class="{ active: initial === c.value }"
          @click="pickInitial(c.value)"
        >{{ c.label }}</button>
      </div>
      <div class="be-filter-actions">
        <button class="be-reset" @click="resetFilters">Reset</button>
        <button class="be-add"   @click="openNew">+ 추가</button>
      </div>
    </div>

    <!-- Table + Drawer -->
    <div class="ath-body">
      <div class="ath-content">
        <table v-if="rows.length" class="be-table">
          <thead>
            <tr>
              <th>aid</th>
              <th>선수명</th>
              <th>성별</th>
              <th>출생</th>
              <th>status</th>
              <th>record</th>
              <th>featured</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in rows" :key="r.id"
              :class="{ active: panel.open && panel.id === r.id }"
              @click="openPanel(r)"
            >
              <td class="td-mono td-dim">{{ r.athleteID }}</td>
              <td class="td-name">{{ r.name }}</td>
              <td><span v-if="r.gender" class="g-tag" :class="`g-${r.gender}`">{{ r.gender }}</span></td>
              <td class="td-mono td-dim">{{ r.dateBirth || r.yearBirth }}</td>
              <td class="td-dim">{{ r.status }}</td>
              <td><span v-if="r.record" class="rec-tag">{{ r.record }}</span></td>
              <td class="td-dim td-ellipsis">{{ r.featured }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="be-empty">{{ loading ? '불러오는 중…' : '일치하는 선수가 없습니다.' }}</div>
      </div>

      <!-- Drawer -->
      <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
        <div class="ep-panel" @click.stop>
          <div class="ep-head">
            <div>
              <div class="ep-title">{{ panel.id ? (panel.form.name || '—') : '새 선수' }}</div>
              <div class="ep-sub">{{ panel.id ? `athleteID ${panel.form.athleteID}` : '수동 등록' }}</div>
            </div>
            <button class="ep-close" @click="closePanel">✕</button>
          </div>

          <div class="ep-body">
            <div class="ep-row">
              <div class="ep-field" style="flex: 0 0 90px;">
                <label>aid</label>
                <input :value="panel.form.athleteID || '자동'" class="ep-inp ep-inp-mono ep-readonly" readonly />
              </div>
              <div class="ep-field ep-field-half">
                <label>선수명 <span class="ep-req">*</span></label>
                <input v-model="panel.form.name" class="ep-inp" placeholder="홍길동" />
              </div>
            </div>

            <div class="ep-row">
              <div class="ep-field ep-field-half">
                <label>성별</label>
                <select v-model="panel.form.gender" class="ep-inp ep-sel">
                  <option value="">미설정</option>
                  <option v-for="g in gendersTable" :key="g.value" :value="g.value">{{ g.label }}</option>
                </select>
              </div>
              <div class="ep-field ep-field-half">
                <label>yearBirth</label>
                <input v-model="panel.form.yearBirth" class="ep-inp ep-inp-mono" placeholder="1990" />
              </div>
            </div>

            <div class="ep-row">
              <div class="ep-field ep-field-half">
                <label>dateBirth</label>
                <input v-model="panel.form.dateBirth" class="ep-inp ep-inp-mono" placeholder="1990-01-01" />
              </div>
              <div class="ep-field ep-field-half">
                <label>status</label>
                <input v-model="panel.form.status" class="ep-inp" placeholder="완료" />
              </div>
            </div>

            <div class="ep-field">
              <label>record <span class="ep-hint">KR · AR · WR 등</span></label>
              <input v-model="panel.form.record" class="ep-inp ep-inp-mono" placeholder="KR" />
            </div>

            <div class="ep-divider"></div>

            <div class="ep-field">
              <label>featured</label>
              <input v-model="panel.form.featured" class="ep-inp ep-inp-mono" placeholder="/cms/images/athletes/23/f" />
            </div>
            <div class="ep-field">
              <label>thumbnail</label>
              <input v-model="panel.form.thumbnail" class="ep-inp ep-inp-mono" placeholder="/cms/images/athletes/23/t" />
            </div>

            <div v-if="previewUrl" class="ep-preview">
              <img :src="previewUrl" :alt="panel.form.name" />
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
useHead({ title: 'Athletes — 메달뱅크 Backend' })

interface AthleteRow {
  id:        string
  athleteID: number
  name:      string
  gender:    string
  status:    string
  record:    string
  yearBirth: string | number
  dateBirth: string
  featured:  string
  thumbnail: string
}

const emptyForm = (): AthleteRow => ({
  id: '', athleteID: 0, name: '', gender: '', status: '',
  record: '', yearBirth: '', dateBirth: '', featured: '', thumbnail: '',
})

// 초성 버튼 — 서버에서 "가%" 를 범위 조회로 처리한다.
const INITIALS = [
  { value: '',  label: '전체' },
  { value: '0', label: '0-9'  },
  { value: 'A', label: 'a-Z'  },
  ...'가나다라마바사아자차카타파하'.split('').map(c => ({ value: c, label: c })),
]

// ── 필터 ──────────────────────────────────────────────────────────
const f       = reactive({ name: '', gender: '' })
const initial = ref('')
const loading = ref(false)

function resetFilters() {
  Object.assign(f, { name: '', gender: '' })
  initial.value = ''
  refresh()
}
function search() { initial.value = ''; refresh() }
function pickInitial(value: string) {
  initial.value = value
  f.name = ''
  refresh()
}

// ── 데이터 ────────────────────────────────────────────────────────
const rows = ref<AthleteRow[]>([])

async function refresh() {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    const name = initial.value ? `${initial.value}%` : f.name
    if (name)     params.name   = name
    if (f.gender) params.gender = f.gender
    rows.value = await $fetch<AthleteRow[]>('/api/backend/athletes', { params })
  } finally {
    loading.value = false
  }
}

// ── Panel ─────────────────────────────────────────────────────────
const panel = reactive({ open: false, id: '', saving: false, form: emptyForm() })

const previewUrl = computed(() => {
  const v = panel.form.thumbnail || panel.form.featured
  return v && v.startsWith('http') ? v : ''
})

function openPanel(r: AthleteRow) {
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
  panel.form = { ...emptyForm(), id: panel.form.id, athleteID: panel.form.athleteID }
}

async function saveRow() {
  if (panel.saving) return
  if (!panel.form.name) { alert('선수명을 입력하세요.'); return }
  panel.saving = true
  try {
    const { id, athleteID, ...payload } = panel.form
    if (panel.id) await $fetch(`/api/backend/athletes/${panel.id}`, { method: 'PUT', body: payload })
    else          await $fetch('/api/backend/athletes', { method: 'POST', body: payload })
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
  if (!confirm(`'${panel.form.name}' 삭제 하시겠습니까?`)) return
  try {
    await $fetch(`/api/backend/athletes/${panel.id}`, { method: 'DELETE' })
    closePanel()
    await refresh()
  } catch (e: any) {
    alert(`삭제 실패: ${e?.statusMessage || e?.message || e}`)
  }
}

onMounted(() => refresh())
</script>

<style scoped>
.ath-root { font-family: var(--sans); }

.be-page-head  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.be-page-title { font-size: 20px; font-weight: 700; color: #0a0a0a; }
.be-page-sub   { font-size: 12px; color: #aaa; margin-top: 2px; }

/* ── Filters ── */
.be-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 12px 0; border-bottom: 1px solid #e8e8e4; margin-bottom: 16px;
}
.be-search { height: 34px; padding: 0 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px; width: 220px; outline: none; }
.be-sel    { height: 34px; padding: 0 8px;  border: 1px solid #ddd; border-radius: 3px; font-size: 12.5px; background: #fff; outline: none; }
.be-search:focus, .be-sel:focus { border-color: #0a1d3a; }

.be-initials { display: flex; gap: 2px; flex-wrap: wrap; }
.be-initial {
  height: 26px; min-width: 26px; padding: 0 6px; font-size: 11.5px;
  border: 1px solid #e0e0e0; background: #fff; color: #777;
  border-radius: 3px; cursor: pointer; transition: background 0.12s, color 0.12s;
}
.be-initial:hover  { background: #f0f0f0; }
.be-initial.active { background: #0a1d3a; border-color: #0a1d3a; color: #fff; }

.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset, .be-add { height: 34px; padding: 0 14px; font-size: 12px; cursor: pointer; border-radius: 3px; transition: background 0.15s; }
.be-reset { border: 1px solid #ddd;     background: #fff;     color: #666; }
.be-reset:hover { background: #f0f0f0; }
.be-add   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.be-add:hover { background: #1a3560; }

/* ── Body ── */
.ath-body    { position: relative; }
.ath-content { overflow-x: auto; }

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
.td-ellipsis { max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
.be-empty    { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

.g-tag   { display: inline-block; font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 3px; letter-spacing: 0.06em; }
.g-men   { background: #dbeafe; color: #1e40af; }
.g-women { background: #fce7f3; color: #9d174d; }
.g-mixed { background: #f1f5f9; color: #475569; }
.rec-tag { display: inline-block; font-family: var(--mono); font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 3px; background: #fef9c3; color: #854d0e; }

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
.ep-row   { display: flex; gap: 12px; }
.ep-field-half { flex: 1; min-width: 0; }
.ep-divider    { border-top: 1px solid #f0f0f0; margin: 4px 0 16px; }
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
.ep-sel       { cursor: pointer; }
.ep-readonly  { background: #f5f5f3; color: #888; cursor: not-allowed; }

.ep-preview     { margin-top: 4px; }
.ep-preview img { width: 100%; border-radius: 3px; display: block; }

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
