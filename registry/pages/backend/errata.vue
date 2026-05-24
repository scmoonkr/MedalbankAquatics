<template>
  <div class="er-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Errata</div>
        <div class="be-page-sub">errata collection · {{ rows.length }} entries</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <select v-model="f.category">
        <option value="">All Categories</option>
        <option v-for="c in CATEGORY_ORDER" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="f.gender">
        <option value="">All Genders</option>
        <option value="men">men</option>
        <option value="women">women</option>
      </select>
      <select v-model="f.discipline">
        <option value="">All Disciplines</option>
        <option v-for="d in DISCIPLINE_ORDER" :key="d" :value="d">{{ d }}</option>
      </select>
      <input v-model="f.name" placeholder="Search name…" class="be-search" />
      <div class="be-filter-actions">
        <button class="be-reset" @click="resetFilters">Reset</button>
        <button class="be-load"  @click="importFileRef?.click()">CSV 불러오기</button>
        <button class="be-confirm" :disabled="!checkedIds.size" @click="bulkConfirm">
          Confirm <span v-if="checkedIds.size" class="be-confirm-count">({{ checkedIds.size }})</span>
        </button>
        <button class="be-new"   @click="openNew">+ 신규</button>
        <input ref="importFileRef" type="file" accept=".csv" style="display:none" @change="importCSV" />
      </div>
    </div>

    <div v-if="pending && !rows.length" class="be-empty">Loading…</div>
    <div v-else-if="!rows.length" class="be-empty">No data.</div>
    <template v-else>
      <div class="be-table-wrap">
        <table class="be-table er-table">
          <thead>
            <tr>
              <th class="c-chk">
                <input type="checkbox" :checked="allChecked" :indeterminate.prop="someChecked && !allChecked" @change="toggleAll" />
              </th>
              <th class="c-no">No.</th>
              <th class="c-cat">분류</th>
              <th class="c-event">종목</th>
              <th class="c-name">이름</th>
              <th class="c-time">기록</th>
              <th class="c-corr">정정 내용</th>
              <th class="c-reporter">제보자</th>
              <th class="c-date">제보일</th>
              <th class="c-mag">반영호</th>
              <th class="c-status">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id"
              class="row-clickable"
              :class="{ active: panel.open && panel.id === r.id, confirmed: !!r.confirmed_at }"
              @click="openPanel(r)">
              <td class="chk" @click.stop>
                <input type="checkbox" :checked="checkedIds.has(r.id)" @change="toggleOne(r.id)" />
              </td>
              <td class="num mono">{{ r.no ?? '—' }}</td>
              <td class="dim small">{{ r.category || '—' }}</td>
              <td class="dim small">{{ eventStr(r.time) }}</td>
              <td class="bold">{{ r.time?.name || '—' }}</td>
              <td class="mono">{{ r.time?.time || '—' }}</td>
              <td class="small entry" v-html="buildEntry(r)"></td>
              <td class="dim small">{{ r.reporter || '—' }}</td>
              <td class="dim mono small">{{ r.report_date || '—' }}</td>
              <td class="dim small">{{ r.magazine || '—' }}</td>
              <td class="status small">
                <span class="status-tag" :class="`status-${r.status}`">{{ r.status || 'pending' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Edit panel -->
    <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
      <div class="ep-panel" @click.stop>
        <div class="ep-head">
          <div>
            <div class="ep-title">{{ panel.id ? `Edit Errata #${panel.form.no || '—'}` : 'New Errata' }}</div>
            <div class="ep-sub">{{ panel.id || '(신규)' }}</div>
          </div>
          <button class="ep-close" @click="closePanel">✕</button>
        </div>

        <div class="ep-body">
          <!-- 메타 -->
          <div class="ep-meta-id">
            <span class="ep-meta-no">No. {{ panel.form.no ?? '—' }}</span>
            <span class="ep-meta-sep">·</span>
            <span class="ep-meta-tid">timeID {{ panel.form.timeID || '신규' }}</span>
          </div>
          <div class="ep-grid">
            <div class="ep-field">
              <label>상태 · status</label>
              <select v-model="panel.form.status" class="ep-inp">
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
            <div class="ep-field">
              <label>분류 · category</label>
              <select v-model="panel.form.category" class="ep-inp">
                <option value=""></option>
                <option v-for="c in CATEGORY_ORDER" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <!-- 기록 필드 -->
          <div class="ep-divider"></div>
          <div class="ep-grid">

            <!-- 성명 | 반영호 -->
            <div class="ep-field">
              <label>성명 <span class="ep-req">*</span></label>
              <input v-model="panel.form.time.name" :class="['ep-inp', { 'ep-inp-changed': mf.has('name') }]" placeholder="홍길동" />
              <span v-if="panel.form.before && mf.has('name')" class="ep-orig">원본: {{ panel.form.before.name || '—' }}</span>
            </div>
            <div class="ep-field">
              <label>반영호 · magazine</label>
              <input v-model="panel.form.magazine" class="ep-inp" />
            </div>

            <!-- 기록 | 순위 -->
            <div class="ep-field">
              <label>기록 <span class="ep-req">*</span></label>
              <input v-model="panel.form.time.time" :class="['ep-inp mono', { 'ep-inp-changed': mf.has('time') }]" placeholder="00:00.00" />
              <span v-if="panel.form.before && mf.has('time')" class="ep-orig">원본: {{ panel.form.before.time || '—' }}</span>
              <span v-else class="ep-hint">mm:ss.00 또는 ss.00</span>
            </div>
            <div class="ep-field">
              <label>순위</label>
              <input v-model.number="panel.form.time.rank" type="number" min="1" :class="['ep-inp mono', { 'ep-inp-changed': mf.has('rank') }]" placeholder="1" />
              <span v-if="panel.form.before && mf.has('rank')" class="ep-orig">원본: {{ panel.form.before.rank ?? '—' }}</span>
            </div>

            <!-- 구분 | 연령부 -->
            <div class="ep-field">
              <label>구분 <span class="ep-req">*</span></label>
              <select v-model="panel.form.time.isMasters" :class="['ep-inp', { 'ep-inp-changed': mf.has('isMasters') }]" @change="onDivisionChange">
                <option :value="false">전문체육 (Elite)</option>
                <option :value="true">마스터즈 (Masters)</option>
              </select>
            </div>
            <div class="ep-field">
              <label>연령부 <span class="ep-req">*</span></label>
              <select v-model="panel.form.time.group" :class="['ep-inp', { 'ep-inp-changed': mf.has('group') }]">
                <option v-for="g in panelAvailableGroups" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>

            <!-- 성별 | 영법 -->
            <div class="ep-field">
              <label>성별 <span class="ep-req">*</span></label>
              <select v-model="panel.form.time.gender" :class="['ep-inp', { 'ep-inp-changed': mf.has('gender') }]">
                <option value="men">남자</option>
                <option value="women">여자</option>
              </select>
            </div>
            <div class="ep-field">
              <label>영법 <span class="ep-req">*</span></label>
              <select v-model="panel.form.time.discipline" :class="['ep-inp', { 'ep-inp-changed': mf.has('discipline') }]">
                <option value="FR">자유형 (FR)</option>
                <option value="BK">배영 (BK)</option>
                <option value="BR">평영 (BR)</option>
                <option value="FL">접영 (FL)</option>
                <option value="IM">개인혼영 (IM)</option>
              </select>
            </div>

            <!-- 코스 | 거리 -->
            <div class="ep-field">
              <label>코스 <span class="ep-req">*</span></label>
              <select v-model="panel.form.time.course" :class="['ep-inp', { 'ep-inp-changed': mf.has('course') }]" @change="onCourseChange">
                <option value="LCM">LCM</option>
                <option value="SCM">SCM</option>
              </select>
            </div>
            <div class="ep-field">
              <label>거리 <span class="ep-req">*</span></label>
              <select v-model="panel.form.time.distance" :class="['ep-inp', { 'ep-inp-changed': mf.has('distance') }]">
                <option v-for="d in panelAvailableDistances" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>

            <!-- 시도 | 소속 -->
            <div class="ep-field">
              <label>시도</label>
              <select v-model="panel.form.time.sido" :class="['ep-inp', { 'ep-inp-changed': mf.has('sido') }]">
                <option value="">선택</option>
                <option v-for="s in SIDOS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="ep-field">
              <label>소속</label>
              <input v-model="panel.form.time.team" :class="['ep-inp', { 'ep-inp-changed': mf.has('team') }]" placeholder="소속팀·클럽" />
              <span v-if="panel.form.before && mf.has('team')" class="ep-orig">원본: {{ panel.form.before.team || '—' }}</span>
            </div>

            <!-- 대회일 | 경기장 -->
            <div class="ep-field">
              <label>대회일 <span class="ep-req">*</span></label>
              <input v-model="panel.form.time.datetime" type="date" :class="['ep-inp mono', { 'ep-inp-changed': mf.has('datetime') }]" />
              <span v-if="panel.form.before && mf.has('datetime')" class="ep-orig">원본: {{ (panel.form.before as any).datetime || '—' }}</span>
            </div>
            <div class="ep-field">
              <label>경기장</label>
              <input v-model="panel.form.time.pool" :class="['ep-inp', { 'ep-inp-changed': mf.has('pool') }]" placeholder="잠실실내수영장" />
              <span v-if="panel.form.before && mf.has('pool')" class="ep-orig">원본: {{ (panel.form.before as any).pool || '—' }}</span>
            </div>

            <!-- 대회명 -->
            <div class="ep-field ep-field-wide">
              <label>대회명 <span class="ep-req">*</span></label>
              <input v-model="panel.form.time.competitionName" :class="['ep-inp', { 'ep-inp-changed': mf.has('competitionName') }]" placeholder="2024 전국체육대회" />
              <span v-if="panel.form.before && mf.has('competitionName')" class="ep-orig">원본: {{ (panel.form.before as any).competitionName || '—' }}</span>
            </div>

          </div>

          <!-- 비고 / 제보 정보 -->
          <div class="ep-divider"></div>
          <div class="ep-grid">
            <div class="ep-field ep-field-wide">
              <label>비고 · note</label>
              <textarea v-model="panel.form.note" rows="2" class="ep-inp ep-textarea" />
            </div>
            <div class="ep-field">
              <label>제보자 · reporter</label>
              <input v-model="panel.form.reporter" class="ep-inp" />
            </div>
            <div class="ep-field">
              <label>제보일 · report_date</label>
              <input v-model="panel.form.report_date" class="ep-inp mono" placeholder="YYYY-MM-DD" />
            </div>
          </div>
        </div>

        <div class="ep-actions">
          <button v-if="panel.id" class="btn-delete" @click="deleteRow">삭제</button>
          <span v-else></span>
          <div class="ep-actions-right">
            <button class="btn-cancel" @click="closePanel">취소</button>
            <button v-if="panel.id" class="btn-confirm" @click="confirmRow">Confirm</button>
            <button class="btn-save" @click="saveRow">저장</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Errata — KSR Backend' })

const CATEGORY_ORDER   = ['누락건 신규 등재', '기록오류 정정', '날짜오류 정정', '이름오류 정정', '기타오류 정정']
const DISCIPLINE_ORDER = ['FR', 'BK', 'BR', 'FL', 'IM']
const DISTANCE_ORDER   = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M']
const COURSE_ORDER     = ['LCM', 'SCM']
const ALL_GROUPS       = ['유년부', '초등부', '중등부', '고등부', '일반부', '성인부']

const SIDOS        = ['서울','경기','인천','강원','대전','충남','충북','세종','부산','대구','울산','경북','경남','광주','전북','전남','제주','해외']
const ELITE_GROUPS   = ['일반부','고등부','중등부','초등부','유년부']
const MASTERS_GROUPS = ['성인부','고등부','중등부','초등부','유년부']
const LCM_DISTS = ['50M','100M','200M','400M','800M','1500M']
const SCM_DISTS = ['25M','50M','100M','200M','400M','800M','1500M']

const panelAvailableGroups = computed(() =>
  panel.form.time.isMasters ? MASTERS_GROUPS : ELITE_GROUPS
)
const panelAvailableDistances = computed(() =>
  panel.form.time.course === 'SCM' ? SCM_DISTS : LCM_DISTS
)
function onDivisionChange() {
  panel.form.time.group = panel.form.time.isMasters ? '성인부' : '일반부'
}
function onCourseChange() {
  if (!panelAvailableDistances.value.includes(panel.form.time.distance ?? '')) {
    panel.form.time.distance = panelAvailableDistances.value[0]
  }
}

function calcMagazine(from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(1)
  d.setMonth(d.getMonth() + (from.getDate() <= 20 ? 1 : 2))
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월호`
}

// modified fields: time 필드 중 before와 다른 항목 Set
const TIME_KEYS = ['name','time','gender','isMasters','group','discipline','distance','course','rank','sido','team','datetime','competitionName','pool'] as const
const mf = computed(() => {
  const s = new Set<string>()
  const b = panel.form.before
  if (!b) return s
  for (const k of TIME_KEYS) {
    const bv = String((b as any)[k] ?? '')
    const tv = String((panel.form.time as any)[k] ?? '')
    if (bv !== tv) s.add(k)
  }
  return s
})

interface TimeBlock {
  gender?: string; discipline?: string; distance?: string; course?: string;
  rank?: number | null; name?: string; time?: string;
  datetime?: string; competitionName?: string; pool?: string;
  team?: string; sido?: string; group?: string; isMasters?: boolean;
}
interface ErrataDoc {
  id: string; no: number | null; category: string; timeID: number;
  time: TimeBlock; before: TimeBlock | null; note: string;
  reporter: string; report_date: string; magazine: string; status: string;
  confirmed_at?: string; confirmed_target?: string; confirmed_action?: string;
}

const f = reactive({ category: '', gender: '', discipline: '', name: '' })

const serverQuery = computed(() => ({
  category:   f.category,
  gender:     f.gender,
  discipline: f.discipline,
  name:       f.name,
}))
const { data, pending, refresh } = useFetch<ErrataDoc[]>('/api/backend/errata', {
  query: serverQuery,
  key: () => `errata:${Date.now()}:${Math.random()}`,
})
const rows = computed(() => data.value ?? [])

function eventStr(t: TimeBlock | undefined) {
  if (!t) return '—'
  const parts = [GENDER_LABEL[t.gender ?? ''] ?? t.gender, DISC_LABEL[t.discipline ?? ''] ?? t.discipline, t.distance, t.course]
  return parts.filter(Boolean).join(' ') || '—'
}

function resetFilters() {
  f.category = ''; f.gender = ''; f.discipline = ''; f.name = ''
}

const GENDER_LABEL: Record<string, string> = { men: '남자', women: '여자' }
const DISC_LABEL:   Record<string, string> = { BR: '평영', FR: '자유형', BK: '배영', FL: '접영', IM: '개인혼영' }

function esc(s: unknown): string {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m as string] ?? m))
}
function eventLabel(t: TimeBlock): string {
  return [GENDER_LABEL[t.gender ?? ''] ?? t.gender, DISC_LABEL[t.discipline ?? ''] ?? t.discipline, t.distance, t.course].filter(Boolean).join(' ')
}
function buildEntry(doc: ErrataDoc): string {
  const t     = doc.time   ?? {}
  const b     = doc.before ?? null
  const isNew = !doc.timeID

  if (isNew) {
    const rank = (t as any).rank ? `${(t as any).rank}위 ` : ''
    const tail = [(t as any).datetime, (t as any).competitionName, (t as any).pool].filter(Boolean).map(esc).join(' ')
    return [
      esc(eventLabel(t)),
      rank + `<strong>${esc(t.name)}</strong>`,
      `<span class="mono">${esc(t.time)}</span>`,
      '누락 등재',
      tail ? `<span class="ep-tail">(${tail})</span>` : '',
    ].filter(Boolean).join(' ')
  }

  const evtLabel = esc(eventLabel(t))
  const nameStr  = esc(t.name)

  if (!b) {
    const subject = [evtLabel, nameStr].filter(Boolean).join(' ')
      || [
          t.time            ? `<span class="mono">${esc(t.time)}</span>` : '',
          (t as any).competitionName ? `<span class="ep-tail">(${esc((t as any).competitionName)})</span>` : '',
        ].filter(Boolean).join(' ')
    const noteHtml = doc.note ? ` — <span class="ep-note">${esc(doc.note)}</span>` : ''
    return `${subject} 오류정정${noteHtml}`
  }

  const diffs: string[] = []
  const chk = (label: string, bVal: unknown, aVal: unknown) => {
    if (String(bVal ?? '') !== String(aVal ?? ''))
      diffs.push(`${label} <span class="ep-before-val">${esc(bVal)}</span> → <span class="ep-after-val">${esc(aVal)}</span>`)
  }
  chk('기록',   b.time,            t.time)
  chk('성명',   b.name,            t.name)
  chk('순위',   b.rank != null ? `${b.rank}위` : '—', (t as any).rank != null ? `${(t as any).rank}위` : '—')
  chk('대회일', b.datetime,        (t as any).datetime)
  chk('대회명', b.competitionName, (t as any).competitionName)
  chk('경기장', b.pool,            (t as any).pool)

  const diffHtml = diffs.length ? `오류정정: ${diffs.join(' · ')}` : '오류정정'
  const noteHtml = doc.note ? ` <span class="ep-note">— ${esc(doc.note)}</span>` : ''
  return [evtLabel, nameStr, diffHtml, noteHtml].filter(Boolean).join(' ')
}

// ── edit / new panel ────────────────────────────────────────────
type FormTime = TimeBlock & { pool?: string }
type PanelForm = {
  no: number | null; category: string; timeID: number; status: string;
  reporter: string; report_date: string; magazine: string; note: string;
  time: FormTime; before: FormTime | null;
}
function emptyForm(): PanelForm {
  return {
    no: null, category: '', timeID: 0, status: 'pending',
    reporter: '', report_date: '', magazine: '', note: '',
    time: {
      gender: '', discipline: '', distance: '', course: '', rank: null,
      name: '', time: '', datetime: '', competitionName: '', pool: '',
      team: '', sido: '', group: '', isMasters: false,
    },
    before: null,
  }
}
const panel = reactive({
  open: false,
  id:   '',
  form: emptyForm() as PanelForm,
})
function openPanel(r: ErrataDoc) {
  panel.open = true
  panel.id   = r.id
  panel.form = {
    no:          r.no ?? null,
    category:    r.category   || '',
    timeID:      r.timeID     ?? 0,
    status:      r.status     || 'pending',
    reporter:    r.reporter   || '',
    report_date: r.report_date || '',
    magazine:    r.magazine   || calcMagazine(),
    note:        r.note       || '',
    time: {
      gender:          r.time?.gender          ?? '',
      discipline:      r.time?.discipline      ?? '',
      distance:        r.time?.distance        ?? '',
      course:          r.time?.course          ?? '',
      rank:            r.time?.rank            ?? null,
      name:            r.time?.name            ?? '',
      time:            r.time?.time            ?? '',
      datetime:        (r.time as any)?.datetime        ?? '',
      competitionName: (r.time as any)?.competitionName ?? '',
      pool:            (r.time as any)?.pool            ?? '',
      team:            r.time?.team            ?? '',
      sido:            r.time?.sido            ?? '',
      group:           r.time?.group           ?? '',
      isMasters:       !!r.time?.isMasters,
    },
    before: r.before ? {
      name:            r.before.name            ?? '',
      time:            r.before.time            ?? '',
      gender:          r.before.gender          ?? '',
      discipline:      r.before.discipline      ?? '',
      distance:        r.before.distance        ?? '',
      course:          r.before.course          ?? '',
      rank:            r.before.rank            ?? null,
      sido:            r.before.sido            ?? '',
      team:            r.before.team            ?? '',
      datetime:        (r.before as any).datetime        ?? '',
      competitionName: (r.before as any).competitionName ?? '',
      pool:            (r.before as any).pool            ?? '',
    } : null,
  }
}
function openNew() {
  panel.open = true
  panel.id   = ''
  panel.form = emptyForm()
  // Suggest next `no` = max + 1
  const maxNo = rows.value.reduce((m, r) => Math.max(m, r.no ?? 0), 0)
  panel.form.no = maxNo + 1
}
function closePanel() {
  panel.open = false
  panel.id   = ''
}
async function saveRow() {
  // Strip empty nested values to keep docs clean (optional)
  const body = JSON.parse(JSON.stringify(panel.form))
  if (panel.id) {
    await $fetch(`/api/backend/errata/${panel.id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/backend/errata', { method: 'POST', body })
  }
  closePanel()
  await refresh()
}
async function deleteRow() {
  if (!panel.id) return
  if (!confirm('이 정정 항목을 삭제하시겠습니까?')) return
  await $fetch(`/api/backend/errata/${panel.id}`, { method: 'DELETE' })
  closePanel()
  await refresh()
}
async function confirmRow() {
  if (!panel.id) return
  // Save any unsaved edits first so the confirm payload reflects the latest form state.
  await $fetch(`/api/backend/errata/${panel.id}`, { method: 'PUT', body: JSON.parse(JSON.stringify(panel.form)) })
  try {
    const res = await $fetch<{ action: string; target: string }>(`/api/backend/errata/${panel.id}/confirm`, { method: 'POST' })
    alert(`Confirm 완료: ${res.action} → mergedTimes ${res.target}`)
  } catch (e: any) {
    alert(`Confirm 실패: ${e?.statusMessage || e?.message || e}`)
    return
  }
  closePanel()
  await refresh()
}

// ── checkbox selection + bulk confirm ───────────────────────────
const checkedIds = ref(new Set<string>())
const allChecked  = computed(() => rows.value.length > 0 && rows.value.every(r => checkedIds.value.has(r.id)))
const someChecked = computed(() => rows.value.some(r => checkedIds.value.has(r.id)))
function toggleOne(id: string) {
  const s = new Set(checkedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  checkedIds.value = s
}
function toggleAll(ev: Event) {
  const on = (ev.target as HTMLInputElement).checked
  checkedIds.value = on ? new Set(rows.value.map(r => r.id)) : new Set()
}
// Clear selection when the underlying list reloads (filter changes / refresh after mutation).
watch(rows, () => { checkedIds.value = new Set() })

async function bulkConfirm() {
  const ids = [...checkedIds.value]
  if (!ids.length) return
  if (!confirm(`${ids.length}건을 confirm 하시겠습니까? (mergedTimes에 insert/update 됩니다)`)) return
  let ok = 0; const fails: { id: string; msg: string }[] = []
  for (const id of ids) {
    try {
      await $fetch(`/api/backend/errata/${id}/confirm`, { method: 'POST' })
      ok++
    } catch (e: any) {
      fails.push({ id, msg: e?.statusMessage || e?.message || String(e) })
    }
  }
  checkedIds.value = new Set()
  await refresh()
  const failMsg = fails.length
    ? '\n실패:\n' + fails.map(f => `  ${f.id.slice(-6)} — ${f.msg}`).join('\n')
    : ''
  alert(`Confirm 완료: ${ok}건 성공 / ${fails.length}건 실패${failMsg}`)
}

// ── CSV load ────────────────────────────────────────────────────
const importFileRef = ref<HTMLInputElement | null>(null)

// Minimal CSV parser supporting quoted cells, escaped quotes, and embedded commas/newlines.
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let i = 0, cell = '', row: string[] = [], inQuotes = false
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 2; continue }
        inQuotes = false; i++; continue
      }
      cell += ch; i++; continue
    }
    if (ch === '"') { inQuotes = true; i++; continue }
    if (ch === ',') { row.push(cell); cell = ''; i++; continue }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''; i++; continue
    }
    cell += ch; i++
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(c => c.length))
}

async function importCSV(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file) return
  const text = await file.text()
  const rows = parseCSV(text)
  if (!rows.length) { alert('CSV에 행이 없습니다.'); return }
  const header = rows[0].map(h => h.trim())
  const idx = (name: string) => header.indexOf(name)

  let inserted = 0
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const get = (k: string) => (idx(k) >= 0 ? (row[idx(k)] ?? '').trim() : '')
    const noStr = get('no')
    const rankStr = get('rank')
    const doc = {
      no:       noStr ? Number(noStr) : null,
      category: get('category'),
      reporter: get('reporter'),
      report_date: get('report_date'),
      magazine: get('magazine'),
      time: {
        gender:          get('gender'),
        discipline:      get('discipline'),
        distance:        get('distance'),
        course:          get('course'),
        rank:            rankStr ? Number(rankStr) : null,
        name:            get('name'),
        time:            get('time'),
        datetime:        get('datetime'),
        competitionName: get('competitionName'),
        correction:      get('correction'),
      },
    }
    try {
      await $fetch('/api/backend/errata', { method: 'POST', body: doc })
      inserted++
    } catch (e) {
      console.error('CSV row failed:', e)
    }
  }
  input.value = ''
  alert(`CSV import 완료: ${inserted}건 추가`)
  await refresh()
}
</script>

<style scoped>
.er-root { font-family: var(--sans); }

.be-page-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 16px; gap: 16px; flex-wrap: wrap;
}
.be-page-title { font-size: 22px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.01em; }
.be-page-sub { font-size: 12px; color: #888; letter-spacing: 0.04em; margin-top: 2px; }

.be-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; align-items: center; }
.be-filters select, .be-search {
  height: 34px; padding: 0 10px; border: 1px solid #ddd; background: #fff;
  font-family: var(--sans); font-size: 12.5px; color: #333; border-radius: 3px; outline: none;
}
.be-filters select:focus, .be-search:focus { border-color: #0a1d3a; }
.be-search { width: 200px; }
.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset, .be-load, .be-new, .be-confirm {
  height: 34px; padding: 0 14px; font-size: 12px; cursor: pointer;
  border-radius: 3px; transition: background 0.15s;
}
.be-reset { border: 1px solid #ddd; background: #fff; color: #666; }
.be-reset:hover { background: #f0f0f0; }
.be-load { border: 1px solid #ddd; background: #fff; color: #555; }
.be-load:hover { background: #f5f5f5; }
.be-confirm {
  border: 1px solid #166534; background: #166534; color: #fff;
}
.be-confirm:hover:not(:disabled) { background: #14532d; }
.be-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
.be-confirm-count { margin-left: 4px; font-weight: 700; }
.be-new { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.be-new:hover { background: #1a3560; }

.be-empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

.be-table-wrap { overflow-x: auto; border: 1px solid #e0e0e0; border-radius: 4px; background: #fff; }
.be-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.be-table thead th {
  padding: 10px 12px; background: #f8f8f6; border-bottom: 1px solid #e8e8e4;
  font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: #888; text-align: left; white-space: nowrap;
}
.be-table tbody tr { border-bottom: 1px solid #f0f0ee; }
.be-table tbody tr:last-child { border-bottom: 0; }
.be-table tbody tr.row-clickable { cursor: pointer; }
.be-table tbody tr.row-clickable:hover { background: #fafaf8; }
.be-table tbody tr.row-clickable.active { background: #eef2f8; }
.be-table tbody td { padding: 8px 12px; vertical-align: middle; color: #222; }

td.num   { color: #999; width: 50px; }
td.dim   { color: #888; }
td.bold  { font-weight: 600; }
td.mono  { font-family: var(--mono); font-size: 12.5px; }
td.small { font-size: 12px; }
td.chk   { width: 32px; }
td.chk input, th .c-chk input { cursor: pointer; }
.be-table thead th.c-chk { width: 32px; }
.be-table thead th input { cursor: pointer; }

.be-table tbody tr.confirmed { background: #f5fbf6; }
.be-table tbody tr.confirmed:hover { background: #ecf6ed; }
.status-tag {
  display: inline-block; padding: 2px 6px; border-radius: 2px;
  font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em;
  background: #f1f5f9; color: #64748b;
}
.status-tag.status-pending   { background: #fef9c3; color: #854d0e; }
.status-tag.status-confirmed { background: #dcfce7; color: #166534; }
.status-tag.status-rejected  { background: #fee2e2; color: #991b1b; }

/* Edit panel */
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
  padding: 16px 20px; border-bottom: 1px solid #eee;
}
.ep-title { font-size: 14px; font-weight: 600; color: #0a0a0a; }
.ep-sub { font-size: 10.5px; color: #888; font-family: var(--mono); margin-top: 4px; word-break: break-all; }
.ep-close {
  width: 28px; height: 28px; border: none; background: transparent;
  font-size: 16px; color: #888; cursor: pointer; border-radius: 3px;
}
.ep-close:hover { background: #f0f0f0; color: #333; }

.ep-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
.ep-section {
  font-size: 10.5px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #888;
  margin: 4px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #eee;
}
.ep-section:not(:first-child) { margin-top: 18px; }
.ep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
.ep-field { display: flex; flex-direction: column; gap: 4px; }
.ep-field-wide { grid-column: 1 / -1; }
.ep-field label { font-size: 11px; color: #666; letter-spacing: 0.04em; }
.ep-inp {
  height: 34px; padding: 0 10px; border: 1px solid #ddd; background: #fff;
  font-family: var(--sans); font-size: 13px; color: #222; border-radius: 3px; outline: none;
}
.ep-inp:focus { border-color: #0a1d3a; }
.ep-inp.mono { font-family: var(--mono); }
.ep-textarea { height: auto; padding: 8px 10px; font-family: var(--sans); resize: vertical; }
.ep-meta-id {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 12px; color: #888;
  padding: 0 0 12px;
}
.ep-meta-no  { font-weight: 600; color: #444; }
.ep-meta-sep { color: #ccc; }
.ep-meta-tid { color: #888; }
.ep-req  { color: #c00; margin-left: 2px; }
.ep-hint { font-size: 11px; color: #aaa; margin-top: -2px; }
.ep-orig { font-size: 11px; color: #999; margin-top: -2px; }
.ep-inp-changed { background: #fffbe6; border-color: #f0c000 !important; }
.ep-inp-changed:focus { border-color: #c89600 !important; }
.ep-readonly { background: #f5f5f5; color: #999; cursor: default; }
.ep-divider { border-top: 1px solid #eee; margin: 16px 0 14px; }
.ep-before { background: #fef9f0; border-color: #f0d090; color: #7a5c00; }
.ep-before:focus { border-color: #c8960a; }
.ep-before-val { text-decoration: line-through; color: #999; font-family: var(--mono); font-size: 12px; }
.ep-after-val  { color: #0a5c1a; font-family: var(--mono); font-size: 12px; font-weight: 600; }
.ep-tail  { color: #aaa; font-size: 11.5px; }
.ep-note  { color: #888; font-style: italic; font-size: 12px; }
td.entry  { max-width: 420px; line-height: 1.5; }

.ep-actions {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; border-top: 1px solid #eee; background: #fafafa;
}
.ep-actions-right { display: flex; gap: 8px; }
.btn-delete, .btn-cancel, .btn-save, .btn-confirm {
  height: 34px; padding: 0 16px; font-size: 12.5px; cursor: pointer;
  border-radius: 3px; transition: background 0.15s;
}
.btn-delete { border: 1px solid #b91c1c; background: #fff; color: #b91c1c; }
.btn-delete:hover { background: #fef2f2; }
.btn-cancel { border: 1px solid #ddd; background: #fff; color: #555; }
.btn-cancel:hover { background: #f5f5f5; }
.btn-confirm { border: 1px solid #166534; background: #166534; color: #fff; }
.btn-confirm:hover { background: #14532d; }
.btn-save { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.btn-save:hover { background: #1a3560; }
</style>
