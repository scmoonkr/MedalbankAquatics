# MedalbankAquatics

## Git 사용법
https://github.com/scmoonkr/MedalbankAquatics

### 변경사항 푸시 (Push)

```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```

### 최신 코드 받기 (Pull)

```bash
git pull origin main
token=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
```

## 개발환경 실행 방법

각 앱은 별도의 터미널에서 실행한다. 최초 1회 또는 의존성 변경 시 `npm run install:all`(또는 각 디렉토리에서 `npm install`)을 먼저 실행한다.
루트(`Aquatics/`)에서 아래 명령으로 바로 실행할 수 있다. API 서버(`server`)를 먼저 띄운다.

| 명령 (루트에서) | 앱 | 디렉토리 | 개발 포트 |
| --- | --- | --- | --- |
| `npm run server` | API 서버 (Express) | `server/` | 6630 |
| `npm run medalbank` | medalbank (Nuxt 3) | `medalbank/` | 6631 |
| `npm run aquatics` | aquatics (Nuxt 3) | `aquatics/` | 6632 |
| `npm run breaststroke` | breaststroke (Nuxt 3) | `breaststroke/` | 6633 |
| `npm run sse` | sse (Nuxt 3) | `sse/` | 6634 |
| `npm run erp` | erp 업무관리 (API + 관리 화면, Express) | `server/erp/` (화면 `erp/public/`) | 6643 |
| `npm run swimmingPhotography` | swimmingPhotography 공개 사이트 (Nuxt 3) | `swimmingPhotography/` | 6641 |
| `npm run swimmingPhotographyDashboard` | swimmingPhotography 관리 대시보드 (Nuxt 3) | `swimmingPhotographyDashboard/` | 6642 |

### swimmingPhotography · erp (Photography 에서 이식)

`C:\Develop\VUE\Medalbank\Photography` 의 server · erp 백엔드를 코드·의존성은 `server/` 하나로 통합했다. 실행은 아래처럼 나뉜다.

| 주소 | 내용 | 코드 | 프로세스 |
| --- | --- | --- | --- |
| `http://localhost:6630/sp/api/*` | swimmingPhotography API (swimmingPhotography · swimmingPhotographyDashboard 가 `/api/**` 를 프록시) | `server/swimmingPhotography/` | API 서버(6630)에 마운트 |
| `http://localhost:6643/` | erp 관리 화면 + `/api/*` | `server/erp/` (화면은 `erp/public/`) | **별도** (`npm run erp`) |

- erp 는 업무 시스템이라 별도 프로세스가 기본이다. API 서버에 같이 띄우려면 `.env` 에 `ERP_MOUNT=true` → `http://localhost:6630/erp/`.
- `SP_` 접두어 환경변수(`SP_NAVER_CLIENT_ID`, `SP_CLOUD_BUCKET` …)는 Aquatics 와 값이 달라 분리한 키다. 없으면 접두어 없는 키를 쓴다. erp 업로드 폴더는 `ERP_UPLOAD_DIR`, 포트는 `ERP_PORT`(기본 6643).
- 두 앱 모두 쿠키 로그인(`sp_sess`, `erp_sess`)을 쓰므로 마운트할 때는 공용 CORS(`*`)보다 먼저 마운트한다 (`server/index.js`).

아래 1)~3)은 폴더로 이동해서 직접 실행하는 방법이다 (포트 번호는 위 표가 최신).

### 1) API 서버 (Express)

```bash
cd C:\Develop\MedalbankAquatics\server
npm run dev      # 개발 (파일 변경 감지 자동 재시작)
# 또는
npm start        # 일반 실행
```

→ http://localhost:6630
https://api.medalbank.com

### 2) aquatics (medalbankaquatics.com)

```bash
cd C:\Develop\MedalbankAquatics\aquatics
npm run dev
```

→ http://localhost:6631
https:// medalbankaquatics.com
→ http://localhost:6631/backend/leaderboard
https:// medalbankaquatics.com/backend/leaderboard

### 3) medalbank (medalbank.com)

```bash
cd C:\Develop\MedalbankAquatics\medalbank
npm run dev
→ http://localhost:6631 
https:// medalbank.com
```

### 4) https://medalbankaquatics.com
→ http://localhost:6632 
https://medalbankaquatics.com
→ http://localhost:6632/backend/meets
https://medalbankaquatics.com/backend/meets


```bash

### 5) https://breaststroke.club
→ http://localhost:6632 
https://https://breaststroke.club
→ http://localhost:6632/backend/competitions
https://https://breaststroke.club/backend/competitions


### 6) sse(swimming stock exchange)
→ http://localhost:6634
https://medalbank.com:6634
```


> 참고: 두 Nuxt 앱은 `/images/`, `/data/` 등 정적/API 요청을 6630(API 서버)으로 프록시하므로,
> 프론트엔드를 띄우기 전에 API 서버를 먼저 실행해 두는 것이 좋다.
> 환경변수는 루트의 `.env` 파일을 사용한다.