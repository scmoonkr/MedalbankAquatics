<template>
  <div>
    <!-- NAV -->
    <nav class="site-nav">
      <NuxtLink class="nav-logo" to="/">
        <div class="nav-logo-mark">
          <svg viewBox="0 0 20 20"><path d="M3 10 Q7 5 10 10 Q13 15 17 10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="4" r="2"/></svg>
        </div>
        <div class="nav-logo-text">
          <span class="nav-logo-title">Medalbank SSE</span>
          <span class="nav-logo-sub">수영 주식 거래소</span>
        </div>
      </NuxtLink>
      <div class="nav-links">
        <a href="#market" @click.prevent="scrollTo('#market')">시장 현황</a>
        <a href="#features" @click.prevent="scrollTo('#features')">서비스 소개</a>
        <a href="#how" @click.prevent="scrollTo('#how')">이용 방법</a>
      </div>
      <div class="nav-actions">
        <NuxtLink class="btn btn-ghost" to="/home">로그인</NuxtLink>
        <NuxtLink class="btn btn-solid" to="/home">시작하기 →</NuxtLink>
      </div>
    </nav>

    <!-- TICKER (fixed) -->
    <div class="ticker-wrap">
      <div class="ticker-track">
        <div v-for="item in [...tickerItems, ...tickerItems]" :key="item.key + Math.random()" class="ticker-item">
          <div class="ti-dot" :class="item.up ? 'dot-up' : 'dot-down'"></div>
          <span class="ti-name">{{ item.name }}</span>
          <span class="ti-price">{{ item.price.toLocaleString() }}</span>
          <span :class="item.up ? 'ti-up' : 'ti-down'">{{ item.up ? '▲' : '▼' }} {{ item.pct }}%</span>
        </div>
      </div>
    </div>

    <!-- HERO -->
    <section class="hero">
      <div>
        <div class="hero-eyebrow fade-up">Medalbank Academy 공식 서비스</div>
        <h1 class="fade-up delay-1">선수의 기록이<br><em>주가</em>가 되는<br>수영 주식시장</h1>
        <p class="hero-desc fade-up delay-2">훈련 출석, 대회 기록, PB 달성이 실시간 주가로 반영됩니다. 유망한 선수를 발굴하고 투자하세요.</p>
        <div class="hero-btns fade-up delay-3">
          <NuxtLink class="btn btn-lg btn-solid" to="/home">선수로 상장하기 →</NuxtLink>
          <NuxtLink class="btn btn-outline" to="/home">투자자로 시작하기</NuxtLink>
        </div>
      </div>

      <div class="hero-card fade-up delay-4">
        <div class="hc-header">
          <div class="hc-header-left">
            <span class="hc-label">이번 주 주가 현황</span>
            <span class="hc-price">2,100</span>
            <span class="hc-change">▲ +30.0% 주간</span>
          </div>
          <div class="hc-badge">24명 상장 중</div>
        </div>
        <div class="hc-body">
          <div class="hc-stats">
            <div class="hc-stat"><div class="hc-stat-label">주간 상승</div><div class="hc-stat-val" style="color:#0A7A6A;">16명</div></div>
            <div class="hc-stat"><div class="hc-stat-label">주간 하락</div><div class="hc-stat-val" style="color:#C0392B;">6명</div></div>
            <div class="hc-stat"><div class="hc-stat-label">PB 달성</div><div class="hc-stat-val" style="color:#0D4F8B;">5명</div></div>
          </div>
          <div class="hc-chart">
            <svg viewBox="0 0 380 64" preserveAspectRatio="none" fill="none">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0D4F8B" stop-opacity="0.12"/>
                  <stop offset="100%" stop-color="#0D4F8B" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,52 L40,48 L80,44 L110,47 L140,38 L175,30 L210,34 L245,24 L280,16 L315,10 L350,6 L380,2 L380,64 L0,64Z" fill="url(#g1)"/>
              <path d="M0,52 L40,48 L80,44 L110,47 L140,38 L175,30 L210,34 L245,24 L280,16 L315,10 L350,6 L380,2" stroke="#0D4F8B" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="245" cy="24" r="3" fill="#0A7A6A"/>
              <text x="250" y="20" font-size="9" fill="#0A7A6A" font-family="monospace">PB</text>
              <circle cx="380" cy="2" r="3" fill="#0D4F8B"/>
            </svg>
          </div>
          <div class="hc-rank-list">
            <div class="hc-rank-item">
              <span class="hc-rank-num g">1</span>
              <div class="hc-av" style="background:#FDF4E3;color:#B06A00;">최</div>
              <span class="hc-rname">최○○</span>
              <span class="hc-rprice">2,100</span>
              <span class="hc-rchange rchange-up">+30%</span>
            </div>
            <div class="hc-rank-item">
              <span class="hc-rank-num s">2</span>
              <div class="hc-av" style="background:#F1EFE8;color:#5F5E5A;">박</div>
              <span class="hc-rname">박○○</span>
              <span class="hc-rprice">1,890</span>
              <span class="hc-rchange rchange-up">+8%</span>
            </div>
            <div class="hc-rank-item">
              <span class="hc-rank-num b">3</span>
              <div class="hc-av" style="background:#E4F5F2;color:#0A7A6A;">이</div>
              <span class="hc-rname">이○○</span>
              <span class="hc-rprice">1,405</span>
              <span class="hc-rchange rchange-up">+15%</span>
            </div>
            <div class="hc-rank-item locked">
              <span class="hc-rank-num">4</span>
              <div class="hc-av" style="background:#F1EFE8;color:#8A99A8;">🔒</div>
              <span class="hc-rname" style="color:#8A99A8;">로그인 후 확인</span>
              <span class="hc-rprice" style="color:#8A99A8;">—</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MARKET PREVIEW -->
    <section class="market-section section-alt" id="market">
      <div class="section-inner">
        <div class="section-eyebrow">실시간 시장 현황</div>
        <h2>지금 시장에서<br>무슨 일이 일어나고 있나요?</h2>
        <p class="section-desc">로그인하면 더 자세한 정보와 투자 기능을 이용할 수 있습니다</p>
        <div class="grid-3 market-grid">

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">
                <span class="icon-tile icon-blue">📈</span> 주간 주가 랭킹
              </div>
              <span class="badge badge-blue">TOP 5</span>
            </div>
            <div class="panel-body">
              <div class="rank-row"><span class="rr-num g">1</span><div class="rr-av av av-xs" style="background:#FDF4E3;color:#B06A00;">최</div><span class="rr-name">최○○</span><span class="rr-val">2,100</span><span class="rr-chg rchange-up">▲ 30%</span></div>
              <div class="rank-row"><span class="rr-num s">2</span><div class="rr-av av av-xs" style="background:#F1EFE8;color:#5F5E5A;">박</div><span class="rr-name">박○○</span><span class="rr-val">1,890</span><span class="rr-chg rchange-up">▲ 8%</span></div>
              <div class="rank-row"><span class="rr-num b">3</span><div class="rr-av av av-xs" style="background:#E4F5F2;color:#0A7A6A;">이</div><span class="rr-name">이○○</span><span class="rr-val">1,405</span><span class="rr-chg rchange-up">▲ 15%</span></div>
              <div class="rank-row"><span class="rr-num">4</span><div class="rr-av av av-xs" style="background:#E8F2FC;color:#0D4F8B;">강</div><span class="rr-name">강○○</span><span class="rr-val">1,460</span><span class="rr-chg rchange-up">▲ 5%</span></div>
              <div class="locked-row"><span class="rr-num lock-icon">5</span><div class="rr-av av av-xs" style="background:#F1EFE8;color:#8A99A8;">🔒</div><span class="rr-name" style="color:#8A99A8;font-size:11px;">로그인 후 확인 가능</span></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title"><span class="icon-tile icon-teal">📢</span> 최근 공시</div>
              <span class="badge badge-live">● 실시간</span>
            </div>
            <div class="panel-body">
              <div class="notice-row"><div class="notice-dot" style="background:#0A7A6A;"></div><div class="notice-content"><div class="notice-text">최○○ PB 달성 — 주가 +30%</div><div class="notice-time">1시간 전</div></div></div>
              <div class="notice-row"><div class="notice-dot" style="background:#0D4F8B;"></div><div class="notice-content"><div class="notice-text">전국마스터즈 출전 명단 확정</div><div class="notice-time">3시간 전</div></div></div>
              <div class="notice-row"><div class="notice-dot" style="background:#5B21B6;"></div><div class="notice-content"><div class="notice-text">이○○ 신규 IPO 상장</div><div class="notice-time">어제 14:22</div></div></div>
              <div class="notice-row" style="opacity:0.3;"><div class="notice-dot" style="background:#D8E4EE;"></div><div class="notice-content"><div class="notice-text" style="color:#8A99A8;">로그인 후 전체 공시 확인</div><div class="notice-time">—</div></div></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title"><span class="icon-tile icon-amber">🏆</span> 대회 현황</div>
              <span class="badge badge-amber">D-7 임박</span>
            </div>
            <div class="panel-body">
              <div class="contest-item featured">
                <div class="ci-top"><span class="ci-name">전국마스터즈 수영대회</span><span class="ci-dday">D-7</span></div>
                <div class="ci-meta"><span class="ci-date">2026.05.29</span><span class="ci-count">출전 8명</span></div>
              </div>
              <div class="contest-item">
                <div class="ci-top"><span class="ci-name">경기도 마스터즈 대회</span><span class="ci-dday">D-23</span></div>
                <div class="ci-meta"><span class="ci-date">2026.06.14</span><span class="ci-count">출전 5명</span></div>
              </div>
              <div class="contest-item" style="opacity:0.35;">
                <div class="ci-top"><span class="ci-name" style="color:#8A99A8;">로그인 후 투자 가능</span></div>
                <div class="ci-meta"><span class="ci-date">투자 가능 시간 · 48시간</span></div>
              </div>
            </div>
          </div>

        </div>
        <div class="login-gate">
          🔒 전체 선수 주가, 투자, 훈련 일지는 <NuxtLink to="/home">로그인</NuxtLink> 후 이용 가능합니다
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section features-section" id="features">
      <div class="section-inner">
        <div class="section-eyebrow">서비스 소개</div>
        <h2>훈련이 게임이 되는<br>가장 독특한 방법</h2>
        <p class="section-desc">수영과 주식시장의 만남. 기록이 주가가 되고 훈련이 자산이 됩니다.</p>
        <div class="grid-2">
          <div class="feat-card card card-hover">
            <div class="icon-tile lg icon-blue feat-icon">📈</div>
            <div class="feat-title">실제 기록이 주가가 됩니다</div>
            <div class="feat-desc">매주 훈련 측정 기록, 대회 성적, 출석률이 실시간 주가에 반영됩니다. PB를 달성하면 주가가 급등합니다. 단순한 기록 관리가 살아있는 금융 지표가 됩니다.</div>
          </div>
          <div class="feat-card card card-hover">
            <div class="icon-tile lg icon-teal feat-icon">🪙</div>
            <div class="feat-title">참가비가 투자 자산이 됩니다</div>
            <div class="feat-desc">매주 내는 참가비가 코인으로 적립됩니다. 자주 출석할수록 투자 여력이 커지는 선순환 구조로, 훈련 동기와 경제적 인센티브가 자연스럽게 연결됩니다.</div>
          </div>
          <div class="feat-card card card-hover">
            <div class="icon-tile lg icon-amber feat-icon">⭐</div>
            <div class="feat-title">유망주를 먼저 발굴하세요</div>
            <div class="feat-desc">IPO 초기에 투자한 선수가 성장하면 더 높은 발굴 점수를 얻습니다. 단순한 수익률을 넘어 안목 있는 투자자가 더 높은 평가를 받는 구조입니다.</div>
          </div>
          <div class="feat-card card card-hover">
            <div class="icon-tile lg icon-purple feat-icon">🏅</div>
            <div class="feat-title">평영인의 밤에서 시즌 결산</div>
            <div class="feat-desc">매년 말 평영인의 밤에서 최고 투자자, 최고 성장 선수를 시상합니다. Medalbank 용품, 커스텀 자수, 사진/영상 서비스가 실물 부상으로 주어집니다.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section section-alt how-section" id="how">
      <div class="section-inner">
        <div class="section-eyebrow">이용 방법</div>
        <h2>4단계로 바로<br>시작할 수 있습니다</h2>
        <p class="section-desc">복잡한 절차 없이 훈련만 하면 자동으로 시작됩니다</p>
        <div class="steps-grid">
          <div class="step-item">
            <div class="step-num">01</div>
            <div class="step-title">훈련 4주 참석</div>
            <div class="step-desc">4주 출석 + 3회 기록 측정 완료 시 IPO 조건 자동 달성</div>
          </div>
          <div class="step-item">
            <div class="step-num">02</div>
            <div class="step-title">월말 IPO 상장</div>
            <div class="step-desc">기록 평균으로 등급과 공모가가 산정되어 공식 상장됩니다</div>
          </div>
          <div class="step-item">
            <div class="step-num">03</div>
            <div class="step-title">훈련 = 주가 상승</div>
            <div class="step-desc">매주 출석·기록·PB가 자동으로 주가에 반영됩니다</div>
          </div>
          <div class="step-item">
            <div class="step-num">04</div>
            <div class="step-title">시즌 결산 시상</div>
            <div class="step-desc">평영인의 밤에서 선수·투자자 모두 시상받습니다</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <div class="cta-inner">
        <div class="cta-label">지금 바로 시작하세요</div>
        <div class="cta-title">훈련을 게임으로<br>만드는 가장 재미있는 방법</div>
        <p class="cta-desc">Medalbank Academy 회원이라면 누구나 참여할 수 있습니다<br>선수로, 혹은 투자자로 원하는 방식을 선택하세요</p>
        <div class="cta-btns">
          <NuxtLink class="btn btn-white" to="/home">선수로 상장하기 →</NuxtLink>
          <NuxtLink class="cta-btn-outline" to="/home">투자자로 시작하기</NuxtLink>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="site-footer">
      <div class="footer-left">
        <div class="footer-logo">Medalbank SSE</div>
        <div>© 2026 Medalbank Academy. All rights reserved.</div>
      </div>
      <div class="footer-links">
        <a href="#">이용 약관</a>
        <a href="#">개인정보 처리방침</a>
        <a href="#">문의하기</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Medalbank SSE — 수영 주식 거래소' })

const tickerItems = useTicker()

function scrollTo(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target as HTMLElement
        el.style.opacity = '1'
        el.style.transform = 'none'
        observer.unobserve(el)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.feat-card, .step-item, .market-grid .panel').forEach(el => {
    const h = el as HTMLElement
    h.style.opacity = '0'
    h.style.transform = 'translateY(16px)'
    h.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
    observer.observe(h)
  })
})
</script>

<style scoped>
/* ── HERO ── */
.hero {
  padding: 172px 40px 80px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 60px;
  align-items: center;
  max-width: 1160px;
  margin: 0 auto;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 500; color: var(--blue);
  background: var(--blue-light); border-radius: 4px;
  padding: 4px 10px; letter-spacing: 0.06em; text-transform: uppercase;
  margin-bottom: 20px;
}
.hero-eyebrow::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: var(--blue); animation: pulse 2s ease infinite;
}
.hero-desc { font-size: 16px; color: var(--ink-soft); line-height: 1.75; margin-bottom: 32px; max-width: 420px; font-weight: 300; }
.hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }

/* HERO CARD */
.hero-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-card);
}
.hc-header { background: var(--blue); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
.hc-header-left { display: flex; flex-direction: column; }
.hc-label  { font-size: 10px; color: rgba(255,255,255,.6); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 2px; }
.hc-price  { font-family: var(--mono); font-size: 26px; font-weight: 500; color: #fff; }
.hc-change { font-family: var(--mono); font-size: 12px; color: #4ADE80; margin-top: 2px; }
.hc-badge  { background: rgba(255,255,255,.15); border-radius: 6px; padding: 6px 12px; font-size: 11px; color: rgba(255,255,255,.9); font-family: var(--mono); }
.hc-body   { padding: 16px 20px; }
.hc-stats  { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
.hc-stat   { background: var(--surface-soft); border-radius: 8px; padding: 10px 12px; }
.hc-stat-label { font-size: 10px; color: var(--ink-muted); margin-bottom: 3px; }
.hc-stat-val   { font-size: 14px; font-weight: 500; color: var(--ink); font-family: var(--mono); }
.hc-chart  { height: 64px; position: relative; margin-bottom: 16px; }
.hc-chart svg { width: 100%; height: 100%; }
.hc-rank-list { display: flex; flex-direction: column; gap: 6px; }
.hc-rank-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px; background: var(--surface-soft);
}
.hc-rank-item.locked { opacity: 0.4; }
.hc-rank-num { font-size: 11px; font-weight: 500; color: var(--ink-muted); width: 16px; font-family: var(--mono); }
.hc-rank-num.g { color: var(--amber); }
.hc-rank-num.s { color: var(--ink-soft); }
.hc-rank-num.b { color: #7B5E3A; }
.hc-av    { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; }
.hc-rname  { font-size: 12px; color: var(--ink); flex: 1; }
.hc-rprice { font-size: 12px; font-family: var(--mono); color: var(--ink); font-weight: 500; }
.hc-rchange { font-size: 11px; font-family: var(--mono); }

/* ── MARKET SECTION ── */
.market-section { padding: 60px 40px; }
.market-grid { margin-top: 32px; }
.panel-title { display: flex; align-items: center; gap: 6px; }
.notice-row { display: flex; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-light); align-items: flex-start; }
.notice-row:last-child { border-bottom: none; }
.notice-dot  { width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.notice-content { flex: 1; }
.notice-text { font-size: 12px; color: var(--ink); line-height: 1.4; }
.notice-time { font-size: 10px; color: var(--ink-muted); margin-top: 2px; font-family: var(--mono); }
.contest-item { padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.contest-item:last-child { border-bottom: none; }
.contest-item.featured { border-left: 2px solid var(--blue); padding-left: 10px; margin-left: -10px; }
.ci-top  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
.ci-name { font-size: 12px; font-weight: 500; color: var(--ink); }
.ci-dday { font-size: 10px; font-family: var(--mono); color: var(--amber); font-weight: 500; }
.ci-meta { display: flex; gap: 10px; }
.ci-date  { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }
.ci-count { font-size: 11px; color: var(--blue); }
.login-gate {
  margin-top: 16px; padding: 10px 14px;
  background: var(--surface-soft); border: 1px solid var(--border);
  border-radius: 8px; display: flex; align-items: center;
  justify-content: center; gap: 8px;
  font-size: 12px; color: var(--ink-soft);
}
.login-gate a { color: var(--blue); font-weight: 500; }

/* ── FEATURES ── */
.features-section { max-width: 1160px; margin: 0 auto; }
.feat-card { padding: 24px; transition: border-color .2s, box-shadow .2s; }
.feat-icon { margin-bottom: 14px; }
.feat-title { font-size: 15px; font-weight: 500; color: var(--ink); margin-bottom: 6px; }
.feat-desc  { font-size: 13px; color: var(--ink-soft); line-height: 1.65; font-weight: 300; }

/* ── HOW IT WORKS ── */
.steps-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 0; position: relative;
}
.steps-grid::before {
  content: ''; position: absolute; top: 20px;
  left: calc(12.5% + 20px); right: calc(12.5% + 20px);
  height: 1px; background: var(--border);
}
.step-item { text-align: center; padding: 0 12px; position: relative; }
.step-num {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--surface); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 500; color: var(--blue); font-family: var(--mono);
  margin: 0 auto 16px; position: relative; z-index: 1;
}
.step-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 6px; }
.step-desc  { font-size: 12px; color: var(--ink-muted); line-height: 1.6; }

/* ── CTA ── */
.cta-inner {
  max-width: 700px; margin: 0 auto; text-align: center;
  background: var(--ink); border-radius: 20px; padding: 60px 48px;
  position: relative; overflow: hidden;
}
.cta-inner::before {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(26,107,181,.3);
}
.cta-inner::after {
  content: ''; position: absolute; bottom: -60px; left: -40px;
  width: 160px; height: 160px; border-radius: 50%;
  background: rgba(10,122,106,.2);
}
.cta-label { font-size: 10px; color: rgba(255,255,255,.4); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 14px; position: relative; z-index: 1; }
.cta-title { font-family: var(--serif); font-size: 36px; color: #fff; margin-bottom: 12px; position: relative; z-index: 1; }
.cta-desc  { font-size: 14px; color: rgba(255,255,255,.6); margin-bottom: 28px; line-height: 1.7; font-weight: 300; position: relative; z-index: 1; }
.cta-btns  { display: flex; justify-content: center; gap: 10px; position: relative; z-index: 1; }
.cta-btn-outline {
  font-size: 14px; color: rgba(255,255,255,.8);
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.2);
  border-radius: 10px; padding: 12px 20px; cursor: pointer;
  font-family: var(--sans); transition: background .15s;
}
.cta-btn-outline:hover { background: rgba(255,255,255,.12); }

/* ── 반응형 ── */
@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; padding: 120px 20px 48px; gap: 36px; }
  .hero-card { max-width: 100%; }
  .market-section { padding: 40px 20px; }
  .cta-inner { padding: 40px 24px; }
  .cta-title { font-size: 26px; }
  .steps-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .steps-grid::before { display: none; }
  .site-footer { padding: 20px; flex-direction: column; gap: 12px; text-align: center; }
  .footer-links { justify-content: center; }
}
@media (max-width: 720px) {
  .site-nav { padding: 0 16px; }
  .nav-links { display: none; }
  .nav-actions .btn-ghost { display: none; }
  .hero { padding: 100px 16px 40px; gap: 28px; }
  .hero-desc { font-size: 14px; }
  .hc-stats { grid-template-columns: repeat(3,1fr); gap: 8px; }
  .market-section, .features-section, .how-section, .cta-section { padding: 40px 16px; }
  .cta-inner { padding: 36px 20px; }
  .cta-title { font-size: 24px; }
  .cta-btns { flex-direction: column; align-items: stretch; }
  .cta-btns .btn-white, .cta-btn-outline { text-align: center; }
  .site-footer { flex-direction: column; gap: 12px; text-align: center; padding: 20px 16px; }
  .footer-links { justify-content: center; }
}
</style>
