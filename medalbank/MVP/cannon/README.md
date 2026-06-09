# The Canon — 통합 안내 (KSR 추가 페이지)

기존 KSR 사이트(index / errata / ledger / charter)에 **The Canon · 정전** 한 페이지를
추가하는 패키지입니다. 이 폴더의 파일을 기존 KSR 폴더에 그대로 얹어 통합하면 됩니다.

---

## 1. 포함된 파일

```
.
├── canon.html              — 새 페이지 (그대로 사이트 루트에 추가)
├── css/styles.css          — 캐논 섹션 + 모달 섹션이 추가된 스타일 (§3, §8 참조)
├── js/
│   ├── canon-data.js       — 매트릭스 데이터 (운영자가 점진 채워 넣을 스켈레톤)
│   ├── canon.js            — 렌더러
│   ├── scoring.js          — 모달용: World Aquatics 포인트 / 연령 보정 엔진 (§8)
│   └── modal.js            — 모달용: 사이트 전체 공용 기록 분석 모달 (§8)
├── images/logo.png         — 기존 로고 (이미 사이트에 있다면 덮어쓰지 말 것)
└── README.md               — 본 문서
```

---

## 2. 페이지 컨셉

**The Canon · 정전**: 종목마다 인류가 새겨 온 모든 기준점(WR · OR · AR · KR · WMR · KMR · ER)
을 한 화면에서 비교하는 매트릭스 페이지.

- LCM **개인전만** 다룹니다. SCM·계영·혼계영·혼성종목은 제외.
- 영법 5종: 자유형 · 배영 · 평영 · 접영 · 개인혼영
- 성별: 남자/여자 동시 표시 (별도 토글 없음)
- 상단 영법 빠른 점프 링크가 sticky로 따라옵니다.

---

## 3. 통합 시 체크리스트

### 3-1. nav 7개 페이지 vs 5개 페이지

본 캐논 페이지의 nav는 기존 운영중인 4개 페이지 + 캐논 5개 항목으로 설정되어 있습니다.

```
The Index · The Errata · The Ledger · The Canon · The Charter
```

기존 4개 페이지의 nav에도 The Canon 링크를 같은 자리(Ledger 다음, Charter 앞)에 추가해
주세요.

### 3-2. eyebrow 번호

- 캐논 페이지 eyebrow: `04 · The Canon · 정전`
- 기존 The Charter 페이지의 eyebrow를 `04 · The Charter · 헌장` → **`05 · The Charter · 헌장`**
  으로 갱신해 주세요.

### 3-3. CSS 추가분

`css/styles.css`는 기존 styles.css와 거의 동일하지만, 파일 끝부분의
`/* 12 · The Canon — record matrix (LCM 개인전 · 남녀 동시) */` 섹션이
새로 추가된 부분입니다. 이 섹션만 기존 styles.css 끝에 append하면 됩니다.

본 패키지에는 lineage/chronology 등 다른 신규 페이지용 CSS는 포함하지 않았습니다.
새 디자인 토큰·새 색·새 폰트 0건 — 모두 기존 CSS 변수만 사용합니다.

---

## 4. 데이터 스키마

`window.KSR_CANON`은 다음 구조를 따릅니다.

```js
{
  recordTypes:  [{ code, ko, full }, ...],   // 7개 기록 종류 메타
  strokeLabels: { FR: {ko,en,short}, ... },  // 5개 영법 라벨
  events: [
    {
      id:       "m-fr-50",
      gender:   "M" | "W",
      stroke:   "FR" | "BA" | "BR" | "FL" | "IM",
      distance: 50 | 100 | 200 | 400 | 800 | 1500,
      course:   "LCM",
      label:    "남자 자유형 50m",
      records: {
        WR:  { time, athlete, nation, year, venue, ageGroup },
        OR:  null,    // 채워질 자리는 null. 렌더 시 "—"로 표시됨
        AR:  null,
        KR:  null,
        WMR: null,    // ageGroup 필드 있음 (예: "25-29")
        KMR: null,    // ageGroup 필드 있음
        ER:  null
      }
    },
    ...
  ]
}
```

- 시드 데이터: 34개 이벤트 (영법 5종 × 거리 × 남녀) 모두에 WR 컬럼만 더미로 채워 넣었음
- 나머지 6개 컬럼(OR/AR/KR/WMR/KMR/ER)은 모두 `null` → 운영자가 검증된 기록 입력 시까지 `—` 표시

---

## 5. 시간 포맷

- `m:ss.SS` (1분 이상) 예: `1:42.00`, `14:30.67`
- `ss.SS` (1분 미만) 예: `20.91`, `46.40`
- JetBrains Mono + `tnum` 폰트 피처로 자릿수 정렬

---

## 6. 디자인 토큰 (기존 KSR과 동일)

- 배경: `#ffffff` / 부드러운 배경: `#f9f8f4`
- 텍스트: `#0a0a0a` / 보조: `#4a4a48` / 흐림: `#8a8a86` / 가장 흐림: `#b8b6af`
- 보더: `#e3e1d8` (단일 hairline)
- 강조색: `#b3893a` (골드) · `#0a1d3a` (네이비)
- 서체: Cormorant Garamond · Nanum Myeongjo · Inter · JetBrains Mono

---

## 7. 로컬 미리보기

순수 정적 파일입니다. 폴더 안에서:

```bash
python3 -m http.server 4178
# http://localhost:4178/canon.html
```

또는 VS Code Live Server 같은 정적 서버 도구로 그대로 열어 볼 수 있습니다.

---

## 8. 기록 분석 모달 (사이트 전체 공용)

캐논 페이지의 모든 시간 셀(예: `20.91`, `1:54.00`)에 마우스를 올리면 밑줄이 나타나며,
클릭 시 모달이 열려 해당 기록을 분석합니다. **사이트 전체에서 재사용 가능한 컴포넌트**로
설계되어 있습니다.

### 8-1. 트리거 패턴

기록 분석을 받고 싶은 시간 텍스트에 다음 마크업을 적용하세요. canon.html 안에서는
`canon.js` 가 자동으로 처리하지만, **index.html · errata.html · ledger.html 에서도
동일한 패턴으로 적용 가능합니다.**

```html
<span class="time time-trigger"
      data-gender="M"
      data-stroke="BR"
      data-distance="100"
      data-course="LCM"
      data-time="59.18"
      role="button"
      tabindex="0">00:59.18</span>
```

데이터 속성:
- `data-gender`   : `M` · `W`
- `data-stroke`   : `FR` · `BA` · `BR` · `FL` · `IM`
- `data-distance` : `50` · `100` · `200` · `400` · `800` · `1500`
- `data-course`   : `LCM` · `SCM`
- `data-time`     : `m:ss.SS` 또는 `ss.SS` 형식 (예: `1:54.00`, `20.91`)

### 8-2. 모달 구성 (위→아래)

1. **헤더** — 종목·거리·시간 요약
2. **입력 (Inputs)** — 성별 / 영법 / 거리 / 코스 / 시간 / 생년월일. **모든 항목을 사용자가
   자유롭게 편집 가능**하며, 변경 시 아래 블록이 즉시 재계산.
3. **권위 기록 비교 (Canon Comparison)** — WR / OR / AR / KR / WMR / KMR 6종에 대해
   기록·차이·보유자 표시. The Ledger의 비교 박스 스타일을 따름.
4. **World Aquatics 포인트** — 큰 italic 숫자 + gold 액자 ❲ ❳ + 1000/900/800점 기준 시간
   3박스 + "1000점까지" 차이.
5. **같은 점수의 다른 종목 (Equivalent Events)** — 2 행 × 5 열 그리드:
   - 1행: 자유형 50 · 배영 50 · 평영 50 · 접영 50 · 개인혼영 200
   - 2행: 자유형 100 · 배영 100 · 평영 100 · 접영 100 · 개인혼영 400
   - 각 칸: 동일 포인트의 환산 시간 + 1000점 기준
6. **연령 보정 (Age Adjustment)** — 생년월일 입력 시에만 표시. 본인 연령 그룹 / 25-29
   오픈 등가 시간 / 등가 점수 + 모든 연령부 (25-29 ~ 85-89) 비교 표.
7. **(i) 정보 버튼** — World Aquatics Points 공식 및 Rowson-style 연령 보정에 대한
   정직한 출처 안내.

### 8-3. 점수 계산 공식

```
Points = floor( 1000 × (basetime ÷ time)³ )
```

`scoring.js` 의 `BASE_TIMES_LCM` 에 모든 LCM 개인전 종목의 기준 시간이 정의되어 있습니다.
운영 시 World Aquatics 공식 베이스타임 표로 교체하면 됩니다.

### 8-4. 연령 보정

`scoring.js` 의 `AGE_GROUP_FACTORS` 는 25-29(오픈) 마스터즈 세계기록과 각 연령부의
마스터즈 세계기록의 평균 비율을 단일 계수로 적용한 **Rowson-style 단일 모델**입니다.
종목·거리에 따라 실제 비율이 변동하나 큰 그림을 가늠하기에 충분하며, 이 한계는
(i) 안내 문구에 명시되어 있습니다.

### 8-5. 권위 기록 데이터 (compare overlay)

WR/OR/AR/KR/WMR/KMR 비교 데이터는 `scoring.js` 의 `COMPARE_OVERLAY` 객체에 종목별로
정의합니다. 현재 다섯 종목에 대한 시드 데이터가 들어있으며, 운영자가 점진적으로
채워 넣는 구조입니다. 해당 데이터가 없는 종목을 클릭하면 안내 문구가 표시됩니다.

### 8-6. 다른 페이지로 확장하기

index.html / errata.html / ledger.html 등에서 동일 모달을 활성화하려면:

```html
<script src="js/scoring.js"></script>
<script src="js/modal.js"></script>
```

위 두 스크립트를 페이지 끝에 추가하고, 시간 텍스트에 `.time-trigger` 클래스 + data 속성
세트를 적용하면 자동으로 모달이 동작합니다. modal.js는 페이지에 모달 DOM을 한 번만
삽입하며, document 레벨 이벤트 위임을 사용해 모든 트리거를 받습니다.

---

*캐논 한 페이지 + 사이트 전체 공용 모달 패키지 · 2026-05-23*
