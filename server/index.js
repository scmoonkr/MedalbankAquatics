import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { createRequire } from 'module'
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') })
import express from 'express'
import { connectDB } from './db.js'
import { ensureIndexes } from './models/Image.js'
import athletesRoute  from './routes/athletes.js'
import meetsRoute     from './routes/meets.js'
import imagesRoute    from './routes/images.js'
import consentRoute   from './routes/consent.js'
import requestsRoute  from './routes/requests.js'
import uploadRoute    from './routes/upload.js'

const app  = express()
const PORT = process.env.PORT ?? 6630
const __dir = dirname(fileURLToPath(import.meta.url))

app.use('/images', express.static(resolve(__dir, '../nuxt/public/images')))

// ── swimmingPhotography / erp (c:\Develop\VUE\Medalbank\Photography 에서 이식) ──────
// 둘 다 자체 /api/* 경로와 쿠키 로그인(credentials CORS)을 쓰므로, 아래의 공용 express.json · CORS(*) 보다
// 먼저 접두어로 분리해 마운트한다.
//   /sp/api/*   swimmingPhotography 서버  (swimmingPhotography · swimmingPhotographyDashboard 가 프록시)
//   /erp/api/*  erp 서버,  /erp/  erp 관리 화면(erp/public) — ERP_MOUNT=true 일 때만.
//               erp 는 업무 시스템이라 기본은 별도 프로세스(npm run erp → 6643)로 띄운다.
// 한쪽이 로드에 실패해도 나머지 API 는 계속 뜨도록 각각 try/catch 한다.
const mounts = [['/sp', './swimmingPhotography/app.js']]
if (process.env.ERP_MOUNT === 'true') {
  // '/erp' → '/erp/' (관리 화면의 상대경로가 맞으려면 끝 슬래시가 필요). app.get 은 '/erp/' 도 매칭해 무한 리다이렉트가 되므로 경로를 직접 비교한다.
  app.use((req, res, next) => (req.path === '/erp' ? res.redirect('/erp/') : next()))
  mounts.push(['/erp', './erp/app.js'])
}
for (const [prefix, file] of mounts) {
  try {
    app.use(prefix, (await import(file)).default)
    if (prefix === '/erp') (await import('./erp/db.js')).ensureIndexes().catch((e) => console.error('[erp] 인덱스 생성 실패:', e.message))
  } catch (e) {
    console.error(`[${prefix}] mount failed:`, e?.message || e)
  }
}

app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const GIT_HASH = (() => {
  try { return execSync('git rev-parse --short HEAD', { cwd: dirname(fileURLToPath(import.meta.url)) }).toString().trim() }
  catch { return 'unknown' }
})()

app.get('/health', (_, res) => res.json({ ok: true }))
app.get('/api/version', (_, res) => res.json({ hash: GIT_HASH }))

athletesRoute(app)
meetsRoute(app)
imagesRoute(app)
consentRoute(app)
requestsRoute(app)
uploadRoute(app)

// ── medalbank-api (c:\develop\node\medalbank 백엔드 이식) ─────────────
// breaststroke 프론트가 쓰는 /BR/*, /statistics, /leaderboardNew, /poolsNew,
// /teamsNew, /stems, /simulation, /usersNew, /times… 라우터를 CJS 서브앱으로 마운트.
try {
  const require = createRequire(import.meta.url)
  app.use(require('./medalbank-api/app.cjs'))
} catch (e) {
  console.error('[medalbank-api] mount failed:', e?.message || e)
}

connectDB().then(async () => {
  await ensureIndexes()
  // atomic image_id 카운터 초기화 ($max: 현재값보다 클 때만 갱신, upsert로 없으면 생성)
  const { getDB } = await import('./db.js')
  const { images } = await import('./models/Image.js')
  const maxImg = await images().find({}).sort({ image_id: -1 }).limit(1).next()
  const maxId  = maxImg?.image_id ?? 0
  await getDB().collection('counters').updateOne(
    { _id: 'image_id' },
    { $max: { seq: maxId } },
    { upsert: true }
  )
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
