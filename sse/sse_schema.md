# 🏊 Swim Stock Exchange (SSE)
### 데이터베이스 스키마 정의서 v1.0

---

## 📌 목차

1. [전체 구조](#1-전체-구조)
2. [Schema 1 — 기반 데이터 테이블](#2-schema-1--기반-데이터-테이블)
   - [athletes](#21-athletes)
   - [teams](#22-teams)
   - [pools](#23-pools)
   - [stems](#24-stems)
   - [competitions](#25-competitions)
   - [mergedTimes](#26-mergedtimes)
3. [Schema 2 — SSE 시스템 테이블](#3-schema-2--sse-시스템-테이블)
   - [users](#31-users)
   - [ipoRecords](#32-iporecords)
   - [stockPrices](#33-stockprices)
   - [playerIndex](#34-playerindex)
   - [investments](#35-investments)
   - [coinLedger](#36-coinledger)
   - [trainingJournals](#37-trainingjournals)
   - [notifications](#38-notifications)
   - [seasonRankings](#39-seasonrankings)
   - [investorRankings](#310-investorrankings)
   - [seasons](#311-seasons)
4. [테이블 관계 요약](#4-테이블-관계-요약)
5. [핵심 데이터 흐름](#5-핵심-데이터-흐름)
6. [인덱스 설계](#6-인덱스-설계)

---

## 1. 전체 구조

```
Schema 1 — 기반 데이터 (기존 수영 대회 데이터 연동)
  athletes / teams / pools / stems / competitions / mergedTimes

Schema 2 — SSE 시스템 (주식시장 게임 전용)
  users / ipoRecords / stockPrices / playerIndex
  investments / coinLedger / trainingJournals
  notifications / seasonRankings / investorRankings / seasons
```

### 두 Schema의 연결점

```
athletes.athleteID
      ↓
users.athleteID        ← SSE 사용자와 선수 연결
ipoRecords.athleteID   ← IPO 상장 정보
stockPrices.athleteID  ← 주가 이력

mergedTimes.timeStamp
      ↓
playerIndex            ← 기록 기반 지수 계산
      ↓
stockPrices            ← 주가 산정
```

---

## 2. Schema 1 — 기반 데이터 테이블

### 2.1 athletes

선수 마스터 테이블. `mergedTimes`의 `athleteID` FK 기준.

```sql
CREATE TABLE athletes (
  athleteID   INT           PRIMARY KEY,
  name        VARCHAR(50)   NOT NULL,
  gender      VARCHAR(10)   NOT NULL,        -- 'men' | 'women'
  sido        VARCHAR(20),                   -- 시도
  teamID      INT,                           -- FK → teams
  birthDate   DATE,
  ageGroup    VARCHAR(20),                   -- '남 2G' 등
  group       VARCHAR(20),                   -- '일반부' | '마스터즈'
  isMasters   BOOLEAN       DEFAULT FALSE,
  isAdult     BOOLEAN       DEFAULT TRUE,
  createdAt   TIMESTAMP     DEFAULT NOW()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| athleteID | INT PK | 선수 고유 ID |
| name | VARCHAR | 선수 이름 |
| gender | VARCHAR | 성별 (men / women) |
| sido | VARCHAR | 시도 (서울 / 경기 등) |
| teamID | INT FK | 소속 팀 → teams |
| birthDate | DATE | 생년월일 (나이 보정 지수 산정용) |
| ageGroup | VARCHAR | 연령 그룹 (남 2G 등) |
| group | VARCHAR | 선수 구분 (일반부 / 마스터즈) |
| isMasters | BOOLEAN | 마스터즈 선수 여부 |
| isAdult | BOOLEAN | 성인 여부 |
| createdAt | TIMESTAMP | 등록일 |

---

### 2.2 teams

팀 마스터 테이블.

```sql
CREATE TABLE teams (
  teamID    INT           PRIMARY KEY,
  name      VARCHAR(100)  NOT NULL,
  sido      VARCHAR(20),
  region    VARCHAR(50),
  createdAt TIMESTAMP     DEFAULT NOW()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| teamID | INT PK | 팀 고유 ID |
| name | VARCHAR | 팀명 (KAIST수영장 등) |
| sido | VARCHAR | 시도 |
| region | VARCHAR | 지역 상세 |
| createdAt | TIMESTAMP | 등록일 |

---

### 2.3 pools

수영장 마스터 테이블.

```sql
CREATE TABLE pools (
  poolID     INT           PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  sido       VARCHAR(20),
  address    VARCHAR(200),
  courseType VARCHAR(10),                  -- 'LCM' | 'SCM'
  lanes      INT
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| poolID | INT PK | 수영장 고유 ID |
| name | VARCHAR | 수영장명 |
| sido | VARCHAR | 시도 |
| address | VARCHAR | 주소 |
| courseType | VARCHAR | 코스 타입 (LCM 50m / SCM 25m) |
| lanes | INT | 레인 수 |

---

### 2.4 stems

대회 시리즈 마스터 테이블.

```sql
CREATE TABLE stems (
  stemID     INT           PRIMARY KEY,
  name       VARCHAR(200)  NOT NULL,        -- '대전광역시장기 수영대회'
  isMasters  BOOLEAN       DEFAULT FALSE,
  organizer  VARCHAR(100)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| stemID | INT PK | 시리즈 고유 ID |
| name | VARCHAR | 시리즈명 |
| isMasters | BOOLEAN | 마스터즈 시리즈 여부 |
| organizer | VARCHAR | 주관 기관 |

---

### 2.5 competitions

대회 마스터 테이블.

```sql
CREATE TABLE competitions (
  competitionID  INT           PRIMARY KEY,
  stemID         INT,                        -- FK → stems
  poolID         INT,                        -- FK → pools
  fullname       VARCHAR(200)  NOT NULL,
  course         VARCHAR(10),                -- 'LCM' | 'SCM'
  dateStart      DATE          NOT NULL,
  isMasters      BOOLEAN       DEFAULT FALSE,
  measured       BOOLEAN       DEFAULT TRUE,  -- 공인 기록 여부
  sido           VARCHAR(20),
  source         VARCHAR(20),                -- 데이터 출처 (MB 등)
  year           INT
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| competitionID | INT PK | 대회 고유 ID |
| stemID | INT FK | 시리즈 → stems |
| poolID | INT FK | 수영장 → pools |
| fullname | VARCHAR | 대회 전체명 |
| course | VARCHAR | 코스 (LCM / SCM) |
| dateStart | DATE | 대회 시작일 |
| isMasters | BOOLEAN | 마스터즈 대회 여부 |
| measured | BOOLEAN | 공인 기록 여부 |
| sido | VARCHAR | 시도 |
| source | VARCHAR | 데이터 출처 |
| year | INT | 연도 |

---

### 2.6 mergedTimes

선수별 대회 기록 원본 테이블. SSE 주가 산정의 핵심 소스.

```sql
CREATE TABLE mergedTimes (
  timeID         INT           PRIMARY KEY,
  athleteID      INT           NOT NULL,     -- FK → athletes
  teamID         INT,                        -- FK → teams
  competitionID  INT,                        -- FK → competitions
  poolID         INT,                        -- FK → pools
  stemID         INT,                        -- FK → stems
  name           VARCHAR(50),
  team           VARCHAR(100),
  gender         VARCHAR(10),
  ageGroup       VARCHAR(20),
  group          VARCHAR(20),
  course         VARCHAR(10),                -- 'LCM' | 'SCM'
  distance       VARCHAR(10),               -- '100M' | '50M'
  discipline     VARCHAR(10),               -- 'FL' | 'BR' | 'BA' | 'FR' | 'IM'
  round          VARCHAR(20),               -- 예선 / 결선
  datetime       DATE,
  rank           INT,
  sido           VARCHAR(20),
  pool           VARCHAR(100),
  competitionName VARCHAR(200),
  timeStamp      FLOAT,                     -- 기록 수치 (정렬 / 계산용)
  time           VARCHAR(20),               -- '01:12.80' 형식
  isMasters      BOOLEAN,
  isAdult        BOOLEAN,
  type           VARCHAR(20),               -- 'event' | 'relay'
  stem           VARCHAR(200)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| timeID | INT PK | 기록 고유 ID |
| athleteID | INT FK | 선수 → athletes |
| teamID | INT FK | 팀 → teams |
| competitionID | INT FK | 대회 → competitions |
| poolID | INT FK | 수영장 → pools |
| stemID | INT FK | 시리즈 → stems |
| discipline | VARCHAR | 영법 (FL / BR / BA / FR / IM) |
| distance | VARCHAR | 거리 (50M / 100M / 200M 등) |
| course | VARCHAR | 코스 (LCM / SCM) |
| round | VARCHAR | 예선 / 결선 |
| rank | INT | 순위 |
| timeStamp | FLOAT | 기록 수치 (초 단위, 정렬 및 계산용) |
| time | VARCHAR | 기록 표시 (mm:ss.ff) |
| type | VARCHAR | event / relay 구분 |

---

## 3. Schema 2 — SSE 시스템 테이블

### 3.1 users

SSE 사용자 테이블. 선수이자 투자자 역할 동시 수행.

```sql
CREATE TABLE users (
  userID        INT           PRIMARY KEY AUTO_INCREMENT,
  athleteID     INT           UNIQUE,        -- FK → athletes (선수인 경우)
  role          VARCHAR(20)   DEFAULT 'both', -- 'athlete' | 'investor' | 'both'
  nickname      VARCHAR(50),
  isPublic      BOOLEAN       DEFAULT TRUE,   -- 주가 공개 여부
  journalPublic BOOLEAN       DEFAULT TRUE,   -- 훈련 일지 공개 여부
  recordPublic  BOOLEAN       DEFAULT FALSE,  -- 기록 상세 공개 여부
  investorPublic BOOLEAN      DEFAULT TRUE,   -- 투자자 목록 공개 여부
  alertPrice    BOOLEAN       DEFAULT TRUE,   -- 주가 알림
  alertInvestee BOOLEAN       DEFAULT TRUE,   -- 투자 선수 알림
  alertContest  BOOLEAN       DEFAULT TRUE,   -- 대회 알림
  alertCoin     BOOLEAN       DEFAULT TRUE,   -- 코인 알림
  alertIPO      BOOLEAN       DEFAULT FALSE,  -- IPO 알림
  journalReminder VARCHAR(10),                -- '21:00' 등
  maxInvestOnce INT           DEFAULT 1000,   -- 1회 최대 투자 코인
  autoReinvest  BOOLEAN       DEFAULT FALSE,  -- 배당 자동 재투자
  createdAt     TIMESTAMP     DEFAULT NOW()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| userID | INT PK | 사용자 고유 ID |
| athleteID | INT FK | 연결된 선수 → athletes |
| role | VARCHAR | 역할 (athlete / investor / both) |
| nickname | VARCHAR | 닉네임 |
| isPublic | BOOLEAN | 주가 공개 여부 |
| journalPublic | BOOLEAN | 훈련 일지 공개 여부 |
| recordPublic | BOOLEAN | 기록 상세 공개 여부 |
| alertPrice | BOOLEAN | 주가 변동 알림 |
| alertInvestee | BOOLEAN | 투자 선수 공시 알림 |
| alertContest | BOOLEAN | 대회 명단 알림 |
| alertCoin | BOOLEAN | 코인 적립 알림 |
| alertIPO | BOOLEAN | 신규 IPO 알림 |
| journalReminder | VARCHAR | 일지 리마인더 시간 |
| maxInvestOnce | INT | 1회 최대 투자 코인 한도 |
| autoReinvest | BOOLEAN | 배당 자동 재투자 여부 |

---

### 3.2 ipoRecords

선수 IPO 상장 정보 테이블.

```sql
CREATE TABLE ipoRecords (
  ipoID        INT           PRIMARY KEY AUTO_INCREMENT,
  athleteID    INT           NOT NULL UNIQUE,  -- FK → athletes
  ipoDate      DATE          NOT NULL,
  ipoPrice     FLOAT         NOT NULL,         -- 공모가 (코인)
  grade        VARCHAR(20)   NOT NULL,         -- '대형주' | '중형주' | '중소형주' | '스타트업'
  avgRecord    FLOAT,                          -- IPO 기준 평균 기록 (timeStamp)
  discipline   VARCHAR(10),                    -- 주종목 영법
  distance     VARCHAR(10),                    -- 주종목 거리
  status       VARCHAR(20)   DEFAULT 'active', -- 'active' | 'suspended' | 'delisted'
  fastTrack    BOOLEAN       DEFAULT FALSE,    -- 패스트트랙 여부
  ipoBonus     FLOAT         DEFAULT 0,        -- 패스트트랙 보너스 비율
  createdAt    TIMESTAMP     DEFAULT NOW()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| ipoID | INT PK | IPO 고유 ID |
| athleteID | INT FK | 상장 선수 → athletes |
| ipoDate | DATE | 상장일 |
| ipoPrice | FLOAT | 공모가 (코인) |
| grade | VARCHAR | 등급 (대형주 / 중형주 / 중소형주 / 스타트업) |
| avgRecord | FLOAT | IPO 기준 평균 기록 |
| discipline | VARCHAR | 주종목 영법 |
| status | VARCHAR | 상태 (active / suspended / delisted) |
| fastTrack | BOOLEAN | 패스트트랙 상장 여부 |
| ipoBonus | FLOAT | 패스트트랙 보너스 비율 |

#### 등급별 공모가 기준 (50m 평영)

| 등급 | 기록 | 공모가 |
|------|------|--------|
| 대형주 | 35초 이하 | 2,000 |
| 중형주 | 35~42초 | 1,500 |
| 중소형주 | 42~50초 | 1,000 |
| 스타트업 | 50초 이상 | 700 |

---

### 3.3 stockPrices

선수 주간 주가 이력 테이블.

```sql
CREATE TABLE stockPrices (
  priceID          INT     PRIMARY KEY AUTO_INCREMENT,
  athleteID        INT     NOT NULL,           -- FK → athletes
  weekDate         DATE    NOT NULL,           -- 해당 주 기준일 (월요일)
  price            FLOAT   NOT NULL,           -- 이번 주 주가
  prevPrice        FLOAT,                      -- 지난 주 주가
  weeklyChange     FLOAT,                      -- 주간 변동률 (%)
  performanceScore FLOAT,                      -- 기록점수 (50%)
  growthScore      FLOAT,                      -- 성장성점수 (25%)
  trainingScore    FLOAT,                      -- 훈련투자점수 (20%)
  marketScore      FLOAT,                      -- 시장지위점수 (15%)
  eventScore       FLOAT,                      -- 이벤트점수 (10%)
  riskScore        FLOAT,                      -- 리스크 감점
  totalIndex       FLOAT,                      -- 종합 지수 (100점 만점)
  isPB             BOOLEAN DEFAULT FALSE,       -- 이번 주 PB 여부
  isContestWeek    BOOLEAN DEFAULT FALSE,       -- 대회 주간 여부
  UNIQUE (athleteID, weekDate)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| priceID | INT PK | 주가 기록 ID |
| athleteID | INT FK | 선수 → athletes |
| weekDate | DATE | 해당 주 기준일 |
| price | FLOAT | 현재 주가 (코인) |
| prevPrice | FLOAT | 전주 주가 |
| weeklyChange | FLOAT | 주간 변동률 (%) |
| performanceScore | FLOAT | 현재 실적 점수 (×30%) |
| growthScore | FLOAT | 성장성 점수 (×25%) |
| trainingScore | FLOAT | 훈련 투자 점수 (×20%) |
| marketScore | FLOAT | 시장 지위 점수 (×15%) |
| eventScore | FLOAT | 특별 이벤트 점수 (×10%) |
| riskScore | FLOAT | 리스크 감점 |
| totalIndex | FLOAT | 종합 지수 (100점 만점) |
| isPB | BOOLEAN | 이번 주 PB 달성 여부 |

#### 주간 주가 변동 공식

```
주간 변동률 =
  기록점수   × 50%
+ 출석점수   × 20%
+ 안정성점수 × 20%
+ 이벤트점수 × 10%

주가 하한선 = IPO 공모가 × 30%
```

---

### 3.4 playerIndex

선수 종합 지수 상세 테이블. 주간 지수 산정 근거 저장.

```sql
CREATE TABLE playerIndex (
  indexID        INT     PRIMARY KEY AUTO_INCREMENT,
  athleteID      INT     NOT NULL,           -- FK → athletes
  weekDate       DATE    NOT NULL,
  currentRecord  FLOAT,                      -- 현재 기록 (timeStamp)
  pbRecord       FLOAT,                      -- 시즌 최고 기록
  pbRate         FLOAT,                      -- PB 달성률 (%)
  recordGrowth   FLOAT,                      -- 기록 향상률 (%)
  stability      FLOAT,                      -- 안정성 (변동계수 %)
  ageBonus       FLOAT,                      -- 나이 보정 지수
  worldGap       FLOAT,                      -- 세계 기록 대비 차이 (초)
  trainingHours  FLOAT,                      -- 주당 훈련 시간
  attendRate     FLOAT,                      -- 출석률 (%)
  journalScore   FLOAT,                      -- 훈련 일지 성실도 점수
  ageRankScore   FLOAT,                      -- 연령대 랭킹 점수
  intlContest    BOOLEAN DEFAULT FALSE,      -- 국제 대회 출전 여부
  injuryCount    INT     DEFAULT 0,          -- 최근 1년 부상 횟수
  mentalScore    FLOAT,                      -- 멘탈 안정성 (대회 vs 훈련 기록 차이)
  trainingGap    INT     DEFAULT 0,          -- 연속 결석 주수
  isDopingClean  BOOLEAN DEFAULT TRUE,       -- 도핑 클린 여부
  updatedAt      TIMESTAMP DEFAULT NOW(),
  UNIQUE (athleteID, weekDate)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| indexID | INT PK | 지수 기록 ID |
| athleteID | INT FK | 선수 |
| weekDate | DATE | 산정 기준일 |
| currentRecord | FLOAT | 현재 기록 (timeStamp) |
| pbRate | FLOAT | 대회 출전 중 PB 달성률 |
| recordGrowth | FLOAT | 기록 향상률 (%) |
| stability | FLOAT | 변동계수 (낮을수록 안정) |
| ageBonus | FLOAT | 나이 보정 지수 |
| worldGap | FLOAT | 세계 기록 대비 차이 |
| attendRate | FLOAT | 아카데미 출석률 |
| journalScore | FLOAT | 훈련 일지 성실도 |
| ageRankScore | FLOAT | 연령대 내 랭킹 점수 |
| injuryCount | INT | 최근 1년 부상 횟수 |
| mentalScore | FLOAT | 멘탈 안정성 지수 |
| trainingGap | INT | 연속 결석 주수 |
| isDopingClean | BOOLEAN | 도핑 클린 여부 (FALSE = 상장폐지) |

---

### 3.5 investments

투자 내역 테이블.

```sql
CREATE TABLE investments (
  investID    INT           PRIMARY KEY AUTO_INCREMENT,
  investorID  INT           NOT NULL,        -- FK → users (투자자)
  athleteID   INT           NOT NULL,        -- FK → athletes (선수)
  coins       FLOAT         NOT NULL,        -- 투자 코인 수
  shareRate   FLOAT         DEFAULT 0,       -- 보유 지분율 (%)
  grade       VARCHAR(20),                   -- '개인투자자' | '서포터' | '스폰서' | '메인스폰서'
  profit      FLOAT         DEFAULT 0,       -- 누적 수익 코인
  profitRate  FLOAT         DEFAULT 0,       -- 수익률 (%)
  scoutScore  FLOAT         DEFAULT 0,       -- 유망주 발굴 점수
  ipoPrice    FLOAT,                         -- 투자 시점 주가
  investedAt  TIMESTAMP     DEFAULT NOW(),
  updatedAt   TIMESTAMP     DEFAULT NOW(),
  UNIQUE (investorID, athleteID)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| investID | INT PK | 투자 고유 ID |
| investorID | INT FK | 투자자 → users |
| athleteID | INT FK | 투자 대상 선수 → athletes |
| coins | FLOAT | 투자 코인 수 |
| shareRate | FLOAT | 보유 지분율 (%) |
| grade | VARCHAR | 투자 등급 |
| profit | FLOAT | 누적 수익 코인 |
| profitRate | FLOAT | 수익률 (%) |
| scoutScore | FLOAT | 유망주 발굴 점수 |
| ipoPrice | FLOAT | 투자 시점 주가 (발굴 지수 계산용) |

#### 투자 등급 기준

| 등급 | 지분율 | 혜택 |
|------|--------|------|
| 개인투자자 | 1% 미만 | 기본 |
| 서포터 | 5% 이상 | 기록 알림 우선 |
| 스폰서 | 10% 이상 | 사진/영상 우선 공개 |
| 메인스폰서 | 30% 이상 | 용품 자수 + 공식 타이틀 |

#### 유망주 발굴 지수 공식

```
scoutScore =
  (현재 주가 - 투자 시점 주가) / 투자 시점 주가
  × 조기성 보정 (IPO 당일 = 1.0, 이후 감소)
  × 보유 지분율
```

---

### 3.6 coinLedger

코인 입출 내역 장부 테이블.

```sql
CREATE TABLE coinLedger (
  ledgerID    INT           PRIMARY KEY AUTO_INCREMENT,
  userID      INT           NOT NULL,        -- FK → users
  type        VARCHAR(10)   NOT NULL,        -- 'credit' | 'debit'
  category    VARCHAR(30)   NOT NULL,        -- 아래 참조
  amount      FLOAT         NOT NULL,        -- 변동 코인 수 (양수)
  balance     FLOAT         NOT NULL,        -- 변동 후 잔액
  description VARCHAR(200),                 -- 상세 설명
  refID       INT,                           -- 관련 레코드 ID (투자 ID, 대회 ID 등)
  createdAt   TIMESTAMP     DEFAULT NOW()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| ledgerID | INT PK | 장부 고유 ID |
| userID | INT FK | 사용자 → users |
| type | VARCHAR | credit (입금) / debit (출금) |
| category | VARCHAR | 거래 유형 (아래 참조) |
| amount | FLOAT | 변동 코인 수 |
| balance | FLOAT | 변동 후 잔액 |
| description | VARCHAR | 상세 설명 |
| refID | INT | 관련 레코드 ID |

#### category 값 정의

| category | type | 설명 |
|----------|------|------|
| attendance | credit | 훈련 출석 적립 |
| measurement | credit | 기록 측정 참여 |
| pb_bonus | credit | PB 달성 보너스 |
| journal | credit | 훈련 일지 입력 |
| streak_bonus | credit | 연속 입력 보너스 |
| dividend | credit | 투자 배당 수익 |
| scatter_bonus | credit | 분산 투자 보너스 |
| invest | debit | 선수 투자 |
| use_goods | debit | 용품 할인 사용 |
| use_photo | debit | 촬영 서비스 사용 |
| use_embroidery | debit | 자수 서비스 사용 |

---

### 3.7 trainingJournals

훈련 일지 테이블. 주가 미반영 / 투자자 참고용.

```sql
CREATE TABLE trainingJournals (
  journalID    INT           PRIMARY KEY AUTO_INCREMENT,
  athleteID    INT           NOT NULL,        -- FK → athletes
  trainingDate DATE          NOT NULL,
  location     VARCHAR(20),                   -- '실내' | '실외' | '개인'
  distanceM    INT,                           -- 훈련 거리 (m)
  durationMin  INT,                           -- 훈련 시간 (분)
  content      VARCHAR(20),                   -- '드릴' | '체력' | '스피드' | '혼합'
  intensity    VARCHAR(20),                   -- '가볍게' | '보통' | '힘들게'
  condition    INT,                           -- 컨디션 1~5점
  memo         TEXT,                          -- 자유 메모 (투자자 공개)
  isPublic     BOOLEAN       DEFAULT TRUE,    -- 투자자 공개 여부
  coinEarned   INT           DEFAULT 10,      -- 입력 시 적립 코인
  createdAt    TIMESTAMP     DEFAULT NOW(),
  UNIQUE (athleteID, trainingDate)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| journalID | INT PK | 일지 고유 ID |
| athleteID | INT FK | 선수 → athletes |
| trainingDate | DATE | 훈련 날짜 |
| location | VARCHAR | 훈련 장소 |
| distanceM | INT | 훈련 거리 (m) |
| durationMin | INT | 훈련 시간 (분) |
| content | VARCHAR | 훈련 내용 유형 |
| intensity | VARCHAR | 훈련 강도 |
| condition | INT | 컨디션 (1~5) |
| memo | TEXT | 자유 메모 (투자자 공개) |
| isPublic | BOOLEAN | 투자자 공개 여부 |
| coinEarned | INT | 입력 적립 코인 |

> 주가에 직접 반영되지 않음. 투자자 참고 / 잡지 콘텐츠 소재 / 연속 기록 보너스 산정에 활용.

---

### 3.8 notifications

공시 알림 테이블.

```sql
CREATE TABLE notifications (
  notifID    INT           PRIMARY KEY AUTO_INCREMENT,
  userID     INT           NOT NULL,        -- FK → users
  type       VARCHAR(20)   NOT NULL,        -- 'price' | 'contest' | 'coin' | 'ipo' | 'system'
  category   VARCHAR(30)   NOT NULL,        -- 아래 참조
  title      VARCHAR(200)  NOT NULL,
  body       TEXT,
  refID      INT,                           -- 관련 레코드 ID
  isRead     BOOLEAN       DEFAULT FALSE,
  createdAt  TIMESTAMP     DEFAULT NOW()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| notifID | INT PK | 알림 고유 ID |
| userID | INT FK | 수신 사용자 → users |
| type | VARCHAR | 알림 유형 |
| category | VARCHAR | 세부 분류 |
| title | VARCHAR | 알림 제목 |
| body | TEXT | 알림 본문 |
| refID | INT | 관련 레코드 ID |
| isRead | BOOLEAN | 읽음 여부 |

#### type / category 정의

| type | category | 색상 | 설명 |
|------|----------|------|------|
| price | pb_achieved | 초록 | PB 달성 주가 상승 |
| price | price_drop | 빨강 | 주가 하락 |
| price | weekly_update | 회색 | 주간 주가 갱신 |
| contest | lineup | 파란 | 출전 명단 공시 |
| contest | result | 파란 | 대회 결과 공시 |
| coin | dividend | 주황 | 배당 수익 적립 |
| coin | attendance | 주황 | 참가비 코인 적립 |
| coin | bonus | 주황 | 보너스 코인 |
| ipo | new_listing | 보라 | 신규 IPO 상장 |
| system | rank_change | 회색 | 랭킹 변동 |

---

### 3.9 seasonRankings

시즌별 선수 랭킹 테이블.

```sql
CREATE TABLE seasonRankings (
  rankID        INT     PRIMARY KEY AUTO_INCREMENT,
  seasonID      INT     NOT NULL,           -- FK → seasons
  athleteID     INT     NOT NULL,           -- FK → athletes
  priceRank     INT,                        -- 주가 순위
  growthRank    INT,                        -- 상승률 순위
  trainingRank  INT,                        -- 훈련 성실도 순위
  pbRank        INT,                        -- PB 달성 횟수 순위
  contestRank   INT,                        -- 대회 성적 순위
  totalScore    FLOAT,                      -- 종합 점수
  totalRank     INT,                        -- 종합 순위
  updatedAt     TIMESTAMP DEFAULT NOW(),
  UNIQUE (seasonID, athleteID)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| rankID | INT PK | 랭킹 기록 ID |
| seasonID | INT FK | 시즌 → seasons |
| athleteID | INT FK | 선수 → athletes |
| priceRank | INT | 주가 순위 |
| growthRank | INT | 상승률 순위 |
| trainingRank | INT | 훈련 성실도 순위 |
| pbRank | INT | PB 달성 횟수 순위 |
| totalRank | INT | 종합 순위 |

---

### 3.10 investorRankings

시즌별 투자자 랭킹 테이블.

```sql
CREATE TABLE investorRankings (
  rankID       INT     PRIMARY KEY AUTO_INCREMENT,
  seasonID     INT     NOT NULL,           -- FK → seasons
  userID       INT     NOT NULL,           -- FK → users
  totalProfit  FLOAT   DEFAULT 0,          -- 시즌 총 수익 코인
  profitRate   FLOAT   DEFAULT 0,          -- 시즌 수익률 (%)
  scoutIndex   FLOAT   DEFAULT 0,          -- 유망주 발굴 지수
  scoutGrade   VARCHAR(20),                -- '전설' | '고수' | '중급' | '입문'
  profitRank   INT,                        -- 수익률 순위
  scoutRank    INT,                        -- 발굴 지수 순위
  investCount  INT     DEFAULT 0,          -- 투자 선수 수
  earlyCount   INT     DEFAULT 0,          -- 조기 투자 선수 수 (IPO 7일 이내)
  updatedAt    TIMESTAMP DEFAULT NOW(),
  UNIQUE (seasonID, userID)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| rankID | INT PK | 랭킹 기록 ID |
| seasonID | INT FK | 시즌 → seasons |
| userID | INT FK | 투자자 → users |
| totalProfit | FLOAT | 시즌 총 수익 코인 |
| profitRate | FLOAT | 시즌 수익률 (%) |
| scoutIndex | FLOAT | 유망주 발굴 지수 |
| scoutGrade | VARCHAR | 발굴 등급 (전설 / 고수 / 중급 / 입문) |
| profitRank | INT | 수익률 순위 |
| scoutRank | INT | 발굴 지수 순위 |
| earlyCount | INT | 조기 투자 선수 수 |

#### 발굴 등급 기준

| 등급 | scoutIndex |
|------|------------|
| 전설 | 90점 이상 |
| 고수 | 70~89점 |
| 중급 | 50~69점 |
| 입문 | 50점 미만 |

---

### 3.11 seasons

시즌 마스터 테이블.

```sql
CREATE TABLE seasons (
  seasonID   INT           PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100)  NOT NULL,        -- '2026 시즌 1'
  startDate  DATE          NOT NULL,
  endDate    DATE          NOT NULL,
  status     VARCHAR(20)   DEFAULT 'active', -- 'upcoming' | 'active' | 'closed'
  year       INT           NOT NULL,
  eventName  VARCHAR(100)                   -- '평영인의 밤 2026'
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| seasonID | INT PK | 시즌 고유 ID |
| name | VARCHAR | 시즌명 (2026 시즌 1) |
| startDate | DATE | 시즌 시작일 |
| endDate | DATE | 시즌 종료일 (평영인의 밤) |
| status | VARCHAR | 상태 (upcoming / active / closed) |
| year | INT | 연도 |
| eventName | VARCHAR | 결산 이벤트명 |

---

## 4. 테이블 관계 요약

```
[기반 데이터]
athletes    ──┬──→ mergedTimes   (기록)
teams       ──┤──→ athletes      (소속)
              └──→ mergedTimes   (팀 기록)
pools       ──┬──→ competitions  (개최)
              └──→ mergedTimes   (경기장)
stems       ──┬──→ competitions  (시리즈)
              └──→ mergedTimes   (시리즈)
competitions ───→ mergedTimes   (대회 기록)

[SSE 시스템]
athletes  ──→ users           (1:1, 선수-사용자 연결)
athletes  ──→ ipoRecords      (1:1, 상장 정보)
athletes  ──→ stockPrices     (1:N, 주간 주가 이력)
athletes  ──→ playerIndex     (1:N, 주간 지수 이력)
athletes  ──→ trainingJournals (1:N, 훈련 일지)
athletes  ──→ seasonRankings  (N:N via seasonID)

users     ──→ investments     (1:N, 투자 내역)
users     ──→ coinLedger      (1:N, 코인 내역)
users     ──→ notifications   (1:N, 알림)
users     ──→ investorRankings (N:N via seasonID)

investments ──→ coinLedger    (배당 발생 시)
trainingJournals ──→ coinLedger (일지 입력 적립)
seasons ──→ seasonRankings    (시즌별 선수 순위)
seasons ──→ investorRankings  (시즌별 투자자 순위)
```

---

## 5. 핵심 데이터 흐름

### 주간 주가 산정 흐름

```
mergedTimes (기록 원본)
      ↓
playerIndex 계산
  currentRecord  = 최신 timeStamp
  recordGrowth   = (이전 - 현재) / 이전 × 100
  stability      = 최근 4주 변동계수
  pbRate         = PB 달성 횟수 / 출전 횟수
  ageBonus       = 나이 보정 지수
  worldGap       = 현재기록 - 세계기록 (초)
  attendRate     = 출석 횟수 / 전체 회차
  journalScore   = 일지 입력 횟수 기반
      ↓
stockPrices 산정
  performanceScore = currentRecord + pbRate + recordGrowth + stability
  growthScore      = ageBonus + worldGap + trainingHours
  trainingScore    = attendRate + journalScore
  marketScore      = ageRankScore + intlContest
  eventScore       = 대회 PB / 국가대표 선발 이벤트
  riskScore        = injuryCount + trainingGap
  totalIndex       = 가중 합산
  price            = 전주가 × (1 + weeklyChange/100)
      ↓
coinLedger (배당 처리)
  investments 조회 → 지분율 × 주가 상승분 = 배당 코인
```

### 코인 흐름

```
참가비 납부
  → coinLedger (category: attendance, +100)
  → coinLedger (category: measurement, +30) ← 기록 측정 시
  → coinLedger (category: pb_bonus, +100)   ← PB 달성 시

훈련 일지 입력
  → trainingJournals 저장
  → coinLedger (category: journal, +10)

투자
  → investments 생성/업데이트
  → coinLedger (category: invest, -N)

주가 상승 → 배당
  → investments 조회 (보유 지분 × 상승분)
  → coinLedger (category: dividend, +N)
```

---

## 6. 인덱스 설계

```sql
-- 기반 데이터
CREATE INDEX idx_mergedTimes_athlete  ON mergedTimes (athleteID);
CREATE INDEX idx_mergedTimes_comp     ON mergedTimes (competitionID);
CREATE INDEX idx_mergedTimes_date     ON mergedTimes (datetime);
CREATE INDEX idx_mergedTimes_disc     ON mergedTimes (discipline, distance);
CREATE INDEX idx_competitions_stem    ON competitions (stemID);
CREATE INDEX idx_competitions_date    ON competitions (dateStart);

-- SSE 시스템
CREATE INDEX idx_stockPrices_athlete  ON stockPrices (athleteID, weekDate DESC);
CREATE INDEX idx_playerIndex_athlete  ON playerIndex (athleteID, weekDate DESC);
CREATE INDEX idx_investments_investor ON investments (investorID);
CREATE INDEX idx_investments_athlete  ON investments (athleteID);
CREATE INDEX idx_coinLedger_user      ON coinLedger (userID, createdAt DESC);
CREATE INDEX idx_journals_athlete     ON trainingJournals (athleteID, trainingDate DESC);
CREATE INDEX idx_notif_user_unread    ON notifications (userID, isRead, createdAt DESC);
CREATE INDEX idx_seasonRank_season    ON seasonRankings (seasonID, priceRank);
CREATE INDEX idx_investorRank_season  ON investorRankings (seasonID, profitRank);
```

---

*Medalbank Academy × Swim Stock Exchange*
*데이터베이스 스키마 정의서 v1.0*
