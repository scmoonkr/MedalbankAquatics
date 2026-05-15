<template>
<main class="cart-shell">

  <!-- ─── 동의 폼 영역 ─── -->
  <div v-if="!submitted" id="formArea">
  <div class="page-inner">

    <div class="cart-head">
      <div class="eyebrow"><span class="num">00</span>Consent · 동의 신청</div>
      <h1>선택한 사진이 본인 사진이 맞는지<br /><span class="em">꼭 다시 한번 확인해주세요.</span></h1>
      <p class="lead">
        선택하신 사진들의 공개를 위해, 본인 또는 보호자의 동의 절차를 진행합니다.
        입력하신 이메일로 전송된 <strong>인증 링크를 누르시면 바로 사진을 다운로드</strong>하실 수 있습니다.
      </p>
      <div class="count-line">
        선택한 사진 <span class="n">{{ cartImages.length }}</span>장
      </div>
    </div>

    <div class="selected-grid">
      <div v-if="cartImages.length === 0" class="sel-empty">
        선택된 사진이 없습니다.<br />
        <NuxtLink to="/consent">사진 선택하러 가기 →</NuxtLink>
      </div>
      <div v-for="img in cartImages" :key="img.image_id" class="sel-tile">
        <img :src="img.urls.thumb" :alt="`사진 ${img.image_id}`" class="sel-img" />
        <button class="remove-btn" type="button" :aria-label="`사진 ${img.image_id} 제거`"
          @click="removeFromCart(img.image_id)">
          <svg viewBox="0 0 10 10" aria-hidden="true">
            <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
          </svg>
        </button>
      </div>
    </div>

    <form class="consent-form" id="consentForm" novalidate>
      <!-- 동의 항목 -->
      <section class="form-section">
        <div class="sec-label">01 · 동의 항목</div>
        <h2>사진들이 어디에 게재되나요?</h2>
        <p class="help">
          선수분의 사진을 다루게 되어 영광입니다.
          국내외 대한민국 선수들의 사진을 촬영하고 다루는 대한민국 유일의 수영 전문지 '메달뱅크 아쿠아틱스' 매거진에 선수의 사진을 게재하려 합니다.
        </p>

        <div class="check-group">
          <label class="check-item required locked" for="c-web">
            <input id="c-web" name="consent_web" type="checkbox" checked />
            <span class="box">
              <svg viewBox="0 0 14 14" aria-hidden="true"><polyline points="2.5 7.5, 6 11, 11.5 3.5"/></svg>
            </span>
            <span class="text">
              <span class="title">웹사이트 공개 및 다운로드 <span class="lock-tag">필수</span></span>
              <span class="desc">웹사이트 사진집에 컬러 원본이 공개되며, 누구나 무료로 다운로드할 수 있습니다.</span>
            </span>
          </label>

          <!-- <label class="check-item required locked" for="c-insta">
            <input id="c-insta" v-model="form.consent_insta" name="consent_insta" type="checkbox" />
            <span class="box">
              <svg viewBox="0 0 14 14" aria-hidden="true"><polyline points="2.5 7.5, 6 11, 11.5 3.5"/></svg>
            </span>
            <span class="text">
              <span class="title">SNS 게재 (인스타그램 등) <span class="lock-tag">필수</span></span>
              <span class="desc">하이라이트 사진으로 선정되는 경우, @medalbankaquatics 계정에 게재될 수 있습니다.</span>
            </span>
          </label> -->

          <label class="check-item required locked" for="c-mag">
            <input id="c-mag" v-model="form.consent_mag" name="consent_mag" type="checkbox" />
            <span class="box">
              <svg viewBox="0 0 14 14" aria-hidden="true"><polyline points="2.5 7.5, 6 11, 11.5 3.5"/></svg>
            </span>
            <span class="text">
              <span class="title">매거진 인쇄 게재 <span class="lock-tag">필수</span></span>
              <span class="desc">하이라이트 사진으로 <u>선정되는 경우</u>, 메달뱅크 아쿠아틱스 실물 매거진에 사진이 게재될 수 있습니다.</span>
            </span>
          </label>
        </div>
      </section>

      <!-- 본인 정보 -->
      <section class="form-section">
        <div class="sec-label">02 · 본인 정보</div>
        <h2>선수 본인의 동의가 필요합니다.</h2>
        <p class="help">동의 인증 메일이 발송될 이메일 주소를 정확히 입력해주세요.</p>

        <div class="field-row">
          <div class="field">
            <label for="f-name">이름</label>
            <input id="f-name" v-model="form.name" name="name" type="text" placeholder="홍길동" required />
          </div>
          <div class="field">
            <label for="f-email">이메일</label>
            <input id="f-email" v-model="form.email" name="email" type="email" placeholder="example@email.com" required />
          </div>
        </div>

        <label class="check-item" for="f-minor">
          <input id="f-minor" v-model="form.minor" name="minor" type="checkbox" />
          <span class="box">
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <polyline points="2.5 7.5, 6 11, 11.5 3.5" />
            </svg>
          </span>
          <span class="text">
            <span class="title">본인 또는 보호자를 사칭하여 무단으로 취득하는 사진의 사용은 유사시 법의 저촉을 받아 처벌 받을 수 있습니다.</span>
          </span>
        </label>

        <label class="check-item check-item--spaced" for="f-minor-confirm">
          <input id="f-minor-confirm" v-model="form.minorConfirm" name="minor_confirm" type="checkbox" />
          <span class="box">
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <polyline points="2.5 7.5, 6 11, 11.5 3.5" />
            </svg>
          </span>
          <span class="text">
            <span class="title">선수가 미성년자, 유년부, 초등부, 중등부, 고등부입니다 — 보호자가 동의를 진행합니다.</span>
          </span>
        </label>

        <div class="minor-warn" :class="{ show: form.minorConfirm }">
          미성년자의 경우, 보호자(부모님 또는 법정대리인)가 직접 동의를 진행하셔야 합니다. 보호자의 이름·이메일을 정확히 입력해주세요.
        </div>
      </section>

      <div class="submit-area">
        <button class="submit-btn" type="submit" :disabled="!canSubmit" @click.prevent="submitForm">
          {{ submitting ? '전송 중…' : '이메일 인증 보내기' }}
        </button>
        <p class="submit-note">
          입력하신 이메일로 인증 링크를 발송합니다. 이메일을 확인해주세요. 이메일 내에서 인증 링크 클릭 시 즉시 완료됩니다.
        </p>
      </div>
      <p v-if="submitError" class="submit-error">{{ submitError }}</p>
    </form>

  </div><!-- /.page-inner -->
  </div>

  <!-- ─── 제출 후 화면 ─── -->
  <div v-if="submitted" class="page-inner">
  <div class="sent-screen show">
    <div class="icon">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M2 8 L14 16 L26 8" />
        <rect x="2" y="6" width="24" height="16" rx="1" />
      </svg>
    </div>
    <h2>인증 메일이 전송되었습니다.</h2>
    <p>
      <span class="email">{{ form.email }}</span>으로 인증 링크를 보냈습니다.<br/>
      메일을 확인하시고 링크를 클릭하시면, 선택하신 <strong>{{ cartImages.length }}장</strong>의 사진이 즉시 공개됩니다.
    </p>
    <p style="color: var(--fg-faint); font-size: 13px;">
      메일이 도착하지 않으면 스팸 폴더를 확인해주세요. 인증 링크는 24시간 동안 유효합니다.
    </p>
    <NuxtLink class="home-link" to="/">메인으로 돌아가기 →</NuxtLink>
  </div><!-- /.sent-screen -->
  </div><!-- /.page-inner -->

</main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: "메달뱅크 아쿠아틱스 — 내 사진 확인하기" })

const CART_KEY = 'medalbank_consent_cart'

type CartImage = { image_id: number; urls: { thumb: string } }

const cartImages = ref<CartImage[]>([])
const submitted  = ref(false)
const submitting = ref(false)
const submitError = ref('')
const form = reactive({
  name: '', email: '', minor: false, minorConfirm: false,
  consent_insta: true, consent_mag: true,
})

const canSubmit = computed(() =>
  cartImages.value.length > 0 &&
  form.name.trim() !== '' &&
  form.email.includes('@') &&
  !submitting.value &&
  form.minor
)

function removeFromCart(id: number) {
  cartImages.value = cartImages.value.filter(img => img.image_id !== id)
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartImages.value.map(img => img.image_id)))
  } catch {}
}

async function submitForm() {
  if (!canSubmit.value) return
  submitting.value = true
  submitError.value = ''
  try {
    await $fetch('/api/consent', {
      method: 'POST',
      body: {
        name:      form.name,
        email:     form.email,
        minor:     form.minor,
        image_ids: cartImages.value.map(img => img.image_id),
        consents: {
          web:   true,
          insta: form.consent_insta,
          mag:   form.consent_mag,
        },
      },
    })
    submitted.value = true
    try { localStorage.removeItem(CART_KEY) } catch {}
  } catch (e: any) {
    submitError.value = e?.data?.error ?? '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const raw = localStorage.getItem(CART_KEY)
    console.log('[cart] localStorage raw:', raw)
    if (!raw) return
    const ids: number[] = JSON.parse(raw)
    console.log('[cart] ids:', ids)
    if (!Array.isArray(ids) || ids.length === 0) return
    const result = await $fetch<CartImage[]>('/api/images-by-ids', {
      query: { ids: ids.join(',') },
    })
    console.log('[cart] fetched images count:', result?.length, JSON.stringify(result?.[0]))
    cartImages.value = result
  } catch (e) {
    console.error('[cart] onMounted error:', e)
  }
})
</script>

<style scoped>

  body { overflow-x: hidden; }

  .cart-shell {
    min-height: 100vh;
    min-height: 100dvh;
    padding-top: 96px;
    padding-bottom: 80px;
  }

  .page-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
  }

  .cart-head {
    padding: 8px 0 24px;
  }
  .cart-head .eyebrow {
    color: var(--fg-faint);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 22px;
  }
  .cart-head .eyebrow .num {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    margin-right: 10px;
    color: var(--accent);
    letter-spacing: -0.01em;
  }
  .cart-head h1 {
    font-family: var(--font-myungjo);
    font-size: clamp(36px, 5vw, 60px);
    font-weight: 400;
    line-height: 1.18;
    letter-spacing: -0.018em;
    margin-bottom: 24px;
  }
  .cart-head h1 .em {
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--accent);
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  .cart-head .lead {
    font-family: var(--font-myungjo);
    font-size: clamp(15px, 1.3vw, 17px);
    line-height: 1.7;
    color: var(--fg-dim);
    letter-spacing: -0.005em;
    max-width: 720px;
  }
  .cart-head .count-line {
    margin-top: 18px;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(20px, 2.2vw, 26px);
    color: var(--fg);
    letter-spacing: -0.01em;
  }
  .cart-head .count-line .n {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
    font-size: 1.2em;
  }
  .cart-head .count-line .back {
    margin-left: 18px;
    font-family: var(--font-sans);
    font-style: normal;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-faint);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s, color 0.3s;
  }
  .cart-head .count-line .back:hover { color: var(--fg); border-bottom-color: currentColor; }
  @media (max-width: 768px) {
    .page-inner { padding: 0 18px; }
    .cart-head { padding: 4px 0 22px; }
    .cart-head h1 { line-height: 1.2; }
    .cart-head .lead { font-size: 14.5px; }
    .cart-head .count-line .back { display: block; margin-left: 0; margin-top: 8px; }
  }

  /* ── 선택 사진 미리보기 그리드 ──────────── */
  .selected-grid {
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, 160px);
    justify-content: start;
    gap: 10px;
    margin: 0 0 56px;
  }
  .sel-tile {
    position: relative;
    aspect-ratio: 3 / 2;
    background-color: var(--bg-soft);
    overflow: hidden;
    border: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .sel-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .sel-tile .remove-btn {
    position: absolute;
    top: 6px; right: 6px;
    width: 22px; height: 22px;
    background: rgba(0,0,0,0.6);
    border: 0;
    border-radius: 50%;
    color: #fff;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s;
  }
  .sel-tile:hover .remove-btn { opacity: 1; }
  .sel-tile .remove-btn:hover { background: #ff4040; }
  .sel-tile .remove-btn svg {
    width: 10px; height: 10px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
  }
  .sel-empty {
    grid-column: 1 / -1;
    padding: 60px 20px;
    text-align: center;
    color: var(--fg-faint);
    font-family: var(--font-myungjo);
    font-size: 16px;
    line-height: 1.7;
    border: 1px dashed var(--line);
  }
  .sel-empty a {
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s;
  }
  .sel-empty a:hover { border-bottom-color: currentColor; }

  @media (max-width: 768px) {
    .selected-grid {
      padding: 0;
      grid-template-columns: repeat(auto-fill, 110px);
      gap: 6px;
      margin-bottom: 36px;
    }
    .sel-tile .remove-btn { opacity: 1; }
  }

  /* ── 동의 폼 ──────────────────────────── */
  .consent-form {
    max-width: 720px;
    margin: 0;
    padding: 0;
  }
  .form-section {
    border-top: 1px solid var(--line);
    padding-top: 36px;
    margin-bottom: 40px;
  }
  .form-section .sec-label {
    color: var(--fg-faint);
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 18px;
  }
  .form-section h2 {
    font-family: var(--font-myungjo);
    font-size: clamp(22px, 2.4vw, 30px);
    font-weight: 400;
    color: var(--fg);
    margin-bottom: 14px;
    letter-spacing: -0.005em;
  }
  .form-section p.help {
    font-family: var(--font-myungjo);
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--fg-dim);
    letter-spacing: -0.003em;
    margin-bottom: 28px;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    margin-bottom: 22px;
  }
  .field-row.full { grid-template-columns: 1fr; }
  .field {
    display: flex; flex-direction: column; gap: 8px;
  }
  .field label {
    color: var(--fg-faint);
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .field input {
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--line);
    color: var(--fg);
    font-family: var(--font-myungjo);
    font-size: 16px;
    padding: 10px 0;
    transition: border-color 0.3s;
    border-radius: 0;
    -webkit-appearance: none;
    appearance: none;
  }
  .field input:focus {
    outline: none;
    border-bottom-color: var(--accent);
  }
  .field input::placeholder { color: var(--fg-faint); }
  @media (max-width: 768px) {
    .field-row { grid-template-columns: 1fr; gap: 16px; }
  }

  /* 체크박스 그룹 */
  .check-group { display: flex; flex-direction: column; gap: 14px; }
  .check-item {
    display: grid;
    grid-template-columns: 22px 1fr;
    gap: 14px;
    cursor: pointer;
    user-select: none;
  }
  .check-item input { display: none; }
  .check-item .box {
    width: 22px; height: 22px;
    border: 1.5px solid var(--line);
    background: transparent;
    margin-top: 2px;
    transition: border-color 0.25s, background 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .check-item .box svg {
    width: 12px; height: 12px;
    stroke: var(--bg);
    stroke-width: 2.4;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
    transform: scale(0.6);
    transition: opacity 0.2s, transform 0.25s var(--ease-out);
  }
  .check-item input:checked + .box {
    background: var(--accent);
    border-color: var(--accent);
  }
  .check-item input:checked + .box svg {
    opacity: 1;
    transform: scale(1);
  }
  .check-item:hover .box { border-color: var(--fg-dim); }
  .check-item--spaced { margin-top: 20px; }
  .check-item .text {
    display: grid; gap: 4px;
  }
  .check-item .text .title {
    color: var(--fg);
    font-family: var(--font-myungjo);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.005em;
    line-height: 1.3;
  }
  .check-item .text .desc {
    color: var(--fg-dim);
    font-family: var(--font-myungjo);
    font-size: 13.5px;
    line-height: 1.6;
    letter-spacing: -0.003em;
  }
  /* 필수 항목 — 체크 해제 불가 */
  .check-item.locked { cursor: default; }
  .check-item.locked input { pointer-events: none; }
  .check-item.locked .box { background: var(--accent); border-color: var(--accent); }
  .check-item.locked .box svg { opacity: 1; transform: scale(1); }
  .check-item .lock-tag {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    font-family: var(--font-sans);
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--bg);
    background: var(--accent);
    border-radius: 999px;
    font-weight: 600;
    vertical-align: middle;
    line-height: 1.4;
  }
  /* required 마크는 .lock-tag로 대체 — 별표는 미사용 */

  /* 미성년자 경고 박스 */
  .minor-warn {
    margin-top: 12px;
    padding: 14px 18px;
    background: rgba(255,200,0,0.06);
    border-left: 2px solid #ffc91f;
    color: var(--fg-dim);
    font-family: var(--font-myungjo);
    font-size: 13px;
    line-height: 1.65;
    letter-spacing: -0.003em;
    display: none;
  }
  .minor-warn.show { display: block; }

  /* Submit 버튼 */
  .submit-area {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--line);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
  }
  .submit-btn {
    display: inline-block;
    padding: 18px 48px;
    background: var(--accent);
    color: var(--bg);
    border: 0;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.3s, transform 0.3s var(--ease-out);
  }
  .submit-btn:hover {
    background: #5cc4ff;
    transform: translateY(-1px);
  }
  .submit-btn:disabled {
    background: var(--bg-soft);
    color: var(--fg-faint);
    cursor: not-allowed;
    transform: none;
  }
  .submit-note {
    color: var(--fg-faint);
    font-family: var(--font-myungjo);
    font-size: 13px;
    line-height: 1.6;
    flex: 1;
    min-width: 240px;
  }
  @media (max-width: 768px) {
    .consent-form { padding: 0; }
    .submit-btn { padding: 14px 36px; }
  }

  /* 제출 후 상태 */
  .sent-screen {
    display: none;
    padding: 0;
    max-width: 720px;
    margin: 60px 0 80px;
    text-align: left;
  }
  .sent-screen.show { display: block; }
  .sent-screen .icon {
    width: 64px; height: 64px;
    margin: 0 auto 24px;
    border: 1.5px solid var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
  }
  .sent-screen .icon svg {
    width: 28px; height: 28px;
    stroke: currentColor;
    stroke-width: 1.6;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sent-screen h2 {
    font-family: var(--font-myungjo);
    font-size: clamp(28px, 3vw, 36px);
    font-weight: 400;
    margin-bottom: 18px;
    letter-spacing: -0.012em;
  }
  .sent-screen p {
    font-family: var(--font-myungjo);
    font-size: 15px;
    line-height: 1.7;
    color: var(--fg-dim);
    letter-spacing: -0.003em;
    margin-bottom: 16px;
  }
  .sent-screen .email {
    color: var(--accent);
    font-weight: 700;
  }
  .sent-screen .home-link {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 28px;
    border: 1px solid var(--line);
    color: var(--fg);
    font-family: var(--font-sans);
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    transition: border-color 0.3s, color 0.3s;
  }
  .sent-screen .home-link:hover { border-color: var(--fg-dim); }

  .form-hidden { display: none !important; }

  .submit-error {
    margin-top: 16px;
    padding: 12px 18px;
    background: rgba(255, 60, 60, 0.08);
    border-left: 2px solid #ff4040;
    color: #ff6060;
    font-family: var(--font-myungjo);
    font-size: 13px;
    line-height: 1.6;
  }

</style>