// Medalbank SSE — shared UI data (dashboard shell 전반에서 사용)
// MVP HTML 목업을 그대로 옮긴 정적 데이터라, 실제 API 연동 전까지 화면 확인용이다.

export interface NavItem {
  label: string
  icon: string
  to: string
  badge?: number
}
export interface NavSection {
  title: string
  items: NavItem[]
}

// 사이드바 메뉴 구성 — MVP main_loggedin.html 의 네비게이션을 라우트로 연결한다.
export const NAV_SECTIONS: NavSection[] = [
  {
    title: '메인',
    items: [
      { label: '홈',        icon: '🏠', to: '/home' },
      { label: '수영 지수', icon: '📈', to: '/swimming-index' },
      { label: '선수 목록', icon: '👥', to: '/athletes' },
      { label: '대회 현황', icon: '🏆', to: '/contests' },
    ],
  },
  {
    title: '내 현황',
    items: [
      { label: '내 주가',       icon: '👤', to: '/my-stock' },
      { label: '내 포트폴리오', icon: '💼', to: '/portfolio' },
      { label: '훈련 일지',     icon: '📓', to: '/journal' },
      { label: '공시 알림',     icon: '🔔', to: '/notifications', badge: 5 },
    ],
  },
  {
    title: '관리',
    items: [
      { label: '시즌 랭킹', icon: '📊', to: '/rankings' },
      { label: '설정',      icon: '⚙️', to: '/settings' },
    ],
  },
]

// 로그인 사용자 프로필(목업)
export const SSE_USER = {
  name: '김○○',
  initial: '김',
  grade: '중형주 · 38주차',
  coin: 3240,
}

export interface TickerItem {
  key: string
  name: string
  price: number
  up: boolean
  pct: number
}

// 상단 티커 종목(목업)
export function useTicker(): TickerItem[] {
  return [
    { key: 'a', name: '최○○',   price: 2100, up: true,  pct: 30 },
    { key: 'b', name: '박○○',   price: 1890, up: true,  pct: 8  },
    { key: 'c', name: '이○○',   price: 1405, up: true,  pct: 15 },
    { key: 'd', name: '강○○',   price: 1460, up: true,  pct: 5  },
    { key: 'e', name: '정○○',   price: 980,  up: false, pct: 5  },
    { key: 'f', name: '강(2)○○', price: 870,  up: false, pct: 10 },
    { key: 'g', name: '윤○○',   price: 700,  up: true,  pct: 5  },
    { key: 'h', name: '김○○',   price: 1440, up: true,  pct: 20 },
  ]
}
