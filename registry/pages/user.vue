<template>
  <div>
    <!-- ── stub-shell ─────────────────────────────────────── -->
    <div class="stub-shell">
      <div class="user-shell-inner">
        <div class="eyebrow">MY ACCOUNT · 내 계정</div>
        <h1>My <span class="em">Account.</span></h1>
        <p class="lede">{{ user?.name || '—' }}</p>
        <div class="stub-foot">
          <span class="online-dot"></span> 로그인됨
        </div>
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

      <!-- 기여하기 -->
      <section class="block">
        <div class="block-head">
          <h2>기여<span class="em">하기.</span></h2>
          <span class="meta">CONTRIBUTE</span>
        </div>

        <p class="contrib-notice">
          이곳에 적는 내용은 모두 비공개로 통계에만 활용되며, 개인정보는 타인에게 공개되지 않습니다.
        </p>

        <div class="contrib-fields">

          <!-- 키 -->
          <div class="contrib-row">
            <span class="contrib-lbl">키</span>
            <input
              type="range" min="140" max="220" step="1"
              class="contrib-slider" :class="{ 'is-empty': height == null }"
              :value="height ?? 170"
              @input="height = Number(($event.target as HTMLInputElement).value)"
            />
            <span class="contrib-val" :class="{ empty: height == null }">
              {{ height != null ? height + 'cm' : '미입력' }}
            </span>
            <button v-if="height != null" class="contrib-clear" type="button" @click="height = null">×</button>
            <span v-else></span>
          </div>

          <!-- 몸무게 -->
          <div class="contrib-row">
            <span class="contrib-lbl">몸무게</span>
            <input
              type="range" min="40" max="150" step="1"
              class="contrib-slider" :class="{ 'is-empty': weight == null }"
              :value="weight ?? 75"
              @input="weight = Number(($event.target as HTMLInputElement).value)"
            />
            <span class="contrib-val" :class="{ empty: weight == null }">
              {{ weight != null ? weight + 'kg' : '미입력' }}
            </span>
            <button v-if="weight != null" class="contrib-clear" type="button" @click="weight = null">×</button>
            <span v-else></span>
          </div>

          <!-- 발사이즈 -->
          <div class="contrib-row">
            <span class="contrib-lbl">발사이즈</span>
            <input
              type="range" min="220" max="310" step="5"
              class="contrib-slider" :class="{ 'is-empty': footSize == null }"
              :value="footSize ?? 260"
              @input="footSize = Number(($event.target as HTMLInputElement).value)"
            />
            <span class="contrib-val" :class="{ empty: footSize == null }">
              {{ footSize != null ? footSize + 'mm' : '미입력' }}
            </span>
            <button v-if="footSize != null" class="contrib-clear" type="button" @click="footSize = null">×</button>
            <span v-else></span>
          </div>

          <!-- 혈액형 -->
          <div class="contrib-row contrib-row-select">
            <span class="contrib-lbl">혈액형</span>
            <select class="contrib-select" v-model="bloodType">
              <option value="">선택 안함</option>
              <option value="A">A형</option>
              <option value="B">B형</option>
              <option value="AB">AB형</option>
              <option value="O">O형</option>
            </select>
          </div>

          <!-- MBTI -->
          <div class="contrib-row contrib-row-select">
            <span class="contrib-lbl">MBTI</span>
            <select class="contrib-select" v-model="mbti">
              <option value="">선택 안함</option>
              <option v-for="t in MBTI_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

        </div>

        <p class="contrib-confirm">
          이곳에 적는 내용은 필수가 아닙니다. 입력해주시는 내용은 '통계 페이지'에 활용됩니다.
          허위기록시 추후 등재 거부 될 수 있습니다. 감사합니다.
        </p>

        <div class="pb-actions">
          <button class="btn-save" type="button" :disabled="contribSaving" @click="saveContrib">
            {{ contribSaving ? '저장 중…' : '저장하기' }}
          </button>
          <span v-if="contribSavedMsg" class="save-ts">{{ contribSavedMsg }}</span>
        </div>
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
  </div>
</template>

<script setup lang="ts">
useHead({ title: '내 계정 — 메달뱅크 · Medalbank' })

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

// ── 기여하기 상태 ──────────────────────────────────────────
const MBTI_TYPES = [
  'ISTJ','ISFJ','INFJ','INTJ',
  'ISTP','ISFP','INFP','INTP',
  'ESTP','ESFP','ENFP','ENTP',
  'ESTJ','ESFJ','ENFJ','ENTJ',
]

const height    = ref<number | null>(null)
const weight    = ref<number | null>(null)
const footSize  = ref<number | null>(null)
const bloodType = ref('')
const mbti      = ref('')

const contribSaving   = ref(false)
const contribSavedMsg = ref('')

onMounted(async () => {
  try {
    const data = await $fetch<Record<string, any>>('/api/user/contrib')
    if (data.height   != null) height.value   = Number(data.height)
    if (data.weight   != null) weight.value   = Number(data.weight)
    if (data.footSize != null) footSize.value = Number(data.footSize)
    if (data.bloodType) bloodType.value = data.bloodType
    if (data.mbti)      mbti.value      = data.mbti
  } catch {}
})

async function saveContrib() {
  if (contribSaving.value) return
  contribSaving.value = true
  contribSavedMsg.value = ''
  try {
    await $fetch('/api/user/contrib', {
      method: 'POST',
      body: {
        height:    height.value,
        weight:    weight.value,
        footSize:  footSize.value,
        bloodType: bloodType.value || null,
        mbti:      mbti.value      || null,
      },
    })
    contribSavedMsg.value = '저장됐습니다.'
    setTimeout(() => { contribSavedMsg.value = '' }, 3000)
  } catch {
    contribSavedMsg.value = '저장에 실패했습니다.'
  } finally {
    contribSaving.value = false
  }
}
</script>

<style scoped>
/* ── 내부 max-width 래퍼 ────────────────────────────────── */
.stub-shell {
  padding-left: 0;
  padding-right: 0;
}
.user-shell-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--pad-x);
}
.page-body {
  max-width: 900px;
}

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

/* ── 기여하기 ───────────────────────────────────────────── */
.contrib-notice {
  font-family: var(--serif-ko);
  font-size: 14px;
  color: var(--fg-dim);
  line-height: 1.8;
  margin: 0 0 32px;
  max-width: 640px;
}

.contrib-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
  margin-bottom: 32px;
}

.contrib-row {
  display: grid;
  grid-template-columns: 90px 1fr 72px 28px;
  align-items: center;
  gap: 0 16px;
}
.contrib-row-select {
  grid-template-columns: 90px 200px;
}

.contrib-lbl {
  font-family: var(--sans);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--fg-dim);
  white-space: nowrap;
}

.contrib-slider {
  width: 100%;
  accent-color: var(--accent);
  cursor: pointer;
  transition: opacity 0.15s;
}
.contrib-slider.is-empty {
  opacity: 0.3;
}

.contrib-val {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--fg);
  text-align: right;
  white-space: nowrap;
}
.contrib-val.empty {
  font-family: var(--sans);
  font-size: 11.5px;
  font-weight: 400;
  color: var(--fg-mute);
}

.contrib-clear {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: transparent;
  font-size: 13px;
  line-height: 1;
  color: var(--fg-mute);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: border-color 0.12s, color 0.12s;
  flex-shrink: 0;
}
.contrib-clear:hover {
  border-color: var(--fg-dim);
  color: var(--fg);
}

.contrib-select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--line);
  background: var(--bg);
  font-family: var(--sans);
  font-size: 13px;
  color: var(--fg);
  border-radius: 3px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.contrib-select:focus { border-color: var(--accent); }

.contrib-confirm {
  font-family: var(--serif-ko);
  font-size: 13px;
  color: var(--fg-faint);
  line-height: 1.85;
  margin: 0 0 28px;
  max-width: 640px;
  border-left: 2px solid var(--line);
  padding-left: 14px;
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

/* ── 모바일 ────────────────────────────────────────────── */
@media (max-width: 760px) {
  .info-table th { width: 90px; }
  .contrib-row {
    grid-template-columns: 72px 1fr 60px 24px;
    gap: 0 10px;
  }
  .contrib-row-select {
    grid-template-columns: 72px 1fr;
  }
  .pb-actions { flex-direction: column; align-items: flex-start; }
}
</style>
