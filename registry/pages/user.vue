<template>
  <div>
    <!-- ── stub-shell ─────────────────────────────────────── -->
    <div class="stub-shell">
      <div class="eyebrow">MY ACCOUNT · 내 계정</div>
      <h1>My <span class="em">Account.</span></h1>
      <p class="lede">{{ user?.name || '—' }}</p>
      <div class="stub-foot">
        <span class="online-dot"></span> 로그인됨
      </div>
    </div>

    <!-- ── page-body ──────────────────────────────────────── -->
    <div class="page-body">

      <!-- 내 정보 -->
      <section class="block">
        <div class="block-head">
          <h2>내 <span class="em">정보.</span></h2>
          <span class="meta">PROFILE</span>
        </div>
        <table class="info-table">
          <tbody>
            <tr>
              <th>이름</th>
              <td class="val-strong">{{ user?.name || '—' }}</td>
              <td><span class="badge badge-pub">공개</span></td>
            </tr>
            <tr>
              <th>네이버 아이디</th>
              <td>{{ (user as any)?.email || '—' }}</td>
              <td><span class="badge badge-priv">비공개</span></td>
            </tr>
            <tr>
              <th>성별</th>
              <td>{{ genderLabel }}</td>
              <td><span class="badge badge-priv">비공개</span></td>
            </tr>
            <tr>
              <th>생년월일</th>
              <td>{{ dobLabel }}</td>
              <td><span class="badge badge-priv">비공개</span></td>
            </tr>
          </tbody>
        </table>
        <p class="info-note">
          <strong>이름</strong>은 기록 제보 시 실명으로 사용됩니다.
          나머지 정보는 로그인·본인인증 목적으로만 사용되며 타인에게 공개되지 않습니다.
        </p>
      </section>

      <!-- 나의 최고기록 -->
      <section class="block">
        <div class="block-head">
          <h2>나의 <span class="em">최고기록.</span></h2>
          <span class="meta">PERSONAL BESTS</span>
        </div>

        <div v-if="pbLoading" class="empty-state">불러오는 중…</div>
        <template v-else>
          <div v-for="group in EVENTS" :key="group.disc" class="pb-group">
            <div class="pb-group-label">{{ group.label }}</div>
            <table class="index-table pb-table">
              <thead>
                <tr>
                  <th class="c-rank">종목</th>
                  <th class="c-name">이름</th>
                  <th class="c-city">도시</th>
                  <th class="c-date">일자</th>
                  <th class="c-meet">대회명</th>
                  <th class="c-time">기록</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dist in group.dists" :key="`${group.disc}-${dist}`">
                  <td class="rank">{{ dist }}</td>
                  <td class="name">
                    <span class="fixed-name">{{ user?.name || '—' }}</span>
                  </td>
                  <td class="city">
                    <input
                      class="pb-inp"
                      type="text"
                      placeholder="—"
                      :value="getField(group.disc, dist, 'city')"
                      @input="setField(group.disc, dist, 'city', ($event.target as HTMLInputElement).value)"
                    />
                  </td>
                  <td class="date">
                    <input
                      class="pb-inp"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      :value="getField(group.disc, dist, 'date')"
                      @input="setField(group.disc, dist, 'date', ($event.target as HTMLInputElement).value)"
                    />
                  </td>
                  <td class="meet">
                    <input
                      class="pb-inp pb-inp-wide"
                      type="text"
                      placeholder="—"
                      :value="getField(group.disc, dist, 'meet')"
                      @input="setField(group.disc, dist, 'meet', ($event.target as HTMLInputElement).value)"
                    />
                  </td>
                  <td class="time">
                    <input
                      class="pb-inp pb-inp-time"
                      type="text"
                      placeholder="0:00.00"
                      :value="getField(group.disc, dist, 'time')"
                      @input="setField(group.disc, dist, 'time', ($event.target as HTMLInputElement).value)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="pb-guide">
            희망시, 본인의 최고기록 (공인기록)을 적고 저장버튼을 눌러주세요.<br>
            실제 등재부에 등재됩니다. 허위기록시 추후 등재요청이 거부 될 수 있습니다.
          </p>

          <div class="pb-actions">
            <button
              class="btn-save"
              :class="{ dirty: isDirty, saving: isSaving }"
              :disabled="isSaving"
              @click="savePbs"
            >
              {{ isSaving ? '저장 중…' : '저장하기' }}
            </button>
            <span v-if="lastSaved" class="save-ts">마지막 저장: {{ lastSaved }}</span>
          </div>
        </template>
      </section>

      <!-- 로그아웃 -->
      <section class="block">
        <div class="block-head">
          <h2>로그아웃.</h2>
          <span class="meta">SESSION</span>
        </div>
        <p class="logout-note">
          로그아웃 전까지 로그인 상태가 유지됩니다.
          이 기기를 공유한다면 사용 후 반드시 로그아웃하세요.
        </p>
        <form action="/auth/logout" method="post">
          <button type="submit" class="btn-logout">로그아웃</button>
        </form>
      </section>

    </div>

    <!-- ── 이탈 경고 다이얼로그 ────────────────────────────── -->
    <Transition name="fade">
      <div v-if="showLeaveDialog" class="leave-overlay" @click.self="onLeaveCancel">
        <div class="leave-dialog">
          <p class="leave-msg">저장되지 않은 변경사항이 있습니다.</p>
          <div class="leave-btns">
            <button class="leave-btn leave-save" @click="onLeaveSave">저장 후 이동</button>
            <button class="leave-btn leave-discard" @click="onLeaveDiscard">변경사항 무시</button>
            <button class="leave-btn leave-cancel" @click="onLeaveCancel">취소</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '내 계정 — KSR · Korean Swimming Registry' })

const { loggedIn, user } = useUserSession()
if (!loggedIn.value) await navigateTo('/login')

// ── 계정 정보 ─────────────────────────────────────────────
const genderLabel = computed(() => {
  const g = (user.value as any)?.gender
  if (g === 'M') return '남성'
  if (g === 'F') return '여성'
  return '—'
})

const dobLabel = computed(() => {
  const u = user.value as any
  const year = u?.birthyear
  const mmdd = u?.birthday
  if (!year && !mmdd) return '—'
  if (year && mmdd) {
    const [m, d] = mmdd.split('-')
    return `${year}년 ${parseInt(m)}월 ${parseInt(d)}일`
  }
  return year || mmdd || '—'
})

// ── 종목 정의 ─────────────────────────────────────────────
const EVENTS = [
  { disc: 'FR', label: '자유형',   dists: ['50M','100M','200M','400M','800M','1500M'] },
  { disc: 'BK', label: '배영',     dists: ['50M','100M','200M'] },
  { disc: 'BR', label: '평영',     dists: ['50M','100M','200M'] },
  { disc: 'FL', label: '접영',     dists: ['50M','100M','200M'] },
  { disc: 'IM', label: '개인혼영', dists: ['200M','400M'] },
]

// ── PB 폼 상태 ────────────────────────────────────────────
interface PbEntry { city: string; date: string; meet: string; time: string }
type PbMap = Record<string, PbEntry>

const pbLoading = ref(true)
const form = ref<PbMap>({})
const savedSnapshot = ref<string>('')
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value)

const isSaving = ref(false)
const lastSaved = ref('')

function pbKey(disc: string, dist: string) { return `${disc}-${dist}` }

function getField(disc: string, dist: string, field: keyof PbEntry): string {
  return form.value[pbKey(disc, dist)]?.[field] ?? ''
}

function setField(disc: string, dist: string, field: keyof PbEntry, val: string) {
  const key = pbKey(disc, dist)
  if (!form.value[key]) {
    form.value[key] = { city: '', date: '', meet: '', time: '' }
  }
  form.value[key][field] = val
}

// ── 초기 로드 ─────────────────────────────────────────────
onMounted(async () => {
  try {
    const data = await $fetch<PbMap>('/api/user/pb')
    form.value = data ?? {}
    savedSnapshot.value = JSON.stringify(form.value)
  } catch {
    // 미저장 상태로 시작
  } finally {
    pbLoading.value = false
  }
})

// ── 저장 ──────────────────────────────────────────────────
async function savePbs() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    await $fetch('/api/user/pb', { method: 'POST', body: { pbs: form.value } })
    savedSnapshot.value = JSON.stringify(form.value)
    const now = new Date()
    lastSaved.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
  } catch (e) {
    alert('저장에 실패했습니다. 다시 시도해 주세요.')
  } finally {
    isSaving.value = false
  }
}

// ── 이탈 경고 ─────────────────────────────────────────────
const showLeaveDialog = ref(false)
let leaveResolve: ((v: boolean) => void) | null = null

function onLeaveDiscard() {
  showLeaveDialog.value = false
  leaveResolve?.(true)
  leaveResolve = null
}

async function onLeaveSave() {
  await savePbs()
  showLeaveDialog.value = false
  leaveResolve?.(true)
  leaveResolve = null
}

function onLeaveCancel() {
  showLeaveDialog.value = false
  leaveResolve?.(false)
  leaveResolve = null
}

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true
  showLeaveDialog.value = true
  return new Promise<boolean>((resolve) => { leaveResolve = resolve })
})

function beforeUnloadHandler(e: BeforeUnloadEvent) {
  if (isDirty.value) { e.preventDefault(); e.returnValue = '' }
}

onMounted(() => window.addEventListener('beforeunload', beforeUnloadHandler))
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnloadHandler))
</script>

<style scoped>
/* stub-foot 상태 표시 */
.stub-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-faint);
  margin-top: 40px;
}
.online-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}

/* ── 내 정보 테이블 ────────────────────────────────────── */
.info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--line);
  max-width: 640px;
  margin-bottom: 20px;
}
.info-table th, .info-table td {
  padding: 13px 18px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
  text-align: left;
}
.info-table tr:last-child th,
.info-table tr:last-child td { border-bottom: 0; }
.info-table th {
  font-size: 11.5px;
  color: var(--fg-faint);
  letter-spacing: 0.04em;
  font-weight: 400;
  width: 130px;
  white-space: nowrap;
}
.info-table td {
  font-size: 14px;
  color: var(--fg);
}
.val-strong { font-weight: 600; }

.badge {
  display: inline-block;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 2px 7px;
  border-radius: 2px;
  white-space: nowrap;
}
.badge-pub  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.badge-priv { background: var(--bg-soft); color: var(--fg-mute); border: 1px solid var(--line); }

.info-note {
  font-size: 12.5px;
  color: var(--fg-faint);
  line-height: 1.8;
  margin: 0;
  max-width: 640px;
}
.info-note strong { color: var(--fg-dim); }

/* ── PB 종목별 그룹 ────────────────────────────────────── */
.pb-group {
  margin-bottom: 40px;
}
.pb-group-label {
  font-family: var(--sans);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fg-faint);
  padding-bottom: 10px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--line);
}

/* index-table 스타일 + 입력칸 오버라이드 */
.pb-table { margin-bottom: 0; }
.pb-table .rank {
  font-family: var(--sans);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--fg-dim);
  white-space: nowrap;
}
.fixed-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--fg);
}
.pb-inp {
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  outline: none;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--fg);
  padding: 3px 0;
  transition: border-color 0.15s;
}
.pb-inp:focus { border-bottom-color: var(--accent); }
.pb-inp::placeholder { color: var(--fg-mute); }
.pb-inp-wide { min-width: 120px; }
.pb-inp-time {
  text-align: right;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

/* ── 안내 문구 ─────────────────────────────────────────── */
.pb-guide {
  font-size: 12px;
  color: var(--fg-mute);
  line-height: 1.9;
  margin: 0 0 28px;
}

/* ── 저장 버튼 ─────────────────────────────────────────── */
.pb-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.btn-save {
  height: 40px;
  padding: 0 28px;
  background: var(--accent);
  color: #fff;
  border: 0;
  border-radius: 3px;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-save:disabled { opacity: 0.5; cursor: default; }
.btn-save.dirty:not(:disabled) { opacity: 1; }
.btn-save:not(.dirty):not(.saving) { opacity: 0.45; }
.save-ts {
  font-size: 11.5px;
  color: var(--fg-mute);
  letter-spacing: 0.04em;
}

/* ── 로그아웃 ──────────────────────────────────────────── */
.logout-note {
  font-size: 13px;
  color: var(--fg-faint);
  line-height: 1.8;
  margin: 0 0 24px;
  max-width: 560px;
}
.btn-logout {
  height: 40px;
  padding: 0 24px;
  border: 1px solid var(--line);
  background: transparent;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--fg-dim);
  cursor: pointer;
  border-radius: 3px;
  transition: border-color 0.15s, color 0.15s;
}
.btn-logout:hover { border-color: #ef4444; color: #ef4444; }

/* ── 이탈 다이얼로그 ───────────────────────────────────── */
.leave-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.leave-dialog {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 36px 40px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.leave-msg {
  font-family: var(--serif-ko);
  font-size: 17px;
  line-height: 1.7;
  color: var(--fg);
  margin: 0;
  text-align: center;
}
.leave-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.leave-btn {
  height: 42px;
  border-radius: 3px;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--line);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.leave-save    { background: var(--accent); color: #fff; border-color: var(--accent); }
.leave-discard { background: transparent; color: var(--fg-dim); }
.leave-cancel  { background: transparent; color: var(--fg-mute); }
.leave-save:hover    { opacity: 0.88; }
.leave-discard:hover { border-color: var(--fg-dim); }
.leave-cancel:hover  { color: var(--fg); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── 모바일 ────────────────────────────────────────────── */
@media (max-width: 760px) {
  .info-table th { width: 90px; }
  .pb-inp-wide { min-width: 80px; }
  .leave-dialog { padding: 28px 20px; }
  .pb-actions { flex-direction: column; align-items: flex-start; }
}
</style>
