// medalbank-api — c:\develop\node\medalbank 백엔드에서 breaststroke 프론트가 호출하는
// 라우터만 골라 이 저장소 server(6630)에 마운트하는 CJS 서브앱.
// 원본 라우터/컨트롤러/모델은 routes/ 아래로 그대로 복제했고 여기서 경로만 붙인다.
// 하나가 실패해도 나머지는 살도록 각 마운트를 try/catch 로 감싼다.
const express = require('express')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// 원본 app.js 가 세팅하던 전역 — CMS 이미지 서빙(/cms)과 파일 업로드가 이 디렉토리를 쓴다.
// 우선순위: IMAGE_PATH/UPLOAD_PATH 환경변수 > (Windows 로컬) server/uploads/ImageMedalBank > 운영 /backup/ImageMedalBank
// 라우터 require 보다 먼저 설정해야 한다.
const uploadRoot = process.env.IMAGE_PATH || process.env.UPLOAD_PATH
  || (process.platform === 'win32' ? path.join(__dirname, '..', 'uploads', 'ImageMedalBank') : '/backup/ImageMedalBank')
if (process.platform === 'win32') fs.mkdirSync(uploadRoot, { recursive: true })
global.uploadPath    = uploadRoot
global.imagePath     = uploadRoot
global.avatarPath    = path.join(uploadRoot, 'avatar')
global.thumbnailPath = path.join(uploadRoot, 'thumbnail')
global.originalPath  = path.join(uploadRoot, 'original')
global.rootPath      = global.rootPath || path.join(__dirname, '..')

const mounted = []
const failed = []

function mount(mountPath, modPath) {
  try {
    router.use(mountPath, require(modPath))
    mounted.push(mountPath)
  } catch (e) {
    failed.push({ mountPath, error: e && e.message ? e.message : String(e) })
  }
}

// ── Breaststroke (/BR/*, /leaderboardNew) ──────────────────────────
mount('/BR/times',        './routes/Breaststroke/Services/times/times.routes')
mount('/BR/athletes',     './routes/Breaststroke/Services/athletes/athletes.routes')
mount('/BR/competitions', './routes/Breaststroke/Services/competitions/competitions.routes')
mount('/BR/analysis',     './routes/Breaststroke/Services/analysis/analysis.routes')
mount('/BR/statistics',   './routes/Breaststroke/Services/statistics/statistics.routes')
mount('/leaderboardNew',  './routes/Breaststroke/Services/leaderboards/leaderboard.routes')
mount('/BR/items',        './routes/Breaststroke/Services/items/items.routes')
mount('/BR/youtube',      './routes/Breaststroke/Services/youtube/youtube.routes')
mount('/BR/magazine',     './routes/Breaststroke/Services/magazine/magazine.routes')
mount('/BR/importTimes',  './routes/Breaststroke/Services/importTimes')
mount('/BR/images',       './routes/Breaststroke/Services/media')

// ── MSKR (/statistics, /poolsNew, /teamsNew, /stems, /simulation, /usersNew, /times…) ──
mount('/statistics',      './routes/MSKR/Services/statistics/statistics.routes.js')
mount('/poolsNew',        './routes/MSKR/Services/pools/pools.routes')
mount('/stems',           './routes/MSKR/Services/stems/stems.routes')
mount('/simulation',      './routes/MSKR/Services/simulation/simulation.routes')
mount('/teamsNew',        './routes/MSKR/Services/teams/teams.routes')
mount('/timesNew',        './routes/MSKR/Services/times/times.routes')
mount('/times',           './routes/MSKR/Services/times/times.routes')
mount('/usersNew',        './routes/MSKR/Services/users/users.routes.js')
mount('/competitionsNew', './routes/MSKR/Services/competitions/competitions.routes')
// 로그인/백엔드 관리용 (breaststroke /backend)
mount('/auth',            './routes/MSKR/Services/login/login.routes.js')
mount('/images',          './routes/MSKR/Services/images/images.routes')
mount('/athletesNew',     './routes/MSKR/Services/athletes/athletes.routes')

// ── CMS 이미지 서빙 (/cms/images/athletes/<id>/<t|f>) — breaststroke 선수 사진 ──
mount('/cms',             './routes/MSKR/CMS/media')

console.log('[medalbank-api] mounted:', mounted.join(', ') || '(none)')
if (failed.length) {
  console.warn('[medalbank-api] FAILED mounts:')
  for (const f of failed) console.warn('   -', f.mountPath, '→', f.error)
}

module.exports = router
module.exports.mounted = mounted
module.exports.failed = failed
