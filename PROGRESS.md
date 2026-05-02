# MedalbankAquatics — 작업 진행 현황

> 마지막 업데이트: 2026-05-02 (2차)

---

## 완료된 작업

### 1. GitHub 저장소 설정
- Private 저장소 생성: https://github.com/scmoonkr/MedalbankAquatics
- 기존 코드 최초 push 완료
- README.md에 git push/pull 명령 추가

---

### 2. Nuxt 3 프론트엔드 구성 (`/nuxt`)

디자이너 HTML 목업을 Nuxt 3 페이지로 포팅 완료

| 파일 | 설명 |
|------|------|
| `nuxt.config.ts` | 포트 6631, shared.css, Google Fonts, Nitro publicAssets 설정 |
| `assets/css/shared.css` | 공통 CSS |
| `plugins/mb.client.ts` | 클라이언트 플러그인 (cursor, menu, lightbox, clock) |
| `layouts/default.vue` | 공통 레이아웃 (로고, 헤더 nav, 햄버거 메뉴, 푸터, 라이트박스) |
| `pages/index.vue` | 메인 — 3D 갤러리 엔진, MongoDB gallery API 연동 |
| `pages/about.vue` | 소개 — IntersectionObserver reveal 애니메이션 |
| `pages/athletes.vue` | 선수 목록 — 이름순/사진보유순/최신순 정렬 |
| `pages/athlete.vue` | 선수 상세 — 대회별/최신순 정렬, query string `?id=` |
| `pages/photos.vue` | 전체 사진 — 페이지네이션 |
| `pages/magazines.vue` | 정기간행물 — vol별 타일 그리드 |
| `pages/request.vue` | 제보 게시판 + 폼 |
| `pages/consent.vue` | 공개 요청 — MongoDB 이미지/대회 연동, 장바구니 (localStorage) |
| `pages/cart.vue` | 동의 신청 — 선택 이미지 미리보기, 폼 제출, 이메일 발송 |
| `pages/verify.vue` | 이메일 인증 — 토큰 검증, 완료/오류 화면 |

**이미지 서빙**: `nitro.publicAssets`로 `/html/images` 절대 경로 마운트
- `/images/thumbs/`, `/images/previews/`, `/images/xl/`, `/images/full/`

---

### 3. MongoDB 스키마

컬렉션 3개. 파생/집계 필드는 조회 시 JS로 처리.

#### `athletes`
| 필드 | 타입 | 설명 |
|------|------|------|
| athlete_id | Number | 고유 ID (max+1 자동 증가) |
| name | String | 선수 이름 |
| email | String | 이메일 (동의 매칭 키) |
| lang | String (ko/en) | 언어 설정 |
| consent_date | Date | 동의 완료일 (인증 시 업데이트) |
| first_date | Date | 최초 동의일 (1회만 세팅) |

파생 처리 (JS): photo_count, last_date, 초성 그룹

#### `meets`
| 필드 | 타입 | 설명 |
|------|------|------|
| meet_id | Number | 고유 ID |
| label | String | "강남 마스터즈" |
| short | String | "2026.04" |
| date | Date | 대회 날짜 |
| location | String | 장소 |

파생 처리 (JS): photo_count

#### `images`
| 필드 | 타입 | 설명 |
|------|------|------|
| image_id | Number | 고유 ID |
| athlete_id | Number | 선수 참조 (동의 인증 시 세팅) |
| meet_id | Number | 대회 참조 |
| date | Date | 촬영일 |
| consent_date | Date | 동의 완료일 (인증 시 세팅, 없으면 비공개) |
| urls.thumb | String | 썸네일 URL |
| urls.preview | String | 미리보기 URL |
| urls.xl | String | 고해상도 URL |
| urls.full | String | 원본 URL |
| tags | [String] | 태그 목록 |

---

### 4. Express API 서버 (`/server`, 포트 6630)

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /health` | 서버 상태 확인 |
| `GET /api/athletes` | 선수 목록 (photo_count, last_date 집계 포함) |
| `GET /api/meets` | 대회 목록 (photo_count 집계 포함) |
| `GET /api/gallery` | 메인 갤러리용 전체 이미지 (thumb, xl URL) |
| `GET /api/images` | 페이지네이션 이미지 (`consent_date: {$exists:true}` 필터, meet_id 옵션) |
| `GET /api/images/by-ids` | image_id 배열로 이미지 조회 (장바구니용) |
| `POST /api/consent` | 동의 접수 — athlete 조회/신규등록, consent 저장, 인증 메일 발송 |
| `GET /api/consent/verify/:token` | 인증 링크 처리 — athletes/images 업데이트 |

**Nuxt 서버 프록시** (`/nuxt/server/api/`): 위 엔드포인트 전부 대응

---

### 5. 동의(Consent) 플로우

```
consent.vue — 이미지 선택 (consent_date 없는 것만 노출)
    ↓ 장바구니 FAB
cart.vue — 이름/이메일 입력 → "이메일 인증 보내기"
    ↓ POST /api/consent
    · athletes.email 조회 → 없으면 신규 등록 (athlete_id: max+1, lang: ko)
    · consents 컬렉션 저장 (athlete_id 포함)
    · Naver SMTP → 썸네일 이미지 포함 인증 메일 발송
    ↓ 이메일 인증 링크 클릭
verify.vue → GET /api/consent/verify/:token
    · athletes: consent_date 업데이트, first_date 최초 1회 세팅
    · images: athlete_id, consent_date 업데이트
```

**이메일**: Naver SMTP (`.env` — `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`)  
**인증 링크**: `SITE_URL/verify?token=...` (`.env` — `SITE_URL`)

---

---

### 6. 버그 수정 및 환경 정비 (2026-05-02 2차)

#### 이미지 서빙 문제 해결
- `nuxt/public/images/` 전체 git에 추가 (avatars, cursor, full, magazine, previews, thumbs, xl — 691개)
- `about.vue` 이미지 경로 `./images/` → `/images/` 수정 (Vite 상대경로 오류)
- `magazines.vue` 커버 이미지(`cover-01.jpg`) 생성 (xl-001.jpg 복사)
- `nuxt.config.ts` `nitro.publicAssets`로 `html/images/` 마운트 확인 (dev에서 이미 작동 중이었음)

#### 어두운 배경 복원
- `default.vue`에 전역 스타일 추가 → `html, body, #__nuxt { background: var(--bg) }`
- `about.vue`, `request.vue` scoped body 스타일 제거 → default.vue로 통합

#### Hydration mismatch 수정
- `about.vue`, `request.vue`, `magazines.vue`, `athlete.vue`에 `definePageMeta({ ssr: false })` 추가

#### photos.vue 이미지 필터 수정
- `GET /api/images` 필터: `consent_date: { $exists: false }` → `{ $exists: true }`
- photos.vue는 동의 완료된 이미지만 노출하는 것이 올바른 동작

#### photos.vue UI 개선
- image_id 좌측 하단 표시 (작은 폰트, opacity 0.55)

---

## 다음 작업 (미착수)

- [ ] iDrive e2 (S3 호환) 이미지 업로드 연동
- [ ] 어드민 페이지 (이미지 업로드, 선수 관리)
- [ ] 선수 프로필 페이지 consent_date 표시
- [ ] consent.vue 이미지 선택 — 비공개(consent_date 없는) 이미지 노출 로직 재검토
