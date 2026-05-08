import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
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

app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
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
