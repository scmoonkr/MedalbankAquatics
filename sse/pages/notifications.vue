<template>
  <div>
    <!-- METRICS -->
    <div class="metrics-4">
      <div class="metric">
        <div class="metric-label">오늘 공시</div>
        <div class="metric-val" style="color:var(--ink);">3건</div>
        <div class="metric-sub blue">투자 선수 포함</div>
      </div>
      <div class="metric">
        <div class="metric-label">주가 상승 알림</div>
        <div class="metric-val up">2건</div>
        <div class="metric-sub up">배당 +240 코인</div>
      </div>
      <div class="metric">
        <div class="metric-label">대회 관련</div>
        <div class="metric-val amber">1건</div>
        <div class="metric-sub amber">명단 공시 확정</div>
      </div>
      <div class="metric">
        <div class="metric-label">이번 주 총 공시</div>
        <div class="metric-val" style="color:var(--ink);">12건</div>
        <div class="metric-sub" style="color:var(--ink-muted);">전체 선수 기준</div>
      </div>
    </div>

    <!-- FILTER ROW -->
    <div class="filter-row">
      <div
        v-for="tab in filterTabs"
        :key="tab.key"
        class="tab-pill"
        :class="{ act: activeFilter === tab.key }"
        @click="activeFilter = tab.key"
      >
        {{ tab.label }}<span class="tp-cnt">{{ tab.count }}</span>
      </div>
      <div class="filter-spacer"></div>
      <select class="sort-select">
        <option>최신순</option>
        <option>읽지 않은순</option>
        <option>유형별</option>
      </select>
    </div>

    <!-- NOTIFICATION GROUPS -->
    <div class="notif-list">
      <template v-for="group in groups" :key="group.key">
        <template v-if="itemsForGroup(group.key).length">
          <div class="group-label">{{ group.label }}</div>
          <div
            v-for="item in itemsForGroup(group.key)"
            :key="item.id"
            class="notif-item"
            :class="item.read ? 'read' : item.accent"
            @click="item.read = true"
          >
            <div class="notif-icon" :class="item.iconClass" :style="item.read ? 'opacity:0.6;' : ''">{{ item.icon }}</div>
            <div class="notif-body">
              <div class="notif-top">
                <div class="notif-title">{{ item.title }}</div>
                <div class="notif-time">{{ item.time }}</div>
              </div>
              <div class="notif-desc">{{ item.desc }}</div>
              <div class="notif-tags">
                <span v-for="(tag, i) in item.tags" :key="i" class="n-tag" :class="tag.cls">{{ tag.label }}</span>
              </div>
              <div v-if="item.action" class="notif-action">{{ item.action }}</div>
            </div>
            <div :class="item.read ? 'read-dot' : 'unread-dot'"></div>
          </div>
        </template>
      </template>
    </div>

    <!-- SETTINGS -->
    <div class="settings-card">
      <div class="sc-head">
        <div class="sc-title">⚙️ 알림 설정</div>
      </div>
      <div v-for="setting in settings" :key="setting.key" class="setting-row">
        <div class="setting-left">
          <div class="setting-label">{{ setting.label }}</div>
          <div class="setting-sub">{{ setting.sub }}</div>
        </div>
        <div class="setting-right">
          <select v-if="setting.hasTime" class="time-select">
            <option>오후 9시</option>
            <option>오후 10시</option>
            <option>끄기</option>
          </select>
          <div class="toggle" :class="setting.on ? 'on' : 'off'" @click="setting.on = !setting.on"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: '공시 알림 — Medalbank SSE' })

const activeFilter = ref('all')

const filterTabs = [
  { key: 'all', label: '전체', count: 12 },
  { key: 'price', label: '📈 내 주가', count: 3 },
  { key: 'invest', label: '💼 투자 선수', count: 4 },
  { key: 'contest', label: '🏆 대회', count: 2 },
  { key: 'coin', label: '🪙 코인', count: 2 },
  { key: 'ipo', label: '🚀 IPO', count: 1 },
]

const groups = [
  { key: 'today', label: '오늘' },
  { key: 'yesterday', label: '어제' },
  { key: 'week', label: '이번 주' },
]

interface NotifTag { label: string; cls: string }
interface NotifItem {
  id: number
  group: string
  cats: string[]
  icon: string
  iconClass: string
  accent: string
  title: string
  time: string
  desc: string
  tags: NotifTag[]
  action?: string
  read: boolean
}

const items = ref<NotifItem[]>([
  {
    id: 1,
    group: 'today',
    cats: ['invest'],
    icon: '📈',
    iconClass: 'ni-teal',
    accent: 'unread-teal',
    title: '최○○ 선수 PB 달성 — 주가 +30% 급등',
    time: '1시간 전',
    desc: '스폰서로 투자한 최○○ 선수가 인천 오픈에서 32.1초 PB를 기록했습니다. 스폰서 보정 1.5× 적용으로 배당 +180 코인이 자동 적립됩니다.',
    tags: [
      { label: 'PB 달성', cls: 'nt-teal' },
      { label: '배당 +180코인', cls: 'nt-teal' },
      { label: '스폰서 선수', cls: 'nt-blue' },
    ],
    action: '→ 내 포트폴리오 확인',
    read: false,
  },
  {
    id: 2,
    group: 'today',
    cats: ['contest'],
    icon: '📢',
    iconClass: 'ni-blue',
    accent: 'unread',
    title: '전국마스터즈 수영대회 출전 명단 확정',
    time: '3시간 전',
    desc: '5월 29일 전국마스터즈 대회 출전 선수 8명 명단이 확정 공시되었습니다. 투자 가능 시간 48시간이 시작되었습니다. 최○○, 김○○, 이○○ 등이 포함되어 있습니다.',
    tags: [
      { label: '대회 공시', cls: 'nt-blue' },
      { label: '투자 가능 D-2', cls: 'nt-amber' },
    ],
    action: '→ 대회 현황 · 투자하기',
    read: false,
  },
  {
    id: 3,
    group: 'today',
    cats: ['coin'],
    icon: '🪙',
    iconClass: 'ni-amber',
    accent: 'unread-amber',
    title: '주간 참가비 코인 적립 완료',
    time: '5시간 전',
    desc: '이번 주 훈련 출석 및 기록 측정 참여, 훈련 일지 입력으로 총 180 코인이 적립되었습니다. 현재 보유 코인 3,240.',
    tags: [
      { label: '코인 +180', cls: 'nt-amber' },
      { label: '개근 11주', cls: 'nt-teal' },
    ],
    read: false,
  },
  {
    id: 4,
    group: 'yesterday',
    cats: ['ipo', 'invest'],
    icon: '🚀',
    iconClass: 'ni-purple',
    accent: 'unread-purple',
    title: '이○○ 선수 신규 IPO 상장',
    time: '어제 14:22',
    desc: '15세 이○○ 선수가 공모가 1,000 코인으로 신규 상장했습니다. 성장성 지수 95점의 고PER 성장주입니다. 현재 내가 서포터로 투자 중인 선수입니다.',
    tags: [
      { label: '신규 IPO', cls: 'nt-purple' },
      { label: '성장성 95점', cls: 'nt-teal' },
      { label: '투자 중', cls: 'nt-blue' },
    ],
    action: '→ 선수 상세 보기',
    read: false,
  },
  {
    id: 5,
    group: 'yesterday',
    cats: ['invest', 'price'],
    icon: '📉',
    iconClass: 'ni-red',
    accent: 'unread-red',
    title: '강○○ 선수 무단 결석 — 주가 −10% 하락',
    time: '어제 09:15',
    desc: '내가 투자한 강○○ 선수가 이번 주 훈련에 무단 결석했습니다. 주가가 870 → 783으로 −10% 하락했습니다. 포트폴리오에 −30 코인 손실 반영.',
    tags: [
      { label: '주가 하락', cls: 'nt-red' },
      { label: '무단 결석', cls: 'nt-red' },
      { label: '손실 −30코인', cls: 'nt-gray' },
    ],
    action: '→ 포트폴리오 확인',
    read: false,
  },
  {
    id: 6,
    group: 'week',
    cats: ['contest'],
    icon: '🏆',
    iconClass: 'ni-teal',
    accent: 'unread-teal',
    title: '인천 오픈 대회 결과 공시',
    time: '3일 전',
    desc: '인천 오픈 수영대회 결과가 반영되었습니다. 출전 선수 6명 평균 주가 +18% 상승. 최○○ 1위, 이○○ 2위 입상으로 PB 달성.',
    tags: [
      { label: '결과 완료', cls: 'nt-gray' },
      { label: '평균 +18%', cls: 'nt-gray' },
    ],
    read: true,
  },
  {
    id: 7,
    group: 'week',
    cats: ['price'],
    icon: '📊',
    iconClass: 'ni-gray',
    accent: 'unread',
    title: '주간 주가 업데이트 완료 — 내 주가 +20%',
    time: '4일 전',
    desc: '이번 주 전체 선수 주가가 갱신되었습니다. 나의 주가 1,200 → 1,440 (+20%) 상승. PB 달성 +30% 기여. 시즌 랭킹 7위 → 5위 상승.',
    tags: [
      { label: '주간 업데이트', cls: 'nt-gray' },
      { label: '내 주가 +20%', cls: 'nt-gray' },
      { label: '랭킹 5위', cls: 'nt-gray' },
    ],
    read: true,
  },
  {
    id: 8,
    group: 'week',
    cats: ['price'],
    icon: '🎯',
    iconClass: 'ni-gray',
    accent: 'unread',
    title: '연령대 랭킹 3위 진입 — 시장 지위 점수 상승',
    time: '5일 전',
    desc: '시장 지위 지수 업데이트로 동일 연령대(25세) 기준 3위에 진입했습니다. 주가 +5점 추가 반영되었습니다.',
    tags: [
      { label: '랭킹 변동', cls: 'nt-gray' },
      { label: '3위 진입', cls: 'nt-gray' },
    ],
    read: true,
  },
  {
    id: 9,
    group: 'week',
    cats: ['invest', 'coin'],
    icon: '💰',
    iconClass: 'ni-teal',
    accent: 'unread-teal',
    title: '이○○ 선수 배당 수익 +60 코인',
    time: '6일 전',
    desc: '서포터로 투자한 이○○ 선수의 주가가 +15% 상승하여 60 코인 배당 수익이 발생했습니다. 서포터 보정 1.2× 적용.',
    tags: [
      { label: '배당 수익', cls: 'nt-gray' },
      { label: '+60코인', cls: 'nt-gray' },
    ],
    read: true,
  },
])

function itemsForGroup(groupKey: string) {
  return items.value.filter(
    (it) => it.group === groupKey && (activeFilter.value === 'all' || it.cats.includes(activeFilter.value)),
  )
}

const settings = ref([
  { key: 'price', label: '내 주가 변동 알림', sub: '주간 주가 업데이트 시 알림', on: true, hasTime: false },
  { key: 'invest', label: '투자 선수 공시', sub: 'PB 달성 · 결석 · 부상 · 대회 결과', on: true, hasTime: false },
  { key: 'roster', label: '대회 명단 공시', sub: '출전 선수 명단 확정 시', on: true, hasTime: false },
  { key: 'coin', label: '코인 적립 알림', sub: '참가비 · 배당 · 보너스 코인', on: true, hasTime: false },
  { key: 'journal', label: '훈련 일지 리마인더', sub: '미입력 시 저녁 알림', on: true, hasTime: true },
  { key: 'ipo', label: '신규 IPO 알림', sub: '새 선수 상장 시', on: false, hasTime: false },
])
</script>

<style scoped>
/* METRICS */
.metrics-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.metric-val { font-size: 20px; margin-bottom: 2px; }
.metric-sub { font-size: 11px; }
.blue { color: var(--blue); }
.amber { color: var(--amber); }

/* FILTER ROW */
.filter-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.tab-pill {
  font-size: 12px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border);
  color: var(--ink-soft); cursor: pointer; background: var(--surface); transition: all 0.12s;
  display: flex; align-items: center; gap: 5px;
}
.tab-pill:hover { background: var(--surface-soft); }
.tab-pill.act { background: var(--blue); color: #fff; border-color: var(--blue); }
.tp-cnt { font-size: 10px; font-family: var(--mono); opacity: 0.8; }
.filter-spacer { flex: 1; }
.sort-select {
  font-size: 12px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px;
  background: var(--surface); color: var(--ink-soft); font-family: var(--sans); outline: none;
}

/* NOTIFICATION LIST */
.notif-list { display: flex; flex-direction: column; gap: 0; }
.group-label {
  font-size: 11px; font-weight: 600; color: var(--ink-muted); letter-spacing: 0.05em;
  text-transform: uppercase; padding: 14px 0 8px; display: flex; align-items: center; gap: 8px;
}
.group-label::after { content: ''; flex: 1; height: 1px; background: var(--border-light); }

/* NOTIFICATION ITEM */
.notif-item {
  background: var(--surface); border: 1px solid var(--border-light); border-radius: 10px;
  padding: 14px 16px; margin-bottom: 6px; display: flex; gap: 12px; align-items: flex-start;
  cursor: pointer; transition: all 0.12s; position: relative;
}
.notif-item:hover { border-color: var(--border); background: var(--surface-soft); }
.notif-item.unread { border-left: 3px solid var(--blue); }
.notif-item.unread-teal { border-left: 3px solid var(--teal); }
.notif-item.unread-amber { border-left: 3px solid var(--amber); }
.notif-item.unread-red { border-left: 3px solid var(--red); }
.notif-item.unread-purple { border-left: 3px solid var(--purple); }
.notif-item.read { opacity: 0.72; }
.notif-icon {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 16px; flex-shrink: 0;
}
.ni-teal { background: var(--teal-light); }
.ni-blue { background: var(--blue-light); }
.ni-amber { background: var(--amber-light); }
.ni-red { background: var(--red-light); }
.ni-purple { background: var(--purple-light); }
.ni-gray { background: var(--surface-alt); }
.notif-body { flex: 1; min-width: 0; }
.notif-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.notif-title { font-size: 13px; font-weight: 500; color: var(--ink); }
.notif-time { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); white-space: nowrap; flex-shrink: 0; }
.notif-desc { font-size: 12px; color: var(--ink-soft); line-height: 1.5; margin-bottom: 6px; }
.notif-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.n-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.nt-teal { background: var(--teal-light); color: var(--teal); }
.nt-blue { background: var(--blue-light); color: var(--blue); }
.nt-amber { background: var(--amber-light); color: var(--amber); }
.nt-red { background: var(--red-light); color: var(--red); }
.nt-purple { background: var(--purple-light); color: var(--purple); }
.nt-gray { background: var(--surface-alt); color: var(--ink-muted); }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); flex-shrink: 0; margin-top: 4px; }
.read-dot { width: 8px; height: 8px; flex-shrink: 0; }
.notif-action { font-size: 11px; color: var(--blue); font-weight: 500; margin-top: 4px; display: inline-block; }

/* SETTINGS PANEL */
.settings-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-top: 24px; }
.sc-head { padding: 14px 18px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 8px; }
.sc-title { font-size: 13px; font-weight: 500; color: var(--ink); }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-bottom: 1px solid var(--border-light); }
.setting-row:last-child { border-bottom: none; }
.setting-label { font-size: 13px; color: var(--ink); }
.setting-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
.toggle { width: 40px; height: 22px; border-radius: 11px; position: relative; cursor: pointer; flex-shrink: 0; transition: background 0.2s; }
.toggle.on { background: var(--blue); }
.toggle.off { background: var(--border); }
.toggle::after { content: ''; position: absolute; width: 18px; height: 18px; background: #fff; border-radius: 50%; top: 2px; transition: left 0.2s; }
.toggle.on::after { left: 20px; }
.toggle.off::after { left: 2px; }
.setting-right { display: flex; align-items: center; gap: 8px; }
.time-select { font-size: 12px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface-soft); color: var(--ink); font-family: var(--sans); outline: none; }

@media (max-width: 960px) {
  .metrics-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .metrics-4 { grid-template-columns: 1fr; }
}
</style>
