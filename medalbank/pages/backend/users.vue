<template>
  <div class="up-root">
    <div class="be-page-head">
      <div>
        <div class="be-page-title">Users</div>
        <div class="be-page-sub">users collection · {{ rows.length }} entries</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="be-filters">
      <input v-model="f.name" class="be-search" placeholder="이름 · 닉네임 · 이메일 검색…" @input="refresh" />
      <select v-model="f.role" class="be-sel" @change="refresh">
        <option value="">역할 전체</option>
        <option value="member">member</option>
        <option value="manager">manager</option>
        <option value="admin">admin</option>
      </select>
      <div class="be-filter-actions">
        <button class="be-reset"    @click="resetFilters">Reset</button>
        <button class="be-migrate"  :disabled="migrating" @click="migrateRoles" title="role 배열 → 문자열 변환">
          {{ migrating ? '변환 중…' : 'Fix Roles' }}
        </button>
        <button class="be-add"      @click="openNew">+ 추가</button>
      </div>
    </div>

    <!-- Table + Drawer -->
    <div class="up-body">
      <div class="up-content">
        <table v-if="rows.length" class="be-table">
          <thead>
            <tr>
              <th></th>
              <th>이름</th>
              <th>닉네임</th>
              <th>이메일</th>
              <th>역할</th>
              <th>가입일</th>
              <th>최종수정</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in rows" :key="r.id"
              class="row-clickable"
              :class="{ active: panel.open && panel.id === r.id }"
              @click="openPanel(r)"
            >
              <td class="td-avatar">
                <img v-if="r.avatar" :src="r.avatar" class="u-avatar" />
                <span v-else class="u-avatar-ph">{{ (r.name || r.nickname || '?')[0] }}</span>
              </td>
              <td class="td-name">{{ r.name }}</td>
              <td class="td-dim">{{ r.nickname }}</td>
              <td class="td-dim td-email">{{ r.email }}</td>
              <td><span class="role-tag" :class="`role-${r.role}`">{{ r.role }}</span></td>
              <td class="td-mono td-dim">{{ r.createdAt }}</td>
              <td class="td-mono td-dim">{{ r.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="be-empty">일치하는 사용자가 없습니다.</div>
      </div>

      <!-- Drawer -->
      <div v-if="panel.open" class="ep-backdrop" @click="closePanel">
        <div class="ep-panel" @click.stop>
          <div class="ep-head">
            <div class="ep-head-user">
              <img v-if="panel.form.avatar" :src="panel.form.avatar" class="ep-avatar" />
              <span v-else class="ep-avatar-ph">{{ (panel.form.name || panel.form.nickname || '?')[0] }}</span>
              <div>
                <div class="ep-title">{{ panel.id ? (panel.form.name || panel.form.nickname || '—') : '새 사용자' }}</div>
                <div class="ep-sub">{{ panel.id ? panel.form.email : '수동 등록' }}</div>
              </div>
            </div>
            <button class="ep-close" @click="closePanel">✕</button>
          </div>

          <div class="ep-body">

            <!-- 역할 — 가장 위 강조 -->
            <div class="ep-field">
              <label>역할 <span class="ep-req">*</span></label>
              <div style="display:flex; gap:8px; justify-content:center; width:100%;">
                <label v-for="r in ROLES" :key="r.value" class="role-radio" :class="`rr-${r.value}`">
                  <input type="radio" v-model="panel.form.role" :value="r.value" />
                  <span>{{ r.label }}</span>
                </label>
              </div>
            </div>

            <div class="ep-divider"></div>

            <!-- 이름 / 닉네임 -->
            <div class="ep-row">
              <div class="ep-field ep-field-half">
                <label>이름</label>
                <input v-model="panel.form.name" class="ep-inp" placeholder="홍길동" />
              </div>
              <div class="ep-field ep-field-half">
                <label>닉네임</label>
                <input v-model="panel.form.nickname" class="ep-inp" placeholder="닉네임" />
              </div>
            </div>

            <!-- 이메일 -->
            <div class="ep-field">
              <label>이메일</label>
              <input v-model="panel.form.email" class="ep-inp" placeholder="user@example.com" type="email" />
            </div>

            <!-- 연락처 -->
            <div class="ep-field">
              <label>연락처</label>
              <input v-model="panel.form.mobile" class="ep-inp ep-inp-mono" placeholder="010-0000-0000" />
            </div>

            <!-- 네이버ID (기존 유저면 readonly) -->
            <div class="ep-field">
              <label>네이버 ID</label>
              <input
                v-model="panel.form.naverId"
                class="ep-inp ep-inp-mono"
                :readonly="!!panel.id"
                :class="{ 'ep-readonly': !!panel.id }"
                placeholder="naver_user_id"
              />
            </div>

            <!-- 성별 -->
            <div class="ep-field">
              <label>성별</label>
              <select v-model="panel.form.gender" class="ep-inp ep-sel">
                <option value="">미설정</option>
                <option value="men">남자</option>
                <option value="women">여자</option>
              </select>
            </div>

            <!-- 가입일 (readonly) -->
            <div v-if="panel.id" class="ep-field">
              <label>가입일</label>
              <input :value="panel.form.createdAt" class="ep-inp ep-inp-mono ep-readonly" readonly />
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
useHead({ title: 'Users — 메달뱅크 Backend' })

const ROLES = [
  { value: 'member',  label: 'member'  },
  { value: 'manager', label: 'manager' },
  { value: 'admin',   label: 'admin'   },
] as const

interface UserRow {
  id:        string
  naverId:   string
  name:      string
  nickname:  string
  email:     string
  mobile:    string
  gender:    string
  role:      string
  avatar:    string
  createdAt: string
  updatedAt: string
}

const emptyForm = (): Omit<UserRow, 'id'> => ({
  naverId: '', name: '', nickname: '', email: '',
  mobile: '', gender: '', role: 'member',
  avatar: '', createdAt: '', updatedAt: '',
})

// ── Fix Roles 마이그레이션 ─────────────────────────────────────────
const migrating = ref(false)
async function migrateRoles() {
  if (migrating.value) return
  migrating.value = true
  try {
    const res = await $fetch<{ updated: number }>('/api/backend/migrate/user-roles', { method: 'POST' })
    alert(`완료: ${res.updated}건 변환됨`)
    await refresh()
  } catch (e: any) {
    alert(`실패: ${e?.statusMessage || e?.message || e}`)
  } finally {
    migrating.value = false
  }
}

// ── 필터 ──────────────────────────────────────────────────────────
const f = reactive({ name: '', role: '' })
function resetFilters() { Object.assign(f, { name: '', role: '' }); refresh() }

// ── 데이터 ────────────────────────────────────────────────────────
const rows = ref<UserRow[]>([])

async function refresh() {
  const params: Record<string, string> = {}
  if (f.name) params.name = f.name
  if (f.role) params.role = f.role
  rows.value = await $fetch<UserRow[]>('/api/backend/users', { params })
}

// ── Panel ─────────────────────────────────────────────────────────
const panel = reactive({
  open:   false,
  id:     '',
  saving: false,
  form:   emptyForm(),
})

function openPanel(r: UserRow) {
  panel.open   = true
  panel.id     = r.id
  panel.saving = false
  panel.form   = { ...r }
}
function openNew() {
  panel.open   = true
  panel.id     = ''
  panel.saving = false
  panel.form   = emptyForm()
}
function closePanel() {
  panel.open = false
  panel.id   = ''
}
function clearForm() {
  const keep = { naverId: panel.form.naverId, createdAt: panel.form.createdAt }
  panel.form = { ...emptyForm(), ...keep }
}

async function saveRow() {
  if (panel.saving) return
  panel.saving = true
  try {
    const { createdAt, updatedAt, ...payload } = panel.form
    if (panel.id) {
      await $fetch(`/api/backend/users/${panel.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/backend/users', { method: 'POST', body: payload })
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
  if (!confirm(`"${panel.form.name || panel.form.nickname}" 사용자를 삭제하시겠습니까?`)) return
  try {
    await $fetch(`/api/backend/users/${panel.id}`, { method: 'DELETE' })
    closePanel()
    await refresh()
  } catch (e: any) {
    alert(`삭제 실패: ${e?.statusMessage || e?.message || e}`)
  }
}

onMounted(() => refresh())
</script>

<style scoped>
.up-root { font-family: var(--sans); }

.be-page-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.be-page-title { font-size: 20px; font-weight: 700; color: #0a0a0a; }
.be-page-sub   { font-size: 12px; color: #aaa; margin-top: 2px; }

/* ── Filters ── */
.be-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 12px 0; border-bottom: 1px solid #e8e8e4; margin-bottom: 16px;
}
.be-search { height: 34px; padding: 0 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px; width: 260px; outline: none; }
.be-sel    { height: 34px; padding: 0 8px;  border: 1px solid #ddd; border-radius: 3px; font-size: 12.5px; background: #fff; outline: none; }
.be-search:focus, .be-sel:focus { border-color: #0a1d3a; }
.be-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.be-reset, .be-add {
  height: 34px; padding: 0 14px; font-size: 12px; cursor: pointer; border-radius: 3px; transition: background 0.15s;
}
.be-reset { border: 1px solid #ddd; background: #fff; color: #666; }
.be-reset:hover { background: #f0f0f0; }
.be-migrate { border: 1px solid #b45309; background: #fff; color: #b45309; }
.be-migrate:hover:not(:disabled) { background: #fffbeb; }
.be-migrate:disabled { opacity: 0.45; cursor: not-allowed; }
.be-add   { border: 1px solid #0a1d3a; background: #0a1d3a; color: #fff; }
.be-add:hover { background: #1a3560; }

/* ── Body ── */
.up-body    { position: relative; }
.up-content { overflow-x: auto; }

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
.td-avatar { width: 36px; padding: 4px 8px !important; }
.td-name   { font-weight: 500; }
.td-dim    { color: #777; font-size: 12px; }
.td-email  { max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.td-mono   { font-family: var(--mono); font-size: 11.5px; }
.be-empty  { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

/* avatars */
.u-avatar    { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; display: block; }
.u-avatar-ph {
  width: 28px; height: 28px; border-radius: 50%; background: #e0e7ef;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #4a6fa5;
}

/* role tags */
.role-tag {
  display: inline-block; font-size: 10.5px; font-weight: 700;
  padding: 2px 7px; border-radius: 3px; letter-spacing: 0.06em;
}
.role-member  { background: #f1f5f9; color: #475569; }
.role-manager { background: #fef9c3; color: #854d0e; }
.role-admin   { background: #dcfce7; color: #166534; }

/* ── Drawer ── */
.ep-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200;
  display: flex; justify-content: flex-end;
}
.ep-panel {
  width: 380px; max-width: 100%; background: #fff; display: flex; flex-direction: column;
  height: 100vh; overflow: hidden; box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  animation: ep-in 0.18s ease;
}
@keyframes ep-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }

.ep-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #eee; flex-shrink: 0;
  background: #0a1d3a;
}
.ep-head-user { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ep-avatar    { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.ep-avatar-ph {
  width: 38px; height: 38px; border-radius: 50%; background: #1e3a5f;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: #93c5fd; flex-shrink: 0;
}
.ep-title { font-size: 14px; font-weight: 700; color: #fff; }
.ep-sub   { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.ep-close { border: 0; background: transparent; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0; flex-shrink: 0; }
.ep-close:hover { color: #fff; }

.ep-body  { flex: 1; overflow-y: auto; padding: 16px 20px; }
.ep-field { margin-bottom: 14px; }
.ep-row   { display: flex; gap: 12px; }
.ep-field-half { flex: 1; min-width: 0; }
.ep-divider { border: 0; border-top: 1px solid #f0f0f0; margin: 4px 0 16px; }
.ep-field > label {
  display: block; font-size: 10.5px; font-weight: 600; color: #888;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px;
}
.ep-req { color: #ef4444; }
.ep-inp {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid #e0e0e0; border-radius: 3px;
  font-family: var(--sans); font-size: 13px; color: #0a0a0a;
  background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.15s;
}
.ep-inp:focus   { border-color: #3b82f6; }
.ep-inp-mono    { font-family: var(--mono); }
.ep-sel         { cursor: pointer; }
.ep-readonly    { background: #f5f5f3; color: #888; cursor: not-allowed; }

/* ── Role radio ── */
.role-radio-group {
  display: flex; gap: 8px; width: 100%;
  justify-content: center; align-items: center;
}
.role-radio {
  flex: 0 0 96px;
  display: flex; align-items: center; justify-content: center;
  height: 36px; border: 2px solid #e0e0e0; border-radius: 4px;
  font-size: 12.5px; font-weight: 600; cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  color: #888;
}
.role-radio input { display: none; }
.role-radio:has(input:checked) { border-color: currentColor; }
.rr-member:has(input:checked)  { background: #f1f5f9; color: #475569; border-color: #94a3b8; }
.rr-manager:has(input:checked) { background: #fef9c3; color: #854d0e; border-color: #ca8a04; }
.rr-admin:has(input:checked)   { background: #dcfce7; color: #166534; border-color: #16a34a; }

/* ── Footer ── */
.ep-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid #eee; flex-shrink: 0; background: #fafafa;
}
.ep-foot-right { display: flex; gap: 8px; }
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
</style>
