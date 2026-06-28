<template>
  <div class="cp-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Competitions</div>
        <div class="be-page-sub">competitions collection · {{ rows.length }} entries</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <input v-model="f.name"      class="be-search" placeholder="대회명 검색…" @input="refresh" />
      <select v-model="f.course"   class="be-sel"    @change="refresh">
        <option value="">코스 전체</option>
        <option value="LCM">LCM</option>
        <option value="SCM">SCM</option>
      </select>
      <select v-model="f.isMasters" class="be-sel"   @change="refresh">
        <option value="">구분 전체</option>
        <option value="false">일반</option>
        <option value="true">마스터즈</option>
      </select>
      <div class="be-filter-actions">
        <button class="be-reset" @click="resetFilters">Reset</button>
        <button class="be-add"   @click="openNew">+ 추가</button>
      </div>
    </div>

    <!-- Table + Drawer -->
    <div class="cp-body">
      <div class="cp-content">
        <template v-if="rows.length">
          <table class="be-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>대회명</th>
                <th>날짜</th>
                <th>수영장</th>
                <th>시도</th>
                <th>코스</th>
                <th>마스터즈</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in rows" :key="r.id"
                class="row-clickable"
                :class="{ active: panel.open && panel.id === r.id }"
                @click="openPanel(r)"
              >
                <td class="td-id">{{ r.competitionID }}</td>
                <td class="td-name">{{ r.competitionName }}</td>
                <td class="td-mono">{{ r.datetime }}</td>
                <td class="td-pool">{{ r.pool }}</td>
                <td>{{ r.sido }}</td>
                <td><span class="course-tag">{{ r.course }}</span></td>
                <td>{{ r.isMasters ? '✓' : '' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <div v-else class="be-empty">일치하는 대회가 없습니다.</div>
      </div>

      <!-- Drawer -->
      <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
        <div class="ep-panel" :class="{ 'ep-panel--wide': times.rows.length }" @click.stop>
          <div class="ep-head">
            <div>
              <div class="ep-title">{{ panel.id ? `대회 #${panel.form.competitionID ?? '—'}` : '새 대회' }}</div>
              <div class="ep-sub">{{ panel.id ? '수정' : '신규 등록' }}</div>
            </div>
            <button class="ep-close" @click="closePanel">✕</button>
          </div>

          <div class="ep-body">
            <!-- competitionID -->
            <div class="ep-field">
              <label>대회 ID</label>
              <input
                v-model.number="panel.form.competitionID"
                class="ep-inp ep-inp-mono"
                :placeholder="panel.id ? '' : '자동 채번'"
                :readonly="!!panel.id"
                :class="{ 'ep-readonly': !!panel.id }"
              />
            </div>

            <!-- 대회명 + LLM 검색 -->
            <div class="ep-field">
              <label>대회명</label>
              <div class="ep-inp-wrap">
                <input
                  v-model="panel.form.competitionName"
                  class="ep-inp ep-inp-search"
                  placeholder="2024 전국체육대회"
                  @keydown.enter.prevent="searchCompetition"
                />
                <button
                  class="ep-search-btn"
                  :class="{ loading: panel.compSearching }"
                  :disabled="panel.compSearching || !panel.form.competitionName"
                  title="대회 검색 (LLM)"
                  @click="searchCompetition"
                >
                  <svg v-if="!panel.compSearching" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span v-else class="ep-spin">⟳</span>
                </button>
              </div>
              <!-- 후보 목록 -->
              <div v-if="panel.compList.length > 0" class="comp-list">
                <button
                  v-for="c in panel.compList"
                  :key="c.competitionID"
                  class="comp-item"
                  :class="{ 'comp-suggested': c.competitionID === panel.compSuggestedId }"
                  @click="applyCompetition(c)"
                >
                  <span class="comp-name">{{ c.competitionName }}</span>
                  <span class="comp-meta">{{ c.datetime?.slice(0, 10) }}{{ c.pool ? ' · ' + c.pool : '' }}</span>
                  <span v-if="c.competitionID === panel.compSuggestedId" class="comp-tag">AI 추천</span>
                </button>
              </div>
              <span v-if="panel.compError" class="ep-comp-error">{{ panel.compError }}</span>
            </div>

            <!-- 날짜 -->
            <div class="ep-field">
              <label>날짜</label>
              <input
                v-model="panel.form.datetime"
                class="ep-inp ep-inp-mono"
                placeholder="2024-05-01"
                @blur="panel.form.datetime = fmtDate(panel.form.datetime)"
              />
            </div>

            <!-- 수영장 -->
            <div class="ep-field">
              <label>수영장</label>
              <input v-model="panel.form.pool" class="ep-inp" placeholder="잠실실내수영장" />
            </div>

            <!-- 시도 -->
            <div class="ep-field">
              <label>시도</label>
              <input v-model="panel.form.sido" class="ep-inp" placeholder="서울" />
            </div>

            <!-- 코스 + 마스터즈 -->
            <div class="ep-row">
              <div class="ep-field ep-field-half">
                <label>코스</label>
                <select v-model="panel.form.course" class="ep-inp ep-sel">
                  <option value="LCM">LCM</option>
                  <option value="SCM">SCM</option>
                </select>
              </div>
              <div class="ep-field ep-field-half">
                <label>마스터즈</label>
                <label class="ep-check">
                  <input type="checkbox" v-model="panel.form.isMasters" />
                  <span>마스터즈 대회</span>
                </label>
              </div>
            </div>

            <!-- 기록(times) 엑셀 업로드 -->
            <div v-if="panel.id" class="tu-section">
              <div class="tu-head">
                <span class="tu-title">기록 업로드</span>
                <button class="tu-upload" :disabled="times.parsing" @click="timesFileRef?.click()">
                  {{ times.parsing ? '분석 중…' : '기록 엑셀 업로드' }}
                </button>
                <input ref="timesFileRef" type="file" accept=".xlsx,.xls" style="display:none" @change="onTimesFile" />
              </div>
              <div v-if="times.fileName" class="tu-file">{{ times.fileName }}</div>
              <div v-if="times.error" class="tu-error">{{ times.error }}</div>

              <template v-if="times.summary">
                <div class="tu-summary">
                  총 <strong>{{ times.summary.total }}</strong> ·
                  등재가능 <strong class="ok">{{ keepCount }}</strong> ·
                  DB중복 {{ times.summary.duplicateInDb }} ·
                  파일중복 {{ times.summary.duplicateInFile }} ·
                  제외 {{ times.summary.flagged }}
                  <span v-if="times.summary.sheets.length" class="tu-sheets">· 시트: {{ times.summary.sheets.join(', ') }}</span>
                </div>

                <div class="tu-table-wrap">
                  <table class="tu-table">
                    <thead>
                      <tr>
                        <th class="c-k"><input type="checkbox" :checked="allKept" @change="toggleAllKeep" /></th>
                        <th>선수</th><th>성별</th><th>구분</th><th>연령대</th><th>조</th><th>팀</th><th>영법</th><th>거리</th><th>기록</th>
                        <th>순위</th><th>상태</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in times.rows" :key="row.rowKey"
                          :class="{ 'tu-skip': !row.insertable, 'tu-dup': row.dup !== 'none' }">
                        <td class="c-k">
                          <input type="checkbox" v-model="row.insertable" :disabled="!canKeep(row)" />
                        </td>
                        <td class="tu-name">{{ row.name || '—' }}</td>
                        <td>{{ genderKo(row.gender) }}</td>
                        <td>
                          <select v-model="row.isMasters" class="tu-inp tu-inp-mst">
                            <option :value="true">masters</option>
                            <option :value="false">elite</option>
                          </select>
                        </td>
                        <td><input v-model="row.ageGroup" class="tu-inp tu-inp-ag" /></td>
                        <td><input v-model="row.heat" class="tu-inp tu-inp-heat" /></td>
                        <td><input v-model="row.team" class="tu-inp tu-inp-team" /></td>
                        <td><input v-model="row.discipline" class="tu-inp tu-inp-sm" /></td>
                        <td><input v-model="row.distance" class="tu-inp tu-inp-sm" /></td>
                        <td><input v-model="row.time" class="tu-inp tu-inp-tm mono" @change="onRowTimeEdit(row)" /></td>
                        <td class="mono">{{ row.rank ?? '' }}</td>
                        <td class="tu-flags">
                          <span v-if="row.dup === 'db'" class="tu-badge amber">DB중복</span>
                          <span v-if="row.dup === 'file'" class="tu-badge amber">파일중복</span>
                          <span v-if="row.status" class="tu-badge" :class="statusClass(row.status)">{{ row.status }}</span>
                          <span v-for="fl in row.flags" :key="fl" class="tu-badge" :class="flagClass(fl)">{{ flagKo(fl) }}</span>
                        </td>
                        <td><button class="tu-rm" @click="removeRow(row)">✕</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button class="tu-confirm" :disabled="times.confirming || !keepCount" @click="confirmTimes">
                  {{ times.confirming ? '등재 중…' : `선택 ${keepCount}건 등재` }}
                </button>
              </template>
            </div>
          </div>

          <div class="ep-foot">
            <button class="btn-clear"  @click="clearForm">지우기</button>
            <button v-if="panel.id" class="btn-delete" :disabled="panel.saving" @click="deleteRow">삭제</button>
            <div style="flex:1"></div>
            <button class="btn-save"   :disabled="panel.saving" @click="saveRow">
              {{ panel.saving ? '저장 중…' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- toast -->
    <Transition name="ct">
      <div v-if="compToast.show" class="ct-toast" :class="compToast.ok ? 'ct-ok' : 'ct-err'">
        <p v-for="(line, i) in compToast.lines" :key="i">{{ line }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Competitions — 메달뱅크 Backend' })

// ── 타입 ──────────────────────────────────────────────────────────
interface CompRow {
  id: string
  competitionID:   number | null
  competitionName: string
  datetime:        string
  pool:            string
  sido:            string
  course:          string
  isMasters:       boolean
}
type CompForm = Omit<CompRow, 'id'>

const emptyForm = (): CompForm => ({
  competitionID:   null,
  competitionName: '',
  datetime:        '',
  pool:            '',
  sido:            '',
  course:          'LCM',
  isMasters:       false,
})

// ── 필터 ──────────────────────────────────────────────────────────
const f = reactive({ name: '', course: '', isMasters: '' })
function resetFilters() { Object.assign(f, { name: '', course: '', isMasters: '' }); refresh() }

// ── 데이터 ────────────────────────────────────────────────────────
const rows   = ref<CompRow[]>([])
const loaded = ref(false)

async function refresh() {
  loaded.value = false
  const params: Record<string, string> = {}
  if (f.name)      params.name      = f.name
  if (f.course)    params.course    = f.course
  if (f.isMasters) params.isMasters = f.isMasters
  rows.value = await $fetch<CompRow[]>('/api/backend/competitions', { params })
  loaded.value = true
}

// ── Panel ─────────────────────────────────────────────────────────
const panel = reactive({
  open:    false,
  id:      '',
  saving:  false,
  form:    emptyForm() as CompForm,
  compSearching:   false,
  compError:       '',
  compList:        [] as any[],
  compSuggestedId: null as number | null,
})

function openPanel(r: CompRow) {
  panel.open   = true
  panel.id     = r.id
  panel.saving = false
  panel.form   = { ...r } as any
  resetCompState()
  resetTimes()
}
function openNew() {
  panel.open   = true
  panel.id     = ''
  panel.saving = false
  panel.form   = emptyForm()
  resetCompState()
  resetTimes()
}
function closePanel() {
  panel.open = false
  panel.id   = ''
  resetCompState()
  resetTimes()
}
function clearForm() {
  const id = panel.form.competitionID
  panel.form = emptyForm()
  if (panel.id) panel.form.competitionID = id  // 수정 시 ID는 유지
  resetCompState()
}
function resetCompState() {
  panel.compSearching   = false
  panel.compError       = ''
  panel.compList        = []
  panel.compSuggestedId = null
}

async function saveRow() {
  if (panel.saving) return
  panel.saving = true
  try {
    const payload = { ...panel.form }
    if (panel.id) {
      await $fetch(`/api/backend/competitions/${panel.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/backend/competitions', { method: 'POST', body: payload })
    }
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
  if (!confirm(`대회 "${panel.form.competitionName}" 를 삭제하시겠습니까?`)) return
  try {
    await $fetch(`/api/backend/competitions/${panel.id}`, { method: 'DELETE' })
    closePanel()
    await refresh()
  } catch (e: any) {
    alert(`삭제 실패: ${e?.statusMessage || e?.message || e}`)
  }
}

// ── 날짜 자동 정형 ────────────────────────────────────────────────
function fmtDate(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length === 8) return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`
  return raw
}

// ── LLM 대회 검색 ─────────────────────────────────────────────────
function applyCompetition(c: any) {
  panel.form.competitionID   = c.competitionID   ?? null
  panel.form.competitionName = c.competitionName || ''
  panel.form.datetime        = c.datetime        ? String(c.datetime).slice(0, 10) : ''
  panel.form.pool            = c.pool            || ''
  panel.form.sido            = c.sido            || ''
  panel.form.course          = c.course          || panel.form.course
  if (c.isMasters !== undefined) panel.form.isMasters = !!c.isMasters
  panel.compList        = []
  panel.compSuggestedId = null
  panel.compError       = ''
}

async function searchCompetition() {
  const query = panel.form.competitionName?.trim()
  if (!query || panel.compSearching) return
  panel.compSearching   = true
  panel.compError       = ''
  panel.compList        = []
  panel.compSuggestedId = null
  try {
    const res = await $fetch<{ competition: any; competitionList: any[]; candidates: number; rawLlm: string }>(
      '/api/backend/competition-search',
      { method: 'POST', body: { query } },
    )
    if (!res.competition) throw new Error('competition 데이터가 없습니다.')
    if (res.competitionList && res.competitionList.length > 1) {
      panel.compList        = res.competitionList
      panel.compSuggestedId = res.competition.competitionID ?? null
    } else {
      applyCompetition(res.competition)
    }
  } catch (e: any) {
    panel.compError = e?.data?.statusMessage || e?.statusMessage || e?.message || '대회 검색 실패'
  } finally {
    panel.compSearching = false
  }
}

// ── 기록(times) 엑셀 업로드 ───────────────────────────────────────
interface PreviewRow {
  rowKey: string; sheet: string
  name: string; names: string[]; gender: string
  discipline: string; styleRaw: string; disciplineRaw: string
  distance: string; course: string
  time: string; timeSec: number | null; timeStamp: number; waPoints: number
  rank: number | null; ageGroup: string; group: string; isMasters: boolean; isAdult: boolean
  team: string; round: string; heat: string; status: string
  flags: string[]; dup: 'none' | 'file' | 'db'; insertable: boolean
}
interface TimesSummary {
  total: number; insertable: number; duplicateInDb: number
  duplicateInFile: number; flagged: number; sheets: string[]
}

const timesFileRef = ref<HTMLInputElement | null>(null)
const times = reactive<{
  parsing: boolean; confirming: boolean; fileName: string
  rows: PreviewRow[]; summary: TimesSummary | null; error: string
}>({ parsing: false, confirming: false, fileName: '', rows: [], summary: null, error: '' })

function resetTimes() {
  times.parsing = false; times.confirming = false; times.fileName = ''
  times.rows = []; times.summary = null; times.error = ''
}

// preview rows sort: isMasters → isAdult → gender → ageGroup → heat → round → discipline → distance → name
const cmpStr = (a: string, b: string) => String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true })
const cmpBool = (a: boolean, b: boolean) => (a === b ? 0 : a ? 1 : -1)
function sortPreviewRows(rows: PreviewRow[]): PreviewRow[] {
  return [...rows].sort((a, b) =>
    cmpBool(a.isMasters, b.isMasters) ||
    cmpBool(a.isAdult, b.isAdult) ||
    cmpStr(a.gender, b.gender) ||
    cmpStr(a.ageGroup, b.ageGroup) ||
    cmpStr(a.heat, b.heat) ||
    cmpStr(a.round, b.round) ||
    cmpStr(a.discipline, b.discipline) ||
    cmpStr(a.distance, b.distance) ||
    cmpStr(a.name, b.name),
  )
}

const keepCount = computed(() => times.rows.filter(r => r.insertable).length)
const allKept   = computed(() => times.rows.length > 0 && times.rows.every(r => r.insertable || !canKeep(r)))

const FLAG_KO: Record<string, string> = {
  'unmapped-style': '영법인식불가', 'unmapped-distance': '거리인식불가',
  'no-basetime': '기준기록없음', 'no-name': '이름없음',
}
function flagKo(f: string) { return FLAG_KO[f] ?? f }
function flagClass(f: string) { return f === 'no-basetime' ? 'grey' : 'red' }
function statusClass(s: string) { return s === 'DQ' ? 'red' : s === '번외' ? 'amber' : 'grey' }
function genderKo(g: string) { return g === 'men' ? '남' : g === 'women' ? '여' : g === 'mixed' ? '혼성' : '—' }

// a row may be kept if it has a valid event and is not a duplicate.
// DNS/status rows are kept too (recorded with empty time + status).
function canKeep(r: PreviewRow): boolean {
  const DIST = ['25M','50M','100M','200M','400M','800M','1500M']
  return !!r.name && ['FR','BA','BR','FL','IM','FRR','MR'].includes(r.discipline) &&
    DIST.includes((r.distance || '').toUpperCase()) && (!!r.time || !!r.status) && r.dup === 'none'
}
function onRowTimeEdit(r: PreviewRow) { r.waPoints = 0 }  // server recomputes on confirm
function removeRow(r: PreviewRow) { times.rows = times.rows.filter(x => x.rowKey !== r.rowKey) }
function toggleAllKeep(ev: Event) {
  const on = (ev.target as HTMLInputElement).checked
  for (const r of times.rows) if (canKeep(r)) r.insertable = on
}

async function onTimesFile(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file || !panel.id) return
  times.parsing = true; times.error = ''; times.rows = []; times.summary = null
  try {
    const fd = new FormData(); fd.append('file', file)
    const res = await $fetch<{ rows: PreviewRow[]; summary: TimesSummary }>(
      `/api/backend/competitions/${panel.id}/times-parse`, { method: 'POST', body: fd })
    times.rows = sortPreviewRows(res.rows); times.summary = res.summary; times.fileName = file.name
  } catch (e: any) {
    times.error = e?.statusMessage || e?.data?.statusMessage || e?.message || '파싱 실패'
  } finally {
    times.parsing = false
    if (timesFileRef.value) timesFileRef.value.value = ''
  }
}

async function confirmTimes() {
  if (times.confirming || !panel.id) return
  const keep = times.rows.filter(r => r.insertable)
  if (!keep.length) return
  times.confirming = true
  try {
    const res = await $fetch<{ inserted: number; skippedDuplicate: number; skippedInvalid: number }>(
      `/api/backend/competitions/${panel.id}/times-confirm`, { method: 'POST', body: { rows: keep } })
    showCompToast(true, [
      `✓ ${res.inserted}건 등재`,
      res.skippedDuplicate ? `⊘ 중복 ${res.skippedDuplicate}건` : '',
      res.skippedInvalid ? `⚠ 제외 ${res.skippedInvalid}건` : '',
    ].filter(Boolean))
    resetTimes()
  } catch (e: any) {
    showCompToast(false, [`등재 실패: ${e?.statusMessage || e?.data?.statusMessage || e?.message || e}`])
  } finally {
    times.confirming = false
  }
}

// ── toast ─────────────────────────────────────────────────────────
const compToast = reactive<{ show: boolean; ok: boolean; lines: string[] }>({ show: false, ok: true, lines: [] })
let compToastTimer: ReturnType<typeof setTimeout> | null = null
function showCompToast(ok: boolean, lines: string[]) {
  if (compToastTimer) clearTimeout(compToastTimer)
  compToast.ok = ok; compToast.lines = lines; compToast.show = true
  compToastTimer = setTimeout(() => { compToast.show = false }, 3500)
}

onMounted(() => refresh())
</script>

<style scoped>
.cp-root { font-family: var(--sans); }

/* ── page head (errata 패턴 재사용) ── */
.be-page-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 20px;
}
.be-page-title { font-size: 20px; font-weight: 700; color: #0a0a0a; }
.be-page-sub   { font-size: 12px; color: #aaa; margin-top: 2px; }

/* ── Filters ── */
.be-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 12px 0; border-bottom: 1px solid #e8e8e4; margin-bottom: 16px;
}
.be-search { height: 34px; padding: 0 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px; width: 220px; }
.be-sel    { height: 34px; padding: 0 8px;  border: 1px solid #ddd; border-radius: 3px; font-size: 12.5px; background: #fff; }
.be-filters select:focus, .be-search:focus { border-color: #0a1d3a; outline: none; }
.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset, .be-add {
  height: 34px; padding: 0 14px; font-size: 12px; cursor: pointer; border-radius: 3px; transition: background 0.15s;
}
.be-reset { border: 1px solid #ddd; background: #fff; color: #666; }
.be-reset:hover { background: #f0f0f0; }
.be-add   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.be-add:hover { background: #1a3560; }

/* ── Body ── */
.cp-body    { position: relative; }
.cp-content { overflow-x: auto; }

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
.be-table tbody td { padding: 8px 12px; color: #222; white-space: nowrap; }
.td-id   { font-family: var(--mono); font-size: 12px; color: #888; width: 60px; }
.td-name { max-width: 280px; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.td-pool { max-width: 200px; overflow: hidden; text-overflow: ellipsis; color: #555; }
.td-mono { font-family: var(--mono); font-size: 12px; color: #555; }
.course-tag {
  display: inline-block; font-family: var(--mono); font-size: 10px; font-weight: 700;
  background: #e8edf5; color: #0a1d3a; padding: 1px 6px; border-radius: 2px;
}
.be-empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

/* ── Drawer backdrop + panel ── */
.ep-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200;
  display: flex; justify-content: flex-end;
}
.ep-panel {
  width: 400px; max-width: 100%; background: #fff; display: flex; flex-direction: column;
  height: 100vh; overflow: hidden; box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  animation: ep-in 0.18s ease;
}
@keyframes ep-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }

.ep-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px 12px; border-bottom: 1px solid #eee; flex-shrink: 0;
  background: #0a1d3a;
}
.ep-title  { font-size: 15px; font-weight: 700; color: #fff; }
.ep-sub    { font-size: 11px; color: #94a3b8; margin-top: 3px; }
.ep-close  {
  border: 0; background: transparent; color: #94a3b8; font-size: 18px;
  cursor: pointer; padding: 0; line-height: 1; flex-shrink: 0; margin-top: 2px;
}
.ep-close:hover { color: #fff; }

.ep-body  { flex: 1; overflow-y: auto; padding: 16px 20px; }
.ep-field { margin-bottom: 14px; }
.ep-row   { display: flex; gap: 12px; }
.ep-field-half { flex: 1; min-width: 0; }
.ep-field label {
  display: block; font-size: 10.5px; font-weight: 600; color: #888;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;
}
.ep-inp {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid #e0e0e0; border-radius: 3px;
  font-family: var(--sans); font-size: 13px; color: #0a0a0a;
  background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.15s;
}
.ep-inp:focus   { border-color: #3b82f6; }
.ep-inp-mono    { font-family: var(--mono); }
.ep-readonly    { background: #f5f5f3; color: #888; cursor: not-allowed; }
.ep-sel         { cursor: pointer; }
.ep-check       { display: flex; align-items: center; gap: 8px; padding-top: 8px; cursor: pointer; font-size: 13px; color: #333; }
.ep-check input { cursor: pointer; }

/* search button */
.ep-inp-wrap    { display: flex; gap: 0; }
.ep-inp-search  { border-radius: 3px 0 0 3px; flex: 1; }
.ep-search-btn  {
  flex-shrink: 0; width: 34px; height: 34px;
  border: 1px solid #e0e0e0; border-left: 0; border-radius: 0 3px 3px 0;
  background: #f8f8f6; color: #555; cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: background 0.12s;
}
.ep-search-btn:hover:not(:disabled) { background: #eff6ff; color: #1d4ed8; }
.ep-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ep-search-btn.loading  { color: #3b82f6; }
.ep-spin { font-size: 16px; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.ep-comp-error { font-size: 11.5px; color: #dc2626; margin-top: 4px; display: block; }

/* competition candidate list */
.comp-list {
  margin-top: 4px; border: 1px solid #d1e0f5; border-radius: 4px;
  overflow: hidden; max-height: 200px; overflow-y: auto;
  background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.comp-item {
  display: flex; align-items: baseline; gap: 8px; width: 100%;
  padding: 7px 10px; border: 0; background: transparent;
  text-align: left; cursor: pointer; font-family: var(--sans);
  border-bottom: 1px solid #f0f0f0; transition: background 0.1s; flex-wrap: wrap;
}
.comp-item:last-child { border-bottom: 0; }
.comp-item:hover { background: #eff6ff; }
.comp-item.comp-suggested { background: #f0fdf4; }
.comp-item.comp-suggested:hover { background: #dcfce7; }
.comp-name { font-size: 12.5px; color: #0a0a0a; font-weight: 500; flex: 1; min-width: 0; }
.comp-meta { font-size: 11px; color: #888; font-family: var(--mono); white-space: nowrap; }
.comp-tag  {
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
  background: #166534; color: #fff; padding: 1px 6px; border-radius: 2px; white-space: nowrap;
}

/* ── Footer buttons ── */
.ep-foot {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; border-top: 1px solid #eee; flex-shrink: 0; background: #fafafa;
}
.btn-clear, .btn-delete, .btn-save {
  height: 34px; padding: 0 16px; font-size: 12.5px; cursor: pointer;
  border-radius: 3px; transition: background 0.15s;
}
.btn-clear  { border: 1px solid #ddd; background: #fff; color: #555; }
.btn-clear:hover  { background: #f5f5f5; }
.btn-delete { border: 1px solid #b91c1c; background: #fff; color: #b91c1c; }
.btn-delete:hover { background: #fef2f2; }
.btn-delete:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-save   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.btn-save:hover:not(:disabled) { background: #1a3560; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── times upload ── */
.ep-panel--wide { width: 1000px; }
.tu-section { margin-top: 18px; padding-top: 14px; border-top: 1px dashed #ddd; }
.tu-head { display: flex; align-items: center; gap: 10px; }
.tu-title { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
.tu-upload {
  height: 30px; padding: 0 12px; font-size: 12px; cursor: pointer; border-radius: 3px;
  border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; transition: background 0.15s;
}
.tu-upload:hover:not(:disabled) { background: #1a3560; }
.tu-upload:disabled { opacity: 0.5; cursor: not-allowed; }
.tu-file { margin-top: 8px; font-size: 11.5px; color: #555; font-family: var(--mono); }
.tu-error { margin-top: 8px; font-size: 12px; color: #b91c1c; }
.tu-summary { margin-top: 10px; font-size: 12px; color: #555; }
.tu-summary strong { color: #0a0a0a; }
.tu-summary strong.ok { color: #166534; }
.tu-sheets { color: #999; }

.tu-table-wrap { margin-top: 8px; max-height: 360px; overflow: auto; border: 1px solid #e8e8e4; border-radius: 4px; }
/* width:auto → columns size to content (no leftover-space gaps), keeps the table narrow so 순위/상태 stay visible */
.tu-table { width: auto; border-collapse: collapse; font-size: 12px; }
.tu-table thead th {
  position: sticky; top: 0; z-index: 1;
  padding: 6px 6px; background: #f8f8f6; border-bottom: 1px solid #e0e0e0;
  font-size: 10px; font-weight: 600; color: #888; text-align: left; white-space: nowrap;
}
.tu-table tbody td { padding: 4px 6px; border-bottom: 1px solid #f2f2ef; color: #222; white-space: nowrap; }
.tu-table tbody tr.tu-skip { background: #fafafa; color: #999; }
.tu-table tbody tr.tu-dup  { background: #fffbeb; }
.tu-name { font-weight: 600; }
.tu-table .mono { font-family: var(--mono); }
.c-k { width: 28px; text-align: center; }
.tu-inp {
  width: 100%; min-width: 56px; height: 24px; padding: 0 5px; box-sizing: border-box;
  border: 1px solid #e0e0e0; border-radius: 3px; font-family: var(--sans); font-size: 12px; color: #222;
}
.tu-inp:focus { border-color: #3b82f6; outline: none; }
.tu-inp-sm { width: 48px; min-width: 40px; text-transform: uppercase; }
.tu-inp-tm { width: 78px; min-width: 64px; }
.tu-inp-ag { width: 120px; min-width: 110px; }
.tu-inp-heat { width: 64px; min-width: 52px; }
.tu-inp-team { width: 100px; min-width: 90px; }
.tu-inp-mst { width: 76px; min-width: 64px; }
.tu-raw { margin-left: 4px; font-size: 10px; color: #c026d3; }
.tu-flags { white-space: normal; }
.tu-badge {
  display: inline-block; margin: 1px 2px; padding: 1px 5px; border-radius: 2px;
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.02em;
}
.tu-badge.red   { background: #fee2e2; color: #991b1b; }
.tu-badge.amber { background: #fef3c7; color: #92400e; }
.tu-badge.grey  { background: #f1f5f9; color: #64748b; }
.tu-rm { border: 0; background: transparent; color: #b91c1c; cursor: pointer; font-size: 13px; padding: 0 2px; }
.tu-rm:hover { color: #7f1d1d; }
.tu-confirm {
  margin-top: 10px; height: 34px; padding: 0 18px; font-size: 12.5px; cursor: pointer; border-radius: 3px;
  border: 1px solid #166534; background: #166534; color: #fff; transition: background 0.15s;
}
.tu-confirm:hover:not(:disabled) { background: #14532d; }
.tu-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── toast ── */
.ct-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  min-width: 240px; max-width: 420px; padding: 14px 20px; border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.22); z-index: 9999; pointer-events: none;
}
.ct-toast p { margin: 0; font-size: 13px; line-height: 1.7; white-space: nowrap; }
.ct-toast p:first-child { font-weight: 600; }
.ct-ok  { background: #0f2d1a; color: #86efac; border: 1px solid #166534; }
.ct-err { background: #2d0f0f; color: #fca5a5; border: 1px solid #991b1b; }
.ct-enter-active { transition: opacity 0.18s, transform 0.18s; }
.ct-leave-active { transition: opacity 0.3s,  transform 0.3s;  }
.ct-enter-from, .ct-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
