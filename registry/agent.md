# KSR Registry — 작업 지침 (agent.md)

## 프로젝트 개요

**Korean Swimming Registry (KSR)** — 대한민국 경영 종목 순위 등재부.  
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

## 데이터 소스 — MongoDB `mergedTimes`

**접속:** `localhost:6632`

### 컬렉션 스키마

```js
{
  round:           "finals",           // "finals"|"prelim" 등 (랭킹 산정시 미사용)
  isMasters:       false,              // false=전문체육(elite), true=마스터즈(masters)
  group:           "고등부",           // 유년부|초등부|중등부|고등부|일반부
  gender:          "men",              // "men" | "women"
  distance:        "100M",             // "50M"|"100M"|"200M"|"400M"|"800M"|"1500M"
  discipline:      "BR",               // BR|FR|BK|FL (평영|자유형|배영|접영)
  course:          "LCM",              // "LCM" | "SCM"
  rank:            12,                 // 해당 대회 내 순위 (KSR 전체순위 아님)
  sido:            "경북",             // 선수 시·도
  time:            "01:07.02",         // mm:ss.dd 형식
  name:            "AHN SONG YOUNGSOO THOMAS",
  team:            "덜위치칼리지서울영국학교",  // 소속
  competitionName: "제12회 김천 전국 수영대회",
  datetime:        "2022-03-12",       // ISO date
}
```

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
| `discipline: "BK"` | `stroke: "back"` | |
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
    utils/
      mongo.ts         ← getDb() 유틸
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

```js
{
  gender:          "men" | "women",
  style:           "FR" | "BK" | "BR" | "FL" | "IM",
  distance:        "50M" | "100M" | "200M" | "400M" | "800M" | "1500M",
  course:          "LCM",
  type:            "WR" | "OR" | "AR" | "KR" | "WMR" | "KMR" | "ER",
  time:            "00:20.88",
  name:            "Cameron McEvoy",
  nationality:     "AUS",       // IOC 3자리 코드
  nation_code:     "🇦🇺",       // 국기 이모지
  year:            2026,
  datetime:        "2026-03-20",
  age:             "25-29",
  sido:            "선전",
  competitionName: "China Open",
  pool:            "수영장명",
}
```

### 기록 유형 (type)

| 코드 | 명칭 | 비고 |
|------|------|------|
| WR  | 세계기록 | |
| OR  | 올림픽기록 | 50m 배영·평영·접영 제외 (비올림픽 종목) |
| AR  | 아시아기록 | |
| KR  | 한국기록 | |
| WMR | 세계마스터즈기록 | |
| KMR | 한국마스터즈기록 | |
| ER  | 인핸스드게임기록 | |

### eventMap 키 형식

```
"men-free-50-lcm"   →  gender-stroke-dist-lcm
```

stroke 변환: `FR→free, BK→back, BR→breast, FL→fly, IM→im`

### records.vue 동작 흐름

1. `useFetch('/api/backend/records')` → `watchEffect`로 `eventMap` 구성
2. 탭(10개: 남녀×5종목) 클릭 → 해당 stroke의 거리별 테이블 표시
3. **행 클릭** → 오른쪽 편집 패널 열림 (데이터 pre-fill)
4. 패널에서 수정 후 **저장** → 즉시 `PUT` or `POST` 호출 → 패널 닫힘
5. CSV 내보내기/불러오기: 현재 탭 기준

---

## 작업 진행사항

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
