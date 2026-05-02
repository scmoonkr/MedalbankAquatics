# MedalbankAquatics — 작업 진행 현황

> 마지막 업데이트: 2026-05-02 (4차)

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
| `pages/consent.vue` | 공개 요청 — consent_date 없는 이미지만 노출, 장바구니 |
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
| `PUT /api/admin/athletes/:id` | 선수 수정 |
| `DELETE /api/admin/athletes/:id` | 선수 삭제 |
| `GET /api/admin/meets` | 대회 전체 목록 |
| `PUT /api/admin/meets/:id` | 대회 수정 |
| `DELETE /api/admin/meets/:id` | 대회 삭제 |
| `GET /api/admin/images` | 이미지 목록 (선수명·대회명 join) |
| `PUT /api/admin/images/:id` | 이미지 수정 (urls 포함) |
| `DELETE /api/admin/images/:id` | 이미지 + iDrive 파일 삭제 |
| `GET /api/admin/requests` | 촬영요청 전체 (비마스킹) |
| `PUT /api/admin/requests/:id` | 촬영요청 수정 |
| `DELETE /api/admin/requests/:id` | 촬영요청 삭제 |
| `POST /api/admin/upload-images` | 이미지 업로드 (sharp 리사이즈 + iDrive) |

---

### 5. 백엔드 관리 페이지 (`/backend/`)

| 페이지 | 경로 | 기능 |
|--------|------|------|
| 촬영요청 관리 | `/backend/request` | 목록 조회, 상태 변경, 편집, 삭제 |
| 이미지 관리 | `/backend/images` | 썸네일 목록, 선수명·대회명 join, urls 편집, 삭제 |
| 선수 관리 | `/backend/athletes` | 목록 조회, 동의일 편집, 삭제 |
| 대회 관리 | `/backend/meets` | 목록 조회, 편집, 이미지 업로드, 삭제 |

**공통 UI**: 체크박스 다중 선택, 행 클릭 우측 편집 패널, 저장/삭제

---

### 6. iDrive e2 이미지 스토리지

- **버킷**: `medalbank-bucket` (ap-northeast-1)
- **업로드 경로**: `meet-{id}/thumbs|previews|full|xl/{image_id}.jpg`
- **리사이즈** (sharp):
  - `thumb`: 긴 쪽 400px
  - `preview`: 긴 쪽 320px, 흑백
  - `full`: 긴 쪽 1600px
  - `xl`: 원본
- **삭제 연동**: images 삭제 시 iDrive 4개 파일 자동 삭제
- **마이그레이션**: `server/migrate-images-to-idrive.mjs` — 기존 로컬 이미지 일괄 업로드

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
- **magazine@medalbank.com**: Naver Works + 가비아 DNS MX 레코드 설정 예정
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

idrivee2_endpoint=s3.ap-northeast-1.idrivee2.com
idrivee2_bucket=medalbank-bucket
idrivee2-access_key_id=...
idrivee2-access_key=...

EMAIL_HOST=smtp.naver.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=...

MAGAZINE_EMAIL=magazine@medalbank.com
MAGAZINE_EMAIL_PASS=...
```

---

## 다음 작업 (미착수)

- [ ] iDrive 버킷 공개 접근 설정 (현재 URL 접속 시 idrive.com으로 리다이렉트됨)
- [ ] magazine@medalbank.com Naver Works 이메일 MX 레코드 적용 확인
- [ ] 기존 이미지 iDrive 마이그레이션 (`migrate-images-to-idrive.mjs` 실행)
- [ ] 백엔드 페이지 인증/접근 제한 (현재 비인증 공개 상태)
- [ ] 이미지 업로드 후 athlete_id 매칭 (현재 0으로 저장됨)
- [ ] 서버 `deploy.sh` 실행 → backend 페이지 반영 확인
