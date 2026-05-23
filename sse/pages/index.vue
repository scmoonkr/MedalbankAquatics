<template>
  <div>

    <!-- ═══════════════════ 비로그인 — 랜딩 (main.html) ═══════════════════ -->
    <template v-if="!loggedIn">

      <!-- NAV -->
      <nav class="site-nav">
        <a class="nav-logo" href="#">
          <div class="nav-logo-mark">
            <svg viewBox="0 0 20 20"><path d="M3 10 Q7 5 10 10 Q13 15 17 10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="4" r="2"/></svg>
          </div>
          <div class="nav-logo-text">
            <span class="nav-logo-title">Medalbank SSE</span>
            <span class="nav-logo-sub">수영 주식 거래소</span>
          </div>
        </a>
        <div class="nav-links">
          <a href="#market" @click.prevent="scrollTo('#market')">시장 현황</a>
          <a href="#features" @click.prevent="scrollTo('#features')">서비스 소개</a>
          <a href="#how" @click.prevent="scrollTo('#how')">이용 방법</a>
        </div>
        <div class="nav-actions">
          <button class="btn btn-ghost" @click="loggedIn = true">로그인</button>
          <button class="btn btn-solid">시작하기 →</button>
        </div>
      </nav>

      <!-- TICKER (fixed) -->
      <div class="ticker-wrap">
        <div class="ticker-track">
          <div v-for="item in [...tickerItems, ...tickerItems]" :key="item.key" class="ticker-item">
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
            <button class="btn btn-lg btn-solid">선수로 상장하기 →</button>
            <button class="btn btn-outline">투자자로 시작하기</button>
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
            🔒 전체 선수 주가, 투자, 훈련 일지는 <a href="#" @click.prevent="loggedIn = true">로그인</a> 후 이용 가능합니다
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
            <button class="btn btn-white">선수로 상장하기 →</button>
            <button class="cta-btn-outline" @click="loggedIn = true">투자자로 시작하기</button>
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

    </template>

    <!-- ═══════════════════ 로그인 — 대시보드 (main_loggedin.html) ═══════════════════ -->
    <div v-else class="app-shell">

      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sb-logo">
          <div class="sb-logo-mark">
            <svg viewBox="0 0 20 20"><path d="M3 10 Q7 5 10 10 Q13 15 17 10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="4" r="2"/></svg>
          </div>
          <div>
            <div class="sb-logo-title">Medalbank SSE</div>
            <div class="sb-logo-sub">수영 주식 거래소</div>
          </div>
        </div>

        <div class="sb-profile">
          <div class="av av-lg" style="background:var(--blue-light);color:var(--blue);">김</div>
          <div>
            <div class="sb-user-name">김○○</div>
            <div class="sb-user-grade">중형주 · 38주차</div>
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div class="sb-coin-val">3,240</div>
            <div class="sb-coin-label">보유 코인</div>
          </div>
        </div>

        <nav class="sb-nav">
          <div class="sb-section-label">메인</div>
          <a class="sb-item active" href="#"><span style="font-size:16px;opacity:.7;">🏠</span> 홈</a>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">📈</span> 수영 지수</a>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">👥</span> 선수 목록</a>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">🏆</span> 대회 현황</a>
          <div class="sb-section-label">내 현황</div>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">👤</span> 내 주가</a>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">💼</span> 내 포트폴리오</a>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">📓</span> 훈련 일지</a>
          <a class="sb-item" href="#">
            <span style="font-size:16px;opacity:.7;">🔔</span> 공시 알림
            <span class="sb-badge">5</span>
          </a>
          <div class="sb-section-label">관리</div>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">📊</span> 시즌 랭킹</a>
          <a class="sb-item" href="#"><span style="font-size:16px;opacity:.7;">⚙️</span> 설정</a>
        </nav>

        <div class="sb-footer">
          <div class="sb-logout" @click="loggedIn = false">↩ 로그아웃</div>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="app-main">

        <!-- TOPBAR -->
        <div class="topbar">
          <div class="topbar-left">
            <span class="topbar-greeting">안녕하세요, <strong>김○○</strong> 선수 · 2026년 5월 22일 (목) · 오늘 훈련일입니다</span>
          </div>
          <div class="topbar-right">
            <div class="topbar-notif">🔔<div class="notif-dot"></div></div>
            <div class="av av-md" style="background:var(--blue-light);color:var(--blue);cursor:pointer;">김</div>
          </div>
        </div>

        <!-- TICKER (inline, not fixed) -->
        <div class="app-ticker">
          <div class="app-ticker-track">
            <div v-for="item in [...tickerItems, ...tickerItems]" :key="item.key" class="ti">
              <div class="tidot" :class="item.up ? 'tidu' : 'tidd'"></div>
              <span class="ti-n">{{ item.name }}</span>
              <span class="ti-p">{{ item.price.toLocaleString() }}</span>
              <span :class="item.up ? 'ti-u' : 'ti-d'">{{ item.up ? '▲' : '▼' }}{{ item.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- CONTENT -->
        <div class="content">

          <!-- MY STOCK HERO -->
          <div class="my-hero">
            <div class="mh-left">
              <div class="mh-label">내 현재 주가</div>
              <div class="mh-price">1,440 <span style="font-size:16px;opacity:.7;">코인</span></div>
              <div class="mh-change">▲ +240 · +20.0% 이번 주</div>
              <div class="mh-stats">
                <div class="mh-stat"><span class="mh-stat-label">현재 기록</span><span class="mh-stat-val">45.8초</span></div>
                <div class="mh-stat"><span class="mh-stat-label">출석률</span><span class="mh-stat-val">92%</span></div>
                <div class="mh-stat"><span class="mh-stat-label">종합 지수</span><span class="mh-stat-val">70.3점</span></div>
                <div class="mh-stat"><span class="mh-stat-label">보유 코인</span><span class="mh-stat-val">3,240</span></div>
                <div class="mh-stat"><span class="mh-stat-label">시즌 순위</span><span class="mh-stat-val">5위</span></div>
              </div>
            </div>
            <div class="mh-chart">
              <svg viewBox="0 0 160 60" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(255,255,255,0.2)"/>
                    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                  </linearGradient>
                </defs>
                <path d="M0,50 L20,46 L40,42 L55,45 L70,34 L88,26 L105,30 L120,20 L135,12 L150,6 L160,2 L160,60 L0,60Z" fill="url(#gh)"/>
                <path d="M0,50 L20,46 L40,42 L55,45 L70,34 L88,26 L105,30 L120,20 L135,12 L150,6 L160,2" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="160" cy="2" r="3" fill="#4ADE80"/>
              </svg>
            </div>
          </div>

          <!-- METRICS -->
          <div class="dash-grid-4">
            <div class="metric"><div class="metric-label">이번 주 PB</div><div class="metric-val">45.8초</div><div class="metric-sub up">▲ -0.7초 향상</div></div>
            <div class="metric"><div class="metric-label">출석 연속</div><div class="metric-val">11주</div><div class="metric-sub" style="color:var(--blue);">🔥 개근 중</div></div>
            <div class="metric"><div class="metric-label">이번 주 배당</div><div class="metric-val">+340</div><div class="metric-sub up">▲ 최○○ 스폰서</div></div>
            <div class="metric"><div class="metric-label">투자자 순위</div><div class="metric-val">3위</div><div class="metric-sub up">▲ 지난주 +1위</div></div>
          </div>

          <!-- JOURNAL -->
          <div class="journal-widget">
            <div class="jw-head">
              <div class="jw-title">📓 이번 주 훈련 일지</div>
              <button class="jw-btn">오늘 기록하기</button>
            </div>
            <div class="jw-days">
              <div class="jw-day"><div class="jw-day-label">월</div><div class="jw-circle jc-done">✓</div></div>
              <div class="jw-day"><div class="jw-day-label">화</div><div class="jw-circle jc-done">✓</div></div>
              <div class="jw-day"><div class="jw-day-label">수</div><div class="jw-circle jc-done">✓</div></div>
              <div class="jw-day"><div class="jw-day-label">목</div><div class="jw-circle jc-today">오늘</div></div>
              <div class="jw-day"><div class="jw-day-label">금</div><div class="jw-circle jc-empty">-</div></div>
              <div class="jw-day"><div class="jw-day-label">토</div><div class="jw-circle jc-empty">-</div></div>
              <div class="jw-day"><div class="jw-day-label">일</div><div class="jw-circle jc-empty">-</div></div>
            </div>
          </div>

          <!-- SEASON RANK + INVESTOR RANK -->
          <div class="dash-grid-2">
            <div class="panel">
              <div class="panel-head">
                <div class="panel-title">📊 시즌 랭킹</div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="mini-tabs">
                    <div class="mini-tab act">주가</div>
                    <div class="mini-tab">상승률</div>
                    <div class="mini-tab">성실도</div>
                  </div>
                  <span class="panel-more">전체</span>
                </div>
              </div>
              <div class="panel-body">
                <div class="rr"><span class="rr-n g">1</span><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">최</div><span class="rr-nm">최○○</span><span class="rr-vl">2,100</span><span class="rr-cg up">▲30%</span></div>
                <div class="rr"><span class="rr-n s">2</span><div class="av av-sm" style="background:#F1EFE8;color:#5F5E5A;">박</div><span class="rr-nm">박○○</span><span class="rr-vl">1,890</span><span class="rr-cg up">▲8%</span></div>
                <div class="rr"><span class="rr-n b">3</span><div class="av av-sm" style="background:#E4F5F2;color:#0A7A6A;">이</div><span class="rr-nm">이○○</span><span class="rr-vl">1,405</span><span class="rr-cg up">▲15%</span></div>
                <div class="rr"><span class="rr-n">4</span><div class="av av-sm" style="background:#E8F2FC;color:#0D4F8B;">강</div><span class="rr-nm">강○○</span><span class="rr-vl">1,460</span><span class="rr-cg up">▲5%</span></div>
                <div class="rr rr-me"><span class="rr-n" style="color:var(--blue);">5</span><div class="av av-sm" style="background:#E8F2FC;color:#0D4F8B;">김</div><span class="rr-nm">김○○<span class="rr-me-tag">나</span></span><span class="rr-vl" style="color:var(--blue);">1,440</span><span class="rr-cg up">▲20%</span></div>
                <div class="rr"><span class="rr-n">6</span><div class="av av-sm" style="background:#FDF0EE;color:#C0392B;">정</div><span class="rr-nm">정○○</span><span class="rr-vl">980</span><span class="rr-cg down">▼5%</span></div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head">
                <div class="panel-title">⭐ 투자자 랭킹</div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="mini-tabs">
                    <div class="mini-tab act-purple">수익률</div>
                    <div class="mini-tab">발굴</div>
                  </div>
                  <span class="panel-more">전체</span>
                </div>
              </div>
              <div class="panel-body">
                <div class="rr"><span class="rr-n g">1</span><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">박</div><span class="rr-nm">박○○</span><span class="rr-vl up">+58%</span><span class="rr-cg muted">+1,240</span></div>
                <div class="rr"><span class="rr-n s">2</span><div class="av av-sm" style="background:#F1EFE8;color:#5F5E5A;">이</div><span class="rr-nm">이○○</span><span class="rr-vl up">+42%</span><span class="rr-cg muted">+920</span></div>
                <div class="rr rr-me" style="background:var(--purple-light);"><span class="rr-n" style="color:var(--purple);">3</span><div class="av av-sm" style="background:#E8F2FC;color:#0D4F8B;">김</div><span class="rr-nm">김○○<span class="rr-me-tag" style="color:var(--purple);">나</span></span><span class="rr-vl" style="color:var(--purple);">+13%</span><span class="rr-cg muted">+680</span></div>
                <div class="rr"><span class="rr-n">4</span><div class="av av-sm" style="background:#E4F5F2;color:#0A7A6A;">최</div><span class="rr-nm">최○○</span><span class="rr-vl up">+22%</span><span class="rr-cg muted">+420</span></div>
                <div class="rr"><span class="rr-n">5</span><div class="av av-sm" style="background:#FDF0EE;color:#C0392B;">정</div><span class="rr-nm">정○○</span><span class="rr-vl up">+9%</span><span class="rr-cg muted">+180</span></div>
                <div class="rr"><span class="rr-n">6</span><div class="av av-sm" style="background:#FDF0EE;color:#C0392B;">강</div><span class="rr-nm">강○○</span><span class="rr-vl down">-8%</span><span class="rr-cg muted">-120</span></div>
              </div>
            </div>
          </div>

          <!-- NOTICE + CONTEST + PORTFOLIO -->
          <div class="dash-grid-3">
            <div class="panel">
              <div class="panel-head">
                <div class="panel-title">📢 최근 공시</div>
                <span class="panel-more">전체 5개 →</span>
              </div>
              <div class="panel-body">
                <div class="nr"><div class="nr-dot" style="background:var(--teal);"></div><div class="nr-body"><div class="nr-text">최○○ PB 달성<span class="nr-tag tag-green">+30%</span></div><div class="nr-time">1시간 전</div></div></div>
                <div class="nr"><div class="nr-dot" style="background:var(--blue);"></div><div class="nr-body"><div class="nr-text">전국마스터즈 명단 확정<span class="nr-tag tag-blue">대회</span></div><div class="nr-time">3시간 전</div></div></div>
                <div class="nr"><div class="nr-dot" style="background:var(--amber);"></div><div class="nr-body"><div class="nr-text">주간 코인 +180 적립<span class="nr-tag tag-blue">코인</span></div><div class="nr-time">5시간 전</div></div></div>
                <div class="nr"><div class="nr-dot" style="background:var(--purple);"></div><div class="nr-body"><div class="nr-text">이○○ 신규 IPO 상장<span class="nr-tag tag-purple">IPO</span></div><div class="nr-time">어제 14:22</div></div></div>
                <div class="nr"><div class="nr-dot" style="background:var(--red);"></div><div class="nr-body"><div class="nr-text">강○○ 무단 결석<span class="nr-tag tag-red">-10%</span></div><div class="nr-time">어제 09:15</div></div></div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head">
                <div class="panel-title">🏅 대회 현황</div>
                <span class="panel-more">전체 →</span>
              </div>
              <div class="panel-body">
                <div class="ce featured-ce">
                  <div class="ce-top"><span class="ce-name">전국마스터즈 수영대회</span><span class="ce-dday">D-7</span></div>
                  <div class="ce-meta"><span class="ce-date">2026.05.29</span><span class="ce-players">출전 8명</span></div>
                  <div style="display:flex;align-items:center;gap:6px;margin-top:6px;">
                    <div class="ce-avatars">
                      <div class="ce-av" style="background:#FDF4E3;color:#B06A00;">최</div>
                      <div class="ce-av" style="background:#E8F2FC;color:#0D4F8B;">김</div>
                      <div class="ce-av" style="background:#E4F5F2;color:#0A7A6A;">이</div>
                      <div class="ce-av" style="background:#F1EFE8;color:#5F5E5A;">+5</div>
                    </div>
                    <span class="invest-link">투자하기 →</span>
                  </div>
                  <div class="ce-time">⏱ 투자 가능 48시간 남음</div>
                </div>
                <div class="ce">
                  <div class="ce-top"><span class="ce-name">경기도 마스터즈 대회</span><span class="ce-dday">D-23</span></div>
                  <div class="ce-meta"><span class="ce-date">2026.06.14</span><span class="ce-players">출전 5명</span></div>
                </div>
                <div class="ce">
                  <div class="ce-top"><span class="ce-name">전국 어린이 수영대회</span><span class="ce-dday">D-45</span></div>
                  <div class="ce-meta"><span class="ce-date">2026.07.05</span><span class="ce-players">출전 4명</span></div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head">
                <div class="panel-title">💼 내 포트폴리오</div>
                <span class="panel-more">전체 →</span>
              </div>
              <div class="panel-body">
                <div class="pr"><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">최</div><span class="pr-name">최○○</span><span class="pr-grade pg-sponsor">스폰서</span><div class="pr-bar"><div class="pr-bar-fill" style="width:75%;background:var(--teal);"></div></div><span class="pr-profit up">+180</span></div>
                <div class="pr"><div class="av av-sm" style="background:#E4F5F2;color:#0A7A6A;">이</div><span class="pr-name">이○○</span><span class="pr-grade pg-support">서포터</span><div class="pr-bar"><div class="pr-bar-fill" style="width:50%;background:var(--teal);"></div></div><span class="pr-profit up">+60</span></div>
                <div class="pr"><div class="av av-sm" style="background:#F1EFE8;color:#5F5E5A;">박</div><span class="pr-name">박○○</span><span class="pr-grade pg-support">서포터</span><div class="pr-bar"><div class="pr-bar-fill" style="width:35%;background:var(--teal);"></div></div><span class="pr-profit up">+35</span></div>
                <div class="pr"><div class="av av-sm" style="background:#FDF4E3;color:#B06A00;">강</div><span class="pr-name">강○○</span><span class="pr-grade pg-personal">개인</span><div class="pr-bar"><div class="pr-bar-fill" style="width:25%;background:var(--red);"></div></div><span class="pr-profit down">-30</span></div>
                <div class="pr"><div class="av av-sm" style="background:#F0EEFF;color:#5B21B6;">윤</div><span class="pr-name">윤○○</span><span class="pr-grade pg-personal">개인</span><div class="pr-bar"><div class="pr-bar-fill" style="width:15%;background:var(--teal);"></div></div><span class="pr-profit up">+10</span></div>
              </div>
            </div>
          </div>

          <!-- COIN BAR -->
          <div class="coin-bar">
            <span style="font-size:20px;color:var(--amber);">🪙</span>
            <div style="flex:1;">
              <div style="font-size:10px;color:var(--ink-muted);margin-bottom:2px;">보유 코인</div>
              <div style="font-size:16px;font-weight:500;font-family:var(--mono);">3,240 코인</div>
              <div style="font-size:10px;color:var(--ink-muted);">투자 중 1,850 · 가용 1,390</div>
            </div>
            <button class="btn btn-solid" style="font-size:12px;padding:8px 18px;">선수에게 투자하기 →</button>
          </div>

        </div><!-- /content -->
      </div><!-- /app-main -->
    </div><!-- /app-shell -->

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Medalbank SSE — 수영 주식 거래소' })

const loggedIn = ref(false)

const tickerItems = [
  { key: 'a', name: '최○○',   price: 2100, up: true,  pct: 30 },
  { key: 'b', name: '박○○',   price: 1890, up: true,  pct: 8  },
  { key: 'c', name: '이○○',   price: 1405, up: true,  pct: 15 },
  { key: 'd', name: '강○○',   price: 1460, up: true,  pct: 5  },
  { key: 'e', name: '정○○',   price: 980,  up: false, pct: 5  },
  { key: 'f', name: '강(2)○○', price: 870,  up: false, pct: 10 },
  { key: 'g', name: '윤○○',   price: 700,  up: true,  pct: 5  },
  { key: 'h', name: '김○○',   price: 1440, up: true,  pct: 20 },
]

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
@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 120px 20px 48px;
    gap: 36px;
  }
  .hero-card { max-width: 100%; }
  .market-section { padding: 40px 20px; }
  .features-section { padding: 40px 20px; }
  .how-section { padding: 40px 20px; }
  .cta-section { padding: 40px 20px; }
  .cta-inner { padding: 40px 24px; }
  .cta-title { font-size: 26px; }
  .steps-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .steps-grid::before { display: none; }
  .site-footer { padding: 20px; flex-direction: column; gap: 12px; text-align: center; }
  .footer-links { justify-content: center; }
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
.how-section { }
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
.cta-section { }
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

/* ── TOPBAR GREETING ── */
.topbar-greeting { font-size: 13px; color: var(--ink-soft); }
.topbar-greeting strong { color: var(--ink); font-weight: 500; }

/* ── APP TICKER (inline, logged-in) ── */
.app-ticker { background: var(--ink); padding: 6px 0; overflow: hidden; flex-shrink: 0; }
.app-ticker-track { display: flex; animation: app-ticker 28s linear infinite; width: max-content; }
@keyframes app-ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ti { display: flex; align-items: center; gap: 7px; padding: 0 22px; border-right: 1px solid rgba(255,255,255,.08); white-space: nowrap; }
.ti-n { font-size: 11px; color: rgba(255,255,255,.5); font-family: var(--mono); }
.ti-p { font-size: 12px; color: #fff; font-family: var(--mono); font-weight: 500; }
.ti-u { font-size: 10px; color: #4ADE80; font-family: var(--mono); }
.ti-d { font-size: 10px; color: #F87171; font-family: var(--mono); }
.tidot { width: 5px; height: 5px; border-radius: 50%; }
.tidu { background: #4ADE80; }
.tidd { background: #F87171; }

/* ── MY HERO (대시보드) ── */
.my-hero {
  background: var(--blue); border-radius: 14px; padding: 20px 24px;
  margin-bottom: 18px; display: grid;
  grid-template-columns: 1fr auto; gap: 20px; align-items: center;
}
.mh-label  { font-size: 10px; color: rgba(255,255,255,.6); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
.mh-price  { font-family: var(--mono); font-size: 32px; font-weight: 500; color: #fff; margin-bottom: 4px; }
.mh-change { font-size: 13px; color: #4ADE80; font-family: var(--mono); margin-bottom: 14px; }
.mh-stats  { display: flex; gap: 20px; }
.mh-stat   { display: flex; flex-direction: column; }
.mh-stat-label { font-size: 10px; color: rgba(255,255,255,.55); margin-bottom: 2px; }
.mh-stat-val   { font-size: 13px; font-weight: 500; color: #fff; font-family: var(--mono); }
.mh-chart  { width: 160px; height: 60px; }
.mh-chart svg { width: 100%; height: 100%; }

/* ── JOURNAL WIDGET ── */
.journal-widget { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; }
.jw-head  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.jw-title { font-size: 13px; font-weight: 500; color: var(--ink); display: flex; align-items: center; gap: 6px; }
.jw-btn   { font-size: 11px; color: var(--blue); border: 1px solid var(--blue); border-radius: 6px; padding: 4px 12px; background: none; cursor: pointer; font-family: var(--sans); }
.jw-days  { display: flex; gap: 6px; }
.jw-day   { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.jw-day-label { font-size: 10px; color: var(--ink-muted); }
.jw-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; }
.jc-done  { background: var(--blue); color: #fff; }
.jc-today { background: var(--teal); color: #fff; }
.jc-empty { background: var(--surface-alt); color: var(--ink-muted); }

/* ── RANK ROWS (대시보드) ── */
.rr { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-light); }
.rr:last-child { border-bottom: none; }
.rr.rr-me { background: var(--blue-pale); margin: 0 -14px; padding: 7px 14px; }
.rr-n  { font-size: 11px; font-weight: 500; width: 16px; text-align: center; font-family: var(--mono); color: var(--ink-muted); }
.rr-n.g { color: var(--amber); }
.rr-n.s { color: var(--ink-soft); }
.rr-n.b { color: #7B5E3A; }
.rr-nm  { font-size: 12px; color: var(--ink); flex: 1; }
.rr-me-tag { font-size: 9px; color: var(--blue); margin-left: 4px; font-weight: 500; }
.rr-vl  { font-size: 12px; font-family: var(--mono); color: var(--ink); font-weight: 500; }
.rr-cg  { font-size: 11px; font-family: var(--mono); min-width: 40px; text-align: right; }

/* MINI TABS */
.mini-tabs { display: flex; gap: 4px; }
.mini-tab { font-size: 10px; padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border); color: var(--ink-muted); cursor: pointer; background: var(--surface); font-family: var(--sans); }
.mini-tab.act { background: var(--blue); color: #fff; border-color: var(--blue); }
.mini-tab.act-purple { background: var(--purple); color: #fff; border-color: var(--purple); }
.panel-more { font-size: 11px; color: var(--blue); cursor: pointer; }

/* NOTICE (대시보드) */
.nr { display: flex; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-light); align-items: flex-start; cursor: pointer; }
.nr:last-child { border-bottom: none; }
.nr:hover { opacity: .8; }
.nr-dot  { width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.nr-body { flex: 1; }
.nr-text { font-size: 12px; color: var(--ink); line-height: 1.4; }
.nr-time { font-size: 10px; color: var(--ink-muted); margin-top: 2px; font-family: var(--mono); }
.nr-tag  { font-size: 9px; padding: 1px 6px; border-radius: 4px; margin-left: 4px; vertical-align: middle; }
.tag-green  { background: var(--teal-light);   color: var(--teal); }
.tag-blue   { background: var(--blue-light);   color: var(--blue); }
.tag-purple { background: var(--purple-light); color: var(--purple); }
.tag-red    { background: var(--red-light);    color: var(--red); }

/* CONTEST (대시보드) */
.ce { padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.ce:last-child { border-bottom: none; }
.featured-ce { border-left: 2px solid var(--blue); padding-left: 10px; margin-left: -14px; }
.ce-top  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.ce-name { font-size: 12px; font-weight: 500; color: var(--ink); }
.ce-dday { font-size: 10px; font-family: var(--mono); color: var(--amber); font-weight: 500; }
.ce-meta { display: flex; gap: 10px; margin-bottom: 6px; }
.ce-date    { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }
.ce-players { font-size: 11px; color: var(--blue); }
.ce-time    { font-size: 10px; color: var(--amber); margin-top: 5px; }
.ce-avatars { display: flex; }
.ce-av { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--surface); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 500; margin-left: -5px; }
.ce-av:first-child { margin-left: 0; }
.invest-link { font-size: 11px; color: var(--blue); margin-left: auto; cursor: pointer; font-weight: 500; }

/* PORTFOLIO (대시보드) */
.pr { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-light); }
.pr:last-child { border-bottom: none; }
.pr-name  { font-size: 12px; color: var(--ink); flex: 1; }
.pr-grade { font-size: 9px; padding: 1px 6px; border-radius: 4px; }
.pg-sponsor  { background: var(--blue-light);  color: var(--blue); }
.pg-support  { background: var(--teal-light);  color: var(--teal); }
.pg-personal { background: var(--amber-light); color: var(--amber); }
.pr-bar { width: 50px; height: 4px; background: var(--surface-alt); border-radius: 2px; overflow: hidden; }
.pr-bar-fill { height: 100%; border-radius: 2px; }
.pr-profit { font-size: 12px; font-family: var(--mono); font-weight: 500; min-width: 40px; text-align: right; }

/* COIN BAR */
.coin-bar { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 14px; }

/* COIN BAR 버튼 */
.coin-bar .btn-solid { white-space: nowrap; }

/* ════════════════════════════════════════
   대시보드 — 풀스크린 레이아웃
════════════════════════════════════════ */

/* app-shell이 뷰포트를 꽉 채움 */
.app-shell  { height: 100vh; overflow: hidden; }
.app-main   { height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
.content    { flex: 1; padding: 20px 24px; }

/* topbar */
.topbar { flex-shrink: 0; }
.app-ticker { flex-shrink: 0; }

/* panel-head/body 간격 */
.panel-head { padding: 11px 14px; }
.panel-body { padding: 8px 12px; }

/* my-hero — 화면 너비에 따라 차트 크기 조정 */
.mh-chart { width: 180px; }

/* 세 패널 그리드 — 각 패널이 세로 스크롤 없이 화면 내 배치 */
.dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr;           gap: 14px; margin-bottom: 14px; }
.dash-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr;       gap: 14px; margin-bottom: 14px; }
.dash-grid-4 { display: grid; grid-template-columns: repeat(4,1fr);     gap: 12px; margin-bottom: 14px; }

/* ════════════════════════════════════════
   랜딩 — 모바일 (≤ 720px)
════════════════════════════════════════ */
@media (max-width: 720px) {
  .site-nav { padding: 0 16px; }
  .nav-links { display: none; }
  .nav-actions .btn-ghost { display: none; }

  .hero { padding: 100px 16px 40px; gap: 28px; }
  .hero-desc { font-size: 14px; }
  .hc-stats { grid-template-columns: repeat(3,1fr); gap: 8px; }

  .market-section, .features-section, .how-section, .cta-section { padding: 40px 16px; }
  .steps-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
  .steps-grid::before { display: none; }
  .cta-inner { padding: 36px 20px; }
  .cta-title { font-size: 24px; }
  .cta-btns { flex-direction: column; align-items: stretch; }
  .cta-btns .btn-white, .cta-btn-outline { text-align: center; }
  .site-footer { flex-direction: column; gap: 12px; text-align: center; padding: 20px 16px; }
  .footer-links { justify-content: center; }
}

/* ════════════════════════════════════════
   대시보드 — 태블릿 (≤ 1024px)
════════════════════════════════════════ */
@media (max-width: 1024px) {
  /* 사이드바 아이콘만 표시 (너비 축소) */
  .sidebar { width: 64px; }
  .sb-logo-title, .sb-logo-sub { display: none; }
  .sb-profile { flex-direction: column; align-items: center; gap: 4px; padding: 10px 8px; }
  .sb-user-name, .sb-user-grade { display: none; }
  .sb-coin { margin-left: 0; align-items: center; }
  .sb-coin-label { display: none; }
  .sb-coin-val { font-size: 10px; }
  .sb-section-label { display: none; }
  .sb-item { padding: 10px 0; justify-content: center; font-size: 0; }
  .sb-item span:not([style*="font-size:16px"]) { display: none; }
  .sb-badge { display: none; }
  .sb-logout { font-size: 0; }

  .app-main { margin-left: 64px; }

  /* 그리드 조정 */
  .dash-grid-3 { grid-template-columns: 1fr 1fr; }
  .dash-grid-4 { grid-template-columns: repeat(2, 1fr); }

  .mh-chart { width: 120px; }
  .mh-stats { gap: 12px; }
}

/* ════════════════════════════════════════
   대시보드 — 모바일 (≤ 720px)
════════════════════════════════════════ */
@media (max-width: 720px) {
  /* 사이드바 → 하단 탭바 */
  .app-shell  { height: auto; overflow: visible; }
  .app-main   { height: auto; overflow-y: visible; margin-left: 0; padding-bottom: 60px; }

  .sidebar {
    position: fixed; top: auto; bottom: 0; left: 0; right: 0;
    width: 100%; height: 56px; flex-direction: row;
    border-right: none; border-top: 1px solid var(--border); z-index: 100;
  }
  .sb-logo, .sb-profile, .sb-section-label, .sb-footer { display: none; }
  .sb-nav {
    flex: 1; display: flex; flex-direction: row;
    overflow-x: auto; padding: 0; gap: 0;
    scrollbar-width: none;
  }
  .sb-nav::-webkit-scrollbar { display: none; }
  .sb-item {
    flex-direction: column; gap: 2px; padding: 6px 8px;
    font-size: 9px; color: var(--ink-muted);
    border-left: none; border-top: 2px solid transparent;
    min-width: 52px; text-align: center; justify-content: center;
  }
  .sb-item span[style*="font-size:16px"] { font-size: 18px !important; opacity: 1 !important; }
  .sb-item > span:not([style]) { display: block; font-size: 9px; }
  .sb-item.active { border-top-color: var(--blue); color: var(--blue); }
  .sb-badge { display: none; }

  /* topbar */
  .topbar { padding: 0 14px; height: 44px; }
  .topbar-greeting { font-size: 11px; }

  /* content */
  .content { padding: 12px; }

  /* my-hero 세로 */
  .my-hero { grid-template-columns: 1fr; padding: 16px; gap: 10px; }
  .mh-chart { display: none; }
  .mh-price { font-size: 26px; }
  .mh-stats { flex-wrap: wrap; gap: 10px; }
  .mh-stat  { min-width: 70px; }

  /* 그리드 → 단열 */
  .dash-grid-2, .dash-grid-3, .dash-grid-4 { grid-template-columns: 1fr; }
  .metrics-grid.cols-4 { grid-template-columns: repeat(2, 1fr); }

  /* journal */
  .jw-circle { width: 22px; height: 22px; font-size: 9px; }
  .jw-day-label { font-size: 9px; }

  /* coin bar */
  .coin-bar { flex-wrap: wrap; }
  .coin-bar .btn-solid { width: 100%; justify-content: center; }
}
</style>
