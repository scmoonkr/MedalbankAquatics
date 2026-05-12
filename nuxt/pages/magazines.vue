<template>
<main class="mag-shell">

  <!-- ─── 00 · Magazine 소개 ─── -->
  <section class="sec reveal-el">
    <div class="sec-eyebrow"><span class="num">00</span>Magazine · 정기간행물</div>
    <h2>매월 한 권씩,<br /><span class="em">우리 모두를 담는 프로젝트.</span></h2>
    <p>
      매월(또는 격월 또는 분기)마다 발행하는 <strong>메달뱅크 아쿠아틱스 매거진</strong>. 대회 현장의 표정, 선수들의 호흡, 그리고 이 시절을 함께하는 우리 모두의 낭만을, 직접 손으로 넘기며 읽는, 풀컬러 인쇄로 담습니다.
    </p>
  </section>

  <!-- ─── 01 · 독자 투고 ─── -->
  <section class="sec sec-tight reveal-el" id="reader-submissions" aria-label="독자 투고">
    <div class="sec-eyebrow"><span class="num">01</span>Reader Submissions · 독자 투고</div>
    <h2>독자 투고 — 다음 호에 적는 <span class="em">나의 한마디.</span></h2>
    <p>수영을 사랑하는 여러분 누구나 참여 가능합니다. 여러분의 이야기를 선정하여 다음 호 매거진에 싣습니다. 우리가 정말 원하는건 세계수영연맹 대표나 펠프스의 축사가 아닌, 지금 오늘을 함께 걷는 동료 여러분의 응원과 참여입니다. 메달뱅크 편집부는, 오직 수영인의 마음으로만 새롭게 다짐하고, 또 노력하겠습니다.</p>
    <ul class="rs-list">
      <li v-for="(r, idx) in READER_SUBMISSIONS" :key="idx" class="rs-item">
        <span class="rs-title" :title="r.title">{{ r.title }}</span>
        <button type="button" class="rs-btn" :aria-label="`${r.title} 자세히 보기`" @click="openModal(idx)">참여</button>
      </li>
    </ul>
  </section>

  <!-- ─── 02 · 발행 라인업 ─── -->
  <section class="sec reveal-el">
    <div class="sec-eyebrow"><span class="num">02</span>Issues · 발행 라인업</div>
    <h2>메달뱅크 아쿠아틱스 — <span class="em">발행 예정 일정.</span></h2>
    <p>다음 호의 수록 예정 목차를 미리 공개합니다. 자세한 내용은 출판일자가 가까워질수록 순차적으로 공개됩니다.</p>
    <div class="mag-grid">
      <template v-for="m in MAGAZINES" :key="m.vol">

        <!-- imminent: 목차 미리보기 타일 -->
        <div v-if="m.status === 'imminent'" class="mag-tile imminent"
          :aria-label="`${m.label} 출간 예정 (vol. ${m.vol}) — 목차 미리보기`">
          <div class="mag-tile-inner">
            <div class="imminent-head">
              <div>
                <div class="vol-num-big">{{ String(m.vol).padStart(2, '0') }}</div>
                <div class="vol-issue">{{ m.label }}</div>
              </div>
            </div>
            <div v-for="sec in m.toc" :key="sec.head" class="toc-section">
              <div class="toc-head">{{ sec.head }}</div>
              <ul class="toc-list">
                <li v-for="(rawIt, i) in sec.items" :key="i"
                  :class="getTocItemClass(rawIt, sec)"
                  :title="getTocItemTip(rawIt, sec)">
                  <span class="t-text">{{ getTocItemText(rawIt) }}</span>
                  <template v-if="getTocItemLabel(rawIt, sec)">
                    <a v-if="getTocItemStatus(rawIt, sec) === 'ongoing' && getTocItemHref(rawIt)"
                      class="t-status" :href="getTocItemHref(rawIt)">
                      <span class="pulse-dot"></span>{{ getTocItemLabel(rawIt, sec) }}
                    </a>
                    <span v-else class="t-status">{{ getTocItemLabel(rawIt, sec) }}</span>
                  </template>
                </li>
              </ul>
            </div>
            <div class="imminent-footer">{{ m.date }} 발행 예정</div>
          </div>
        </div>

        <!-- coming -->
        <div v-else class="mag-tile coming"
          :aria-label="`${m.date} 발행 예정 (vol. ${m.vol})`">
          <div class="mag-tile-inner">
            <span class="vol-num">{{ String(m.vol).padStart(2, '0') }}</span>
            <span class="coming-label">Coming Soon</span>
            <span class="vol-date">{{ m.date }}</span>
          </div>
        </div>

      </template>
    </div>
  </section>

</main>

<!-- ─── 독자 투고 모달 ─── -->
<div class="rs-modal" :class="{ open: rsModalOpen }"
  role="dialog" aria-modal="true" :aria-hidden="!rsModalOpen">
  <div class="modal-backdrop" @click="closeModal"></div>
  <div class="modal-content" role="document">
    <button type="button" class="modal-close" aria-label="닫기" @click="closeModal">×</button>
    <div class="modal-eyebrow">Reader Submission · 독자 투고</div>
    <h3 class="modal-title">{{ rsModalItem?.title ?? '' }}</h3>
    <p class="modal-desc">{{ rsModalItem?.description ?? '' }}</p>
    <div class="modal-actions">
      <button type="button" class="modal-btn modal-btn-secondary" @click="closeModal">닫기</button>
      <a class="modal-btn modal-btn-primary" :href="rsModalItem?.url ?? '#'"
        target="_blank" rel="noopener noreferrer">네이버폼으로 응답 →</a>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
useHead({ title: '메달뱅크 아쿠아틱스 — 정기간행물' })

// ─── 발행 데이터 ───
const MAGAZINES: any[] = [
  {
    vol: 1, label: '창간호', date: '2026-05 ~ 2026-06', status: 'imminent',
    toc: [
      {
        head: '인터뷰',
        defaultStatus: 'done',
        items: [
          '전문체육 수영선수 인터뷰 I',
          '전문체육 수영선수 인터뷰 II',
          '주니어 수영선수 인터뷰 I',
          '외국인학교 수영선수 인터뷰 I',
          '외국인학교 수영선수 인터뷰 II',
          '마스터즈 수영선수 인터뷰 I',
          '마스터즈 수영선수 인터뷰 II',
          '수영하는 사람 이야기 I',
          '수영하는 사람 이야기 II',
        ],
      },
      {
        head: '베스트 사진집',
        defaultStatus: 'progress',
        defaultNote: '초상권 동의 절차 진행 중',
        items: [
          '베스트 드레서',
          '베스트 하카',
          '베스트 세레모니',
        ],
      },
      {
        head: '대회 현장 이모저모',
        defaultStatus: 'progress',
        defaultNote: '초상권 동의 절차 진행 중',
        items: [
          '2025 월드아쿠아틱스 마스터즈 챔피온쉽',
          '2025 배럴 스프린트',
          '2025 MBC배 수영대회',
          '2025 평영인의 밤',
          '2025 오산 마스터즈',
          '2026 김천 전국 수영대회',
          '2026 소년체전 경기도대표 선발전',
          '2026 경기 도민체육대회',
          '2026 수원 마스터즈',
          '2026 춘천 마스터즈',
        ],
      },
      {
        head: '그 외',
        items: [
          { text: '여러 수영인의 마음', status: 'ongoing', href: '#reader-submissions' },
          { text: '한국수영 성적표', status: 'ongoing', href: '/records', label: '상시 업데이트 중', tip: '상시 업데이트 중 — 한국 수영 기록 데이터' },
        ],
      },
    ],
  },
  { vol: 2, date: '2026.08', status: 'coming' },
  { vol: 3, date: '2026.11', status: 'coming' },
  { vol: 4, date: '2027.02', status: 'coming' },
  { vol: 5, date: '2027.05', status: 'coming' },
  { vol: 6, date: '2027.08', status: 'coming' },
]

// ─── 독자 투고 ───
const READER_SUBMISSIONS = [
  { title: '축하메세지',                      url: 'https://naver.me/F3E0PkwE', description: '메달뱅크 매거진 창간을 축하해 주시는 한마디를 받습니다. 소속·국적·세대 상관없이, 한국 수영에 종사하시는 모든 분들이 함께해 주세요.' },
  { title: '나의 처음, 첫 수영·첫 클럽·첫 팀·첫 대회', url: 'https://naver.me/xTyrjrj7', description: '처음으로 수영을 시작한 그 순간, 첫 클럽·팀·대회의 기억을 들려주세요. 사소한 디테일이 다음 호의 한 페이지가 됩니다.' },
  { title: '낭만적인 수영 기억',               url: 'https://naver.me/FSvu3N7g', description: '수영을 하며 만난 가장 낭만적인 순간을 짧은 글로 남겨주세요. 풀, 새벽, 동료, 노을, 무엇이든.' },
  { title: '수영인의 짤막한 한마디',            url: 'https://naver.me/xG02pwY6', description: '수영을 사랑하는 한 사람으로서, 동료들에게 전하고 싶은 짧은 한마디.' },
  { title: '수영인만 공감할 수 있는 이야기',    url: 'https://naver.me/xgXPmZY7', description: '수영을 해본 사람만이 알아챌 수 있는 그 특별한 순간이나 에피소드를 공유해 주세요.' },
  { title: '좋았던, 싫었던 이야기',            url: 'https://naver.me/G7N5YxPx', description: '기억에 남는 좋았던 순간과 어려웠던 순간을 솔직하게 적어주세요. 모두에게 위로가 됩니다.' },
  { title: '내가 좋아하는 수영 명언',           url: 'https://naver.me/xKyC1ESs', description: '마음에 새기고 있는 수영 관련 명언이나, 힘들 때 떠올리는 한 줄을 알려주세요.' },
  { title: '나만의 대회 준비 루틴',             url: 'https://naver.me/50BA7eWM', description: '대회 전 워밍업·멘탈·식단·플레이리스트까지, 나만의 준비 과정을 공유해 주세요.' },
  { title: '강사님께 하고 싶은 말',             url: 'https://naver.me/FkaucNHM', description: '지금까지 가르쳐주신 강사님께 전하고 싶은 감사·고백·인사를 짧게 적어주세요.' },
  { title: '조직위에게 전하는 목소리',          url: 'https://naver.me/5PWRBnsN', description: '대회 운영·시상·진행 등에 대해 조직위원회에 전하고 싶은 의견을 익명으로 남겨주세요.' },
  { title: '연맹에게 전하는 목소리',            url: 'https://naver.me/FVF9kHCo', description: '한국 수영 연맹에 전하고 싶은 의견·제안·격려를 남겨주세요. 한 줄도 좋고, 긴 글도 좋습니다.' },
  { title: '매니저가 선수에게 하고 싶은 말',    url: 'https://naver.me/FmGp1kmK', description: '매니저로서 선수들에게 전하고 싶은 응원·조언·고마움의 메시지.' },
  { title: '선수가 매니저에게 하고 싶은 말',    url: 'https://naver.me/5bCIND4f', description: '선수로서 매니저에게 전하고 싶은 감사·존경·격려의 메시지.' },
  { title: '#WIMB',                            url: 'https://naver.me/xnOaxOFd', description: "What's In My Backpack — 수영 가방 속 필수 아이템들과 그 이유를 알려주세요. 사진 첨부 환영합니다." },
  { title: '우리의 오늘',                       url: 'https://naver.me/F3EekKD4', description: '오늘 수영하며 있었던 순간, 작은 기록·메모·기분을 자유롭게 남겨주세요.' },
]

// ─── TOC 헬퍼 ───
function normIt(rawIt: any) {
  return typeof rawIt === 'string' ? { text: rawIt } : rawIt
}
function getTocItemText(rawIt: any) {
  return normIt(rawIt).text
}
function getTocItemStatus(rawIt: any, sec: any): string {
  return normIt(rawIt).status || sec.defaultStatus || ''
}
function getTocItemHref(rawIt: any): string {
  return normIt(rawIt).href || ''
}
function getTocItemLabel(rawIt: any, sec: any): string {
  const it = normIt(rawIt)
  if (it.label) return it.label
  const status = getTocItemStatus(rawIt, sec)
  const note = it.note || sec.defaultNote || ''
  if (status === 'done')     return '완료'
  if (status === 'progress') return note ? `98% · ${note}` : '98%'
  if (status === 'ongoing')  return '독자 투고 상시 진행 중'
  return ''
}
function getTocItemTip(rawIt: any, sec: any): string {
  const it = normIt(rawIt)
  if (it.tip) return it.tip
  const status = getTocItemStatus(rawIt, sec)
  const note = it.note || sec.defaultNote || ''
  if (status === 'done')     return '완료'
  if (status === 'progress') return `98% 완료${note ? ' · ' + note : ''}`
  if (status === 'ongoing')  return '독자 투고 상시 진행 중 — 응답을 받고 있습니다'
  return ''
}
function getTocItemClass(rawIt: any, sec: any): string {
  const status = getTocItemStatus(rawIt, sec)
  return status ? `s-${status}` : ''
}

// ─── 모달 ───
const rsModalOpen = ref(false)
const rsModalItem = ref<typeof READER_SUBMISSIONS[0] | null>(null)

function openModal(idx: number) {
  rsModalItem.value = READER_SUBMISSIONS[idx]
  rsModalOpen.value = true
  document.body.style.overflow = 'hidden'
}
function closeModal() {
  rsModalOpen.value = false
  document.body.style.overflow = ''
}

// Escape key
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)

  // reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })
  document.querySelectorAll('.reveal-el').forEach(el => io.observe(el))
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && rsModalOpen.value) closeModal()
}
</script>

<style scoped>
.mag-shell {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 40px;
  padding-bottom: 40px;
}

/* ── 공통 섹션 ───────────────────────────────────────── */
.sec {
  padding: 90px 32px;
  max-width: 1280px;
  margin: 0 auto;
}
.sec.sec-tight { padding-top: 56px; padding-bottom: 56px; }
.sec-eyebrow {
  color: var(--fg-faint);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 24px;
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
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.012em;
  color: var(--fg);
  margin-bottom: 32px;
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
  font-size: clamp(16px, 1.4vw, 19px);
  line-height: 1.78;
  color: var(--fg-dim);
  letter-spacing: -0.005em;
  max-width: 760px;
}
.sec p + p { margin-top: 1.2em; }
.sec p strong { color: var(--fg); font-weight: 400; }
@media (max-width: 768px) {
  .sec { padding: 60px 20px; }
  .sec.sec-tight { padding-top: 40px; padding-bottom: 40px; }
  .sec-eyebrow { font-size: 10px; margin-bottom: 18px; }
  .sec h2 { margin-bottom: 22px; }
  .sec p { line-height: 1.72; }
}

/* ── 독자 투고 리스트 ─────────────────────────────────── */
.rs-list {
  list-style: none;
  padding: 0;
  margin: 28px 0 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}
.rs-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 14px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  transition: background 0.3s ease;
}
.rs-item:hover { background: rgba(255,255,255,0.012); }
.rs-title {
  font-family: var(--font-myungjo);
  font-size: 13px;
  color: var(--fg-dim);
  letter-spacing: -0.005em;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rs-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg-faint);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease;
  white-space: nowrap;
  line-height: 1;
}
.rs-btn::after { content: '→'; font-size: 11px; letter-spacing: 0; margin-left: 1px; }
.rs-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(56,182,255,0.04); }
@media (max-width: 1199px) {
  .rs-list { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .rs-list { grid-template-columns: 1fr; margin-top: 22px; }
  .rs-item { padding: 10px 12px; }
  .rs-title { font-size: 12.5px; }
}

/* ── 발행 그리드 ──────────────────────────────────────── */
.mag-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
}
@media (max-width: 1199px) { .mag-grid { grid-template-columns: repeat(2, 1fr); gap: 22px; } }
@media (max-width: 768px)  { .mag-grid { grid-template-columns: 1fr; gap: 18px; margin-top: 22px; } }

/* ── 공통 타일 ───────────────────────────────────────── */
.mag-tile {
  position: relative;
  aspect-ratio: 1 / 1.4142;
  background-color: var(--bg-soft);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 0;
  padding: 0;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.5s var(--ease-out);
}
.mag-tile-inner {
  position: absolute;
  inset: 0;
  transition: box-shadow 0.4s ease-out;
}

/* ── coming ──────────────────────────────────────────── */
.mag-tile.coming {
  background-color: var(--bg-soft);
  cursor: not-allowed;
  border: 1px solid var(--line);
}
.mag-tile.coming .mag-tile-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  color: var(--fg-faint);
}
.mag-tile.coming .vol-num {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(80px, 9vw, 140px);
  line-height: 1;
  color: var(--fg-ghost);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.mag-tile.coming .coming-label {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fg-faint);
}
.mag-tile.coming .vol-date {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--fg-faint);
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 1199px) { .mag-tile.coming .vol-num { font-size: 64px; } }
@media (max-width: 768px)  { .mag-tile.coming .vol-num { font-size: 44px; } .mag-tile.coming .vol-date { font-size: 9px; } }

/* ── imminent ────────────────────────────────────────── */
.mag-tile.imminent {
  background-color: var(--bg-soft);
  cursor: default;
  border: 1px solid var(--line);
}
.mag-tile.imminent .mag-tile-inner {
  display: flex;
  flex-direction: column;
  padding: 24px 22px;
  color: var(--fg-faint);
  overflow: auto;
}
.mag-tile.imminent .imminent-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.mag-tile.imminent .vol-num-big {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(56px, 6.4vw, 96px);
  line-height: 1;
  color: var(--fg-ghost);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin-top: -0.34em;
  margin-bottom: 14px;
}
.mag-tile.imminent .vol-issue {
  font-family: var(--font-myungjo);
  font-size: 18px;
  color: var(--fg);
  letter-spacing: -0.005em;
  line-height: 1.2;
}
.mag-tile.imminent .toc-section { margin-bottom: 14px; }
.mag-tile.imminent .toc-section:last-child { margin-bottom: 0; }
.mag-tile.imminent .toc-head {
  font-family: var(--font-myungjo);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--fg-dim);
  letter-spacing: 0.04em;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px dotted rgba(255,255,255,0.08);
}
.mag-tile.imminent .toc-list { list-style: none; padding: 0; margin: 0; }
.mag-tile.imminent .toc-list li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 2px 0;
  line-height: 1.5;
}
.mag-tile.imminent .toc-list .t-text {
  flex: 1;
  min-width: 0;
  font-family: var(--font-myungjo);
  font-size: 10px;
  color: var(--fg-dim);
  letter-spacing: -0.002em;
}
.mag-tile.imminent .toc-list .t-status {
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-size: 9px;
  line-height: 1.4;
  color: var(--fg-faint);
  letter-spacing: 0.03em;
  opacity: 0.92;
  text-align: right;
  text-decoration: none;
}
.mag-tile.imminent .toc-list li.s-done .t-status {
  color: var(--accent);
  opacity: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
}
.mag-tile.imminent .toc-list li.s-ongoing .t-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--accent);
  opacity: 0.95;
  letter-spacing: 0.02em;
  text-transform: none;
  transition: opacity 0.3s ease;
}
.mag-tile.imminent .toc-list li.s-ongoing .t-status:hover { opacity: 1; text-decoration: underline; text-underline-offset: 2px; }
.pulse-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  animation: mag-pulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes mag-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%       { opacity: 1;    transform: scale(1.25); }
}
@media (prefers-reduced-motion: reduce) { .pulse-dot { animation: none; opacity: 0.85; } }
.mag-tile.imminent .imminent-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dotted rgba(255,255,255,0.08);
  font-family: var(--font-sans);
  font-size: 8.5px;
  letter-spacing: 0.08em;
  color: var(--fg-faint);
  text-align: right;
  opacity: 0.7;
}
@media (max-width: 1199px) {
  .mag-tile.imminent .mag-tile-inner { padding: 20px 18px; }
  .mag-tile.imminent .vol-num-big { font-size: 56px; margin-bottom: 10px; }
  .mag-tile.imminent .vol-issue { font-size: 16px; }
}
@media (max-width: 768px) {
  .mag-tile.imminent .mag-tile-inner { padding: 18px 16px; }
  .mag-tile.imminent .vol-num-big { font-size: 44px; margin-bottom: 8px; }
  .mag-tile.imminent .vol-issue { font-size: 15px; }
  .mag-tile.imminent .toc-head { font-size: 10px; }
  .mag-tile.imminent .toc-list li { line-height: 1.5; }
}

/* ── reveal ──────────────────────────────────────────── */
.reveal-el { opacity: 0; transform: translateY(20px); transition: opacity 0.9s ease, transform 0.9s ease; }
.reveal-el.in { opacity: 1; transform: translateY(0); }

@media (hover: none), (pointer: coarse) { .mag-tile { cursor: auto; } }

/* ── 독자 투고 모달 ─────────────────────────────────── */
.rs-modal {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.rs-modal.open { opacity: 1; pointer-events: auto; }
.rs-modal .modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 9, 15, 0.78);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  cursor: pointer;
}
.rs-modal .modal-content {
  position: relative;
  z-index: 1;
  max-width: 540px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  padding: 44px 38px 36px;
  transform: scale(0.96);
  opacity: 0;
  transition: transform 0.5s var(--ease-out), opacity 0.4s 0.05s ease-out;
  box-shadow: 0 30px 80px rgba(0,0,0,0.55);
}
.rs-modal.open .modal-content { transform: scale(1); opacity: 1; }
.rs-modal .modal-close {
  position: absolute;
  top: 14px; right: 16px;
  background: transparent;
  border: 0;
  color: var(--fg-dim);
  font-size: 24px;
  line-height: 1;
  padding: 6px 10px;
  cursor: pointer;
  transition: color 0.2s ease;
}
.rs-modal .modal-close:hover { color: var(--fg); }
.rs-modal .modal-eyebrow {
  color: var(--fg-faint);
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.rs-modal .modal-title {
  font-family: var(--font-myungjo);
  font-size: 24px;
  font-weight: 400;
  color: var(--fg);
  letter-spacing: -0.005em;
  line-height: 1.25;
  margin: 0 0 14px;
}
.rs-modal .modal-desc {
  font-family: var(--font-myungjo);
  font-size: 14.5px;
  color: var(--fg-dim);
  line-height: 1.75;
  letter-spacing: -0.003em;
  margin: 0 0 22px;
}
.rs-modal .modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}
.rs-modal .modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-decoration: none;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg-dim);
  cursor: pointer;
  transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease;
  white-space: nowrap;
}
.rs-modal .modal-btn-secondary:hover { border-color: var(--fg-dim); color: var(--fg); }
.rs-modal .modal-btn-primary { border-color: var(--accent); color: var(--accent); }
.rs-modal .modal-btn-primary:hover { background: var(--accent); color: var(--bg); }
@media (max-width: 768px) {
  .rs-modal { padding: 14px; }
  .rs-modal .modal-content { padding: 36px 24px 28px; max-height: 92vh; }
  .rs-modal .modal-title { font-size: 20px; }
  .rs-modal .modal-desc { font-size: 13.5px; line-height: 1.7; }
  .rs-modal .modal-actions { flex-direction: column-reverse; align-items: stretch; gap: 8px; }
  .rs-modal .modal-btn { justify-content: center; padding: 12px 16px; font-size: 13px; }
}
@media (prefers-reduced-motion: reduce) {
  .rs-modal .modal-backdrop, .rs-modal .modal-content { transition: none; }
}
</style>
