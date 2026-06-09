# KSR Registry — 작업 지침 (agent.md)

## 프로젝트 개요

**메달뱅크 (Medalbank)** — 대한민국 경영 종목 순위 등재부.  
`registry/MVP/` 에 정적 HTML+JS MVP가 있으며, MongoDB `mergedTimes` 컬렉션을 데이터 소스로 사용한다.

---

## 디렉토리 구조

```
registry/                ← Nuxt 앱 루트 (포트 6632)
  agent.md               ← 이 파일 (작업 지침)
  nuxt.config.ts
  package.json
  pages/                 ← 공개 사이트 + /backend 어드민
  layouts/
  server/                ← Nuxt SSR API (Mongo 직접 쿼리)
    api/
      sheet.get.ts       ← GET /api/sheet (단일 이벤트 페이지네이션)
    utils/
      mongo.ts
    plugins/
      ensure-indexes.ts  ← 기동 시 mergedTimes 인덱스 보장
  assets/
  public/
  MVP/                   ← 폐기 예정 정적 프로토타입 (화면 정리 후 삭제)
    index.html           ← The Index (등재부 메인, 순위표)
    ledger.html          ← The Ledger (기록대장, 신규 등재 피드)
    errata.html          ← The Errata (정오표)
    charter.html         ← The Charter (헌장, 정적)
    css/styles.css
    js/
      data.js            ← window.KSR_DATA 전체 데이터 (빌드 결과물)
      index.js           ← The Index 렌더링 로직
    images/logo.png
    AUTOMATION.md        ← 데이터 스키마 및 자동화 규칙 상세 문서
```

---

## 데이터 소스 — MongoDB (`Breaststroke` DB)

**접속:** `localhost:6632` (registry Nitro → `server/utils/mongo.ts`)

---

### `mergedTimes` — PK: `timeID`

`times` 컬렉션의 비정규화(denormalized) 사본. `times`와 필드 구조가 동일하며, 에라타(수동 정정) 반영본이다.

```js
{
  // ── 식별자 ──────────────────────────────────────────
  timeID:          752966,             // PK (times.timeID 와 동일)
  tid:             1,                  // 순번 고유키 (마이그레이션으로 부여, 1~)
  competitionID:   2300,               // FK → competitions.competitionID
  poolID:          1341,               // FK → pools.poolID
  teamID:          11908,              // FK → teams.teamID
  stemID:          397,                // FK → stems.stemID
  aid:             1000001,            // FK → athletes.aid

  // ── 선수 / 기록 ──────────────────────────────────────
  name:            "AHN SONG YOUNGSOO THOMAS",
  gender:          "men",              // "men" | "women"
  time:            "01:07.02",         // mm:ss.dd
  timeStamp:       0.000776,           // time을 일(day) 단위 소수로 변환 (정렬용)
  rank:            12,                 // 해당 대회 내 순위 (KSR 전체순위 아님)
  lane:            1,
  round:           "finals",           // "finals"|"prelim"|"" 등

  // ── 종목 ─────────────────────────────────────────────
  discipline:      "BR",               // BR|FR|BA|FL|IM
  distance:        "100M",             // "50M"|"100M"|"200M"|"400M"|"800M"|"1500M"
  course:          "LCM",              // "LCM" | "SCM"

  // ── 분류 ─────────────────────────────────────────────
  isMasters:       false,              // false=전문체육(elite), true=마스터즈
  isAdult:         false,              // false=학생부, true=성인부
  group:           "고등부",           // 유년부|초등부|중등부|고등부|일반부|성인부
  ageGroup:        "남자고등부",       // 표시용 연령 그룹 레이블 (마스터즈는 "55-59" 등)
  type:            "event",            // "event" 고정 (기록 타입)
  measured:        "자동계측",         // "자동계측" | "수동계측"
  grade:           "1",                // 학년 (학생부만)
  status:          "번외",             // 번외 기록 등 특이사항 (없으면 필드 없음)

  // ── 소속 / 지역 ───────────────────────────────────────
  team:            "덜위치칼리지서울영국학교",
  sido:            "경북",             // 선수 시·도 (해외는 "해외")

  // ── 대회 / 장소 (비정규화 복사) ──────────────────────
  competitionName: "제12회 김천 전국 수영대회",
  datetime:        "2022-03-12",       // ISO date
  pool:            "김천",             // 수영장명
  stem:            "김천 전국 수영대회", // 대회 시리즈명
}
```

---

### `competitions` — PK: `competitionID`

대회 메타데이터.

```js
{
  competitionID:   1370,               // PK
  competitionName: "제9회 오산시 독산성배 전국 마스터즈 수영대회",
  datetime:        "2019-07-06",       // ISO date
  isMasters:       true,
  pool:            "오산스포츠센터수영장",
  poolID:          869,                // FK → pools.poolID
  sido:            "경기",
  stemID:          85,                 // FK → stems.stemID
  stem:            "오산시 독산성배 전국 마스터즈 수영대회",
  measured:        "자동계측",
  course:          "LCM",
}
```

---

### `pools` — PK: `poolID`

수영장 마스터.

```js
{
  poolID:  1342,                       // PK
  pool:    "남아프리카공화국,더반",    // 수영장명 (해외는 "국가,도시" 형식)
  sido:    "해외",                     // 국내 시·도 또는 "해외"
  country: "남아프리카공화국",         // 해외 수영장만 존재
}
```

---

### `counters` — tid 자동증가 카운터

MongoDB 시퀀스 패턴. `mergedTimes_tid` 문서 하나로 `tid`의 현재 최댓값을 관리한다.

```js
// counters 컬렉션
{ _id: "mergedTimes_tid", seq: 912087 }
```

`server/utils/tid.ts` 에 두 함수 존재:

```ts
// 새 tid 발급 (신규 문서 삽입 시)
nextTid(db): Promise<number>
  → findOneAndUpdate({ _id: 'mergedTimes_tid' }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' })

// 마이그레이션 후 카운터 동기화 (이미 더 큰 값이 있으면 덮어쓰지 않음)
initTidCounter(db, value): Promise<void>
```

`errata/[id]/confirm.post.ts` — '누락건 신규 등재' 시 `nextTid(db)` 를 호출해 `tid` 를 삽입 payload에 포함.

**인덱스** (`ensure-indexes.ts`):
```ts
{ tid: 1 },  unique: true, sparse: true   // 이름: 'ksr-tid'
// sparse: pre-migration 문서(tid 없음)가 unique 제약 위반하지 않도록
```

---

### 컬렉션 관계

```
mergedTimes ──┬── competitionID ──▶ competitions
              ├── poolID        ──▶ pools
              ├── teamID        ──▶ teams
              ├── stemID        ──▶ stems
              └── aid           ──▶ athletes
```

---

### 핵심 주의사항

- `rank` 필드는 **대회 내 순위**이지 KSR 전체순위가 아니다. KSR 순위는 ETL에서 별도 계산.
- KSR 순위 = 선수별 best time 기준 전체 정렬 후 1~100위 부여.
- `round` 값은 랭킹 산정에서 **필터하지 않는다.** prelim/heats/finals 어디서든 best time이 곧 해당 선수의 KSR 기록 (dedupe가 자동으로 최고기록 한 줄만 남김).

---

## 필드 매핑 (mergedTimes → KSR)

| mergedTimes | KSR | 변환 |
|---|---|---|
| `isMasters: false` | `division: "elite"` | |
| `isMasters: true` | `division: "masters"` | |
| `group: "일반부"` | `group: "adult"` | |
| `group: "고등부"` | `group: "high"` | |
| `group: "중등부"` | `group: "mid"` | |
| `group: "초등부"` | `group: "elem"` | |
| `group: "유년부"` | `group: "youth"` | |
| `discipline: "BR"` | `stroke: "breast"` | |
| `discipline: "FR"` | `stroke: "free"` | |
| `discipline: "BA"` | `stroke: "back"` | |
| `discipline: "FL"` | `stroke: "fly"` | |
| `gender: "men"` | `gender: "m"` | |
| `gender: "women"` | `gender: "f"` | |
| `distance: "100M"` | `distance: 100` | 숫자로 변환 |
| `course: "LCM"` | `course: "lcm"` | 소문자 |
| `sido` | `city` | 그대로 |
| `team` | `team` (신규 필드) | |
| `competitionName` | `meet_full` | |
| `datetime` | `date` | |

---

## data.js 구조 (window.KSR_DATA)

```js
window.KSR_DATA = {
  // division=all 계열
  "all":           [...],   // 전부문 전연령
  "adult":         [...],   // 전부문 일반부
  "high":          [...],   // 전부문 고등부
  "mid":           [...],   // 전부문 중등부
  "elem":          [...],   // 전부문 초등부
  "youth":         [...],   // 전부문 유년부

  // elite 계열
  "elite":         [...],   // 전문 전연령
  "elite-adult":   [...],   // 전문 일반부
  "elite-high":    [...],   // 전문 고등부
  "elite-mid":     [...],   // 전문 중등부
  "elite-elem":    [...],   // 전문 초등부
  "elite-youth":   [...],   // 전문 유년부

  // masters 계열
  "masters":       [...],   // 마스터즈 전연령
  "masters-adult": [...],   // 마스터즈 성인부
}
```

각 배열 원소 (event):

```js
{
  label:    "남자 평영 100M LCM",
  id:       "m-breast-100-lcm",
  gender:   "m",
  stroke:   "breast",
  distance: 100,
  course:   "lcm",
  ranks: [
    {
      rank:      1,
      name:      "김민호",
      city:      "광주",        // sido
      team:      "광주광역시청", // 소속 (신규)
      date:      "2026-05-18",
      time:      "00:59.18",
      meet:      "25 코리아챔피언십",    // 단축명 (생성 규칙 아래 참조)
      meet_full: "2025 KB금융 코리아 스위밍 챔피언십",
    },
    ...
  ]
}
```

### meet 단축명 생성 규칙

`competitionName`에서 자동 생성:
- 연도 4자리 → 2자리로 (`2022` → `22`)
- "제NN회" → NN회로 축약
- 예: `"제12회 김천 전국 수영대회"` → `"12회 김천 전국"`

---

## index.js — sheetKey() 매핑

```js
function sheetKey(division, group) {
  if (group === 'all') return division;           // "all"|"elite"|"masters"
  if (division === 'all') return group;           // "adult"|"high"|"mid"|"elem"|"youth"
  return `${division}-${group}`;                  // "elite-high" 등
}
```

---

## 작업 목록

### 1. /api/sheet — 단일 이벤트 페이지네이션 (`registry/server/api/sheet.get.ts`)

쿼리: `division, group, gender, stroke, distance, course, page` (page=1당 100명)

MongoDB aggregation 한 번에 처리, 5분 캐시. 과거 `/api/sheets`(복수, 전체 빌드)와 `registry/server/utils/etl.ts`(인프로세스 변환)는 폐기.

```
$match: gender + discipline + distance + course + (isMasters) + (group)
       + time 포맷 검증 (DNS/DQ 등 status 있는 행 제외)
$sort:  { time: 1 }                       ← athlete의 best가 맨 앞
$group: { _id: { name, gender }, best: $first }          ← 동명이인 dedupe
                                                          (group/division 키 미포함:
                                                          같은 선수의 연령군·소속 변경 무시)
$replaceRoot, $sort by time
$facet: page 슬라이스 + total 카운트 동시
→ shapeRanks: 동률 처리 후 응답 (rank 12×2 → 다음 rank 14)
```

### 2. index.js 업데이트

- `GROUPS` 배열 `enabled: false` → `true` (high/mid/elem/youth)
- `sheetKey()` 전체 division×group 조합 처리
- `buildTable()` / `rowHtml()` — `team` 컬럼 추가 (City · 시도, Team · 소속)

### 3. ledger.html 연동 (후순위)

현재 완전 정적 HTML. data.js 기반으로 동적 렌더링으로 전환.

---

## 참고 파일

- `registry/MVP/AUTOMATION.md` — 전체 데이터 스키마 및 Ledger/Errata 자동화 규칙 상세
- `registry/MVP/js/index.js` — The Index 렌더링 로직 전체
- `registry/MVP/ledger.html` — Ledger entry HTML 구조 참조 (정적 샘플 10건)

---

## Nuxt 앱 — `registry/`

Nuxt 3 (SSR + SPA 혼합) 기반 공개 사이트 + 백엔드 어드민.  
포트: **6632** (`nuxt.config.ts` → `devServer.port` + `package.json` dev script `--port 6632`)

### 디렉토리 구조

```
registry/
  pages/
    index.vue          ← 홈
    ledger.vue         ← The Ledger (ledger 컬렉션)
    backend/
      records.vue      ← 백엔드 어드민 — Records 관리
      times.vue        ← 백엔드 어드민 — Times 조회
      leaderboard.vue  ← 백엔드 어드민 — 리더보드
      errata.vue       ← 백엔드 어드민 — 에라타 (오류정정)
  layouts/
    backend.vue        ← 어드민 레이아웃 (다크 상단바)
  server/
    api/
      ledger.get.ts
      backend/
        records.get.ts
        records.post.ts
        records/
          [id].put.ts
          [id].delete.ts
        times.get.ts
        times-all.get.ts   ← 전체 mergedTimes 조회 (필터 없음)
        migrate-tid.post.ts ← tid 일괄 부여 HTTP 엔드포인트
        errata/
          [id]/
            confirm.post.ts ← 에라타 → mergedTimes 확정 등재 (tid 자동 부여)
    utils/
      mongo.ts         ← getDb() 유틸
      tid.ts           ← nextTid() / initTidCounter() — counters 패턴
    plugins/
      ensure-indexes.ts ← 기동 시 mergedTimes 인덱스 보장 (tid 포함)
  scripts/
    migrate-tid.mjs        ← tid 일괄 부여 Node.js 스탠드얼론 스크립트
    fix-tid-duplicates.mjs ← tid 중복 감지·재부여
    check-timeid.mjs       ← timeID 존재 여부 진단
  nuxt.config.ts
```

### routeRules

```ts
'/backend/**': { ssr: false }   // 어드민 페이지는 SSR 끔 (hydration mismatch 방지)
```

### 중요 주의사항

- **`await useFetch` in `<script setup>`** 금지.  
  Nuxt 3 transform이 `await` 앞뒤 변수 scope를 분리하여 `panel`, `rowClass` 등이 템플릿에서 `undefined`로 보임.  
  대신 `const { data } = useFetch(...)` (await 없이) + `watchEffect`로 반응형 처리.
- **TypeScript generic 멀티라인** (`reactive<{\n...\n}>`) 사용 자제.  
  Vue SFC 컴파일러가 멀티라인 제네릭을 파싱 실패하여 변수가 setup return에서 누락될 수 있음.  
  → `reactive({ ... })` 타입 추론 또는 단일 라인 제네릭 사용.
- **MongoDB ObjectId**: `[id].put.ts` / `[id].delete.ts` 에서 반드시 `new ObjectId(id)` 사용.

---

## 백엔드 어드민 — records 페이지

### MongoDB `records` 컬렉션 스키마

크롤링 시점에서 확정된 실제 스키마. `isMasters` 값에 따라 `type` 필드의 의미가 달라진다.

#### 공통 필드

| 필드 | 타입 | 예 | 설명 |
|---|---|---|---|
| `isMasters`  | boolean | `false` / `true` | 전문체육 vs 생활체육(마스터즈) 구분 |
| `gender`     | string  | `"men"` / `"women"` | |
| `discipline` | string  | `"FR"`/`"BA"`/`"BR"`/`"FL"`/`"IM"` | 영법 |
| `distance`   | string  | `"50M"`/`"100M"`/`"200M"`/`"400M"`/`"800M"`/`"1500M"` | 거리 |
| `course`     | string  | `"LCM"` / `"SCM"` | 풀 길이 |
| `time`       | string  | `"00:20.88"` | mm:ss.dd |
| `name`       | string  | `"Cameron McEVOY"` | 보유자 |
| `team`       | string  | `"AUS"` / `"제주"` | 소속/국가 (3-letter 또는 시도) |
| `datetime`   | string  | `"2026-03-20"` | YYYY-MM-DD |
| `location`   | string  | `"Shenzhen, CHN"` / `"2022 전국생활체육대축전"` | 도시/장소 또는 대회명 |

#### 전문체육 (`isMasters: false`)

`type`이 **기록 유형 코드**:

| 코드 | 명칭 | 비고 |
|------|------|------|
| WR  | 세계기록 | |
| OR  | 올림픽기록 | 50m 배영·평영·접영 제외 (비올림픽 종목) |
| AR  | 아시아기록 | |
| KR  | 한국기록 | |
| ER  | 인핸스드게임기록 | |

```js
// 예: 남자 50m FR LCM 세계기록
{
  isMasters:  false,
  gender:     "men",
  discipline: "FR",
  distance:   "50M",
  course:     "LCM",
  type:       "WR",
  time:       "00:20.88",
  name:       "Cameron McEVOY",
  team:       "AUS",
  datetime:   "2026-03-20",
  location:   "Shenzhen, CHN",
}
```

#### 마스터즈 (`isMasters: true`)

`type`이 **연령 그룹**으로 사용됨. 추가로 `isAdult` 플래그 존재.

| 필드 | 타입 | 예 |
|---|---|---|
| `isAdult` | boolean | `false`(학생부) / `true`(성인부) |
| `type`    | string | 학생부: `"초등부"` / `"중등부"` / `"고등부"`<br/>성인부: `"20-24"` / `"25-29"` / … / `"75-79"` |

```js
// 예: 남자 50m FR LCM 중등부 한국 마스터즈 기록
{
  isMasters:  true,
  isAdult:    false,
  gender:     "men",
  discipline: "FR",
  distance:   "50M",
  course:     "LCM",
  type:       "중등부",
  time:       "00:26.10",
  name:       "임동현",
  team:       "제주",
  datetime:   "2022-09-03",
  location:   "2022 전국생활체육대축전",
}
```

> **주의:** 과거 스키마(`style`/`nationality`/`nation_code`/`year`/`age`/`sido`/`competitionName`/`pool`)는 폐기되었다. [`registry/pages/backend/records.vue`](registry/pages/backend/records.vue)와 관련 API endpoint들은 위 새 스키마에 맞춰 리팩토링 필요 (별도 작업).

### eventMap 키 형식

```
"men-free-50-lcm"   →  gender-stroke-dist-lcm
```

stroke 변환: `FR→free, BA→back, BR→breast, FL→fly, IM→im`

### records.vue 동작 흐름

1. `useFetch('/api/backend/records')` → `watchEffect`로 `eventMap` 구성
2. 탭(10개: 남녀×5종목) 클릭 → 해당 stroke의 거리별 테이블 표시
3. **행 클릭** → 오른쪽 편집 패널 열림 (데이터 pre-fill)
4. 패널에서 수정 후 **저장** → 즉시 `PUT` or `POST` 호출 → 패널 닫힘
5. CSV 내보내기/불러오기: 현재 탭 기준

---

---

## SSE 앱 — `sse/`

**Swim Stock Exchange** — 선수 주식시장 컨셉의 공개 사이트.  
포트: **6633** (`sse/nuxt.config.ts` → `devServer.port` + `package.json` dev script `--port 6633`)

MongoDB: 동일 `.env` 파일 (상위 디렉토리의 `../.env`) 에서 접속정보 로드.

### 디렉토리 구조

```
sse/
  pages/
    index.vue          ← 랜딩(비로그인) + 대시보드(로그인) 단일 파일
  assets/
    css/
      main.css         ← 전역 CSS (변수, reset, 공통 컴포넌트)
  nuxt.config.ts       ← port 6633, DM Serif Display/Pretendard 폰트
```

### index.vue 구조

`definePageMeta({ layout: false })` — default.vue 레이아웃 비활성화.

```vue
<script setup>
const loggedIn = ref(false)          // 로그인 상태 토글
const tickerItems = [...]            // 랜딩·대시보드 공통 티커 데이터
</script>

<template>
  <!-- 랜딩 (비로그인) -->
  <div v-if="!loggedIn">
    site-nav / ticker-wrap / hero / market-preview / features / how-it-works / cta / site-footer
  </div>

  <!-- 대시보드 (로그인) -->
  <div v-else class="app-shell">
    sidebar + app-main (topbar / app-ticker / content)
  </div>
</template>
```

### 랜딩 CSS 핵심 클래스

| 클래스 | 용도 |
|---|---|
| `.grid-2` | 랜딩 2열 그리드 (how-it-works 등) |
| `.grid-3 .market-grid` | 랜딩 마켓 프리뷰 3열 |
| `.hero` | 2열 hero (우측 SVG 차트) |

### 대시보드 CSS 핵심 클래스

| 클래스 | 용도 |
|---|---|
| `.app-shell` | `height:100vh; overflow:hidden` — 전체화면 고정 |
| `.sidebar` | 좌측 사이드바 (240px) |
| `.app-main` | `height:100vh; overflow-y:auto` — 메인 스크롤 영역 |
| `.dash-grid-2` | 대시보드 2열 (시즌랭킹 + 투자자랭킹) |
| `.dash-grid-3` | 대시보드 3열 (공시 + 대회 + 포트폴리오) |
| `.dash-grid-4` | 대시보드 4열 (지표 카드) |

**주의**: 랜딩용 `.grid-2/.grid-3`과 대시보드용 `.dash-grid-*`는 **별개 클래스**로 분리됨.  
대시보드 섹션에서 `.grid-2/.grid-3` 사용 금지 (독립 반응형 제어 불가).

### 반응형 브레이크포인트

| 조건 | 동작 |
|---|---|
| `≤860px` | hero 1열 스택 |
| `≤1024px` | 사이드바 64px 아이콘 전용, `dash-grid-3` → 2열, `dash-grid-4` → 2×2 |
| `≤720px` | 사이드바 → 하단 탭바(56px), `app-shell/app-main` height:auto, 모든 dash-grid → 1열 |

---

## 작업 진행사항

### 2026-05-23

#### mergedTimes — `tid` 순번키 부여

**배경**: `timeID`(자연키, times 컬렉션과 공유)는 이미 825,400개 전체 문서에 존재.  
`tid`는 1부터 시작하는 별도의 순번 고유키로 추가.

- `server/utils/tid.ts` 신규: `nextTid()` / `initTidCounter()` — counters 컬렉션 $inc 패턴
- `server/plugins/ensure-indexes.ts` 업데이트: `{ tid:1 } unique sparse` 인덱스 추가
- `server/api/backend/migrate-tid.post.ts` 신규: HTTP 일괄 부여 엔드포인트 (5000건 배치)
- `scripts/migrate-tid.mjs` 신규: Node.js 스탠드얼론 — 769,518건 부여, maxTid 905,921
- `scripts/fix-tid-duplicates.mjs` 신규: 중복 6,164그룹(6,166건) 감지 후 재부여, 최종 maxTid 912,087
- `scripts/check-timeid.mjs` 신규: timeID 존재 여부 진단 (전수 확인)
- `server/api/backend/errata/[id]/confirm.post.ts` 업데이트: 신규 등재 시 `nextTid()` 호출
- `server/api/backend/times.get.ts` / `times-all.get.ts` 업데이트: 응답에 `tid` 필드 추가

#### registry/agent.md — 스키마 문서 업데이트

`mergedTimes`, `competitions`, `pools` 전체 필드 스키마 + 컬렉션 관계도 추가.

#### sse/pages/index.vue — 전면 재작성

- **랜딩** (`MVP/main.html` 기반): site-nav, 티커, hero(2열), 마켓 프리뷰, 피처, CTA, footer
- **대시보드** (`MVP/main_loggedin.html` 기반): 사이드바 + app-main 전체화면 레이아웃
- `definePageMeta({ layout: false })` — default.vue 레이아웃 완전 분리
- `loggedIn = ref(false)` — `v-if/v-else`로 랜딩·대시보드 토글
- `dash-grid-2/3/4` CSS 클래스 신규: 랜딩 grid-*와 독립 반응형 제어
- 반응형: 860px(hero 스택), 1024px(사이드바 아이콘 전용), 720px(사이드바→하단 탭바)

---

### 2026-05-20

#### registry Nuxt 앱 신규 구축

- `package.json` dev script에 `--port 6632` 추가
- `nuxt.config.ts` `routeRules` 추가: `/backend/**` → `ssr: false`

#### ledger 페이지

- `server/api/ledger.get.ts` 신규: `ledger` 컬렉션 조회, gender/discipline/distance 한국어 변환
- `pages/ledger.vue` 재작성: 25개씩 페이지네이션, 기록 피드 레이아웃

#### 백엔드 어드민 신규

- `layouts/backend.vue` 신규: 다크 상단바, Records·Times·← Site 네비
- `server/api/backend/records.get.ts` — records 컬렉션 전체 조회
- `server/api/backend/records.post.ts` — 신규 레코드 삽입
- `server/api/backend/records/[id].put.ts` — 레코드 수정
- `server/api/backend/records/[id].delete.ts` — 레코드 삭제
- `server/api/backend/times.get.ts` — mergedTimes 최신 2000건 조회
- `pages/backend/times.vue` 신규: 필터(성별·종목·거리·코스·그룹·라운드·검색) + 페이지네이션

#### records 페이지 전면 재작성 (`pages/backend/records.vue`)

- 10개 탭 (남녀 × 자유형·배영·평영·접영·개인혼영)
- 종목별 거리 테이블 + 7가지 기록유형 행 (OR는 50m 배영·평영·접영 제외)
- **행 클릭 → 오른쪽 편집 패널** 슬라이드인
  - 모든 필드 pre-fill (기록, 보유자, 국적, 연도, 작성일, 연령대, 지역, 대회명, 수영장)
  - 국적 클릭 → 76개국 검색 모달 (IOC코드·한국어·영어)
  - 패널 저장 → 즉시 MongoDB PUT/POST → 패널 닫힘
- 기록 auto-format: `002091` → `00:20.91`
- 작성일 auto-format: `20260518` → `2026-05-18`
- Excel paste (탭 구분): 행 전체 한번에 붙여넣기
- CSV 내보내기/불러오기 (탭 단위, BOM UTF-8)
- 전체저장 버튼 제거 → 패널 저장 시 즉시 DB 반영
