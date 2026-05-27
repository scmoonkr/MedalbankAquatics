<template>
  <Teleport to="body">
    <div v-if="open" class="sm-overlay" @click.self="close">
      <div class="sm-modal" role="dialog" aria-modal="true" aria-labelledby="smTitle">
        <button class="sm-close" type="button" aria-label="닫기" @click="close">×</button>

        <!-- 로그인 필요 -->
        <template v-if="!loggedIn">
          <div class="sm-head">
            <div class="sm-eyebrow">제보하기 · SUBMIT</div>
            <h2 id="smTitle">로그인이 필요합니다.</h2>
            <p class="sm-desc">기록 제보는 로그인 후 이용할 수 있습니다.<br/>제보자는 실명으로 영구 등재됩니다.</p>
          </div>
          <div class="sm-login-cta">
            <a href="/auth/naver" class="sm-btn-naver">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
              네이버로 로그인
            </a>
          </div>
        </template>

        <!-- 폼 -->
        <template v-else-if="!done">
          <div class="sm-head">
            <div class="sm-eyebrow">제보하기 · SUBMIT</div>
            <h2 id="smTitle" :class="{ 'is-dynamic': isDirtyTitle }">{{ modalTitle }}</h2>
            <p class="sm-desc">제보된 내용은 담당자 검수 후 등재됩니다. 제보자는 실명으로 영구 등재됩니다.</p>
          </div>

          <form class="sm-form" @submit.prevent="submit">

            <input type="hidden" v-model.number="form.timeID" />

            <div class="sm-grid">

              <!-- 성명 -->
              <div class="sm-field sm-span2">
                <label>성명 <span class="req">*</span></label>
                <input v-model="form.name" type="text" placeholder="홍길동" required />
              </div>

              <!-- 기록 -->
              <div class="sm-field">
                <label>기록 <span class="req">*</span></label>
                <input
                  v-model="form.time"
                  type="text"
                  placeholder="00:00.00"
                  :class="{ 'input-error': timeError }"
                  required
                  @change="onTimeChange"
                />
                <span v-if="timeError" class="sm-field-error">{{ timeError }}</span>
                <span v-else class="sm-hint">숫자만 입력해도 mm:ss.tt 형식으로 정리돼요</span>
              </div>

              <!-- 순위 -->
              <div class="sm-field">
                <label>순위</label>
                <input v-model.number="form.rank" type="number" min="1" placeholder="1" />
              </div>

              <!-- 구분 -->
              <div class="sm-field">
                <label>구분 <span class="req">*</span></label>
                <select v-model="form.isMasters" @change="onDivisionChange">
                  <option :value="false">전문체육 (Elite)</option>
                  <option :value="true">마스터즈 (Masters)</option>
                </select>
              </div>

              <!-- 연령부 -->
              <div class="sm-field">
                <label>연령부 <span class="req">*</span></label>
                <select v-model="form.group">
                  <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>

              <!-- 성별 -->
              <div class="sm-field">
                <label>성별 <span class="req">*</span></label>
                <select v-model="form.gender">
                  <option value="men">남자</option>
                  <option value="women">여자</option>
                </select>
              </div>

              <!-- 영법 -->
              <div class="sm-field">
                <label>영법 <span class="req">*</span></label>
                <select v-model="form.discipline">
                  <option value="FR">자유형 (FR)</option>
                  <option value="BK">배영 (BK)</option>
                  <option value="BR">평영 (BR)</option>
                  <option value="FL">접영 (FL)</option>
                  <option value="IM">개인혼영 (IM)</option>
                </select>
              </div>

              <!-- 코스 -->
              <div class="sm-field">
                <label>코스 <span class="req">*</span></label>
                <select v-model="form.course" @change="onCourseChange">
                  <option value="LCM">LCM</option>
                  <option value="SCM">SCM</option>
                </select>
              </div>

              <!-- 거리 -->
              <div class="sm-field">
                <label>거리 <span class="req">*</span></label>
                <select v-model="form.distance">
                  <option v-for="d in availableDistances" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>

              <!-- 시도 -->
              <div class="sm-field">
                <label>시도</label>
                <select v-model="form.sido">
                  <option value="">선택</option>
                  <option v-for="s in SIDOS" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <!-- 소속 -->
              <div class="sm-field">
                <label>소속</label>
                <input v-model="form.team" type="text" placeholder="소속팀·클럽" />
              </div>

              <!-- 대회일 -->
              <div class="sm-field">
                <label>대회일 <span class="req">*</span></label>
                <input v-model="form.datetime" type="date" required />
              </div>

              <!-- 대회명 -->
              <div class="sm-field sm-span2">
                <label>대회명 <span class="req">*</span></label>
                <input v-model="form.competitionName" type="text" placeholder="2024 전국체육대회" required />
              </div>

              <!-- 풀 -->
              <div class="sm-field sm-span2">
                <label>경기장</label>
                <input v-model="form.pool" type="text" placeholder="잠실실내수영장" />
              </div>

              <!-- 비고 -->
              <div class="sm-field sm-span2">
                <label>비고</label>
                <textarea v-model="form.note" rows="2" placeholder="추가로 전달할 내용이 있으면 입력해 주세요." />
              </div>

            </div>

            <!-- 증빙자료 -->
            <div class="sm-evidence">
              <div class="sm-ev-head">
                증빙자료
                <span class="sm-hint">각 종류별 사진 1장씩 첨부 가능</span>
              </div>
              <div class="sm-ev-btns">
                <div v-for="slot in EV_SLOTS" :key="slot.key" class="sm-ev-slot">
                  <label class="sm-ev-btn" :class="{ 'has-file': !!evPhoto[slot.key] }">
                    <span class="sm-ev-btn-label">{{ slot.label }}</span>
                    <span v-if="evPhoto[slot.key]" class="sm-ev-fname">{{ evPhoto[slot.key]!.name }}</span>
                    <input type="file" accept="image/*" hidden
                      @change="(e) => onEvPhoto(slot.key, (e.target as HTMLInputElement).files?.[0] ?? null)" />
                  </label>
                  <button v-if="evPhoto[slot.key]" class="sm-file-clear" type="button"
                    @click="onEvPhoto(slot.key, null)">×</button>
                </div>
              </div>
            </div>

            <div v-if="error" class="sm-error">{{ error }}</div>

            <div class="sm-footer">
              <button type="button" class="sm-btn-cancel" @click="close">취소</button>
              <button type="submit" class="sm-btn-submit">제보하기 →</button>
            </div>

          </form>
        </template>

        <!-- 완료 -->
        <div v-if="done" class="sm-done">
          <div class="sm-done-icon">✓</div>
          <h3>제보가 완료되었습니다.</h3>
          <p>소중한 제보 감사합니다.<br>기록지 내용 검토 후 일괄 반영하겠습니다. 감사합니다.</p>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; initialTimeID?: number; initialData?: Partial<ReturnType<typeof defaultForm>> }>()
const emit  = defineEmits<{ (e: 'close'): void }>()

const { loggedIn } = useUserSession()

const SIDOS = ['서울','경기','인천','강원','대전','충남','충북','세종','부산','대구','울산','경북','경남','광주','전북','전남','제주','해외']

const ELITE_GROUPS   = ['일반부','고등부','중등부','초등부','유년부']
const MASTERS_GROUPS = ['성인부','고등부','중등부','초등부','유년부']

const LCM_DISTS = ['50M','100M','200M','400M','800M','1500M']
const SCM_DISTS = ['25M','50M','100M','200M','400M','800M','1500M']

const DISC_KO: Record<string, string> = { FR:'자유형', BK:'배영', BR:'평영', FL:'접영', IM:'개인혼영' }

const EV_SLOTS = [
  { key: 'board'   as const, label: '전광판 사진' },
  { key: 'sheet'   as const, label: '기록지 사진' },
  { key: 'article' as const, label: '신문기사 사진' },
  { key: 'other'   as const, label: '기타 증빙사진' },
]

const defaultForm = () => ({
  timeID:          props.initialTimeID ?? 0,
  name:            '',
  time:            '',
  gender:          'men',
  isMasters:       false,
  group:           '일반부',
  discipline:      'FR',
  distance:        '50M',
  course:          'LCM',
  rank:            null as number | null,
  sido:            '',
  team:            '',
  datetime:        '',
  competitionName: '',
  pool:            '',
  note:            '',
})

const form = reactive(defaultForm())

const evPhoto = reactive<Record<'board'|'sheet'|'article'|'other', File | null>>({
  board: null, sheet: null, article: null, other: null,
})

function onEvPhoto(key: keyof typeof evPhoto, file: File | null) {
  evPhoto[key] = file
}

const submitting = ref(false)
const error      = ref('')
const timeError  = ref('')
const done       = ref(false)

function normalizeTimeInput(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  if (/^\d+$/.test(t)) {
    const d = t.padStart(6, '0').slice(-6)
    return `${d.slice(0,2)}:${d.slice(2,4)}.${d.slice(4,6)}`
  }
  if (t.includes(':')) {
    const [mRaw, rest = ''] = t.split(':', 2)
    const mm = mRaw.padStart(2, '0').slice(-2)
    if (rest.includes('.')) {
      const [sRaw, tRaw = ''] = rest.split('.', 2)
      return `${mm}:${sRaw.padStart(2,'0').slice(-2)}.${(tRaw+'00').slice(0,2)}`
    }
    return `${mm}:${rest.padStart(2,'0').slice(-2)}.00`
  }
  if (t.includes('.')) {
    const [sRaw, tRaw = ''] = t.split('.', 2)
    return `00:${sRaw.padStart(2,'0').slice(-2)}.${(tRaw+'00').slice(0,2)}`
  }
  return t
}
function isValidTime(n: string): boolean {
  const m = n.match(/^(\d{2}):(\d{2})\.\d{2}$/)
  if (!m) return false
  return +m[1] <= 59 && +m[2] <= 59
}
function onTimeChange(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  if (!raw.trim()) { timeError.value = ''; return }
  const normalized = normalizeTimeInput(raw)
  if (!isValidTime(normalized)) {
    timeError.value = '올바른 기록 형식이 아닙니다 (예: 01:23.45)'
    return
  }
  timeError.value = ''
  form.time = normalized
}

const availableGroups     = computed(() => form.isMasters ? MASTERS_GROUPS : ELITE_GROUPS)
const availableDistances  = computed(() => form.course === 'SCM' ? SCM_DISTS : LCM_DISTS)

// ── 동적 타이틀 ────────────────────────────────────────────
const isDirtyTitle = computed(() =>
  !!(form.name || form.time || form.datetime || form.competitionName)
)

const modalTitle = computed(() => {
  if (!isDirtyTitle.value) return '경기실적(기록) 직접 입력하기'
  const div  = form.isMasters ? '마스터즈' : '전문체육'
  const gen  = form.gender === 'men' ? '남자' : '여자'
  const disc = DISC_KO[form.discipline] ?? form.discipline
  const t    = form.time     || '00:00.00'
  const dt   = form.datetime || 'yyyy-mm-dd'
  const nm   = form.name     || '—'
  return `${div} ${gen} ${disc} ${form.distance} ${form.course} | ${t} | ${dt} | ${nm} 기록 등재 요청하기`
})

function onDivisionChange() {
  form.group = form.isMasters ? '성인부' : '일반부'
}
function onCourseChange() {
  if (!availableDistances.value.includes(form.distance)) {
    form.distance = availableDistances.value[0]
  }
}

function close() {
  emit('close')
}

watch(() => props.open, (v) => {
  if (v) {
    Object.assign(form, defaultForm())
    if (props.initialData) Object.assign(form, props.initialData)
    evPhoto.board = evPhoto.sheet = evPhoto.article = evPhoto.other = null
    error.value      = ''
    timeError.value  = ''
    done.value       = false
    submitting.value = false
  }
})

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
  return res.url
}

async function submit() {
  // 기록 형식 최종 검증
  if (form.time) {
    const normalized = normalizeTimeInput(form.time)
    if (!isValidTime(normalized)) {
      timeError.value = '올바른 기록 형식이 아닙니다 (예: 01:23.45)'
      return
    }
    form.time = normalized
  }

  // 즉시 완료 상태 전환 + 자동 닫기
  done.value = true
  setTimeout(() => close(), 3000)

  // API 제출은 백그라운드
  try {
    const [boardUrl, sheetUrl, articleUrl, otherUrl] = await Promise.all([
      evPhoto.board   ? uploadFile(evPhoto.board)   : Promise.resolve(''),
      evPhoto.sheet   ? uploadFile(evPhoto.sheet)   : Promise.resolve(''),
      evPhoto.article ? uploadFile(evPhoto.article) : Promise.resolve(''),
      evPhoto.other   ? uploadFile(evPhoto.other)   : Promise.resolve(''),
    ])
    await $fetch('/api/submit', {
      method: 'POST',
      body: {
        ...form,
        evidenceUrls: {
          board:   boardUrl   || null,
          sheet:   sheetUrl   || null,
          article: articleUrl || null,
          other:   otherUrl   || null,
        },
      },
    })
  } catch {}
}
</script>

<style scoped>
.sm-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 24px 16px 40px; overflow-y: auto;
}
.sm-modal {
  position: relative; width: 100%; max-width: 680px;
  background: var(--bg); border: 1px solid var(--line);
  padding: 48px 40px 40px;
  animation: smIn 0.18s ease;
}
@keyframes smIn {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sm-close {
  position: absolute; top: 16px; right: 20px;
  background: none; border: none; cursor: pointer;
  font-size: 22px; line-height: 1; color: var(--fg-mute);
  padding: 4px 8px;
}
.sm-close:hover { color: var(--fg); }

.sm-eyebrow {
  font-family: var(--sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--fg-faint);
  margin-bottom: 10px;
}
.sm-head h2 {
  font-family: var(--serif-ko); font-size: 26px; font-weight: 400;
  margin: 0 0 10px; transition: font-size 0.15s;
}
.sm-head h2.is-dynamic {
  font-size: 15px;
  line-height: 1.6;
  color: var(--fg-dim);
}
.sm-desc {
  font-family: var(--sans); font-size: 13px; color: var(--fg-mute);
  line-height: 1.6; margin: 0 0 28px;
}

/* Login CTA */
.sm-login-cta { display: flex; justify-content: center; padding: 16px 0 8px; }
.sm-btn-naver {
  display: inline-flex; align-items: center; gap: 10px;
  background: #03C75A; color: #fff;
  font-family: var(--sans); font-size: 14px; font-weight: 600;
  padding: 13px 28px; border: none; cursor: pointer;
  text-decoration: none;
}
.sm-btn-naver:hover { background: #02b350; }

/* Form grid */
.sm-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px;
  margin-bottom: 24px;
}
.sm-field { display: flex; flex-direction: column; gap: 6px; }
.sm-span2 { grid-column: 1 / -1; }

.sm-field label {
  font-family: var(--sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-mute);
}
.req { color: var(--accent, #c00); margin-left: 2px; }

.sm-field input,
.sm-field select,
.sm-field textarea {
  background: var(--bg-soft, #f8f8f8); border: 1px solid var(--line);
  color: var(--fg); font-family: var(--sans); font-size: 13px;
  padding: 9px 11px; outline: none;
  transition: border-color 0.15s;
}
.sm-field input:focus,
.sm-field select:focus,
.sm-field textarea:focus { border-color: var(--fg-mute); }
.sm-field textarea { resize: vertical; }
.sm-hint {
  font-family: var(--sans); font-size: 11px; color: var(--fg-faint);
  margin-top: -2px;
}
.sm-field-error {
  font-family: var(--sans); font-size: 11px; color: #c00;
  margin-top: -2px;
}
.sm-field input.input-error {
  border-color: #c00;
  outline-color: #c00;
}

/* 증빙자료 */
.sm-evidence {
  border-top: 1px solid var(--line);
  padding-top: 20px;
  margin-bottom: 24px;
}
.sm-ev-head {
  font-family: var(--sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-mute);
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
}
.sm-ev-btns {
  display: flex; flex-wrap: wrap; gap: 10px;
}
.sm-ev-slot {
  display: flex; align-items: center; gap: 4px;
}
.sm-ev-btn {
  display: inline-flex; flex-direction: column; gap: 3px;
  background: var(--bg-soft, #f8f8f8); border: 1px solid var(--line);
  font-family: var(--sans); font-size: 12px; font-weight: 500;
  color: var(--fg-dim); padding: 9px 14px; cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  max-width: 160px;
}
.sm-ev-btn:hover { border-color: var(--fg-mute); color: var(--fg); }
.sm-ev-btn.has-file { border-color: var(--accent); color: var(--fg); }
.sm-ev-btn-label { white-space: nowrap; }
.sm-ev-fname {
  font-size: 10px; color: var(--fg-faint); font-weight: 400;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 130px;
}
.sm-file-clear {
  background: none; border: none; cursor: pointer;
  color: var(--fg-mute); font-size: 16px; line-height: 1;
  padding: 2px 4px; flex-shrink: 0;
}
.sm-file-clear:hover { color: var(--fg); }

.sm-error {
  font-family: var(--sans); font-size: 13px; color: #c00;
  padding: 10px 14px; border: 1px solid #c00;
  margin-bottom: 16px;
}

.sm-footer {
  display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px;
}
.sm-btn-cancel {
  background: none; border: 1px solid var(--line);
  color: var(--fg-mute); font-family: var(--sans); font-size: 13px;
  padding: 10px 20px; cursor: pointer;
}
.sm-btn-cancel:hover { border-color: var(--fg-mute); color: var(--fg); }
.sm-btn-submit {
  background: var(--fg); color: var(--bg);
  border: none; font-family: var(--sans); font-size: 13px; font-weight: 500;
  padding: 10px 24px; cursor: pointer;
  transition: opacity 0.15s;
}
.sm-btn-submit:hover:not(:disabled) { opacity: 0.82; }
.sm-btn-submit:disabled { opacity: 0.4; cursor: default; }

/* Done state */
.sm-done {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px;
  text-align: center; padding: 60px 40px;
}
.sm-done-icon {
  font-size: 40px; color: #03C75A;
}
.sm-done h3 {
  font-family: var(--serif-ko); font-size: 22px; font-weight: 400; margin: 0;
}
.sm-done p {
  font-family: var(--serif-ko); font-size: 14px; line-height: 1.85;
  color: var(--fg-dim); margin: 0;
}

@media (max-width: 760px) {
  .sm-overlay { padding: 0; align-items: flex-start; }
  .sm-modal {
    border: 0; padding: 28px 22px 32px;
    min-height: 100vh; min-height: 100dvh;
    max-width: none; border-radius: 0;
  }
  .sm-grid { grid-template-columns: 1fr; }
  .sm-span2 { grid-column: 1; }
  .sm-ev-btns { gap: 8px; }
  .sm-ev-btn { font-size: 11px; padding: 8px 10px; }
}
</style>
