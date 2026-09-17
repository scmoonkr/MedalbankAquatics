<template>
  <div class="tm-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Teams</div>
        <div class="be-page-sub">teams collection · {{ rows.length }} entries</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <input v-model="f.name" class="be-search" placeholder="팀명 검색… (2자 이상)" @input="onSearchInput" />
      <span v-if="checked.size" class="be-selected">{{ checked.size }}개 선택됨</span>
      <div class="be-filter-actions">
        <button class="be-reset" @click="resetFilters">Reset</button>
        <button class="be-add"   @click="openNew">+ 추가</button>
      </div>
    </div>

    <!-- Table + Drawer -->
    <div class="tm-body">
      <div class="tm-content">
        <table v-if="rows.length" class="be-table">
          <thead>
            <tr>
              <th class="th-check"></th>
              <th>teamID</th>
              <th>name</th>
              <th>nameKor</th>
              <th>teamCode</th>
              <th>sido</th>
              <th>names</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in rows" :key="r.id"
              :class="{ active: panel.open && panel.id === r.id }"
              @click="openPanel(r)"
            >
              <td class="td-check" @click.stop>
                <input type="checkbox" :checked="checked.has(r.teamID)" @change="toggleCheck(r.teamID)" />
              </td>
              <td class="td-mono td-dim">{{ r.teamID }}</td>
              <td class="td-name">{{ r.name }}</td>
              <td class="td-dim">{{ r.nameKor }}</td>
              <td class="td-mono td-dim">{{ r.teamCode }}</td>
              <td class="td-dim">{{ r.sido }}</td>
              <td class="td-dim td-ellipsis">{{ (r.names || []).join(', ') }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="be-empty">{{ loading ? '불러오는 중…' : '일치하는 팀이 없습니다.' }}</div>
      </div>

      <!-- Drawer -->
      <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
        <div class="ep-panel" @click.stop>
          <div class="ep-head">
            <div>
              <div class="ep-title">{{ panel.id ? (panel.form.name || '—') : '새 팀' }}</div>
              <div class="ep-sub">{{ panel.id ? `teamID ${panel.form.teamID}` : '수동 등록' }}</div>
            </div>
            <button class="ep-close" @click="closePanel">✕</button>
          </div>

          <div class="ep-body">
            <div class="ep-row">
              <div class="ep-field" style="flex: 0 0 90px;">
                <label>teamID</label>
                <input :value="panel.form.teamID || '자동'" class="ep-inp ep-inp-mono ep-readonly" readonly />
              </div>
              <div class="ep-field ep-field-half">
                <label>팀명 <span class="ep-req">*</span></label>
                <input v-model="panel.form.name" class="ep-inp" placeholder="팀명" />
              </div>
            </div>

            <div class="ep-row">
              <div class="ep-field ep-field-half">
                <label>nameKor</label>
                <input v-model="panel.form.nameKor" class="ep-inp" placeholder="한글 팀명" />
              </div>
              <div class="ep-field ep-field-half">
                <label>팀code</label>
                <input v-model="panel.form.teamCode" class="ep-inp ep-inp-mono" placeholder="teamCode" />
              </div>
            </div>

            <div class="ep-field">
              <label>sido</label>
              <select v-model="panel.form.sido" class="ep-inp ep-sel">
                <option value="">미설정</option>
                <option v-for="s in sidoTable" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div class="ep-divider"></div>

            <div class="ep-field">
              <label>Names <span class="ep-hint">한 줄에 하나</span></label>
              <textarea v-model="namesText" class="ep-inp ep-area" rows="8" placeholder="별칭"></textarea>
            </div>

            <!-- 팀 병합 — 목록에서 체크한 팀들을 이 팀으로 합친다 -->
            <div class="ep-merge">
              <div class="ep-merge-head">팀 병합</div>
              <p class="ep-merge-desc">
                목록에서 체크한 {{ checked.size }}개 팀을 teamID <strong>{{ panel.form.teamID }}</strong> 로 병합합니다.
                (2개 이상 선택 필요)
              </p>
              <button class="btn-merge" :disabled="checked.size < 2 || !panel.id || merging" @click="mergeRows">
                {{ merging ? '병합 중…' : '병합 실행' }}
              </button>
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
useHead({ title: 'Teams — 메달뱅크 Backend' })

interface TeamRow {
  id:       string
  teamID:   number
  name:     string
  nameKor:  string
  teamCode: string
  names:    string[]
  sido:     string
}

const emptyForm = (): TeamRow => ({
  id: '', teamID: 0, name: '', nameKor: '', teamCode: '', names: [], sido: '',
})

// ── 필터 ──────────────────────────────────────────────────────────
const f       = reactive({ name: '' })
const loading = ref(false)
const checked = reactive(new Set<number>())

function resetFilters() { f.name = ''; checked.clear(); refresh() }
function toggleCheck(id: number) {
  if (checked.has(id)) checked.delete(id); else checked.add(id)
}

// 12,958건이라 2자 미만이면 조회하지 않는다.
function onSearchInput() {
  if (f.name.length && f.name.length < 2) return
  refresh()
}

// ── 데이터 ────────────────────────────────────────────────────────
const rows = ref<TeamRow[]>([])

async function refresh() {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (f.name) params.name = f.name
    rows.value = await $fetch<TeamRow[]>('/api/backend/teams', { params })
  } finally {
    loading.value = false
  }
}

// ── Panel ─────────────────────────────────────────────────────────
const panel     = reactive({ open: false, id: '', saving: false, form: emptyForm() })
const namesText = ref('')
const merging   = ref(false)

function openPanel(r: TeamRow) {
  panel.open = true
  panel.id   = r.id
  panel.saving = false
  panel.form = { ...emptyForm(), ...r }
  namesText.value = (r.names || []).join('\n')
}
function openNew() {
  panel.open = true
  panel.id   = ''
  panel.saving = false
  panel.form = emptyForm()
  namesText.value = ''
}
function closePanel() {
  panel.open = false
  panel.id   = ''
}
function clearForm() {
  panel.form = { ...emptyForm(), id: panel.form.id, teamID: panel.form.teamID }
  namesText.value = ''
}

async function saveRow() {
  if (panel.saving) return
  if (!panel.form.name) { alert('팀명을 입력하세요.'); return }
  panel.saving = true
  try {
    const { id, teamID, ...rest } = panel.form
    const payload = { ...rest, names: namesText.value.split('\n').map(s => s.trim()).filter(Boolean) }
    if (panel.id) await $fetch(`/api/backend/teams/${panel.id}`, { method: 'PUT', body: payload })
    else          await $fetch('/api/backend/teams', { method: 'POST', body: payload })
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
    await $fetch(`/api/backend/teams/${panel.id}`, { method: 'DELETE' })
    closePanel()
    await refresh()
  } catch (e: any) {
    alert(`삭제 실패: ${e?.statusMessage || e?.message || e}`)
  }
}

// 목록에서 체크한 팀들을 현재 팀으로 흡수한다. 별칭 병합 + mergedTimes 의 teamID 갱신까지 서버가 처리한다.
async function mergeRows() {
  const teamIDs = [...checked]
  if (teamIDs.length < 2 || !panel.form.teamID) return
  if (!confirm(`${teamIDs.length}개 팀을 '${panel.form.name}'(으)로 병합하시겠습니까?`)) return
  merging.value = true
  try {
    const res = await $fetch<{ mergedTeams: number; updatedTimes: number }>(
      '/api/backend/teams/merge',
      { method: 'POST', body: { teamID: panel.form.teamID, teamIDs } },
    )
    alert(`병합 완료: 팀 ${res.mergedTeams}개, 기록 ${res.updatedTimes}건 갱신`)
    checked.clear()
    closePanel()
    await refresh()
  } catch (e: any) {
    alert(`병합 실패: ${e?.statusMessage || e?.message || e}`)
  } finally {
    merging.value = false
  }
}

onMounted(() => refresh())
</script>

<style scoped>
.tm-root { font-family: var(--sans); }

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
.be-selected { font-size: 11.5px; color: #1e40af; background: #dbeafe; padding: 4px 10px; border-radius: 3px; }
.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset, .be-add { height: 34px; padding: 0 14px; font-size: 12px; cursor: pointer; border-radius: 3px; transition: background 0.15s; }
.be-reset { border: 1px solid #ddd;     background: #fff;     color: #666; }
.be-reset:hover { background: #f0f0f0; }
.be-add   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.be-add:hover { background: #1a3560; }

/* ── Body ── */
.tm-body    { position: relative; }
.tm-content { overflow-x: auto; }

/* ── Table ── */
.be-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.be-table thead th {
  padding: 8px 12px; background: #f8f8f6; border-bottom: 2px solid #e0e0e0;
  font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: #aaa; text-align: left; white-space: nowrap;
}
.th-check { width: 36px; }
.be-table tbody tr { border-bottom: 1px solid #f0f0ee; cursor: pointer; }
.be-table tbody tr:hover  { background: #f5f5f3; }
.be-table tbody tr.active { background: #dbeafe !important; }
.be-table tbody td { padding: 7px 12px; color: #222; white-space: nowrap; vertical-align: middle; }
.td-check    { width: 36px; padding: 4px 12px !important; cursor: default; }
.td-name     { font-weight: 500; }
.td-dim      { color: #777; font-size: 12px; }
.td-mono     { font-family: var(--mono); font-size: 11.5px; }
.td-ellipsis { max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
.be-empty    { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

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
.ep-area      { height: auto; padding: 8px 10px; resize: vertical; line-height: 1.5; }

/* ── Merge ── */
.ep-merge { border: 1px solid #fde68a; background: #fffbeb; border-radius: 4px; padding: 12px; }
.ep-merge-head { font-size: 11px; font-weight: 700; color: #854d0e; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.ep-merge-desc { font-size: 11.5px; color: #92400e; line-height: 1.5; margin: 0 0 10px; }
.btn-merge { height: 30px; padding: 0 14px; font-size: 12px; cursor: pointer; border-radius: 3px; border: 1px solid #ca8a04; background: #fff; color: #854d0e; transition: background 0.15s; }
.btn-merge:hover:not(:disabled) { background: #fef9c3; }
.btn-merge:disabled { opacity: 0.45; cursor: not-allowed; }

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
