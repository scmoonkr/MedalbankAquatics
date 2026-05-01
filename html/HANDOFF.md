# 메달뱅크 아쿠아틱스 웹사이트 — 핸드오프 브리핑

> **작성일**: 2026-05-01
> **목적**: 차기 담당자가 이어서 작업할 수 있도록 현재까지의 상황 + 다음 작업 명세 정리
> **현재 상태**: 7개 페이지 중 6개 완성 / 1개(선수목록·선수상세) 미착수

---

## 0. 프로젝트 개요

**메달뱅크 아쿠아틱스**는 수영 대회 촬영 전문팀(2019~). 본 사이트는 다음의 핵심 기능을 가진 포트폴리오 + 사진 동의 플랫폼:

1. **갤러리(메인)** — 시네마틱 큐레이션 (현재 150장의 동의 완료 사진)
2. **사진집(photos)** — 정갈한 그리드 + 페이지네이션
3. **공개요청(consent) + 장바구니(cart)** — 사진 동의 시스템 (B&W 미공개 → 이메일 동의 → 컬러 공개)
4. **선수목록(athletes) + 선수상세(athlete)** — 동의된 사진의 디렉토리 (이름·이메일별)
5. **정기간행물(magazines)** — A4 표지 갤러리
6. **촬영서비스(about)** — 회사 소개 / 매니페스토
7. **촬영요청(request)** — 대회 촬영 협업 + 게시판 형식 제보

데이터 흐름: 누군가 자기 사진을 consent.html에서 발견 → 장바구니 → 이메일 인증 → 공개 → photos.html에 컬러로 등장 + 그 이름으로 athlete 페이지 자동 생성.

---

## 1. 디자인 철학

- **시네마틱 + 매거진 톤** — Nanum Myeongjo + Playfair Italic + Sans 3종 조합
- **색상**: 검정 베이스(#07090f), accent 컬러는 #38B6FF
- **갤러리(index)는 자체 시스템** — 곡률 그리드 + 드래그 + 모멘텀 + 커스텀 커서 (시네마)
- **그 외 페이지는 shared.css / shared.js 사용** — 정적 + 단순 + 빠름 (책 / 매거진)
- **사진 비율**:
  - 갤러리: 4:5 portrait (큐레이션)
  - 사진집: 3:2 landscape (실제 카메라 비율)
  - 공개요청: 4:5 (저화질 흑백 320×400)
  - 정기간행물: A4 (1:√2)
- **모든 비-index 페이지** footer는 정적 (페이지 끝) — 처음 로드 시 안 보이고, 스크롤 끝에서 등장

---

## 2. 폴더 구조

```
2. 갤러리/
├── index.html              ✅ 메인 갤러리 (자체 system)
├── photos.html             ✅ 사진집
├── magazines.html          ✅ 정기간행물 목록 (3/2/1 컬럼)
├── about.html              ✅ 촬영서비스
├── request.html            ✅ 촬영요청 (게시판 + 폼)
├── consent.html            ✅ 공개요청 (다중 선택 + localStorage 카트)
├── cart.html               ✅ 장바구니 (동의 폼 + 미성년자 처리)
├── athletes.html           ❌ 미구현 (이번 작업)
├── athlete.html            ❌ 미구현 (이번 작업)
├── magazine.html           ⏸ 보류 (사용자 요청)
│
├── css/
│   └── shared.css          ✅ 공통 디자인 시스템 (커서 시스템 제외 — index.html만 사용)
├── js/
│   └── shared.js           ✅ 공통 JS (메뉴, 라이트박스, 시계, 힌트 dismiss)
│
├── data/                   📁 (생성 예정 — athletes.json, photos.json)
│
├── images/
│   ├── thumbs/                  ✅ 800×1000 4:5 썸네일 × 150
│   ├── xl/                      ✅ 2080~3200px 4:5 최상화질 × 150 (라이트박스용 — index/photos 공통)
│   ├── preview/                 ✅ 320×400 흑백 저화질 × 150 (consent.html용)
│   ├── avatars/                 ✅ 14명 (about.html testimonials용)
│   ├── magazine/                📁 (cover-01.jpg 자리만 있음)
│   ├── medalbankaquatics.png    ✅ 메인 로고
│   ├── medalbankaquatics_.png   ✅ 검정 배경 로고 (미사용)
│   ├── cursor.png               ✅ 검정 커서 (미사용)
│   └── cursor_2.png             ✅ 흰 커서 (index.html 전용)
│
├── HANDOFF.md              ✅ 본 문서
└── .backup/                📁 작업 중 백업 (20260501-XXXX)
```

### 핵심 자산 메타

- **photo_mapping.json**: 썸네일 인덱스 ↔ 원본 파일명 매핑 (150장 — 작업 중 outputs에 보관)
- **현재 사진**: 모두 4:5 portrait (placeholders 원본 폴더는 제거됨, 실제 production에선 3:2 8000px 원본 사용 예정)
- **이미지 tier 통일**: 라이트박스는 index/photos 모두 `xl/` 사용 (이전 `full/` 제거)

---

## 3. 페이지별 현재 상태

### ✅ index.html — 갤러리 메인
- **자체 system** (shared.css/js 사용 안 함)
- 곡률 sin 그리드 + 5.5/3.5 컬럼 + 드래그/휠/터치 모멘텀
- 커스텀 커서 (mix-blend-mode, "ㅍㅇ ㅎㅇㅌ" 라벨)
- 라이트박스 (썸네일 즉시 + full lazy load)
- 로더 → 로고 morph → 갤러리 reveal 시퀀스
- 메뉴: 인라인(데스크탑) + 햄버거 풀스크린(모바일/태블릿)

### ✅ photos.html — 사진집
- **shared.css/js 사용**
- 6/3/3 정적 그리드, 100장/페이지, 4 mock 페이지
- 라이트박스: 3:2 비율 + xl tier (최상화질)
  - **참고**: 실제 사진은 4:5 portrait 파일이라 3:2 박스에 cover crop 표시. 추후 진짜 3:2 8000px 원본이 들어오면 그대로 작동.
- 페이지네이션: 1~32 숫자만 (이전 페이지/다음 페이지 step 버튼 없음, 좌측 정렬)
- 대회 드롭다운 (mock 6개)
- 사진 hover 시 cursor: pointer

### ✅ magazines.html — 정기간행물 목록
- **3/2/1 컬럼** (데스크탑/태블릿/모바일) — A4 비율 표지
- 5월 창간호만 활성, 5개 coming soon (vol.02~06)
- 표지 클릭 링크/안내 문구 모두 제거 (신비롭게 남김)
- magazine.html 상세 페이지는 **사용자 요청으로 보류**

### ✅ about.html — 촬영서비스
- 9개 섹션 (Press Kit / Who we are / Stats / Mission / Values / Equipment / Testimonials / Contact / Disclaimer)
- Hero: 풀스크린 사진 + 헤드라인
- Stats: 2019 / 50+ / 100% / FREE
- Equipment: 촬영 구간 / 장면 / 렌즈 + 18개 브랜드 pills (hover 효과 없음, 정적 라벨)
- Testimonials: 12개 카드 + 14개 아바타 (직업/말투에 매칭됨)
- CTA "촬영 요청" → request.html 연결
- Disclaimer: 별도 섹션 07 (저작권 / 동의 철회 / © 정보)
- Footer: 정적, hero 안에 작은 meta band 한 번 더 (맨 위에서만 보임)

### ✅ request.html — 촬영요청
- 5개 섹션 (Hero / Premium / Community / Invitations / Submit / Federations)
- **Premium Edition** (정식 의뢰, 1,200,000원) ↔ **Community Edition** (협업 무료) 프레임 — "무료" 단어 0회 (세련된 톤 유지)
- 게시판 = 채팅 스타일 피드 (6개 mock 메시지, 검토중/대기/완료 상태)
- 폼: 이름·소속·이메일(선택)·내용 4필드 + 마스킹 안내
- For Federations & Organizers: 별도 05 섹션

### ✅ consent.html — 공개요청
- 6/3/3 그리드 + 320×400 B&W preview 이미지
- 다중 선택 (accent 보더 + 체크 아이콘)
- localStorage 기반 카트 (`medalbank_consent_cart`)
- Floating cart 버튼 (선택 시 등장, 클릭 시 cart.html로)
- 페이지네이션 (4 mock 페이지, 100장/페이지)

### ✅ cart.html — 장바구니
- 선택 사진 미리보기 (3:2 가로, 좌측 정렬, 160px fixed)
- 동의 폼:
  - 본인 정보: 이름/이메일/미성년자 체크
  - 동의 항목 3종: 웹사이트(필수, 잠금) / SNS / 매거진
  - 미성년자 체크 시 노란 경고 박스
- 제출 시 mock "인증 메일 전송" 화면 (실제 백엔드 미연동)

---

## 4. 공통 시스템 명세

### shared.css 핵심
- 디자인 토큰: --bg, --fg, --accent, --line + 폰트 변수
- 레이아웃: 헤더(top-fixed), footer(end-of-flow), 햄버거 + 풀스크린 메뉴(<1200px)
- 라이트박스: 4:5 기본 (페이지에서 override 가능)
- 비네팅, 그레인 (선택 적용)
- 커서 시스템 **없음** (index.html만 보유)

### shared.js 핵심 API
```js
window.MB.openLightbox(thumbUrl, fullUrl, alt)  // 썸네일 즉시 + full lazy load
window.MB.closeLightbox()
window.MB.setupHintDismiss(delayMs)             // 힌트 dismiss 패턴
```
- Menu toggle/close (햄버거)
- 시계 (KST tick)
- 자동 cursor lerp는 .cursor 엘리먼트 있을 때만 (현재 비활성)

### z-index 표
```
ui (footer/menu)  : 10
vignette          : 5
stage-dim         : 6
lightbox          : 1100
menu-overlay      : 1900
menu-toggle       : 1950
loader            : 2000
logo              : 2100
cursor            : 3000  (index.html only)
```

### 이메일 컨벤션
- `magazine@medalbank.com` — 일반 문의 / 정기간행물 / 촬영 협업
- `consent@medalbank.com` — 동의 철회 / 사진 공개 시스템

---

## 5. 다음 작업: athletes.html + athlete.html

### 5-1. 데이터 모델 — `data/athletes.json` 생성 필요

**선수 mock 데이터 300~500명**:
```json
[
  {
    "id": "ath-001",
    "name": "김민수",
    "name_en": "Kim Minsu",
    "email_masked": "k****@gmail.com",
    "group_ko": "ㄱ",
    "group_en": "K",
    "photo_count": 28,
    "first_meet": "2024.03",
    "last_meet": "2026.04",
    "consented_photos": [/* photos.json에서 idx 참조 */]
  },
  ...
]
```

**그룹핑 규칙**:
- 한글 이름 → 첫 글자 초성 (ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ)
- 영문 이름 → 첫 글자 (A~Z)

**이메일 마스킹**: 첫 1자 + `****` + `@도메인` (예: `k****@gmail.com`)

### 5-2. athletes.html 디자인 명세

```
[헤더]
─────────────────────────────────
선수목록
— 동의된 사진을 가진 모든 수영인

전체 N명 · 사진 N,XXX장
─────────────────────────────────
[Sticky 인덱스]
ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ │ A B C D E F G H ...
─────────────────────────────────
ㄱ
   김민수      28장   2024.03 → 2026.04
   김지영      12장   2025.06 → 2026.04
   김태우      45장   2023.11 → 2026.04
ㄴ
   남궁현      8장
   ...
A
   Adams Lee   5장
   ...
─────────────────────────────────
[footer]
```

**디자인 디테일**:
- 좌측 또는 상단에 sticky 이니셜 인덱스 (클릭 시 jump scroll)
- 큰 헤딩 — 이니셜은 거대 Playfair Italic (예: 80px) + 옆에 카운트 작게
- 이름 리스트 — Nanum Myeongjo, hover 시 좌측 점 indicator + 톤 변화
- 우측에 photo_count + first/last meet 작게
- 클릭 → `athlete.html?id=ath-001`

### 5-3. athlete.html 디자인 명세

```
[헤더]
─────────────────────────────────
← 선수목록

김민수
서울시 선수권 외 4개 대회 · 28장 동의

[대회별 ▾]  [최신순 ▾]
─────────────────────────────────
2026.04  강남 마스터즈                   12장
┌──┬──┬──┬──┬──┬──┐
│  │  │  │  │  │  │  ← 그리드 (사진집과 동일 레이아웃)
└──┴──┴──┴──┴──┴──┘

2026.03  서울시 선수권                    8장
┌──┬──┬──┐
│  │  │  │
└──┴──┴──┘
...
─────────────────────────────────
[footer]
```

**디자인 디테일**:
- 이름은 거대 Nanum Myeongjo (60~80px)
- 메타: 대회 수, 동의 사진 수, 첫 사진 날짜
- 토글: "대회별" (default) / "최신순"
- 사진 그리드는 photos.html과 동일한 6/3/3 + 3:2 비율
- 라이트박스도 사진집과 동일 (xl tier 3:2)
- **미동의 사진은 표시 불가** — 이 페이지는 그 이름+이메일로 **동의된 사진만** 모임
- 빈 상태 처리 (있을 수 없지만 안전 차원)

### 5-4. 인터랙션
- athletes.html에서 이니셜 인덱스 클릭 → 해당 섹션으로 부드럽게 스크롤
- 이름 hover → 점 indicator + accent 컬러 톤 변화
- 이름 클릭 → athlete.html?id=ath-XXX (URL 파라미터)
- athlete.html은 URL의 id로 데이터 fetch + 렌더

### 5-5. 모바일
- Sticky 인덱스: 가로 스크롤 (수평 인덱스 바)
- 이름 리스트: 1컬럼
- athlete.html 그리드: 모바일 3컬럼 (photos.html과 동일)

---

## 6. 알려진 이슈 / 메모

### 잘 작동하는 것
- ✅ 7개 페이지 시각 일관성 (디자인 토큰, 폰트, 색상)
- ✅ 모바일/태블릿/데스크탑 반응형
- ✅ localStorage 카트 (consent → cart 페이지간 유지)
- ✅ 마스킹 안내 + 미성년자 동선
- ✅ 이메일 인증 mock 화면
- ✅ Premium/Community 프레임으로 "무료" 단어 절제

### 우선 점검 권장
- ⚠️ photos.html 라이트박스 배경 — 일부 환경에서 blurred 사진이 안 뜨고 검정만 표시되는 케이스 보고됨. shared.js에 fallback 추가됨 (CSS var + DOM style 이중 적용). 새 chat에서 다시 확인 권장.
- ⚠️ photos.html의 사진 파일은 4:5 portrait지만 그리드/라이트박스는 3:2 — 추후 진짜 3:2 원본 들어오면 자연스럽게 정상화

### 백엔드 미연동
- request.html 폼 제출 → mock alert
- cart.html 제출 → mock 인증 메일 화면
- 대회 드롭다운 필터 → 시각만 작동 (실제 필터링 X)
- 페이지네이션 → 같은 사진의 다른 시퀀스 (mock offset)

### 백엔드 연동 시 필요
- consent 시스템 (Supabase + Resend 권장 — `1. 마크다운/photo-consent-system-spec-v2.md` 참조)
- 사진 메타데이터 (대회·날짜·태그된 선수)
- 이메일 인증 토큰 / 동의 철회

---

## 7. 작업 환경

- **브라우저**: Chrome/Safari/Firefox 모두 최신 (CSS aspect-ratio, :has(), backdrop-filter 사용)
- **빌드 도구 없음** — 순수 HTML/CSS/JS
- **외부 폰트**: Google Fonts (Playfair Display Italic, Nanum Myeongjo)
- **이미지 최적화**: Pillow 스크립트 사용 (`outputs/scripts/build_xl.py`, `build_preview.py`, `shuffle_resize.py`)

---

## 8. 다음 담당자에게

1. **새 chat 시작 시** 이 HANDOFF.md를 첨부하고 "선수목록 + 선수상세 페이지 만들 차례야" 라고 말하면 됨
2. **데이터 mock**: 300~500명 가상 선수 생성 (Python으로 한국 성씨 + 이름 조합 + 영문 + 가짜 이메일)
3. **파일명 규칙**: athletes.html / athlete.html (단/복수 일관성)
4. **링크 연결**: 메뉴 "선수목록" → athletes.html, photo lightbox에서 선수 이름 클릭 시 → athlete.html?id=... (이건 다음 다음 단계)
5. **백업**: 작업 중 .backup/{YYYYMMDD-HHMM}/ 폴더에 저장 권장 (이미 3개 백업 있음)

---

## 9. 진행 체크리스트

- [x] 백업 + 1.마크다운 폴더 분석
- [x] 전체 아키텍처 + 페이지별 디자인 제안서
- [x] 공통 디자인 시스템 (shared.css/js)
- [x] index.html 갤러리 (이전 chat에서 완성)
- [x] photos.html 사진집
- [x] about.html 촬영서비스
- [x] request.html 촬영요청
- [x] consent.html + cart.html 공개요청·장바구니
- [x] magazines.html 정기간행물 목록
- [x] 320px 흑백 placeholder 생성
- [ ] **athletes.html + athlete.html 선수목록·선수상세** ← 다음 작업
- [ ] 선수 mock 데이터 (athletes.json) 생성
- [ ] magazine.html 단일 호 상세 (보류 중)
- [ ] 전체 통합 + 메뉴 링크 연결 + 검증
- [ ] (장기) 백엔드 연동 / 실제 사진 교체 / 도메인 배포

---

**End of brief — Good luck! 🏊**
