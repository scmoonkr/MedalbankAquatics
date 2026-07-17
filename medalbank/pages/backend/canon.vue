<template>
  <div class="cn-root">

    <!-- Toolbar -->
    <div class="cn-bar">
      <div class="cn-bar-left">
        <nav class="cn-tabs">
          <button
            v-for="tab in TABS"
            :key="tab.disc"
            class="cn-tab"
            :class="{ active: activeDisc === tab.disc }"
            @click="activeDisc = tab.disc"
          >{{ tab.ko }}</button>
        </nav>
        <select v-model="activeType" class="cn-sel">
          <option value="">All Types</option>
          <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="activeCourse" class="cn-sel">
          <option value="">All Courses</option>
          <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="cn-bar-right">
        <span v-if="result" class="cn-result" :class="result.error ? 'cn-result-err' : 'cn-result-ok'">
          {{ result.msg }}
        </span>
        <button class="btn-update" :disabled="updating" @click="runUpdate">
          <span v-if="updating" class="cn-spinner"></span>
          {{ updating ? '진행 중…' : 'Update' }}
        </button>
      </div>
    </div>

    <!-- Info -->
    <div class="cn-info">
      <strong>Update</strong> 버튼을 누르면 <code>records</code> 컬렉션의 모든 도큐먼트를 <code>mergedTimes</code>로 동기화합니다.
      중복 체크 기준: <strong>name · gender · isMasters · discipline · course · distance · time</strong>.
      이미 존재하면 skip, 없으면 신규 insert합니다. insert된 레코드에는 <code>updateTimes</code>가 기록됩니다.
    </div>

    <!-- Table -->
    <div v-if="loaded" class="cn-table-wrap">
      <table class="cn-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>성별</th>
            <th>거리</th>
            <th>코스</th>
            <th>기록</th>
            <th>이름</th>
            <th>팀</th>
            <th>날짜</th>
            <th>장소</th>
            <th>UpdateTimes</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="filteredRecs.length">
            <tr v-for="r in filteredRecs" :key="r.id"
                class="cn-row" :class="{ active: panel.open && panel.id === r.id }"
                @click="openPanel(r)">
              <td><span class="rt-badge">{{ r.type }}</span></td>
              <td class="td-gen">{{ r.gender === 'men' ? '남자' : '여자' }}</td>
              <td class="td-mono">{{ r.distance }}</td>
              <td class="td-mono td-course">{{ r.course }}</td>
              <td class="td-mono td-time">{{ r.time }}</td>
              <td>{{ r.name }}</td>
              <td class="td-team">{{ r.team }}</td>
              <td class="td-mono td-date">{{ r.datetime }}</td>
              <td class="td-loc">{{ r.location }}</td>
              <td class="td-mono td-upd" :class="r.updateTimes ? 'upd-done' : 'upd-none'">
                {{ r.updateTimes ? r.updateTimes.slice(0, 10) : '—' }}
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="10" class="cn-empty">해당 조건 기록 없음</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="cn-loading">불러오는 중…</div>

    <!-- Edit drawer -->
    <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
      <div class="ep-panel" @click.stop>
        <div class="ep-head">
          <div>
            <div class="ep-title">기록 수정</div>
            <div class="ep-sub">{{ panel.id }}</div>
          </div>
          <button class="ep-close" @click="closePanel">✕</button>
        </div>

        <div class="ep-body">
          <div class="ep-grid">
            <div class="ep-field">
              <label>종류 · type</label>
              <input v-model="panel.form.type" class="ep-inp ep-mono" placeholder="WR / KR …" />
            </div>
            <div class="ep-field">
              <label>성별 · gender</label>
              <select v-model="panel.form.gender" class="ep-inp">
                <option value="men">men</option>
                <option value="women">women</option>
              </select>
            </div>
            <div class="ep-field">
              <label>종목 · discipline</label>
              <select v-model="panel.form.discipline" class="ep-inp">
                <option v-for="t in TABS" :key="t.disc" :value="t.disc">{{ t.disc }} · {{ t.ko }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>거리 · distance</label>
              <select v-model="panel.form.distance" class="ep-inp">
                <option v-for="d in DISTANCES" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>코스 · course</label>
              <select v-model="panel.form.course" class="ep-inp">
                <option value="LCM">LCM</option>
                <option value="SCM">SCM</option>
              </select>
            </div>
            <div class="ep-field">
              <label>마스터즈 · isMasters</label>
              <select v-model="panel.form.isMasters" class="ep-inp">
                <option :value="false">false</option>
                <option :value="true">true</option>
              </select>
            </div>
            <div class="ep-field">
              <label>기록 · time (mm:ss.dd)</label>
              <input v-model="panel.form.time" class="ep-inp ep-mono" placeholder="00:00.00"
                @blur="panel.form.time = fmtTime(panel.form.time)" />
            </div>
            <div class="ep-field">
              <label>날짜 · datetime</label>
              <input v-model="panel.form.datetime" class="ep-inp ep-mono" placeholder="YYYY-MM-DD"
                @blur="panel.form.datetime = fmtDate(panel.form.datetime)" />
            </div>
            <div class="ep-field">
              <label>이름 · name</label>
              <input v-model="panel.form.name" class="ep-inp" />
            </div>
            <div class="ep-field">
              <label>팀 · team</label>
              <input v-model="panel.form.team" class="ep-inp" />
            </div>
            <div class="ep-field ep-field-wide">
              <label>장소 · location</label>
              <input v-model="panel.form.location" class="ep-inp" placeholder="Gwangju, KOR" />
            </div>
          </div>
          <p v-if="panel.error" class="ep-error">{{ panel.error }}</p>
        </div>

        <div class="ep-actions">
          <button class="ep-btn-cancel" :disabled="panel.saving" @click="closePanel">취소</button>
          <button class="ep-btn-save" :disabled="panel.saving" @click="panelSave">
            {{ panel.saving ? '저장 중…' : '저장' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Cannon Update — 메달뱅크 Backend' })

// ── 영법 탭 ──────────────────────────────────────────────────────────
const TABS = [
  { disc: 'FR', ko: '자유형' },
  { disc: 'BA', ko: '배영'   },
  { disc: 'BR', ko: '평영'   },
  { disc: 'FL', ko: '접영'   },
  { disc: 'IM', ko: '개인혼영' },
] as const

type Disc = typeof TABS[number]['disc']

const activeDisc = ref<Disc>('FR')

// style 필드 → disc 정규화 (records.style = 'FR' or 'freestyle')
const STYLE_TO_DISC: Record<string, string> = {
  FR: 'FR', freestyle: 'FR',
  BA: 'BA', backstroke: 'BA', back: 'BA',
  BR: 'BR', breaststroke: 'BR', breast: 'BR',
  FL: 'FL', butterfly: 'FL', fly: 'FL',
  IM: 'IM', medley: 'IM',
}

// ── 데이터 ───────────────────────────────────────────────────────────
const DISTANCES = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M']

interface RecRow {
  id:          string
  type:        string
  gender:      string
  distance:    string
  course:      string
  time:        string
  name:        string
  team:        string
  datetime:    string
  location:    string
  discipline:  string
  isMasters:   boolean
  updateTimes: string | null
}

const recs   = ref<RecRow[]>([])
const loaded = ref(false)

async function loadRecs() {
  loaded.value = false
  const data = await $fetch<any[]>('/api/backend/records')
  recs.value = data.map((d: any) => ({
    id:          d.id,
    type:        d.type        || '—',
    gender:      d.gender      || '—',
    distance:    d.distance    || '—',
    course:      d.course && d.course !== '—' ? d.course : 'LCM',
    time:        d.time        || '—',
    name:        d.name        || '—',
    team:        d.team        || d.nationality || '—',
    datetime:    d.datetime    || '—',
    location:    d.location    || d.pool        || '—',
    discipline:  d.discipline  || d.style       || '',
    isMasters:   !!d.isMasters,
    updateTimes: d.updateTimes || null,
  }))
  loaded.value = true
}

const normDisc = (r: RecRow) => (r.discipline ? (STYLE_TO_DISC[r.discipline] || r.discipline) : '')

// Type / Course 필터 — 옵션은 실제 데이터에서 뽑되 표준 순서를 먼저, 그 외는 뒤에 알파벳순.
const CANON_TYPE_ORDER   = ['WR', 'OR', 'AR', 'KR', 'KMR']
const CANON_COURSE_ORDER = ['LCM', 'SCM']

function pickOptions(values: string[], order: string[]): string[] {
  const seen = new Set(values.filter(v => v && v !== '—'))
  const known = order.filter(v => seen.has(v))
  const extra = [...seen].filter(v => !order.includes(v)).sort()
  return [...known, ...extra]
}

const activeType   = ref('')
const activeCourse = ref('')
const typeOptions   = computed(() => pickOptions(recs.value.map(r => r.type),   CANON_TYPE_ORDER))
const courseOptions = computed(() => pickOptions(recs.value.map(r => r.course), CANON_COURSE_ORDER))

// records는 (gender · discipline · distance · course · type)당 최종 기록 1건만 유지한다.
// 기록 경신은 drawer에서 해당 문서를 수정하는 방식이므로 time/datetime 비교는 불필요.
const filteredRecs = computed(() =>
  recs.value.filter((r) => {
    if (normDisc(r) !== activeDisc.value) return false
    if (activeType.value && r.type !== activeType.value) return false
    if (activeCourse.value && r.course !== activeCourse.value) return false
    return true
  }),
)

// ── Edit drawer ───────────────────────────────────────────────────────
// '—' is the list's placeholder for an empty value — strip it so it never gets saved.
const unDash = (v: string) => (v === '—' ? '' : v)

function fmtTime(raw: string): string {
  const d = String(raw ?? '').replace(/\D/g, '')
  if (!d || d === '000000') return raw
  const p = d.padStart(6, '0').slice(-6)
  return `${p.slice(0, 2)}:${p.slice(2, 4)}.${p.slice(4, 6)}`
}
function fmtDate(raw: string): string {
  const d = String(raw ?? '').replace(/\D/g, '')
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
  return raw
}

type CanonForm = {
  type: string; gender: string; discipline: string; distance: string; course: string
  time: string; name: string; team: string; datetime: string; location: string; isMasters: boolean
}
const panel = reactive({
  open: false, id: '', saving: false, error: '',
  form: {
    type: '', gender: 'men', discipline: 'FR', distance: '50M', course: 'LCM',
    time: '', name: '', team: '', datetime: '', location: '', isMasters: false,
  } as CanonForm,
})

function openPanel(r: RecRow) {
  if (!r.id) return
  panel.open = true
  panel.id = r.id
  panel.error = ''
  Object.assign(panel.form, {
    type:       unDash(r.type),
    gender:     unDash(r.gender) || 'men',
    discipline: STYLE_TO_DISC[r.discipline] || r.discipline || activeDisc.value,
    distance:   unDash(r.distance),
    course:     r.course || 'LCM',
    time:       unDash(r.time),
    name:       unDash(r.name),
    team:       unDash(r.team),
    datetime:   unDash(r.datetime),
    location:   unDash(r.location),
    isMasters:  r.isMasters,
  } as CanonForm)
}
function closePanel() { panel.open = false; panel.id = '' }

// 기록 경신 = 해당 문서를 그대로 갱신(선수명/기록/일자/장소 등). 이력은 남기지 않는다.
async function panelSave() {
  if (panel.saving || !panel.id) return
  panel.saving = true
  panel.error = ''
  try {
    // timeStamp is derived from time server-side (canon sync reads records.timeStamp).
    await $fetch(`/api/backend/records/${panel.id}`, { method: 'PUT', body: { ...panel.form } })
    closePanel()
    await loadRecs()
  } catch (e: any) {
    panel.error = e?.statusMessage || e?.data?.statusMessage || e?.message || '저장 실패'
  } finally {
    panel.saving = false
  }
}

// ── Update ────────────────────────────────────────────────────────────
const updating = ref(false)
const result   = ref<{ msg: string; error: boolean } | null>(null)
let resultTimer: ReturnType<typeof setTimeout> | null = null

async function runUpdate() {
  if (updating.value) return
  updating.value = true
  result.value = null
  try {
    const res = await $fetch<{ inserted: number; skipped: number }>(
      '/api/backend/canon/update',
      { method: 'POST' },
    )
    result.value = {
      msg:   `✓ ${res.inserted}건 추가  /  ${res.skipped}건 중복 skip`,
      error: false,
    }
    await loadRecs() // updateTimes 반영을 위해 새로고침
  } catch (e: any) {
    result.value = {
      msg:   `오류: ${e?.data?.message || e?.message || '알 수 없는 오류'}`,
      error: true,
    }
  } finally {
    updating.value = false
    // 5초 후 자동 소멸
    if (resultTimer) clearTimeout(resultTimer)
    resultTimer = setTimeout(() => { result.value = null }, 5000)
  }
}

onMounted(() => loadRecs())
onUnmounted(() => { if (resultTimer) clearTimeout(resultTimer) })
</script>

<style scoped>
.cn-root { font-family: var(--sans); }

/* ── Toolbar ── */
.cn-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; gap: 12px; flex-wrap: wrap;
}
.cn-bar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cn-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.cn-sel {
  height: 32px; padding: 0 10px; border: 1px solid #ddd; background: #fff;
  font-family: var(--sans); font-size: 13px; color: #555;
  border-radius: 3px; outline: none; cursor: pointer;
}
.cn-sel:focus { border-color: #0a1d3a; }
.cn-tab {
  height: 32px; padding: 0 14px; border: 1px solid #ddd; background: #fff;
  font-size: 13px; color: #555; cursor: pointer; border-radius: 3px;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  font-family: var(--sans);
}
.cn-tab:hover  { background: #f5f5f3; color: #0a0a0a; }
.cn-tab.active { background: #0a1d3a; color: #fff; border-color: #0a1d3a; }

.cn-bar-right { display: flex; align-items: center; gap: 10px; }

.cn-result {
  font-size: 12.5px; padding: 5px 12px; border-radius: 3px;
  white-space: nowrap;
}
.cn-result-ok  { background: #dcfce7; color: #166534; }
.cn-result-err { background: #fee2e2; color: #991b1b; }

.btn-update {
  height: 32px; padding: 0 18px;
  background: #0a1d3a; color: #fff; border: 0;
  font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 3px;
  display: flex; align-items: center; gap: 8px;
  transition: background 0.15s;
}
.btn-update:hover:not(:disabled) { background: #1e3a5f; }
.btn-update:disabled { opacity: 0.55; cursor: not-allowed; }

.cn-spinner {
  width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Info ── */
.cn-info {
  padding: 12px 16px; background: #fafaf8; border: 1px solid #e8e8e4;
  border-radius: 3px; font-size: 12.5px; color: #555; line-height: 1.8;
  margin-bottom: 20px;
}
.cn-info strong { color: #0a0a0a; }
.cn-info code {
  font-family: var(--mono); font-size: 11.5px;
  background: #f0f0ee; padding: 1px 5px; border-radius: 2px; color: #333;
}

/* ── Table ── */
.cn-loading { padding: 60px; text-align: center; color: #aaa; }
.cn-table-wrap { overflow-x: auto; }
.cn-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cn-table thead th {
  padding: 8px 10px; background: #f8f8f6; border-bottom: 2px solid #e0e0e0;
  font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: #aaa; text-align: left; white-space: nowrap;
}
.cn-table tbody tr { border-bottom: 1px solid #f0f0ee; }
.cn-table tbody tr:hover { background: #fafaf8; }
.cn-table tbody td { padding: 7px 10px; color: #222; white-space: nowrap; }

.cn-empty { text-align: center; color: #bbb; padding: 40px !important; }

.rt-badge {
  display: inline-block; font-family: var(--mono); font-size: 11px;
  font-weight: 700; background: #0a1d3a; color: #fff;
  padding: 2px 7px; border-radius: 3px; letter-spacing: 0.08em;
}
.td-gen  { font-size: 12px; color: #666; }
.td-mono { font-family: var(--mono); }
.td-course { font-size: 12px; color: #666; }
.td-time { font-weight: 600; color: #0a0a0a; }
.td-team { font-family: var(--mono); font-size: 12px; color: #555; }
.td-date { font-size: 12px; color: #888; }
.td-loc  { max-width: 200px; overflow: hidden; text-overflow: ellipsis; color: #666; }
.td-upd  { font-size: 12px; }
.upd-done { color: #16a34a; }
.upd-none { color: #bbb; }

/* ── Edit drawer ── */
.cn-row { cursor: pointer; }
.cn-row.active { background: #eef2f8; }

.ep-backdrop {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.32);
  display: flex; justify-content: flex-end; z-index: 200;
}
.ep-panel {
  width: 520px; max-width: 100%; background: #fff;
  display: flex; flex-direction: column; overflow: hidden;
}
.ep-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 14px 20px; background: #0a1d3a;
}
.ep-title { font-size: 14px; font-weight: 700; color: #fff; }
.ep-sub { font-size: 10.5px; color: #94a3b8; font-family: var(--mono); margin-top: 3px; word-break: break-all; }
.ep-close {
  border: 0; background: transparent; color: #94a3b8; font-size: 18px;
  cursor: pointer; padding: 0; line-height: 1; flex-shrink: 0;
}
.ep-close:hover { color: #fff; }

.ep-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
.ep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
.ep-field { display: flex; flex-direction: column; gap: 4px; }
.ep-field-wide { grid-column: 1 / -1; }
.ep-field label {
  font-size: 10.5px; font-weight: 600; color: #888;
  text-transform: uppercase; letter-spacing: 0.08em;
}
.ep-inp {
  height: 34px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 3px;
  font-family: var(--sans); font-size: 13px; color: #0a0a0a;
  background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.15s;
}
.ep-inp:focus { border-color: #3b82f6; }
.ep-mono { font-family: var(--mono); }
.ep-error { margin-top: 12px; font-size: 12px; color: #b91c1c; }

.ep-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 20px; border-top: 1px solid #eee; background: #fafafa;
}
.ep-btn-cancel, .ep-btn-save {
  height: 34px; padding: 0 16px; font-size: 12.5px; cursor: pointer;
  border-radius: 3px; transition: background 0.15s;
}
.ep-btn-cancel { border: 1px solid #ddd; background: #fff; color: #555; }
.ep-btn-cancel:hover:not(:disabled) { background: #f0f0f0; }
.ep-btn-save { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.ep-btn-save:hover:not(:disabled) { background: #1e3a5f; }
.ep-btn-cancel:disabled, .ep-btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
</style>
