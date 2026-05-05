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
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
