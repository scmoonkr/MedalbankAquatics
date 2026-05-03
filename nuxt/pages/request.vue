<template>
<main class="req-shell">

  <!-- ─── HERO ─── -->
  <section class="req-hero">
    <div class="eyebrow"><span class="num">00</span>Collaboration Request</div>
    <h1><span class="em">함께하고자</span> 합니다.</h1>
    <p class="lead">
      메달뱅크 취재팀의 참여를 원하시는 경우, 대회 정보를 남겨주시면
      <strong>일정 · 거리에 따라 가능 여부</strong>를 검토하겠습니다.
      일부 연맹 및 대회 담당자께서도 본 페이지를 모니터링하고 계십니다.
    </p>
  </section>

  <!-- ─── PREMIUM EDITION ─── -->
  <section class="sec reveal">
    <div class="sec-eyebrow"><span class="num">01</span>Premium Edition · 정식 의뢰</div>
    <h2>일반 촬영 및 수영대회가 아닌 촬영.</h2>

    <div class="paid-box">
      <div>
        <span class="badge">Premium</span>
        <h3>장비 · 인건비 · 출장비 포함, 하이라이트 300장+</h3>
        <p class="desc">
          연맹·대회 측의 데크 액세스 제공이 어려운 상황에서 정식 의뢰 형태로 진행됩니다.
          medalbankaquatics.com에 대회명과 함께 공유되며, 단체·팀·클럽 단위 사전 의뢰도 가능합니다.
        </p>
      </div>
      <div class="price-block">
        <div class="price">₩1,200,000</div>
        <div class="unit">/ 명 / 일</div>
        <div class="free-note">※ 프레스패스 지급 시 Community Edition으로 전환됩니다.</div>
      </div>
    </div>
  </section>

  <!-- ─── COMMUNITY EDITION ─── -->
  <section class="sec reveal">
    <div class="sec-eyebrow"><span class="num">02</span>Community Edition · 협업 패키지</div>
    <h2>촬영부터 공유까지,<br /><span class="em">한 흐름으로.</span></h2>
    <p>
      <strong>연맹·대회·수영장 측의 승인 하에 데크레벨(수영장층) 입장 승인이 가능한 수영 대회</strong>에 한해,
      아래 네 가지 서비스를 아무런 비용 없이 모두 제공합니다.
      촬영이 끝난 후, 모든 사진은 각 선수 또는 보호자의 동의 절차가 완료된 경우에 한해 자동으로 공개됩니다.
    </p>

    <div class="free-grid">
      <div class="free-card">
        <span class="num">01</span>
        <h3>선수 우선</h3>
        <p>안전과 동선이 항상 우선합니다. 경기 흐름을 방해하지 않는 위치에서 촬영합니다.</p>
      </div>
      <div class="free-card">
        <span class="num">02</span>
        <h3>컬링 · 에디팅</h3>
        <p>현장 컷 선별과 기본 톤 보정까지 일관된 흐름으로 진행합니다.</p>
      </div>
      <div class="free-card">
        <span class="num">03</span>
        <h3>초상권 동의 시스템</h3>
        <p>본인 또는 보호자의 이메일 동의 한 번이면 사진 공개요청과 사용 동의가 완료되고, 컬러 원본 다운로드가 활성화됩니다. 별도의 추가 절차가 필요하지 않습니다.</p>
      </div>
      <div class="free-card">
        <span class="num">04</span>
        <h3>온라인 공유</h3>
        <p>고용량 사진을 온라인에 게재하고 관리합니다. 선수·코치·가족이 어디서든 열람 가능합니다.</p>
      </div>
    </div>
  </section>

  <!-- ─── 초대장 (chat-style) ─── -->
  <section class="sec reveal">
    <div class="sec-eyebrow"><span class="num">03</span>Invitations · 대회장에서 온 초대장</div>
    <h2>대회장에서 보내온 <span class="em">초대장.</span></h2>
    <p>수영인들로부터 받은 짤막한 메시지들.</p>

    <div v-if="reqPending" class="invite-feed">
      <div v-for="n in 3" :key="n" class="invite-row skeleton-row" />
    </div>
    <div v-else class="invite-feed">
      <div v-for="r in requests" :key="r.request_id" class="invite-row">
        <span class="invite-dot" :class="r.status" :title="STATUS_LABEL[r.status]"></span>
        <div class="invite-head">
          <span class="name">{{ r.name }}</span>
          <span class="org">{{ r.team }}</span>
          <template v-if="r.meet">
            <span class="sep">·</span>
            <span class="meet">{{ r.meet }} 출전 예정</span>
          </template>
          <template v-if="r.date">
            <span class="sep">·</span>
            <span class="meet-date">{{ fmtEventDate(r.date) }}</span>
          </template>
        </div>
        <p class="invite-msg" :class="r.status">{{ r.message }}</p>
        <div class="invite-when">{{ fmtFullDate(r.created_at) }}</div>
      </div>
    </div>
  </section>

  <!-- ─── 요청 남기기 폼 (간소화) ─── -->
  <section class="sec reveal">
    <div class="sec-eyebrow"><span class="num">04</span>Submit · 제보하기</div>
    <h2>대회 정보 제보 및<br /><span class="em">촬영 요청.</span></h2>
    <p>
      담당자도 그냥 수영인입니다. 저희가 알아야 할 내용이 있다면 알려주세요.<br/>
      한마디 남겨주시면 충분합니다. 가볍게, 친구에게 보내듯이.
    </p>

    <form class="form-wrap" novalidate @submit.prevent="submitForm">
      <p class="form-privacy">
        이름 · 소속 · 이메일 주소는 모두 알아볼 수 없는 형태로 <strong>마스킹되어 게시</strong>됩니다.
      </p>

      <div class="form-row">
        <div class="form-field">
          <label for="f-name">이름</label>
          <input id="f-name" v-model="form.name" name="name" type="text" placeholder="○○○" />
        </div>
        <div class="form-field">
          <label for="f-org">소속</label>
          <input id="f-org" v-model="form.team" name="team" type="text" placeholder="○○초등학교" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="f-meet">대회명 <span class="opt">(선택)</span></label>
          <input id="f-meet" v-model="form.meet" name="meet" type="text" placeholder="2026 전국소년체육대회 수영" />
        </div>
        <div class="form-field">
          <label for="f-date">대회 날짜 <span class="opt">(선택)</span></label>
          <input id="f-date" v-model="form.date" name="date" type="date" />
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label for="f-email">이메일 <span class="opt">(답장이 필요한 경우)</span></label>
          <input id="f-email" v-model="form.email" name="email" type="email" placeholder="example@email.com" />
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label for="f-msg">내용</label>
          <textarea id="f-msg" v-model="form.message" name="message" placeholder="예) 5월 10일 서울 꿈나무 수영대회 나가요!! 와주세요~" required></textarea>
        </div>
      </div>

      <button class="form-submit" type="submit" :disabled="submitting">{{ submitting ? '제출 중…' : '제보 남기기' }}</button>
    </form>
  </section>

  <!-- ─── 05 · For Federations & Organizers ─── -->
  <section class="sec reveal">
    <div class="sec-eyebrow"><span class="num">05</span>For Federations &amp; Organizers · 연맹·대회 관계자께</div>
    <h2>함께 <span class="em">일합니다.</span></h2>

    <div class="organizer-grid">
      <div class="organizer-item">
        <span class="o-num">01</span>
        <p>모든 사진은 각 선수 또는 보호자의 동의 절차가 완료된 경우에 한해 자동으로 공개됩니다.</p>
      </div>
      <div class="organizer-item">
        <span class="o-num">02</span>
        <p>참여 가능 여부는 일정 및 거리에 따라 결정되며, 검토 후 정중히 회신드립니다.</p>
      </div>
      <div class="organizer-item">
        <span class="o-num">03</span>
        <p>데크레벨(수영장층) 촬영 승인이 가능한 경우, 준비 · 촬영 · 컬링 · 동의 · 공유 · 관리, 전 과정 Community Edition으로 진행합니다.</p>
      </div>
    </div>

    <p class="organizer-contact">
      촬영 협업 문의 — <a class="link-line" href="mailto:magazine@medalbank.com">magazine@medalbank.com</a>
    </p>
  </section>

</main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: "메달뱅크 아쿠아틱스 — 촬영 요청" })

interface Request {
  request_id: number
  status: string
  name: string
  team: string
  meet: string
  date: string
  message: string
  created_at: string
}

const STATUS_LABEL: Record<string, string> = { review: '검토중', waiting: '대기', done: '완료' }
const DAYS_KO = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']

const { data: requests, status: reqStatus } = useFetch<Request[]>('/api/requests')
const reqPending = computed(() => reqStatus.value === 'pending')

function fmtFullDate(s: string) {
  const dt = new Date(s)
  return `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${DAYS_KO[dt.getDay()]}`
}

function fmtEventDate(s: string) {
  const [, m, d] = s.split('-')
  return `${Number(m)}월 ${Number(d)}일`
}

const form = reactive({ name: '', team: '', email: '', meet: '', date: '', message: '' })
const submitting = ref(false)

async function submitForm() {
  if (!form.name.trim()) { alert('이름을 입력해주세요.'); return }
  if (!form.message.trim()) { alert('한마디를 남겨주세요.'); return }
  submitting.value = true
  try {
    await $fetch('/api/requests', { method: 'POST', body: { ...form } })
    alert('제보가 접수되었습니다. 감사합니다.')
    Object.assign(form, { name: '', team: '', email: '', meet: '', date: '', message: '' })
    await refreshNuxtData('requests')
  } catch {
    alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'))
    return
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target) }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
  document.querySelectorAll('.reveal').forEach(el => io.observe(el))
})
</script>

<style scoped>

  .req-shell {
    min-height: 100vh;
    min-height: 100dvh;
    padding-top: 0;
    padding-bottom: 80px;
  }

  /* ── HERO ──────────────────────────── */
  .req-hero {
    position: relative;
    padding: 130px 32px 72px;
    border-bottom: 1px solid var(--line);
  }
  .req-hero .eyebrow {
    color: var(--fg-faint);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 28px;
  }
  .req-hero .eyebrow .num {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    margin-right: 10px;
    color: var(--accent);
    letter-spacing: -0.01em;
  }
  .req-hero h1 {
    font-family: var(--font-myungjo);
    font-size: clamp(40px, 6vw, 80px);
    font-weight: 400;
    line-height: 1.18;
    letter-spacing: -0.018em;
    margin-bottom: 28px;
    max-width: 1100px;
  }
  .req-hero h1 .em {
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--accent);
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  .req-hero .lead {
    font-family: var(--font-myungjo);
    font-size: clamp(17px, 1.5vw, 21px);
    line-height: 1.7;
    color: var(--fg-dim);
    letter-spacing: -0.005em;
    max-width: 720px;
  }
  .req-hero .lead strong { color: var(--fg); font-weight: 400; }
  @media (max-width: 768px) {
    .req-hero { padding: 100px 20px 48px; }
    .req-hero .eyebrow { margin-bottom: 20px; font-size: 10px; }
    .req-hero h1 { line-height: 1.2; margin-bottom: 22px; }
  }

  /* ── 공통 섹션 ──────────────────────── */
  .sec {
    padding: 90px 32px;
    max-width: 1280px;
    margin: 0 auto;
  }
  .sec-eyebrow {
    color: var(--fg-faint);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 22px;
  }
  .sec-eyebrow .num {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    margin-right: 10px;
    color: var(--accent);
    letter-spacing: -0.01em;
  }
  .sec h2 {
    font-family: var(--font-myungjo);
    font-size: clamp(28px, 3.6vw, 44px);
    font-weight: 400;
    line-height: 1.3;
    letter-spacing: -0.012em;
    margin-bottom: 28px;
    max-width: 980px;
  }
  .sec h2 .em {
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--accent);
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  .sec p {
    font-family: var(--font-myungjo);
    font-size: clamp(16px, 1.4vw, 18px);
    line-height: 1.78;
    color: var(--fg-dim);
    letter-spacing: -0.005em;
    max-width: 760px;
  }
  .sec p + p { margin-top: 1em; }
  .sec p strong { color: var(--fg); font-weight: 400; }
  @media (max-width: 768px) {
    .sec { padding: 60px 20px; }
    .sec h2 { margin-bottom: 22px; }
  }

  /* ── Community Edition · 4개 서비스 카드 ──── */
  .free-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
    margin-top: 40px;
  }
  .free-card {
    border: 1px solid var(--line);
    padding: 28px 26px;
    background: rgba(255,255,255,0.015);
  }
  .free-card .num {
    display: block;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 36px;
    color: var(--accent);
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 18px;
  }
  .free-card h3 {
    font-family: var(--font-myungjo);
    font-size: 22px;
    font-weight: 700;
    color: var(--fg);
    letter-spacing: -0.005em;
    margin-bottom: 10px;
  }
  .free-card p {
    font-family: var(--font-myungjo);
    font-size: 15px;
    line-height: 1.65;
    color: var(--fg-dim);
    letter-spacing: -0.003em;
    margin: 0;
  }
  @media (max-width: 768px) {
    .free-grid { grid-template-columns: 1fr; gap: 16px; margin-top: 28px; }
    .free-card { padding: 22px 20px; }
    .free-card .num { font-size: 30px; margin-bottom: 14px; }
    .free-card h3 { font-size: 18px; }
    .free-card p { font-size: 14px; }
  }

  /* ── 유료 서비스 박스 ─────────────── */
  .paid-box {
    margin-top: 40px;
    border: 1px solid var(--line);
    padding: 36px 32px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 40px;
    align-items: center;
    background: rgba(56,182,255,0.025);
  }
  .paid-box .badge {
    display: inline-block;
    padding: 5px 12px;
    background: var(--accent);
    color: var(--bg);
    font-family: var(--font-sans);
    font-size: 10px;
    letter-spacing: 0.18em;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .paid-box h3 {
    font-family: var(--font-myungjo);
    font-size: clamp(20px, 1.8vw, 26px);
    font-weight: 400;
    color: var(--fg);
    margin-bottom: 8px;
    letter-spacing: -0.005em;
  }
  .paid-box .desc {
    color: var(--fg-dim);
    font-family: var(--font-myungjo);
    font-size: 14.5px;
    line-height: 1.65;
    letter-spacing: -0.003em;
    max-width: 540px;
  }
  .paid-box .price-block {
    text-align: right;
    border-left: 1px solid var(--line);
    padding-left: 36px;
    min-width: 260px;
  }
  .paid-box .price {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(28px, 3.2vw, 42px);
    color: var(--fg);
    line-height: 1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .paid-box .price .strike {
    color: var(--fg-faint);
    text-decoration: line-through;
    font-size: 0.62em;
    margin-right: 6px;
    text-decoration-color: var(--accent-dim);
  }
  .paid-box .unit {
    color: var(--fg-faint);
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 10px;
    line-height: 1.5;
  }
  .paid-box .free-note {
    color: var(--accent);
    font-family: var(--font-myungjo);
    font-size: 14px;
    margin-top: 14px;
    letter-spacing: -0.003em;
  }
  @media (max-width: 768px) {
    .paid-box { grid-template-columns: 1fr; gap: 24px; padding: 28px 22px; }
    .paid-box .price-block { border-left: 0; border-top: 1px solid var(--line); padding-left: 0; padding-top: 24px; text-align: left; }
  }

  /* ── 초대장 (chat-style feed) ─────────── */
  .invite-feed {
    margin-top: 36px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 720px;
  }
  .skeleton-row { height: 80px; background: var(--bg-soft); animation: skeletonPulse 1.4s ease-in-out infinite; border-radius: 2px; }
  @keyframes skeletonPulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
  .invite-row {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 14px;
    row-gap: 6px;
    align-items: baseline;
  }
  .invite-dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    grid-column: 1;
    grid-row: 1;
    margin-top: 9px;
    align-self: flex-start;
    flex-shrink: 0;
  }
  .invite-dot.review  { background: #ffc91f; box-shadow: 0 0 0 3px rgba(255,200,0,0.12); }
  .invite-dot.waiting { background: rgba(255,255,255,0.4); }
  .invite-dot.done    { background: var(--accent); box-shadow: 0 0 0 3px rgba(56,182,255,0.15); }

  .invite-head {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--fg-dim);
    font-family: var(--font-sans);
    font-size: 12px;
    letter-spacing: -0.005em;
    line-height: 1.5;
  }
  .invite-head .name {
    font-family: var(--font-myungjo);
    font-size: 15px;
    font-weight: 700;
    color: var(--fg);
    letter-spacing: -0.005em;
    margin-right: 4px;
  }
  .invite-head .org   { color: var(--fg-dim); }
  .invite-head .meet  { color: var(--accent); }
  .invite-head .meet-date { color: var(--accent); font-variant-numeric: tabular-nums; }
  .invite-head .sep   { color: var(--fg-faint); }

  .invite-msg {
    grid-column: 2;
    grid-row: 2;
    color: var(--fg);
    font-family: var(--font-myungjo);
    font-size: 16px;
    line-height: 1.6;
    letter-spacing: -0.003em;
    padding: 12px 16px;
    background: var(--bg-soft);
    border-radius: 4px;
    border-left: 2px solid var(--line);
    margin-top: 6px;
  }
  .invite-msg.done    { border-left-color: var(--accent); }
  .invite-msg.review  { border-left-color: #ffc91f; }

  .invite-when {
    grid-column: 2;
    grid-row: 3;
    margin-top: 8px;
    text-align: right;
    color: var(--fg-faint);
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 768px) {
    .invite-feed { gap: 22px; }
    .invite-msg  { font-size: 15px; padding: 10px 14px; }
    .invite-head { font-size: 11.5px; }
    .invite-head .name { font-size: 14px; }
  }

  /* ── 요청 폼 ───────────────────────── */
  .form-wrap {
    margin-top: 40px;
    border: 1px solid var(--line);
    padding: 36px 32px;
    background: var(--bg-soft);
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 18px;
  }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field { display: flex; flex-direction: column; gap: 8px; }
  .form-field label {
    color: var(--fg-faint);
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .form-field label .opt {
    color: var(--fg-faint);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0.04em;
    margin-left: 6px;
    opacity: 0.7;
  }
  .form-field input,
  .form-field textarea {
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--line);
    color: var(--fg);
    font-family: var(--font-myungjo);
    font-size: 16px;
    padding: 10px 0;
    transition: border-color 0.3s;
    width: 100%;
    resize: vertical;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 0;
  }
  .form-field textarea {
    min-height: 120px;
    line-height: 1.6;
  }
  .form-field input:focus,
  .form-field textarea:focus {
    outline: none;
    border-bottom-color: var(--accent);
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: var(--fg-faint);
  }
  .form-privacy {
    margin: 0 0 26px 0;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--line);
    color: var(--fg-faint);
    font-family: var(--font-sans);
    font-size: 12px;
    letter-spacing: 0.02em;
    line-height: 1.6;
  }
  .form-privacy strong {
    color: var(--fg-dim);
    font-weight: 500;
  }
  .form-submit {
    margin-top: 24px;
    display: inline-block;
    padding: 16px 48px;
    background: var(--fg);
    color: var(--bg);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    border: 0;
    cursor: pointer;
    transition: background 0.3s, color 0.3s, transform 0.3s var(--ease-out);
  }
  .form-submit:hover {
    background: var(--accent);
    transform: translateY(-1px);
  }
  .form-note {
    margin-top: 16px;
    color: var(--fg-faint);
    font-family: var(--font-myungjo);
    font-size: 13px;
    line-height: 1.5;
    letter-spacing: -0.003em;
  }
  @media (max-width: 768px) {
    .form-wrap { padding: 28px 22px; }
    .form-row { grid-template-columns: 1fr; gap: 14px; }
  }

  /* ── 05 · 관계자 안내 ───────────────── */
  .organizer-grid {
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    border-top: 1px solid var(--line);
    padding-top: 36px;
  }
  .organizer-item {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 18px;
    align-items: start;
  }
  .organizer-item .o-num {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 36px;
    line-height: 1;
    color: var(--accent);
    letter-spacing: -0.02em;
    margin-top: -4px;
  }
  .organizer-item p {
    color: var(--fg-dim);
    font-family: var(--font-myungjo);
    font-size: 15px;
    line-height: 1.7;
    letter-spacing: -0.003em;
    margin: 0;
  }
  .organizer-contact {
    margin-top: 36px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
    color: var(--fg);
    font-family: var(--font-myungjo);
    font-size: 15px;
    letter-spacing: -0.003em;
  }
  .organizer-contact a { color: var(--accent); }
  @media (max-width: 1199px) {
    .organizer-grid { grid-template-columns: 1fr; gap: 22px; }
  }
  @media (max-width: 768px) {
    .organizer-item { grid-template-columns: 44px 1fr; gap: 14px; }
    .organizer-item .o-num { font-size: 30px; }
    .organizer-item p { font-size: 14px; }
  }

  /* ── 섹션 fade-in ────────────────── */
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.9s var(--ease-out), transform 0.9s var(--ease-out);
  }
  .reveal.in { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1; transform: none; }
  }

</style>