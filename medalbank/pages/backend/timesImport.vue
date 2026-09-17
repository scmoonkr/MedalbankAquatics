<template>
  <div class="ti-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Import Times</div>
        <div class="be-page-sub">
          mergedTimes 등재
          <template v-if="comp.id"> · {{ comp.competitionName }}</template>
        </div>
      </div>
    </div>

    <!-- ── Filter ───────────────────────────────────────────── -->
    <div class="be-filters">
      <input
        v-model.number="cid"
        class="ti-cid-inp"
        type="text"
        placeholder="cid"
        @change="loadCompetition"
        @keyup.enter="loadCompetition"
      />

      <input
        ref="fileRef"
        type="file"
        accept=".xlsx, .xls"
        class="ti-file-inp"
        @change="onFilePick"
      />

      <button class="ti-btn ti-green" :disabled="!comp.id || parsing" @click="clickUpload">Upload.xls</button>
      <button class="ti-btn ti-green" :disabled="!comp.id || parsing" @click="clickRead">Read</button>
      <button class="ti-btn ti-green" :disabled="!rows.length"        @click="clickCheck">Check</button>
      <button class="ti-btn ti-blue"  :disabled="!keepCount || confirming" @click="confirmTimes">Save to DB</button>
      <button class="ti-btn ti-blue"  :disabled="!comp.id || parsing" @click="clickLoadFromDb">load from DB</button>
      <button class="ti-btn ti-red"   :disabled="!rows.length"        @click="clickDelete">Delete</button>

      <select v-model.number="perPage" class="ti-per" title="페이지당 행수">
        <option :value="10">10</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
        <option :value="0">전체</option>
      </select>
    </div>

    <div class="ti-compline" :class="{ none: !comp.id }">
      {{ comp.id ? compLine : (cidError || 'cid 를 입력하고 Enter 를 누르세요.') }}
    </div>

    <div v-if="error" class="ti-error">{{ error }}</div>

    <div v-if="toast.lines.length" class="ti-result" :class="toast.ok ? 'ok' : 'warn'">
      <div class="ti-result-head">
        <span class="ti-result-title">{{ toast.ok ? '등재 결과' : '실패' }}</span>
        <button class="ti-result-close" @click="toast.lines = []">✕</button>
      </div>
      <div class="ti-result-body">
        <div v-for="(l, i) in toast.lines" :key="i">{{ l }}</div>
      </div>
    </div>

    <div v-if="summary && showCheck" class="ti-summary">
      총 <strong>{{ summary.total }}</strong> ·
      등재가능 <strong class="ok">{{ keepCount }}</strong> ·
      DB중복 {{ summary.duplicateInDb }} ·
      파일중복 {{ summary.duplicateInFile }} ·
      제외 {{ summary.flagged }}
      <span v-if="summary.sheets.length" class="ti-sheets">· 시트: {{ summary.sheets.join(', ') }}</span>
    </div>

    <!-- ── Table ────────────────────────────────────────────── -->
    <div class="ti-content">
      <table v-if="rows.length" class="be-table">
        <thead>
          <tr>
            <th v-for="col in COLUMNS" :key="col.key" :style="{ width: col.width }">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in pagedRows" :key="row.rowKey"
            :class="[i % 2 === 1 ? 'alt-row' : '', !row.insertable ? 'ti-skip' : '', row.dup !== 'none' ? 'ti-dup' : '']"
          >
            <td class="c-chk"><input type="checkbox" :checked="row.isMasters" disabled /></td>
            <td class="c-chk"><input type="checkbox" :checked="row.isAdult"   disabled /></td>
            <td class="ti-name">{{ row.name }}</td>
            <td class="alt-col">{{ row.team }}</td>
            <td>{{ row.ageGroup }}</td>
            <td class="alt-col">{{ getGenderByEng(row.gender) }}</td>
            <td>{{ getStyleLabel(row.discipline) }}</td>
            <td class="alt-col mono">{{ row.course || comp.course }}</td>
            <td class="mono">{{ row.distance }}</td>
            <td class="alt-col mono ti-time">{{ row.time }}</td>
            <td class="mono">{{ row.rank ?? '' }}</td>
            <td class="alt-col ti-flags">
              <span v-if="row.status" class="ti-badge" :class="statusClass(row.status)">{{ row.status }}</span>
              <span v-if="row.dup === 'db'"   class="ti-badge amber">DB중복</span>
              <span v-if="row.dup === 'file'" class="ti-badge amber">파일중복</span>
              <span v-for="fl in row.flags" :key="fl" class="ti-badge" :class="flagClass(fl)">{{ flagKo(fl) }}</span>
            </td>
            <td class="c-act">
              <button class="act edit" title="기록 수정" @click="openEdit(row)">✎</button>
              <button class="act del"  title="기록 삭제" @click="removeRow(row)">🗑</button>
              <button class="act view" title="기록 보기" @click="openView(row)">👁</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="be-empty">
        {{ parsing ? '분석 중…' : comp.id ? 'Upload.xls 로 기록지 엑셀을 올리세요.' : '먼저 대회를 검색해서 선택하세요.' }}
      </div>

      <!-- pagination -->
      <div v-if="totalPages > 1" class="ti-pager">
        <button :disabled="page === 1" @click="page = 1">«</button>
        <button :disabled="page === 1" @click="page--">‹</button>
        <span class="ti-pager-now">{{ page }} / {{ totalPages }}</span>
        <button :disabled="page === totalPages" @click="page++">›</button>
        <button :disabled="page === totalPages" @click="page = totalPages">»</button>
        <span class="ti-pager-cnt">{{ rows.length }}건</span>
      </div>
    </div>

    <!-- ── 수정 모달 ────────────────────────────────────────── -->
    <div v-if="edit.open" class="ti-backdrop" @click="edit.open = false">
      <div class="ti-modal" @click.stop>
        <div class="ti-modal-head">
          <span class="ti-modal-title">Times 수정</span>
          <button class="ti-result-close" @click="edit.open = false">✕</button>
        </div>
        <div class="ti-modal-body">
          <div v-for="col in EDITABLE" :key="col.key" class="ti-field">
            <label>{{ col.label }}</label>
            <select v-if="col.options" v-model="edit.form[col.key]" class="ti-inp">
              <option v-for="o in col.options" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
            </select>
            <input v-else v-model="edit.form[col.key]" class="ti-inp" />
          </div>
        </div>
        <div class="ti-modal-foot">
          <button class="ti-btn ti-go"   @click="edit.open = false">취소</button>
          <button class="ti-btn ti-save" @click="saveEdit">확인</button>
        </div>
      </div>
    </div>

    <!-- ── 상세 모달 ────────────────────────────────────────── -->
    <div v-if="view.open" class="ti-backdrop" @click="view.open = false">
      <div class="ti-modal" @click.stop>
        <div class="ti-modal-head">
          <span class="ti-modal-title">Times 정보</span>
          <button class="ti-result-close" @click="view.open = false">✕</button>
        </div>
        <div class="ti-modal-body">
          <div v-for="col in COLUMNS.filter(c => c.key !== 'actions')" :key="col.key" class="ti-view-row">
            <span class="ti-view-k">{{ col.label }}</span>
            <span class="ti-view-v">{{ viewValue(col.key) }}</span>
          </div>
        </div>
        <div class="ti-modal-foot">
          <button class="ti-btn ti-go"   @click="view.open = false">닫기</button>
          <button class="ti-btn ti-save" @click="editFromView">수정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Import Times — 메달뱅크 Backend' })

// 데이터는 이 프로젝트 API 를 쓴다 (competitions.vue 드로어와 동일).
//   POST /api/backend/competitions/:id/times-parse   (multipart, field=file) → 미리보기 행
//   POST /api/backend/competitions/:id/times-confirm ({ rows })              → mergedTimes 등재
// 화면 구성(필터·컬럼·액션)은 Breaststroke/pages/backend/timesImport 와 맞췄다.

interface Competition {
  id: string; competitionID: number; competitionName: string
  datetime: string; course: string; isMasters: boolean
}

interface PreviewRow {
  rowKey: string
  name: string; names?: string[]; gender: string
  discipline: string; distance: string; time: string
  status: string; rank: number | null; ageGroup: string; group?: string
  isMasters: boolean; isAdult: boolean
  team: string; round: string; heat: string; waPoints: number
  flags: string[]; dup: 'none' | 'file' | 'db'; insertable: boolean
  [k: string]: any
}

interface Summary {
  total: number; insertable: number; duplicateInDb: number
  duplicateInFile: number; flagged: number; sheets: string[]
}

// 원본 tableColumns.ts 와 동일한 순서·라벨·폭
const COLUMNS = [
  { key: 'isMasters',  label: 'masters', width: '78px' },
  { key: 'isAdult',    label: 'adult',   width: '52px' },
  { key: 'name',       label: '이름',     width: '100px' },
  { key: 'team',       label: '팀명',     width: '150px' },
  { key: 'ageGroup',   label: '연령대',   width: '170px' },
  { key: 'gender',     label: '성별',     width: '60px'  },
  { key: 'discipline', label: '종목',     width: '100px' },
  { key: 'course',     label: '코스',     width: '40px'  },
  { key: 'distance',   label: '거리',     width: '60px'  },
  { key: 'time',       label: '기록',     width: '92px' },
  { key: 'rank',       label: 'rank',    width: '58px' },
  { key: 'status',     label: 'status',  width: '160px' },
  { key: 'actions',    label: '액션',     width: '104px' },
]

// 수정 모달에서 다룰 필드 (원본 TheModalForm 과 같은 구성)
const EDITABLE = [
  { key: 'name',       label: '이름' },
  { key: 'team',       label: '팀명' },
  { key: 'ageGroup',   label: '연령대' },
  { key: 'gender',     label: '성별',  options: gendersTable.map(g => ({ value: g.value, label: g.label })) },
  { key: 'discipline', label: '종목',  options: styleTable.map(s => ({ value: s.value, label: s.label })) },
  { key: 'distance',   label: '거리',  options: distanceTable.map(d => ({ value: d.value, label: d.label })) },
  { key: 'time',       label: '기록' },
  { key: 'rank',       label: 'rank' },
  { key: 'status',     label: 'status' },
  { key: 'isMasters',  label: 'masters', options: [{ value: true, label: 'masters' }, { value: false, label: 'elite' }] },
  { key: 'isAdult',    label: 'adult',   options: [{ value: true, label: '성인' },    { value: false, label: '학생' }] },
]

const DISTANCES   = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M']
const DISCIPLINES = ['FR', 'BA', 'BR', 'FL', 'IM', 'FRR', 'MR']

// ── 대회 선택 — cid 로 조회 ────────────────────────────────────────
const comp     = reactive<Partial<Competition>>({})
const cid      = ref<number | null>(null)
const cidError = ref('')

async function loadCompetition() {
  for (const k of Object.keys(comp)) delete (comp as any)[k]
  cidError.value = ''
  resetRows()
  if (!cid.value) return
  try {
    const found = await $fetch<Competition[]>('/api/backend/competitions', {
      params: { competitionID: cid.value },
    })
    if (!found.length) { cidError.value = `cid ${cid.value} 대회를 찾을 수 없습니다.`; return }
    Object.assign(comp, found[0])
  } catch (e: any) {
    cidError.value = e?.statusMessage || e?.message || '대회 조회 실패'
  }
}

// 비어 있는 항목은 빼고 이어 붙인다 (datetime 없는 대회가 있다)
const compLine = computed(() => [
  comp.competitionName,
  comp.datetime,
  comp.course,
  comp.id ? (comp.isMasters ? '마스터즈' : '일반') : '',
].filter(Boolean).join(' · '))

// ── 파싱 ──────────────────────────────────────────────────────────
const fileRef    = ref<HTMLInputElement | null>(null)
const picked     = ref<File | null>(null)
const fileName   = ref('')
const rows       = ref<PreviewRow[]>([])
const summary    = ref<Summary | null>(null)
const parsing    = ref(false)
const confirming = ref(false)
const error      = ref('')
const showCheck  = ref(true)
const toast      = reactive<{ ok: boolean; lines: string[] }>({ ok: true, lines: [] })

function resetRows() {
  rows.value     = []
  summary.value  = null
  error.value    = ''
  page.value     = 1
}

// 파일 선택만 기억해 둔다. 분석은 Upload.xls / Read 가 수행한다.
function onFilePick(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0] ?? null
  picked.value = file
  fileName.value = file?.name ?? ''
}

async function parsePicked() {
  if (!comp.id)      { error.value = 'cid 를 먼저 입력하세요.'; return }
  if (!picked.value) { error.value = '업로드할 파일을 선택하세요. (서버에 이미 올린 기록지는 Read 를 쓰세요)'; return }
  parsing.value = true
  error.value   = ''
  rows.value    = []
  summary.value = null
  try {
    const fd = new FormData()
    fd.append('file', picked.value)
    const res = await $fetch<{ rows: PreviewRow[]; summary: Summary }>(
      `/api/backend/competitions/${comp.id}/times-parse`, { method: 'POST', body: fd })
    rows.value    = res.rows
    summary.value = res.summary
    page.value    = 1
  } catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || e?.message || '파싱 실패'
  } finally {
    parsing.value = false
  }
}

// Upload.xls — 선택한 엑셀을 올려 분석한다.
const clickUpload = () => parsePicked()

// Read — 서버에 이미 올라가 있는 이 대회의 기록지를 읽는다 (로컬 파일 선택 불필요).
async function clickRead() {
  if (!comp.id) { error.value = 'cid 를 먼저 입력하세요.'; return }
  parsing.value = true
  error.value   = ''
  rows.value    = []
  summary.value = null
  try {
    const res = await $fetch<{ rows: PreviewRow[]; summary: Summary; file?: string }>(
      `/api/backend/competitions/${comp.id}/times-read`, { method: 'POST' })
    rows.value     = res.rows
    summary.value  = res.summary
    fileName.value = res.file || ''
    page.value     = 1
    if (!res.rows.length) error.value = '읽어올 기록이 없습니다.'
  } catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || e?.message || '읽기 실패'
  } finally {
    parsing.value = false
  }
}

// Check — 검사 요약(총/등재가능/중복/제외)을 켜고 끈다.
function clickCheck() { showCheck.value = !showCheck.value }

// load from DB — 이 대회에 이미 등재된 mergedTimes 기록을 같은 표로 불러온다.
async function clickLoadFromDb() {
  if (!comp.id) return
  parsing.value = true
  error.value   = ''
  rows.value    = []
  summary.value = null
  try {
    const res = await $fetch<{ rows: PreviewRow[]; summary: Summary }>(
      `/api/backend/competitions/${comp.id}/times`)
    rows.value     = res.rows
    summary.value  = res.summary
    fileName.value = ''
    page.value     = 1
    if (!res.rows.length) error.value = '이 대회로 등재된 기록이 없습니다.'
  } catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || e?.message || '불러오기 실패'
  } finally {
    parsing.value = false
  }
}

// Delete — 화면의 분석 결과를 비운다 (DB 는 건드리지 않는다).
function clickDelete() {
  if (!confirm('표의 내용을 비우시겠습니까? DB 기록은 삭제되지 않습니다.')) return
  resetRows()
}

// ── 페이지네이션 ──────────────────────────────────────────────────
const perPage = ref(10)   // 원본 UI_CONFIG.rowsPerPage 와 동일
const page    = ref(1)

const totalPages = computed(() =>
  perPage.value === 0 ? 1 : Math.max(1, Math.ceil(rows.value.length / perPage.value)))
const pagedRows = computed(() =>
  perPage.value === 0 ? rows.value
    : rows.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))

watch([perPage, () => rows.value.length], () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

// ── 행 상태 ───────────────────────────────────────────────────────
const keepCount = computed(() => rows.value.filter(r => r.insertable).length)

const FLAG_KO: Record<string, string> = {
  'unmapped-style': '영법인식불가', 'unmapped-distance': '거리인식불가',
  'no-basetime': '기준기록없음', 'no-name': '이름없음',
}
function flagKo(f: string)      { return FLAG_KO[f] ?? f }
function flagClass(f: string)   { return f === 'no-basetime' ? 'grey' : 'red' }
function statusClass(s: string) { return s === 'DQ' ? 'red' : s === '번외' ? 'amber' : 'grey' }

// 유효한 종목이고 중복이 아니면 등재 대상. DNS/DQ 처럼 기록이 비어도 상태가 있으면 남긴다.
function canKeep(r: PreviewRow): boolean {
  return !!r.name && DISCIPLINES.includes(r.discipline) &&
    DISTANCES.includes((r.distance || '').toUpperCase()) &&
    (!!r.time || !!r.status) && r.dup === 'none'
}
function removeRow(r: PreviewRow) {
  rows.value = rows.value.filter(x => x.rowKey !== r.rowKey)
}

// ── 수정 / 상세 모달 ──────────────────────────────────────────────
const edit = reactive<{ open: boolean; target: PreviewRow | null; form: Record<string, any> }>(
  { open: false, target: null, form: {} })
const view = reactive<{ open: boolean; target: PreviewRow | null }>({ open: false, target: null })

function openEdit(r: PreviewRow) {
  edit.target = r
  edit.form   = Object.fromEntries(EDITABLE.map(c => [c.key, r[c.key]]))
  edit.open   = true
}
function saveEdit() {
  const r = edit.target
  if (!r) return
  for (const c of EDITABLE) {
    if (c.key === 'rank') r.rank = edit.form.rank === '' || edit.form.rank == null ? null : Number(edit.form.rank)
    else r[c.key] = edit.form[c.key]
  }
  r.waPoints   = 0            // 등재 시 서버가 다시 계산한다
  r.insertable = canKeep(r)
  edit.open    = false
}
function openView(r: PreviewRow) { view.target = r; view.open = true }
function editFromView() {
  const r = view.target
  view.open = false
  if (r) openEdit(r)
}
function viewValue(key: string) {
  const r = view.target
  if (!r) return ''
  switch (key) {
    case 'isMasters':  return r.isMasters ? 'masters' : 'elite'
    case 'isAdult':    return r.isAdult ? '성인' : '학생'
    case 'gender':     return getGenderByEng(r.gender)
    case 'discipline': return getStyleLabel(r.discipline)
    case 'course':     return r.course || comp.course || ''
    default:           return r[key] ?? ''
  }
}

// ── 등재 ──────────────────────────────────────────────────────────
async function confirmTimes() {
  if (confirming.value || !comp.id) return
  const keep = rows.value.filter(r => r.insertable)
  if (!keep.length) return
  if (!confirm(`${keep.length}건을 '${comp.competitionName}' 기록으로 등재하시겠습니까?`)) return

  confirming.value = true
  try {
    const res = await $fetch<{ inserted: number; skippedDuplicate: number; skippedInvalid: number }>(
      `/api/backend/competitions/${comp.id}/times-confirm`, { method: 'POST', body: { rows: keep } })
    toast.ok = true
    toast.lines = [
      `✓ ${res.inserted}건 등재`,
      res.skippedDuplicate ? `⊘ 중복 ${res.skippedDuplicate}건` : '',
      res.skippedInvalid   ? `⚠ 제외 ${res.skippedInvalid}건`   : '',
    ].filter(Boolean)
    resetRows()
  } catch (e: any) {
    toast.ok = false
    toast.lines = [`등재 실패: ${e?.statusMessage || e?.data?.statusMessage || e?.message || e}`]
  } finally {
    confirming.value = false
  }
}
</script>

<style scoped>
.ti-root { font-family: var(--sans); }

.be-page-head  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.be-page-title { font-size: 20px; font-weight: 700; color: #0a0a0a; }
.be-page-sub   { font-size: 12px; color: #aaa; margin-top: 2px; }

/* ── Filter ── 원본 timesImport 툴바와 같은 구성/색 ── */
.be-filters {
  display: flex; align-items: center; gap: 10px; flex-wrap: nowrap;
  padding: 12px 0; border-bottom: 1px solid #e8e8e4; margin-bottom: 10px;
  overflow-x: auto;
}
.ti-cid-inp {
  flex: 0 0 auto; width: 110px; height: 40px; padding: 0 10px;
  border: 1px solid #ddd; border-radius: 4px;
  font-family: var(--mono); font-size: 14px; color: #222; background: #fff; outline: none;
}
.ti-cid-inp:focus { border-color: #0a1d3a; }

.ti-file-inp {
  flex: 0 0 auto; width: 300px; height: 40px; padding: 7px 8px;
  border: 1px solid #ddd; border-radius: 4px;
  font-size: 13px; color: #555; background: #fff; box-sizing: border-box;
}

.ti-btn {
  flex: 0 0 auto; height: 40px; padding: 0 18px;
  border: none; border-radius: 4px;
  font-size: 14px; font-weight: 500; white-space: nowrap; cursor: pointer;
  transition: filter 0.15s;
}
.ti-btn:hover:not(:disabled) { filter: brightness(0.93); }
.ti-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ti-green { background: #c7f784; color: #333; }
.ti-blue  { background: #3498db; color: #fff; }
.ti-red   { background: #e74c3c; color: #fff; }

.ti-per {
  flex: 0 0 auto; margin-left: auto; height: 40px; padding: 0 8px;
  border: 1px solid #ddd; border-radius: 4px;
  font-size: 12.5px; background: #fff; outline: none; cursor: pointer;
}

/* 선택한 대회 — 툴바 아래 한 줄 */
.ti-compline {
  font-size: 12.5px; color: #222; margin-bottom: 12px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ti-compline.none { color: #bbb; }

/* ── 결과 / 요약 ── */
.ti-error { font-size: 12px; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; }
.ti-result { border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 4px; margin-bottom: 12px; overflow: hidden; }
.ti-result.warn { border-color: #fecaca; background: #fef2f2; }
.ti-result-head { display: flex; align-items: center; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid rgba(0,0,0,0.06); }
.ti-result-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #1e40af; }
.ti-result.warn .ti-result-title { color: #b91c1c; }
.ti-result-close { border: 0; background: transparent; color: #999; font-size: 14px; cursor: pointer; padding: 0; }
.ti-result-close:hover { color: #333; }
.ti-result-body { padding: 8px 12px; font-size: 12.5px; line-height: 1.7; color: #333; }

.ti-summary { font-size: 12px; color: #666; margin-bottom: 12px; }
.ti-summary strong { color: #0a0a0a; }
.ti-summary strong.ok { color: #166534; }
.ti-sheets { color: #aaa; }

/* ── Table (원본 DataTable: 행·열 교차 배경) ── */
.ti-content { overflow-x: auto; }
.be-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
.be-table thead th {
  padding: 8px 8px; background: #f8f8f6; border-bottom: 2px solid #e0e0e0;
  font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  color: #aaa; text-align: left; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.be-table thead th:nth-child(1),
.be-table thead th:nth-child(2) { text-align: center; }
.be-table tbody tr { border-bottom: 1px solid #f0f0ee; }
.be-table tbody tr.alt-row { background: #fafaf9; }
.be-table tbody tr:hover   { background: #f0f4f8; }
.be-table tbody tr.ti-skip { opacity: 0.5; }
.be-table tbody tr.ti-dup  { background: #fffbeb; }
.be-table tbody td {
  padding: 5px 8px; color: #222; vertical-align: middle;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.be-table tbody td.alt-col { background: rgba(0,0,0,0.015); }
.c-chk   { text-align: center; }
.c-act   { white-space: nowrap; }
.ti-name { font-weight: 500; }
.mono    { font-family: var(--mono); }
.ti-time { font-weight: 600; color: #0a0a0a; }
.be-empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

.ti-flags { white-space: nowrap; }
.ti-badge {
  display: inline-block; font-size: 9.5px; font-weight: 700;
  padding: 1px 5px; margin-right: 2px; border-radius: 3px;
}
.ti-badge.amber { background: #fef9c3; color: #854d0e; }
.ti-badge.red   { background: #fee2e2; color: #991b1b; }
.ti-badge.grey  { background: #f1f5f9; color: #475569; }

.act {
  border: 1px solid #e0e0e0; background: #fff; border-radius: 3px;
  width: 22px; height: 22px; font-size: 11px; line-height: 1;
  cursor: pointer; margin-right: 2px; padding: 0;
  transition: background 0.12s, border-color 0.12s;
}
.act.edit:hover { background: #eff6ff; border-color: #3b82f6; }
.act.del:hover  { background: #fef2f2; border-color: #b91c1c; }
.act.view:hover { background: #f0fdf4; border-color: #16a34a; }

/* ── Pagination ── */
.ti-pager { display: flex; align-items: center; gap: 4px; padding: 12px 0; }
.ti-pager button {
  min-width: 28px; height: 28px; border: 1px solid #e0e0e0; background: #fff;
  color: #555; border-radius: 3px; font-size: 12px; cursor: pointer;
}
.ti-pager button:hover:not(:disabled) { background: #f0f0f0; }
.ti-pager button:disabled { opacity: 0.4; cursor: not-allowed; }
.ti-pager-now { font-family: var(--mono); font-size: 12px; color: #333; padding: 0 8px; }
.ti-pager-cnt { margin-left: auto; font-size: 11.5px; color: #aaa; }

/* ── Modal ── */
.ti-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200; display: flex; align-items: center; justify-content: center; }
.ti-modal { width: 420px; max-width: 94vw; max-height: 86vh; background: #fff; border-radius: 4px; display: flex; flex-direction: column; box-shadow: 0 12px 40px rgba(0,0,0,0.2); }
.ti-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #0a1d3a; border-radius: 4px 4px 0 0; }
.ti-modal-title { font-size: 13px; font-weight: 700; color: #fff; }
.ti-modal-head .ti-result-close { color: #94a3b8; }
.ti-modal-head .ti-result-close:hover { color: #fff; }
.ti-modal-body { flex: 1; overflow-y: auto; padding: 14px 16px; }
.ti-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 16px; border-top: 1px solid #eee; background: #fafafa; border-radius: 0 0 4px 4px; }

.ti-field { margin-bottom: 10px; }
.ti-field > label {
  display: block; font-size: 10.5px; font-weight: 600; color: #888;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;
}
.ti-inp {
  width: 100%; height: 30px; padding: 0 8px; box-sizing: border-box;
  border: 1px solid #e0e0e0; border-radius: 3px;
  font-family: var(--sans); font-size: 12.5px; color: #222; background: #fff; outline: none;
}
.ti-inp:focus { border-color: #3b82f6; }

.ti-view-row { display: flex; gap: 10px; padding: 5px 0; border-bottom: 1px solid #f5f5f3; font-size: 12.5px; }
.ti-view-k { flex: 0 0 90px; color: #888; }
.ti-view-v { color: #222; word-break: break-all; }
</style>
