# MedalbankAquatics — 작업 진행 현황

> 마지막 업데이트: 2026-05-02

---

## 완료된 작업

### 1. GitHub 저장소 설정
- Private 저장소 생성: https://github.com/scmoonkr/MedalbankAquatics
- 기존 코드 최초 push 완료
- README.md에 git push/pull 명령 추가

---

### 2. Nuxt 3 프론트엔드 구성 (`/nuxt`)

디자이너 HTML 목업을 Nuxt 3 페이지로 포팅 (디자인 검수용)

| 파일 | 설명 |
|------|------|
| `nuxt.config.ts` | 포트 6631, shared.css, Google Fonts, Nitro publicAssets 설정 |
| `assets/css/shared.css` | 공통 CSS |
| `plugins/mb.client.ts` | 클라이언트 플러그인 (cursor, menu, lightbox, clock) |
| `layouts/default.vue` | 공통 레이아웃 (로고, 헤더 nav, 햄버거 메뉴, 푸터, 라이트박스) |
| `pages/index.vue` | 메인 — 3D 갤러리 엔진 (tile pool, drag/scroll, curve animation) |
| `pages/athletes.vue` | 선수 목록 — 이름순/사진보유순/최신순 정렬 |
| `pages/athlete.vue` | 선수 상세 — 대회별/최신순 정렬, query string `?id=` |
| `pages/photos.vue` | 전체 사진 — 페이지네이션 (32페이지 × 100장) |

**이미지 서빙**: `nitro.publicAssets`로 `/html/images` 절대 경로 마운트
- URL: `http://localhost:6631/images/...`
- URL: `http://localhost:6631/data/...` (JSON 목업 데이터)

---

### 3. MongoDB 스키마 설계

컬렉션 3개. 파생/집계 필드는 모두 제거하고 조회 시 JS로 처리.

#### `athletes`
| 필드 | 타입 | 설명 |
|------|------|------|
| name | String | 선수 이름 |
| email | String | 이메일 |
| lang | String (ko/en) | 언어 설정 |
| consent_date | Date \| null | null = 미동의 |
| first_date | Date \| null | 최초 촬영일 |
| created_at | Date | 자동 생성 |

파생 처리 (JS): photo_count, last_date, email_masked, 초성 그룹

#### `meets` (대회)
| 필드 | 타입 | 설명 |
|------|------|------|
| label | String | "강남 마스터즈" |
| short | String | "2026.04" |
| date | Date | 대회 날짜 |
| location | String | 장소 |
| created_at | Date | 자동 생성 |

파생 처리 (JS): photo_count

#### `images`
| 필드 | 타입 | 설명 |
|------|------|------|
| athlete_id | ObjectId → Athlete | 선수 참조 (1장 = 1명) |
| meet_id | ObjectId → Meet | 대회 참조 |
| date | Date | 촬영일 |
| consent_date | Date \| null | null = 비공개 |
| urls.thumb | String | 썸네일 URL |
| urls.preview | String | 미리보기 URL |
| urls.xl | String | 고해상도 URL |
| urls.full | String | 원본 URL |
| tags | [String] | 태그 목록 |
| created_at | Date | 자동 생성 |

파생 처리 (JS): sort_order (date 기준 정렬)

---

### 4. Express API 서버 구성 (`/server`)

| 파일 | 설명 |
|------|------|
| `package.json` | ES Module (`"type": "module"`), mongoose/express/dotenv 의존성 |
| `index.js` | dotenv 로드 → Express 앱 → MongoDB 연결 → 서버 시작 |
| `db.js` | `connectDB()` — `.env` 환경변수로 MongoDB URI 구성 |
| `models/Athlete.js` | Athlete Mongoose 모델 |
| `models/Meet.js` | Meet Mongoose 모델 |
| `models/Image.js` | Image Mongoose 모델 |

**포트**: 6630  
**엔드포인트**: `GET /health` → `{ ok: true }`  
**MongoDB 연결**: `221.143.48.153:4529` / DB: `MedalbankAquatics` ✓

`.env` 참조 변수:
```
PORT=6630
MONGODB_ADDR
MONGO_USERNAME
MONGO_PWD
MONGO_DBNAME
idrivee2_endpoint
```

---

## 다음 작업 (미착수)

- [ ] REST API 라우트 작성 (`/api/athletes`, `/api/meets`, `/api/images`)
- [ ] iDrive e2 (S3 호환) 이미지 업로드 연동
- [ ] `athletes.json` 목업 데이터 → MongoDB 마이그레이션
- [ ] 선수 동의 이메일 발송 기능
- [ ] 어드민 페이지 (이미지 업로드, 선수 관리)
