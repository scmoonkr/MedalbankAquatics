# The Canon — 계산 공식 명세

이 문서는 `js/scoring.js` 와 `js/modal.js` 에 구현된 모든 계산식·환산식·데이터
구조를 정리한 기술 명세입니다. 담당자가 본 모달 시스템을 운영 환경에 통합하거나
개선할 때 참고할 수 있도록, 출처와 가정 모두 명시했습니다.

---

## 0. 시간 표기 규약

모든 내부 계산은 **초(second) 단위 부동소수점**으로 처리합니다. 표시할 때만
사람이 읽기 쉬운 포맷으로 변환합니다.

| 입력 (string) | 내부 표현 (number) |
|---|---|
| `"20.91"` | `20.91` |
| `"1:42.00"` | `102.00` |
| `"14:30.67"` | `870.67` |
| `"00:20.91"` | `20.91` |
| `"1:42"` | `102.0` |

- **표시 포맷**:
  - `time >= 60s` → `m:ss.SS` (예: `1:42.00`, `14:30.67`)
  - `time < 60s` → `ss.SS` (예: `20.91`)
- 모든 숫자 표시는 **JetBrains Mono + `font-feature-settings: "tnum"`** 으로
  자릿수가 일정하게 정렬됩니다.

구현: `scoring.js` → `parseTime(input)`, `formatTime(seconds)`

---

## 1. World Aquatics 포인트

### 공식

```
Points = floor( 1000 × (basetime / time)³ )
```

- `basetime`: 해당 종목의 기준 시간(초). World Aquatics(전 FINA)가 공식 발간하는
  포인트 표의 베이스타임을 따른다.
- `time`: 측정 기록(초).
- 결과는 정수(소수점 절사).

### 역산 (목표 점수 → 필요한 시간)

```
time = basetime / cbrt(points / 1000)
```

### 출처와 신뢰도

World Aquatics(전 FINA)가 종목 간 객관적 비교를 위해 사용하는 공식 점수 체계로,
세계 수영계에서 가장 보편적·표준적인 비교 지표입니다. 본 페이지의 베이스타임은
**LCM 세계기록 기준**으로 구성되어 있으며, 운영자가 World Aquatics 공식
베이스타임 표로 교체할 수 있습니다 (`scoring.js` → `BASE_TIMES_LCM`).

### 점수 해석 기준 (운영 안내용)

| 점수대 | 의미 |
|---|---|
| 1000점 | 세계기록 수준 |
| 900점 | 세계선수권 결승 수준 |
| 800점 | 국제 정상권 |
| 700점 | 국가대표급 |
| 500점 | 일반 마스터즈 평균대 |

### 구현

```js
function calcPoints(gender, stroke, distance, timeSec) {
  const base = basetime(gender, stroke, distance);
  if (!base || !timeSec || timeSec <= 0) return null;
  return Math.floor(1000 * Math.pow(base / timeSec, 3));
}

function timeForPoints(gender, stroke, distance, points) {
  const base = basetime(gender, stroke, distance);
  if (!base || !points || points <= 0) return null;
  return base / Math.cbrt(points / 1000);
}
```

---

## 2. 베이스타임 표

`scoring.js` → `BASE_TIMES_LCM` 객체. LCM 개인전 34개 종목.

| 영법 (stroke) | 거리 (m) | M 베이스타임 | W 베이스타임 |
|---|---|---|---|
| 자유형 (FR) | 50 | 20.91 | 23.61 |
| 자유형 (FR) | 100 | 46.40 | 51.71 |
| 자유형 (FR) | 200 | 102.00 | 112.23 |
| 자유형 (FR) | 400 | 219.96 | 235.38 |
| 자유형 (FR) | 800 | 452.12 | 484.79 |
| 자유형 (FR) | 1500 | 870.67 | 920.48 |
| 배영 (BA) | 50 | 23.55 | 26.86 |
| 배영 (BA) | 100 | 51.60 | 57.13 |
| 배영 (BA) | 200 | 111.92 | 123.14 |
| 평영 (BR) | 50 | 25.95 | 28.56 |
| 평영 (BR) | 100 | 56.88 | 64.13 |
| 평영 (BR) | 200 | 125.48 | 137.55 |
| 접영 (FL) | 50 | 22.27 | 24.43 |
| 접영 (FL) | 100 | 49.45 | 55.48 |
| 접영 (FL) | 200 | 110.34 | 121.81 |
| 개인혼영 (IM) | 200 | 114.00 | 126.12 |
| 개인혼영 (IM) | 400 | 243.84 | 265.87 |

> **주의**: 본 데이터는 시드값입니다. 운영 시 World Aquatics 공식 베이스타임
> 표로 교체해야 정확한 점수가 산출됩니다. 베이스타임은 매 올림픽 주기마다 갱신됩니다.

---

## 3. 권위 기록 비교 (CANON COMPARISON)

여섯 가지 권위 기록을 한 줄로 비교합니다.

| 코드 | 한글 | 영문 | 출처 |
|---|---|---|---|
| WR | 세계기록 | World Record | World Aquatics |
| OR | 올림픽기록 | Olympic Record | 국제올림픽위원회 (IOC) |
| AR | 아시아기록 | Asian Record | 아시아 수영연맹 (AASF) |
| KR | 한국기록 | Korean Record | 대한수영연맹 |
| WMR | 세계마스터즈기록 | World Masters Record | World Aquatics Masters |
| KMR | 한국마스터즈기록 | Korea Masters Record | 대한수영연맹 마스터즈 |

### 차이초 (diff) 계산

```
diff = user_time - reference_time
```

- `diff > 0` → 사용자 기록이 reference보다 **느림** (양수, `+` 접두)
- `diff < 0` → 사용자 기록이 reference보다 **빠름** (음수, `−` 접두, em-dash 사용)
- `diff == 0` → `±0.00초`
- `|diff| >= 60` → `formatTime()` 으로 `m:ss.SS` 표기
- `|diff| < 60` → `초` 단위로 소수 둘째 자리까지

구현: `scoring.js` → `diffString(timeSec, referenceSec)`

### 데이터 소스

1. **수동 큐레이션** (`COMPARE_OVERLAY` 객체): 운영자가 직접 입력한 정확한 권위 기록
2. **자동 폴백** (`compareRecords` 함수 내부): `COMPARE_OVERLAY` 에 없는 종목은
   다음 비율로 베이스타임에서 자동 생성

| 코드 | 베이스타임 대비 비율 | 비고 |
|---|---|---|
| WR | × 1.000 | 베이스타임 == WR (기본 가정) |
| OR | × 1.018 | WR 대비 약 1.8% 느림 |
| AR | × 1.038 | 약 3.8% 느림 |
| KR | × 1.085 | 약 8.5% 느림 |
| WMR | × 1.125 | 약 12.5% 느림 (25-29 오픈 마스터즈) |
| KMR | × 1.210 | 약 21% 느림 |

> 폴백은 어디까지나 **시각 검증용 placeholder** 입니다. 운영 시 실제 권위 기록을
> `COMPARE_OVERLAY` 에 채워넣어 폴백을 대체해야 합니다.

---

## 4. 연령 보정 (AGE ADJUSTMENT)

### 핵심 개념

마스터즈 수영에서는 연령부별로 세계기록(WMR)이 다릅니다. 같은 절대 시간이라도
연령부에 따라 "어느 수준의 수행인지"가 달라집니다. 본 모듈은 World Aquatics
Masters의 각 5세 연령부 세계기록 평균 비율을 단일 계수로 적용한 **Rowson-style
단일 모델**을 사용합니다.

### 계수 정의

```
factor_X = open_WR_masters / X_age_group_WR_masters
```

- 25-29(오픈 마스터즈) 그룹: `factor = 1.0000`
- 더 나이가 많은 그룹: `factor < 1.0` (그 그룹의 WR이 더 느리므로)

### 계수표

`scoring.js` → `AGE_GROUP_FACTORS`

| 연령부 | factor |
|---|---|
| 25-29 | 1.0000 |
| 30-34 | 0.9900 |
| 35-39 | 0.9777 |
| 40-44 | 0.9560 |
| 45-49 | 0.9280 |
| 50-54 | 0.8940 |
| 55-59 | 0.8510 |
| 60-64 | 0.8040 |
| 65-69 | 0.7490 |
| 70-74 | 0.6860 |
| 75-79 | 0.6170 |
| 80-84 | 0.5430 |
| 85-89 | 0.4670 |

### 등가 시간 환산

본인 연령부 X에서 시간 T_X 를 기록했을 때, 다른 연령부 Y에서 같은 수준의 수행은:

```
T_Y = T_X × (factor_X / factor_Y)
```

- Y가 더 어린 그룹 → `factor_Y > factor_X` → `T_Y < T_X` (등가 시간이 **더 빠름**)
- Y가 더 나이 많은 그룹 → `factor_Y < factor_X` → `T_Y > T_X` (등가 시간이 **더 느림**)

### 예시

본인이 35-39 그룹이고 32.68초를 기록했을 때:

- 25-29 등가: `32.68 × (0.9777 / 1.0000) = 31.95` (더 빠른 시간 필요)
- 40-44 등가: `32.68 × (0.9777 / 0.9560) = 33.42` (더 느린 시간 인정)
- 60-64 등가: `32.68 × (0.9777 / 0.8040) = 39.74` (훨씬 느린 시간 인정)

### 연령 그룹 산출 (DOB → 그룹)

`scoring.js` → `ageGroupFromDob(dobStr, refDate)`

1. 생년월일(`dobStr`)과 기준일(`refDate`, 기본 = 현재) 비교
2. 만 나이 계산
3. 만 25세 미만 → `null` (보정 대상 아님)
4. 그 외 → `Math.floor(age / 5) * 5` 로 5세 간격 그룹 시작점 산출
5. 90세 이상 → `"85-89"` 로 클램프 (표 상한)

### 출처와 한계

- World Aquatics Masters의 연령부별 세계기록 비율을 평균낸 **단일 계수 모델**
- 마스터즈 수영계에서 수십 년간 통용되어 온 비교 방식 (Rowson, Mike Phelps 등
  여러 연구자가 유사 모델을 발표)
- **한계**: 영법·거리에 따라 실제 비율이 다소 변동합니다 (예: 50m 평영과
  1500m 자유형의 연령 곡선은 다름). 본 모델은 평균값을 사용하므로
  종목별 정밀 계수표가 필요한 경우 별도 데이터로 교체 필요.

---

## 5. 같은 점수의 다른 종목 (EQUIVALENT EVENTS)

### 개념

현재 기록의 World Aquatics 포인트와 **동일한 포인트**를 받는 다른 종목의 시간을
역산하여 보여줍니다.

### 공식

```
T_target = basetime_target / cbrt(P / 1000)
```

여기서 `P = calcPoints(현재 기록)`, `basetime_target` = 환산 대상 종목의 베이스타임.

### 표시 그리드

`scoring.js` → `EQUIV_GRID`

| 행 | 종목 |
|---|---|
| 1 | 자유형 50 · 배영 50 · 평영 50 · 접영 50 · 개인혼영 200 |
| 2 | 자유형 100 · 배영 100 · 평영 100 · 접영 100 · 개인혼영 400 |

성별·코스(LCM)는 현재 입력값을 그대로 사용합니다.

---

## 6. 유사한 기록 (SIMILAR PERFORMANCES)

### 개념

World Aquatics 포인트가 현재 기록과 **가장 가까운** 기록 20건을 큐레이션합니다.

- 같은 영법: 10건 (다른 거리·성별 가능)
- 다른 영법: 10건

### 알고리즘

```js
// 1. 풀의 각 기록에 대해 WA Points 계산
// 2. 절대 차이로 정렬
// 3. 같은 영법 / 다른 영법으로 그룹핑
// 4. 각 그룹에서 상위 10건 선택

function similarRecords(gender, stroke, distance, course, points, n = 10) {
  const pool = SAMPLE_RECORDS.map(r => ({
    ...r,
    points: calcPoints(r.gender, r.stroke, r.distance, r.time),
    diff: Math.abs(calcPoints(...) - points)
  })).filter(r => r.points != null);

  const same  = pool.filter(r => r.stroke === stroke)
                    .sort((a, b) => a.diff - b.diff).slice(0, n);
  const other = pool.filter(r => r.stroke !== stroke)
                    .sort((a, b) => a.diff - b.diff).slice(0, n);
  return { same, other };
}
```

### 데이터 소스

- **현재**: `scoring.js` → `SAMPLE_RECORDS` (~340건의 자동 생성 가상 풀)
  - 각 종목 × 10단계 포인트 레벨로 자동 생성
  - 가상 선수명 (`_NAMES`), 대회명 (`_MEETS`), 수영장명 (`_VENUES`) 무작위 배정
- **운영 시**: KSR 데이터베이스의 검증된 등재 기록으로 교체

### 통합 가이드

운영 환경에서는 다음 함수 시그니처를 유지하면서 데이터 소스만 교체합니다:

```js
function similarRecords(gender, stroke, distance, course, points, n) {
  // KSR DB 쿼리:
  //   SELECT * FROM records
  //   WHERE points 가까운 순으로 정렬
  //   GROUP BY same_stroke vs other_stroke
  //   LIMIT n per group
  return { same: [...], other: [...] };
}
```

반환 객체의 각 항목은 다음 필드 필요:
`gender`, `stroke`, `distance`, `course`, `time`(seconds), `athlete`, `date`,
`points`. 선택적으로 `meet`, `venue`.

---

## 7. 단순 속도 (SIMPLE SPEED)

거리 ÷ 시간의 직선 평균. **참고용 지표**임을 명시.

```
speed_ms  = distance(m) / time(s)
speed_kmh = speed_ms × 3.6
```

비교 행에는 같은 종목의 권위 기록(WR / KR / WMR / KMR) 평균 속도를 chip으로
함께 표시합니다. 비교 데이터는 §3의 권위 기록 비교 결과를 재사용합니다.

---

## 8. 단순 페이스 (SIMPLE PACE)

같은 속도를 유지했을 때 다른 거리에서 예상되는 시간. **선형 비례 환산**.

```
T_d = T_current × (d / distance_current)
```

표시 거리: `[50, 100, 200, 400]` m. 현재 거리와 일치하는 셀은 `current` 클래스로
강조됩니다.

### 한계

영법·구간·체력 변동을 고려하지 않은 단순 거리 비례이므로 실제 수영의 페이스와는
다릅니다. 모달 하단에 명시적 disclaimer가 표시됩니다.

---

## 9. 데이터 흐름 도식

```
사용자 클릭 (.time-trigger)
   │
   │ data-* 속성 (gender, stroke, distance, course, time,
   │              athlete, year, venue, nation)
   ▼
modal.js · open(data)
   │
   │ state 갱신 (attribution 포함)
   ▼
render()
   ├── renderHeader   — 종목·시간 표제
   ├── renderAttribution — 선수명/연도/장소 + 제보 링크
   ├── renderInputs   — 편집 가능 필터
   ├── renderCompare  → S().compareRecords()  → COMPARE_OVERLAY or fallback
   ├── renderPoints   → S().calcPoints() + timeForPoints (tier)
   ├── renderEquiv    → S().timeForPoints() × EQUIV_GRID
   ├── renderSimilar  → S().similarRecords()
   ├── renderAge      → S().ageGroupFromDob() + AGE_GROUP_FACTORS
   ├── renderSpeed    → 거리÷시간 + 비교 records
   └── renderPace     → 선형 비례 환산
```

필터 chip 클릭 / 시간 입력 변경 시 `clearAttribution()` 호출 → `attribution = null`
로 설정 → 다음 `render()` 사이클에서 attribution 영역이 페이드 아웃 (CSS
transition).

---

## 10. 시간 트리거 (`.time-trigger`)

사이트 전체에서 모달을 활성화하는 진입점.

```html
<span class="time time-trigger"
      data-gender="M"
      data-stroke="BR"
      data-distance="100"
      data-course="LCM"
      data-time="59.18"
      data-athlete="김민호"
      data-nation="KOR"
      data-year="2026"
      data-venue="김천 실내수영장"
      role="button"
      tabindex="0">00:59.18</span>
```

| data 속성 | 필수 | 형식 |
|---|---|---|
| `data-gender` | ✓ | `M` · `W` |
| `data-stroke` | ✓ | `FR` · `BA` · `BR` · `FL` · `IM` |
| `data-distance` | ✓ | `50` · `100` · `200` · `400` · `800` · `1500` |
| `data-course` | ✓ | `LCM` · `SCM` (현재 LCM만 베이스타임 정의됨) |
| `data-time` | ✓ | `1:54.00` · `20.91` · `00:20.91` |
| `data-athlete` | (선택) | 선수명 |
| `data-nation` | (선택) | 국가 3자리 코드 |
| `data-year` | (선택) | 4자리 연도 |
| `data-venue` | (선택) | 수영장명 |
| `data-meet` | (선택) | 대회명 (현재 canon-data.js에는 미포함) |
| `data-event-id` | (선택) | KSR 이벤트 ID (디버그용) |

선택 attribution 데이터(`data-athlete` 등)는 모달 헤더에 표시되며, 필터 변경
시 자동으로 사라집니다.

---

## 11. 확장 시 체크리스트 (담당자용)

### A. 베이스타임을 World Aquatics 공식 표로 교체

1. `scoring.js` → `BASE_TIMES_LCM` 객체 값을 공식 베이스타임으로 갱신
2. `?v=` 캐시 무효화 param 변경 (현재 `?v=20260523-12`)
3. 전 종목 점수 산출 결과 재확인

### B. 권위 기록 비교 데이터 채워넣기

1. `scoring.js` → `COMPARE_OVERLAY` 객체에 종목별 `{WR, OR, AR, KR, WMR, KMR}`
   항목 입력
2. `time` 은 **초 단위 number** 로 저장 (예: `1:42.00` → `102.00`)
3. `holder`, `nation`, `year`, `venue` 필드 채우기. WMR/KMR 는 `ageGroup` 도 명시
4. `COMPARE_OVERLAY` 에 없는 종목은 자동 폴백으로 가상 데이터가 표시되므로,
   운영 전에 모든 종목을 채우거나 폴백 텍스트를 운영자가 검수하기

### C. SCM 지원

현재는 LCM 전용. SCM 지원하려면:

1. `BASE_TIMES_LCM` 옆에 `BASE_TIMES_SCM` 정의
2. `basetime()` 함수가 `course` 인자로 두 표 중 하나를 선택하도록 수정
3. 캐논 페이지 자체에 SCM 토글 부활 (사용자 요구에 따라)
4. `COMPARE_OVERLAY` 키를 `gender-stroke-distance-course` 로 분리

### D. 유사 기록 DB 연결

1. `similarRecords()` 함수 본문을 KSR DB 쿼리로 교체
2. 시그니처와 반환 객체 형태 유지
3. 비동기 처리가 필요하면 `async` 로 전환하고 `renderSimilar()` 도 비동기화

### E. 종목별 정밀 연령 계수

현재 단일 계수 모델. 종목별로 정확한 비율을 적용하려면:

1. `AGE_GROUP_FACTORS` 를 `{ stroke-distance: { age: factor } }` 구조로 확장
2. `renderAge()` 에서 `state.stroke`, `state.distance` 까지 키로 사용

### F. 정정 제보 링크 교체

현재 `https://naver.me/xeFYWn8m` 로 하드코딩. 운영 시:

1. `modal.js` → `REPORT_URL` 상수 변경, 또는
2. 환경별로 다른 URL을 주입할 수 있게 빌드 시점에 치환

---

## 12. 출처 요약 (사용자에게 보이는 (i) 안내 문구의 근거)

| 섹션 | 출처 |
|---|---|
| 권위 기록 비교 | World Aquatics · IOC · AASF · 대한수영연맹 · World Aquatics Masters |
| World Aquatics 포인트 | World Aquatics(전 FINA) 공식 발간 포인트 표 |
| 같은 점수의 다른 종목 | 위 포인트 공식의 역산 |
| 유사한 기록 | KSR 데이터베이스 (현재는 가상 시드) |
| 연령 보정 | World Aquatics Masters 연령부 WR 비율 (Rowson-style 단일 모델) |
| 단순 속도 / 페이스 | 단순 거리·시간 산술 — 명시적 참고용 |

---

## 13. 변경 이력 메모 (이 문서 유지보수용)

본 모듈은 다음 가정 위에 만들어져 있습니다. 가정이 깨질 때 본 문서도 함께
업데이트해야 합니다.

- LCM 개인전만 다룬다 (계영·혼계영·SCM 제외)
- 1000점 = 세계기록 수준이라는 점수 척도 해석
- 단일 계수 연령 보정 모델
- 베이스타임은 운영자가 손으로 유지보수 (DB 자동 동기화 아님)

---

*문서 버전: 2026-05-24 · 작성: KSR · The Canon 패키지에 동봉*
