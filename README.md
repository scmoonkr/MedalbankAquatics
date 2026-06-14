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

세 앱은 각각 별도의 터미널에서 실행한다. 최초 1회 또는 의존성 변경 시 각 디렉토리에서 `npm install`을 먼저 실행한다.

| 앱 | 디렉토리 | 도메인 | 개발 포트 |
| --- | --- | --- | --- |
| API 서버 (Express) | `server/` | 공통 API | 6630 |
| aquatics (Nuxt 3) | `aquatics/` | medalbankaquatics.com | 6631 |
| medalbank (Nuxt 3) | `medalbank/` | medalbank.com | 6632 |

### 1) API 서버 (Express)

```bash
cd C:\Develop\MedalbankAquatics\server
npm run dev      # 개발 (파일 변경 감지 자동 재시작)
# 또는
npm start        # 일반 실행
```

→ http://localhost:6630

### 2) aquatics (medalbankaquatics.com)

```bash
cd C:\Develop\MedalbankAquatics\aquatics
npm run dev
```

→ http://localhost:6631

### 3) medalbank (medalbank.com)

```bash
cd C:\Develop\MedalbankAquatics\medalbank
npm run dev
```

→ http://localhost:6632

> 참고: 두 Nuxt 앱은 `/images/`, `/data/` 등 정적/API 요청을 6630(API 서버)으로 프록시하므로,
> 프론트엔드를 띄우기 전에 API 서버를 먼저 실행해 두는 것이 좋다.
> 환경변수는 루트의 `.env` 파일을 사용한다.