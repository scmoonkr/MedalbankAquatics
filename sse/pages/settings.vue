<template>
  <div class="settings-layout">

    <!-- LEFT NAV -->
    <div class="settings-nav">
      <template v-for="item in navItems" :key="item.id">
        <hr v-if="item.id === 'info'" class="sn-divider">
        <div
          class="sn-item"
          :class="{ act: activeNav === item.id }"
          :style="item.danger ? 'color:var(--red);' : ''"
          @click="scrollToSection(item.id)"
        >
          <span class="sn-item-icon">{{ item.icon }}</span> {{ item.label }}
        </div>
      </template>
    </div>

    <!-- RIGHT CONTENT -->
    <div class="settings-main">

      <!-- PROFILE CARD -->
      <div id="profile" class="profile-card">
        <div class="pc-avatar-wrap">
          <div class="pc-av av">김</div>
          <div class="pc-av-edit" title="사진 변경">✏</div>
        </div>
        <div class="pc-info">
          <div class="pc-name">김○○</div>
          <div class="pc-sub">25세 · 중형주 · 상장 38주차 · 50m 평영</div>
          <div class="pc-badges">
            <span class="pc-badge pb-blue">🔥 개근 11주</span>
            <span class="pc-badge pb-green">✓ PB 4회</span>
            <span class="pc-badge pb-amber">펀드매니저</span>
            <span class="pc-badge pb-purple">투자자 8명</span>
          </div>
        </div>
        <div class="pc-right">
          <div>
            <div class="pc-price-label">현재 주가</div>
            <div class="pc-price">1,440<span style="font-size:12px;color:var(--ink-muted);"> 코인</span></div>
          </div>
          <div class="pc-status-badge">중형주 · 활성 상장</div>
          <button class="edit-btn">프로필 수정</button>
        </div>
      </div>

      <!-- 선수 정보 -->
      <div class="sec">
        <div class="sec-head"><span class="sec-icon">🏊</span><span class="sec-title">선수 정보</span></div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">이름</div><div class="sr-sub">공개 프로필에 표시됩니다</div></div>
          <div class="sr-right"><input v-model="profile.name" class="sr-input" type="text"></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">나이</div><div class="sr-sub">나이 보정 지수 산정에 사용됩니다</div></div>
          <div class="sr-right"><input v-model="profile.age" class="sr-input" type="number" style="min-width:80px;"></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">주종목</div><div class="sr-sub">IPO 기준 종목 · 변경 시 코치 확인 필요</div></div>
          <div class="sr-right">
            <select v-model="profile.event" class="sr-select">
              <option>50m 평영</option>
              <option>100m 평영</option>
              <option>50m 자유형</option>
              <option>50m 접영</option>
            </select>
          </div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">보유 영법</div><div class="sr-sub">영법 다양성 지수에 반영됩니다</div></div>
          <div class="sr-right" style="gap:6px;">
            <span class="tag tag-blue">평영</span>
            <span class="tag tag-green">자유형</span>
            <span class="tag tag-gray">+ 추가</span>
          </div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">소속</div><div class="sr-sub">스윔온 · 변경 시 코치 확인 필요</div></div>
          <div class="sr-right">
            <span class="sr-val">스윔온</span>
            <span class="sr-arrow">›</span>
          </div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">IPO 상장일</div><div class="sr-sub">상장 이후 38주 경과</div></div>
          <div class="sr-right"><span class="sr-val">2025.11.30</span></div>
        </div>
      </div>

      <!-- 공개 설정 -->
      <div id="public" class="sec">
        <div class="sec-head"><span class="sec-icon">👁</span><span class="sec-title">공개 설정</span></div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">내 주가 공개</div><div class="sr-sub">다른 회원이 내 주가를 볼 수 있습니다</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.stockPublic ? 'on' : 'off'" @click="toggles.stockPublic = !toggles.stockPublic"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">훈련 일지 공개</div><div class="sr-sub">투자자에게 훈련 내용이 공개됩니다</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.journalPublic ? 'on' : 'off'" @click="toggles.journalPublic = !toggles.journalPublic"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">기록 상세 공개</div><div class="sr-sub">랩타임 등 세부 기록 공개 여부</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.recordDetail ? 'on' : 'off'" @click="toggles.recordDetail = !toggles.recordDetail"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">투자자 목록 공개</div><div class="sr-sub">나에게 투자한 사람 목록 공개 여부</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.investorList ? 'on' : 'off'" @click="toggles.investorList = !toggles.investorList"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">지수 구성 공개</div><div class="sr-sub">카테고리별 지수 점수 공개 여부</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.indexComposition ? 'on' : 'off'" @click="toggles.indexComposition = !toggles.indexComposition"></div></div>
        </div>
      </div>

      <!-- 알림 설정 -->
      <div id="notify" class="sec">
        <div class="sec-head"><span class="sec-icon">🔔</span><span class="sec-title">알림 설정</span></div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">내 주가 변동 알림</div><div class="sr-sub">주간 주가 업데이트 시</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.priceChange ? 'on' : 'off'" @click="toggles.priceChange = !toggles.priceChange"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">투자 선수 공시</div><div class="sr-sub">PB 달성 · 결석 · 부상 · 대회 결과</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.investPlayer ? 'on' : 'off'" @click="toggles.investPlayer = !toggles.investPlayer"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">대회 명단 공시</div><div class="sr-sub">출전 선수 명단 확정 시</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.contestRoster ? 'on' : 'off'" @click="toggles.contestRoster = !toggles.contestRoster"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">코인 적립 알림</div><div class="sr-sub">참가비 · 배당 · 보너스 코인</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.coinEarn ? 'on' : 'off'" @click="toggles.coinEarn = !toggles.coinEarn"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">훈련 일지 리마인더</div><div class="sr-sub">미입력 시 저녁 알림</div></div>
          <div class="sr-right">
            <select v-model="reminderTime" class="sr-select">
              <option>오후 9시</option>
              <option>오후 10시</option>
              <option>끄기</option>
            </select>
            <div class="toggle" :class="toggles.journalReminder ? 'on' : 'off'" @click="toggles.journalReminder = !toggles.journalReminder"></div>
          </div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">신규 IPO 알림</div><div class="sr-sub">새 선수 상장 시</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.newIpo ? 'on' : 'off'" @click="toggles.newIpo = !toggles.newIpo"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">시즌 랭킹 변동</div><div class="sr-sub">내 순위 변동 시</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.seasonRank ? 'on' : 'off'" @click="toggles.seasonRank = !toggles.seasonRank"></div></div>
        </div>
      </div>

      <!-- 코인 / 투자 설정 -->
      <div id="coin" class="sec">
        <div class="sec-head"><span class="sec-icon">🪙</span><span class="sec-title">코인 / 투자 설정</span></div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">투자 확인 팝업</div><div class="sr-sub">투자 실행 전 확인 단계 추가</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.investConfirm ? 'on' : 'off'" @click="toggles.investConfirm = !toggles.investConfirm"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">1회 최대 투자 한도</div><div class="sr-sub">한 번에 투자할 수 있는 최대 코인</div></div>
          <div class="sr-right">
            <div class="slider-wrap">
              <input v-model.number="investLimit" class="slider" type="range" min="100" max="3000" step="100">
              <span class="slider-val">{{ investLimit.toLocaleString() }} 코인</span>
            </div>
          </div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">배당 자동 재투자</div><div class="sr-sub">배당 코인을 동일 선수에게 자동으로 재투자</div></div>
          <div class="sr-right"><div class="toggle" :class="toggles.autoReinvest ? 'on' : 'off'" @click="toggles.autoReinvest = !toggles.autoReinvest"></div></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">코인 사용처 우선순위</div><div class="sr-sub">코인 사용 시 기본 선택</div></div>
          <div class="sr-right">
            <select v-model="coinPriority" class="sr-select">
              <option>용품 할인</option>
              <option>자수 서비스</option>
              <option>촬영 서비스</option>
              <option>재투자</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 정보 -->
      <div id="info" class="sec">
        <div class="sec-head"><span class="sec-icon">ℹ️</span><span class="sec-title">정보</span></div>
        <div class="sr" style="cursor:pointer;">
          <div class="sr-left"><div class="sr-label">이용 약관</div></div>
          <div class="sr-right"><span class="sr-arrow">›</span></div>
        </div>
        <div class="sr" style="cursor:pointer;">
          <div class="sr-left"><div class="sr-label">개인정보 처리방침</div></div>
          <div class="sr-right"><span class="sr-arrow">›</span></div>
        </div>
        <div class="sr" style="cursor:pointer;">
          <div class="sr-left"><div class="sr-label">문의 / 피드백</div><div class="sr-sub">Medalbank 운영팀에 직접 문의</div></div>
          <div class="sr-right"><span class="sr-arrow">›</span></div>
        </div>
        <div class="sr">
          <div class="sr-left"><div class="sr-label">앱 버전</div></div>
          <div class="sr-right"><span class="sr-val" style="font-family:var(--mono);">v1.0.0 MVP</span></div>
        </div>
      </div>

      <!-- 위험 구역 -->
      <div id="danger" class="danger-sec">
        <div class="danger-head">
          <span style="font-size:15px;">⚠️</span>
          <span style="font-size:13px;font-weight:500;color:var(--red);">위험 구역</span>
        </div>
        <div class="danger-sr">
          <div>
            <div class="danger-label">상장 일시 중단</div>
            <div class="danger-sub">주가 산정이 중단되며 투자자에게 공시됩니다 · 재개 시 이전 데이터 유지</div>
          </div>
          <button class="danger-btn" @click="openModal('suspend')">중단 신청</button>
        </div>
        <div class="danger-sr">
          <div>
            <div class="danger-label">상장 폐지 (탈퇴)</div>
            <div class="danger-sub">모든 데이터가 삭제되며 복구되지 않습니다 · 투자자 코인 전액 자동 환불</div>
          </div>
          <button class="danger-btn" @click="openModal('delete')">탈퇴 신청</button>
        </div>
      </div>

      <div class="version-footer">Medalbank Academy × Swim Stock Exchange · v1.0.0 MVP</div>

    </div>

    <!-- MODAL -->
    <div class="modal-backdrop" :class="{ open: modal.open }" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-title">{{ modal.title }}</div>
        <div class="modal-desc">{{ modal.desc }}</div>
        <div class="modal-btns">
          <button class="modal-cancel" @click="closeModal">취소</button>
          <button class="modal-confirm-red" @click="closeModal">{{ modal.confirm }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

definePageMeta({ layout: 'dashboard' })
useHead({ title: '설정 — Medalbank SSE' })

const navItems = [
  { id: 'profile', icon: '👤', label: '선수 정보' },
  { id: 'public', icon: '👁', label: '공개 설정' },
  { id: 'notify', icon: '🔔', label: '알림 설정' },
  { id: 'coin', icon: '🪙', label: '코인 / 투자' },
  { id: 'info', icon: 'ℹ️', label: '정보' },
  { id: 'danger', icon: '⚠️', label: '위험 구역', danger: true }
]
const activeNav = ref('profile')

const profile = reactive({
  name: '김○○',
  age: 25,
  event: '50m 평영'
})

const toggles = reactive({
  stockPublic: true,
  journalPublic: true,
  recordDetail: false,
  investorList: true,
  indexComposition: false,
  priceChange: true,
  investPlayer: true,
  contestRoster: true,
  coinEarn: true,
  journalReminder: true,
  newIpo: false,
  seasonRank: true,
  investConfirm: true,
  autoReinvest: false
})

const reminderTime = ref('오후 9시')
const investLimit = ref(1000)
const coinPriority = ref('용품 할인')

function scrollToSection(id: string) {
  activeNav.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const modal = reactive({ open: false, title: '', desc: '', confirm: '' })
function openModal(type: 'suspend' | 'delete') {
  if (type === 'suspend') {
    modal.title = '상장 일시 중단'
    modal.desc = '주가 산정이 일시 중단됩니다. 투자자들에게 공시되며, 중단 기간 동안 주가가 하락할 수 있습니다. 재개 시 이전 모든 데이터는 유지됩니다.'
    modal.confirm = '중단 신청'
  } else {
    modal.title = '상장 폐지 (탈퇴)'
    modal.desc = '⚠️ 이 작업은 되돌릴 수 없습니다.\n\n모든 기록, 주가 데이터, 훈련 일지가 영구 삭제됩니다. 투자자들의 코인은 자동으로 전액 환불됩니다. 정말 탈퇴하시겠습니까?'
    modal.confirm = '영구 탈퇴'
  }
  modal.open = true
}
function closeModal() {
  modal.open = false
}
</script>

<style scoped>
/* LAYOUT */
.settings-layout { display: grid; grid-template-columns: 200px 1fr; gap: 24px; align-items: start; }
.settings-nav { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; position: sticky; top: 72px; }
.sn-item { display: flex; align-items: center; gap: 9px; padding: 10px 16px; font-size: 13px; color: var(--ink-soft); cursor: pointer; border-left: 2px solid transparent; transition: all 0.12s; }
.sn-item:hover { background: var(--surface-soft); color: var(--ink); }
.sn-item.act { background: var(--blue-pale); color: var(--blue); border-left-color: var(--blue); font-weight: 500; }
.sn-item-icon { font-size: 15px; }
.sn-divider { border: none; border-top: 1px solid var(--border-light); }
.settings-main { display: flex; flex-direction: column; gap: 16px; }

/* PROFILE CARD */
.profile-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 22px; display: flex; align-items: center; gap: 18px; }
.pc-avatar-wrap { position: relative; flex-shrink: 0; }
.pc-av { width: 64px; height: 64px; border-radius: 50%; background: var(--blue-light); color: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 600; border: 2px solid var(--blue-light); }
.pc-av-edit { position: absolute; bottom: 0; right: 0; width: 22px; height: 22px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; color: #fff; }
.pc-info { flex: 1; }
.pc-name { font-size: 18px; font-weight: 500; color: var(--ink); margin-bottom: 3px; }
.pc-sub { font-size: 12px; color: var(--ink-muted); margin-bottom: 10px; }
.pc-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.pc-badge { font-size: 10px; padding: 3px 9px; border-radius: 5px; }
.pb-blue { background: var(--blue-light); color: var(--blue); }
.pb-green { background: var(--teal-light); color: var(--teal); }
.pb-amber { background: var(--amber-light); color: var(--amber); }
.pb-purple { background: var(--purple-light); color: var(--purple); }
.pc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.pc-price { font-size: 20px; font-weight: 500; color: var(--blue); font-family: var(--mono); }
.pc-price-label { font-size: 10px; color: var(--ink-muted); }
.pc-status-badge { font-size: 11px; padding: 4px 12px; border-radius: 5px; background: var(--surface-alt); color: var(--ink-soft); }
.edit-btn { font-size: 12px; color: var(--blue); border: 1px solid var(--blue); border-radius: 7px; padding: 6px 16px; background: none; cursor: pointer; font-family: var(--sans); }

/* SECTION CARD */
.sec { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.sec-head { padding: 13px 18px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 8px; background: var(--surface-alt); }
.sec-icon { font-size: 15px; }
.sec-title { font-size: 13px; font-weight: 500; color: var(--ink); }

/* SETTING ROW */
.sr { display: flex; justify-content: space-between; align-items: center; padding: 13px 18px; border-bottom: 1px solid var(--border-light); }
.sr:last-child { border-bottom: none; }
.sr-left { flex: 1; }
.sr-label { font-size: 13px; color: var(--ink); }
.sr-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
.sr-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* FORM ELEMENTS */
.sr-input { font-size: 13px; padding: 7px 12px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface-soft); color: var(--ink); font-family: var(--sans); outline: none; min-width: 160px; }
.sr-input:focus { border-color: var(--blue); }
.sr-select { font-size: 12px; padding: 7px 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface-soft); color: var(--ink-soft); font-family: var(--sans); outline: none; cursor: pointer; }
.sr-select:focus { border-color: var(--blue); }
.sr-val { font-size: 13px; color: var(--ink-muted); }
.sr-arrow { font-size: 14px; color: var(--ink-muted); cursor: pointer; }

/* TOGGLE */
.toggle { width: 42px; height: 24px; border-radius: 12px; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
.toggle.on { background: var(--blue); }
.toggle.off { background: var(--border); }
.toggle::after { content: ''; position: absolute; width: 20px; height: 20px; background: #fff; border-radius: 50%; top: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: left 0.2s; }
.toggle.on::after { left: 20px; }
.toggle.off::after { left: 2px; }

/* COIN LIMIT SLIDER */
.slider-wrap { display: flex; align-items: center; gap: 10px; }
.slider { -webkit-appearance: none; appearance: none; width: 120px; height: 5px; border-radius: 3px; background: var(--border); outline: none; cursor: pointer; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--blue); cursor: pointer; }
.slider-val { font-size: 12px; font-family: var(--mono); color: var(--ink); min-width: 60px; }

/* TAG BADGES */
.tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; }
.tag-blue { background: var(--blue-light); color: var(--blue); }
.tag-green { background: var(--teal-light); color: var(--teal); }
.tag-gray { background: var(--surface-alt); color: var(--ink-muted); }

/* DANGER ZONE */
.danger-sec { background: var(--surface); border: 1px solid #FFBCBC; border-radius: 12px; overflow: hidden; }
.danger-head { padding: 13px 18px; border-bottom: 1px solid #FFBCBC; display: flex; align-items: center; gap: 8px; background: #FFF5F5; }
.danger-sr { display: flex; justify-content: space-between; align-items: center; padding: 13px 18px; border-bottom: 1px solid var(--border-light); }
.danger-sr:last-child { border-bottom: none; }
.danger-label { font-size: 13px; color: var(--red); font-weight: 500; }
.danger-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
.danger-btn { font-size: 12px; color: var(--red); border: 1px solid var(--red); border-radius: 7px; padding: 6px 16px; background: none; cursor: pointer; font-family: var(--sans); transition: all 0.12s; }
.danger-btn:hover { background: var(--red-light); }

/* MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(15,25,35,0.45); z-index: 200; display: none; align-items: center; justify-content: center; }
.modal-backdrop.open { display: flex; }
.modal { background: var(--surface); border-radius: 14px; width: 380px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-title { font-size: 16px; font-weight: 500; color: var(--ink); margin-bottom: 8px; }
.modal-desc { font-size: 13px; color: var(--ink-soft); line-height: 1.6; margin-bottom: 20px; white-space: pre-line; }
.modal-btns { display: flex; gap: 8px; justify-content: flex-end; }
.modal-cancel { font-size: 13px; color: var(--ink-soft); background: none; border: 1px solid var(--border); border-radius: 8px; padding: 8px 18px; cursor: pointer; font-family: var(--sans); }
.modal-confirm-red { font-size: 13px; font-weight: 500; color: #fff; background: var(--red); border: none; border-radius: 8px; padding: 8px 18px; cursor: pointer; font-family: var(--sans); }

/* VERSION */
.version-footer { text-align: center; padding: 12px 0 0; font-size: 11px; color: var(--ink-muted); }

@media (max-width: 720px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-nav { position: static; }
  .profile-card { flex-direction: column; align-items: flex-start; }
  .pc-right { align-items: flex-start; }
}
</style>
