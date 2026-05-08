# MedalbankAquatics — 작업 진행 현황

> 마지막 업데이트: 2026-05-05 (6차)

---

## 완료된 작업

### 1. GitHub 저장소 설정
- Private 저장소: https://github.com/scmoonkr/MedalbankAquatics
- 기존 코드 최초 push 완료
- README.md에 git push/pull 명령 추가

---

### 2. Nuxt 3 프론트엔드 구성 (`/nuxt`, 포트 6631)

| 파일 | 설명 |
|------|------|
| `nuxt.config.ts` | 포트 6631, shared.css, Google Fonts, Nitro publicAssets 설정 |
| `assets/css/shared.css` | 공통 CSS 변수 (`--bg: #07090f` 등) |
| `plugins/mb.client.ts` | 클라이언트 플러그인 (cursor, menu, lightbox, clock) |
| `layouts/default.vue` | 공통 레이아웃 — 전역 배경색(`html, body, #__nuxt`) 포함 |
| `pages/index.vue` | 메인 — 3D 갤러리 엔진, MongoDB gallery API 연동 |
| `pages/about.vue` | 소개 — 아바타 이미지 `/images/` 절대경로, 촬영요청 NuxtLink |
| `pages/athletes.vue` | 선수 목록 — 이름순/사진보유순/최신순 정렬 |
| `pages/athlete.vue` | 선수 상세 — MongoDB `/api/athletes/:id` 연동, 대회별/최신순 |
| `pages/photos.vue` | 전체 사진 — consent_date 있는 이미지만 노출, image_id 표시 |
| `pages/magazines.vue` | 정기간행물 — vol별 타일 그리드 |
| `pages/request.vue` | 촬영요청 게시판 + 폼 (MongoDB request 컬렉션 연동) |
| `pages/consent.vue` | 확인요청 — consent_date 없는 이미지만 노출, 장바구니 |
| `pages/cart.vue` | 동의 신청 — 선택 이미지 미리보기, 폼 제출, 이메일 발송 |
| `pages/verify.vue` | 이메일 인증 — 토큰 검증, 완료/오류 화면 |

---

### 3. MongoDB 스키마

#### `athletes`
| 필드 | 타입 | 설명 |
|------|------|------|
| athlete_id | Number | 고유 ID |
| name | String | 선수 이름 |
| email | String | 이메일 |
| lang | String | ko / en |
| consent_date | Date | 동의 완료일 |

#### `meets`
| 필드 | 타입 | 설명 |
|------|------|------|
| meet_id | Number | 고유 ID |
| label | String | 대회명 |
| short | String | 2026.04 형식 |
| date | Date | 대회 날짜 |
| location | String | 장소 |
| competition_id | String | 외부 대회 ID (신규 추가) |

#### `images`
| 필드 | 타입 | 설명 |
|------|------|------|
| image_id | Number | 고유 ID |
| athlete_id | Number | 선수 참조 |
| meet_id | Number | 대회 참조 |
| date | Date | 촬영일 |
| consent_date | Date | 동의 완료일 (없으면 비공개) |
| urls.thumb | String | iDrive CDN URL |
| urls.preview | String | iDrive CDN URL (흑백) |
| urls.xl | String | iDrive CDN URL |
| urls.full | String | iDrive CDN URL |
| urls-backup | Object | 기존 로컬 경로 백업 |
| tags | [String] | 태그 |

#### `request`
| 필드 | 타입 | 설명 |
|------|------|------|
| request_id | Number | 고유 ID |
| status | String | review / approved / rejected / done |
| name | String | 신청자 이름 |
| team | String | 소속 |
| email | String | 이메일 |
| meet | String | 대회명 |
| date | String | 날짜 |
| message | String | 요청 내용 |
| created_at | Date | 신청일 |

---

### 4. Express API 서버 (`/server`, 포트 6630)

#### 공개 API
| 엔드포인트 | 설명 |
|-----------|------|
| `GET /health` | 서버 상태 |
| `GET /api/athletes` | 선수 목록 |
| `GET /api/athletes/:id` | 선수 상세 + 이미지 + 대회 |
| `GET /api/meets` | 대회 목록 |
| `GET /api/gallery` | 메인 갤러리용 이미지 |
| `GET /api/images` | 페이지네이션 이미지 |
| `GET /api/images/by-ids` | image_id 배열 조회 |
| `GET /api/requests` | 촬영요청 목록 (이름/소속 마스킹) |
| `POST /api/requests` | 촬영요청 등록 |
| `POST /api/consent` | 동의 접수 + 인증 메일 발송 |
| `GET /api/consent/verify/:token` | 이메일 인증 처리 |

#### 백엔드 관리 API (`/api/admin/`)
| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/admin/athletes` | 선수 전체 목록 (비마스킹) |
| `POST /api/admin/athletes` | 선수 신규 등록 (athlete_id 자동 채번) |
| `PUT /api/admin/athletes/:id` | 선수 수정 |
| `DELETE /api/admin/athletes/:id` | 선수 삭제 |
| `GET /api/admin/meets` | 대회 전체 목록 |
| `POST /api/admin/meets` | 대회 신규 등록 (meet_id 자동 채번) |
| `PUT /api/admin/meets/:id` | 대회 수정 |
| `DELETE /api/admin/meets/:id` | 대회 삭제 |
| `GET /api/admin/images` | 이미지 목록 (선수명·대회명 join) |
| `PUT /api/admin/images/:id` | 이미지 수정 (urls 포함) |
| `DELETE /api/admin/images/:id` | 이미지 + iDrive 파일 삭제 |
| `GET /api/admin/requests` | 촬영요청 전체 (비마스킹) |
| `POST /api/admin/requests` | 촬영요청 신규 등록 (request_id 자동 채번) |
| `PUT /api/admin/requests/:id` | 촬영요청 수정 |
| `DELETE /api/admin/requests/:id` | 촬영요청 삭제 |
| `POST /api/admin/upload-images` | 이미지 업로드 (sharp 리사이즈 + iDrive) |

---

### 5. 백엔드 관리 페이지 (`/backend/`)

| 페이지 | 경로 | 기능 |
|--------|------|------|
| 촬영요청 관리 | `/backend/request` | 목록 조회·편집·삭제, **신규 추가**, **상태별·소속별·대회별·월별 필터** |
| 이미지 관리 | `/backend/images` | 썸네일 목록·편집·삭제, **동의/비동의·대회별·월별 필터**, **그리드/리스트 뷰 토글** |
| 선수 관리 | `/backend/athletes` | 목록 조회·편집·삭제, **신규 추가** |
| 대회 관리 | `/backend/meets` | 목록 조회·편집·삭제, **신규 추가**, **폴더 선택 배치 업로드** (업로드 완료 파일 `uploaded/` 자동 이동) |

**공통 UI**: 체크박스 다중 선택, 행 클릭 우측 편집 패널, 저장/삭제, 지우기(폼 초기화)

#### 폴더 업로드 (`/backend/meets`)
- File System Access API(`showDirectoryPicker`) 사용 — Chrome/Edge 전용
- 폴더 선택 시 이미지 파일 자동 스캔, `uploaded/` 서브폴더 완료 파일 수 집계
- 20장씩 배치 업로드, 진행률 표시 (프로그레스 바)
- 업로드 완료된 파일은 `폴더/uploaded/`로 이동 → 중복 업로드 방지

---

### 6. Cloudflare R2 이미지 스토리지 (2026-05-05 교체)

- **이전**: iDrive e2 (`medalbank-bucket`) — 10TB 이하 플랜에서 퍼블릭 버킷 불가로 교체
- **현재**: Cloudflare R2 (`medalbankaquatics-bucket`)
  - 퍼블릭 URL: `https://pub-df208b7bfe8647ef8a12e9eacbce028c.r2.dev`
  - S3 API: `https://a44879681445b06ffe42cdab6fe31667.r2.cloudflarestorage.com`
  - egress 무료, 퍼블릭 버킷 플랜 무관
- **업로드 경로**: `meet-{id}/thumbs|previews|large|original/{image_id}.jpg`
- **리사이즈** (sharp, 가로 기준):
  - `thumb`: 가로 400px
  - `preview`: 가로 320px, 흑백
  - `large`: 가로 1600px
  - `original`: 원본
- **이미지 URL 필드명**: `urls.full` → `urls.large`, `urls.xl` → `urls.original`
- **삭제 연동**: images 삭제 시 R2 4개 파일 자동 삭제
- **환경변수**: `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL`

---

### 7. CentOS 서버 배포

- **Node.js 20 LTS** + **PM2** 프로세스 관리
- **Apache httpd** 리버스 프록시 (SSL — Let's Encrypt)
- **도메인**: medalbankaquatics.com → Nuxt(6631), /api/ → Express(6630)
- **배포 스크립트**: `deploy.sh` — git pull → npm install → nuxt build → pm2 restart
- **PM2 프로세스**:
  - `medalbank-api`: Express 서버
  - `medalbank-nuxt`: Nuxt 서버 (PORT=6631)

**서버 git pull 주의사항**:
- 서버에서 직접 파일 수정 시 pull 충돌 발생 → `git stash` 후 pull
  ```bash
  git stash
  git pull origin master
  ```
- 이후 Nuxt 재빌드 필요:
  ```bash
  cd nuxt && npm run build && pm2 restart medalbank-nuxt
  ```

---

### 8. 이메일 설정

- **동의 인증 메일**: Naver SMTP (`scmoonkr@naver.com`)
- **press@medalbank.com**: Naver Works + 가비아 DNS MX 레코드 설정 예정
  - MX: `mx1.worksmobile.com` (우선순위 10), `mx2.worksmobile.com` (20)
  - SPF: `v=spf1 include:worksmobile.com ~all`

---

## 환경 변수 (`.env`)

```
PORT=6630
NUXT_PUBLIC_API_BASE=http://localhost:6630
SITE_URL=https://medalbankaquatics.com

MONGODB_ADDR=...
MONGO_USERNAME=...
MONGO_PWD=...
MONGO_DBNAME=MedalbankAquatics

# Cloudflare R2
R2_ENDPOINT=https://a44879681445b06ffe42cdab6fe31667.r2.cloudflarestorage.com
R2_BUCKET=medalbankaquatics-bucket
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_URL=https://pub-df208b7bfe8647ef8a12e9eacbce028c.r2.dev

EMAIL_HOST=smtp.naver.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=...

MAGAZINE_EMAIL=press@medalbank.com
MAGAZINE_EMAIL_PASS=...

CONSENT_TOKEN_SECRET=...
```

---

### 9. 프론트엔드 CSS 전반 수정 (2026-05-03)

- `nuxt/layouts/default.vue` 전역 `<style>` 블록에 `:root` CSS 변수 전체 선언
  - 서브페이지에서 `--bg-soft`, `--line`, `--font-*`, `--ease-*` 등이 빈 값이었던 문제 해결
- 스크롤바: `transparent` track, `rgba(255,255,255,0.08)` thumb
- 서브페이지 `<h1>` 가시성 복구
- 메인 외 모든 페이지 `footer` → `position: static` (`body:not(.is-home)` 선택자)
- 전 페이지 하단 여백 `padding-bottom: 80px` 통일
- `consent.vue` 동의 철회 안내 ⓘ 아이콘 + 모달 추가
- `event-select` 드롭다운 배경색 global CSS로 통합 (scoped specificity 충돌 해결)

---

### 10. 6차 작업 추가 변경사항 (2026-05-05)

- **Consent 흐름 개선**: POST `/api/consent`에서 DB 저장 없이 HMAC-SHA256 서명 토큰으로 이메일 발송, GET `/verify`에서 모든 DB 작업 처리
- **SPA 이동 후 라이트박스 미동작 버그 수정**: `plugins/mb.client.ts`에서 `openLightbox`/`closeLightbox`를 매번 `getElementById` fresh lookup으로 변경
- **localStorage 복원 배너**: `consent.vue`에서 이전 선택 복원 시 배너 표시, 초기화 버튼 추가
- **백엔드 사이드바**: Medalbank 클릭 시 홈 이동, git 버전 해시 표시 (`nuxt/server/api/version.get.ts`)
- **이미지 대회 필터**: `backend/images.vue`에서 이미지 없는 대회도 필터에 표시되도록 `/api/admin/meets` 직접 조회
- **meets date 업데이트 버그 수정**: PUT 핸들러 `label` 등 `undefined` 필드 `?? ''` fallback 추가, `save()` try-catch 추가
- **deploy.sh**: `git pull origin master` 주석 해제 (서버 배포 자동화)
- **브랜치 정책**: 서버를 `master` 브랜치로 변경 (`git checkout master`)

---

## 다음 작업 (미착수)

- [ ] 로컬/서버 화면 차이 원인 파악 및 해결
- [ ] 서버 `.env`에 R2 환경변수 5개 추가 필요 (`R2_ENDPOINT` 등)
- [ ] press@medalbank.com Naver Works 이메일 MX 레코드 적용 확인
- [ ] 백엔드 페이지 인증/접근 제한 (현재 비인증 공개 상태)
- [ ] 이미지 업로드 후 athlete_id 매칭 (현재 0으로 저장됨)
