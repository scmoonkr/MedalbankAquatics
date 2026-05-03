<template>
  <div class="admin-shell">
    <header class="admin-head">
      <h1>선수 관리</h1>
      <div class="head-actions">
        <button class="btn-secondary" @click="openNew">신규 추가</button>
        <span class="head-sep" />
        <button class="btn-danger" :disabled="!checkedIds.length" @click="deleteChecked">
          선택 삭제 ({{ checkedIds.length }})
        </button>
      </div>
    </header>

    <div class="filter-bar">
      <div class="btn-group">
        <button :class="{ active: consentFilter === 'all' }" @click="consentFilter = 'all'">전체</button>
        <button :class="{ active: consentFilter === 'yes' }" @click="consentFilter = 'yes'">동의</button>
        <button :class="{ active: consentFilter === 'no' }"  @click="consentFilter = 'no'">비동의</button>
      </div>
      <div class="group-filter">
        <button type="button" class="group-btn" :class="{ active: groupFilter === '' }"
          @click="groupFilter = ''">전체</button>
        <button v-for="g in availableGroups" :key="g" type="button"
          class="group-btn" :class="{ active: groupFilter === g }"
          @click="groupFilter = groupFilter === g ? '' : g">{{ g }}</button>
      </div>
      <span class="filter-count">{{ filteredList.length }}명</span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="col-chk">
              <input type="checkbox" :checked="allChecked" @change="toggleAll" />
            </th>
            <th class="col-id">athlete_id</th>
            <th class="col-name">이름</th>
            <th class="col-email">이메일</th>
            <th class="col-consent">consent_date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filteredList" :key="a.athlete_id"
            :class="{ selected: checkedIds.includes(a.athlete_id), editing: editing?.athlete_id === a.athlete_id }"
            @click.stop="openEdit(a)">
            <td class="col-chk" @click.stop>
              <input type="checkbox" :value="a.athlete_id" v-model="checkedIds" />
            </td>
            <td class="col-id">{{ a.athlete_id }}</td>
            <td class="col-name">{{ a.name }}</td>
            <td class="col-email">{{ a.email }}</td>
            <td class="col-consent">
              <span v-if="a.consent_date" class="badge approved">{{ fmtDate(a.consent_date) }}</span>
              <span v-else class="badge review">미동의</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 편집 패널 -->
    <div v-if="editing" class="edit-panel" @click.stop>
      <div class="edit-header">
        <span>{{ editing.athlete_id ? `선수 #${editing.athlete_id}` : '신규 선수' }}</span>
        <div class="header-actions">
          <button class="clear-btn" @click="clearForm">지우기</button>
          <button class="close-btn" @click="editing = null">✕</button>
        </div>
      </div>
      <div class="edit-body">
        <div class="field-row">
          <label>athlete_id</label>
          <input :value="editing.athlete_id" disabled />
        </div>
        <div class="field-row">
          <label>이름</label>
          <input v-model="editing.name" />
        </div>
        <div class="field-row">
          <label>lang</label>
          <input v-model="editing.lang" placeholder="ko / en" />
        </div>
        <div class="field-row">
          <label>이메일</label>
          <input v-model="editing.email" type="email" />
        </div>
        <div class="field-row">
          <label>consent_date</label>
          <input v-model="editConsentDate" type="date" placeholder="비워두면 미동의" />
        </div>
      </div>
      <div class="edit-footer">
        <button v-if="editing.athlete_id" class="btn-danger" @click="deleteOne(editing.athlete_id)">삭제</button>
        <button class="btn-primary" @click="save">{{ editing.athlete_id ? '저장' : '신규 저장' }}</button>
      </div>
    </div>
    <div v-if="editing" class="overlay" @click="editing = null" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'backend' })
useHead({ title: '선수 관리 — 백엔드' })

const { data, refresh } = await useFetch<any[]>('/api/admin/athletes')
const list = computed(() => data.value ?? [])

const checkedIds      = ref<number[]>([])
const editing         = ref<any>(null)
const editConsentDate = ref('')
const consentFilter   = ref<'all' | 'yes' | 'no'>('all')
const groupFilter     = ref('')

const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
function getGroup(name: string): string {
  const first = name?.[0]
  if (!first) return '?'
  const code = first.charCodeAt(0)
  if (code >= 0xAC00 && code <= 0xD7A3)
    return CHOSEONG[Math.floor((code - 0xAC00) / 28 / 21)]
  if (/[A-Za-z]/.test(first)) return first.toUpperCase()
  return first
}

const availableGroups = computed(() => {
  const groupSet = new Set<string>()
  for (const a of list.value) groupSet.add(getGroup(a.name))
  const korOrder = Object.fromEntries(CHOSEONG.map((c, i) => [c, i]))
  return [...groupSet].sort((a, b) => {
    const aIsKor = a in korOrder, bIsKor = b in korOrder
    if (aIsKor && bIsKor) return korOrder[a] - korOrder[b]
    if (aIsKor) return -1; if (bIsKor) return 1
    return a.localeCompare(b)
  })
})

const filteredList = computed(() => {
  let items = list.value
  if (consentFilter.value === 'yes') items = items.filter(a => !!a.consent_date)
  if (consentFilter.value === 'no')  items = items.filter(a => !a.consent_date)
  if (groupFilter.value)             items = items.filter(a => getGroup(a.name) === groupFilter.value)
  return items
})

const allChecked = computed(() =>
  filteredList.value.length > 0 &&
  filteredList.value.every(a => checkedIds.value.includes(a.athlete_id)))

function toggleAll(e: Event) {
  const ids = filteredList.value.map(a => a.athlete_id)
  if ((e.target as HTMLInputElement).checked) {
    checkedIds.value = [...new Set([...checkedIds.value, ...ids])]
  } else {
    checkedIds.value = checkedIds.value.filter(id => !ids.includes(id))
  }
}

function openEdit(a: any) {
  editing.value = { ...a }
  editConsentDate.value = a.consent_date
    ? new Date(a.consent_date).toISOString().slice(0, 10)
    : ''
}

function openNew() {
  editing.value = { name: '', email: '', lang: '' }
  editConsentDate.value = ''
}

function clearForm() {
  editing.value = { name: '', email: '', lang: '' }
  editConsentDate.value = ''
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('ko-KR') : ''
}

async function save() {
  const { athlete_id } = editing.value
  const body = {
    name:         editing.value.name,
    email:        editing.value.email,
    lang:         editing.value.lang,
    consent_date: editConsentDate.value || null,
  }
  if (athlete_id) {
    await $fetch(`/api/admin/athletes/${athlete_id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/admin/athletes', { method: 'POST', body })
  }
  editing.value = null
  await refresh()
}

async function deleteOne(id: number) {
  if (!confirm('삭제하시겠습니까?')) return
  await $fetch(`/api/admin/athletes/${id}`, { method: 'DELETE' })
  editing.value = null
  checkedIds.value = checkedIds.value.filter(i => i !== id)
  await refresh()
}

async function deleteChecked() {
  if (!confirm(`${checkedIds.value.length}명을 삭제하시겠습니까?`)) return
  await Promise.all(checkedIds.value.map(id =>
    $fetch(`/api/admin/athletes/${id}`, { method: 'DELETE' })))
  checkedIds.value = []
  await refresh()
}
</script>

<style scoped>
.admin-shell { min-height: 100vh; background: #0d1117; color: #e6edf3; font-family: var(--font-sans, sans-serif); padding: 32px; }
.admin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.admin-head h1 { font-size: 20px; font-weight: 600; }
.table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #30363d; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead tr { background: #161b22; border-bottom: 1px solid #30363d; }
th { padding: 10px 12px; text-align: left; color: #8b949e; font-weight: 500; white-space: nowrap; }
tbody tr { border-bottom: 1px solid #21262d; cursor: pointer; transition: background 0.15s; }
tbody tr:hover { background: #161b22; }
tbody tr.selected { background: #1c2a3a; }
tbody tr.editing { background: #1a2332; outline: 1px solid #388bfd; }
td { padding: 10px 12px; vertical-align: middle; }
.col-chk { width: 36px; }
.col-id { width: 90px; font-variant-numeric: tabular-nums; }
.col-name { width: 120px; }
.col-email { }
.col-consent { width: 120px; }
input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #388bfd; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge.approved { background: #1a3a2a; color: #3fb950; }
.badge.review   { background: #2d333b; color: #8b949e; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 100; }
.edit-panel { position: fixed; right: 0; top: 0; bottom: 0; width: 340px; background: #161b22; border-left: 1px solid #30363d; z-index: 101; display: flex; flex-direction: column; }
.edit-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #30363d; font-weight: 600; }
.close-btn { background: none; border: none; color: #8b949e; font-size: 18px; cursor: pointer; }
.close-btn:hover { color: #e6edf3; }
.edit-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.field-row { display: flex; align-items: center; gap: 12px; }
.field-row label { width: 88px; flex-shrink: 0; font-size: 12px; color: #8b949e; }
.field-row input {
  flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  color: #e6edf3; padding: 6px 10px; font-size: 13px; font-family: inherit;
}
.field-row input:focus { outline: none; border-color: #388bfd; }
.field-row input:disabled { opacity: 0.5; cursor: not-allowed; }
.edit-footer { padding: 16px 20px; border-top: 1px solid #30363d; display: flex; justify-content: space-between; gap: 10px; }
.btn-primary { padding: 8px 20px; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; }
.btn-primary:hover { background: #2ea043; }
.btn-danger { padding: 8px 20px; background: transparent; border: 1px solid #f85149; border-radius: 6px; color: #f85149; font-size: 13px; cursor: pointer; }
.btn-danger:hover { background: #3a1a1a; }
.btn-danger:disabled { opacity: 0.4; cursor: default; }
.btn-secondary { padding: 8px 20px; background: transparent; border: 1px solid #388bfd; border-radius: 6px; color: #388bfd; font-size: 13px; cursor: pointer; }
.btn-secondary:hover { background: rgba(56,139,253,0.1); }
.head-actions { display: flex; align-items: center; gap: 10px; }
.head-sep { display: inline-block; width: 1px; height: 20px; background: #30363d; margin: 0 8px; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.clear-btn { background: none; border: 1px solid #30363d; border-radius: 4px; color: #8b949e; font-size: 11px; padding: 3px 8px; cursor: pointer; letter-spacing: 0.04em; }
.clear-btn:hover { border-color: #8b949e; color: #e6edf3; }
.filter-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.btn-group { display: flex; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; }
.btn-group button { padding: 6px 14px; background: none; border: 0; color: #8b949e; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s; white-space: nowrap; }
.btn-group button:not(:last-child) { border-right: 1px solid #30363d; }
.btn-group button:hover { background: #21262d; color: #e6edf3; }
.btn-group button.active { background: #21262d; color: #e6edf3; }
.group-filter { display: flex; flex-wrap: wrap; gap: 4px; }
.group-btn { padding: 4px 10px; background: none; border: 1px solid #30363d; border-radius: 4px; color: #8b949e; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
.group-btn:hover { background: #21262d; color: #e6edf3; }
.group-btn.active { background: #21262d; color: #e6edf3; border-color: #388bfd; }
.filter-count { font-size: 12px; color: #8b949e; font-variant-numeric: tabular-nums; white-space: nowrap; margin-left: 4px; }
</style>
