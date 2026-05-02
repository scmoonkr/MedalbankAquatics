import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
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

app.get('/health', (_, res) => res.json({ ok: true }))

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
