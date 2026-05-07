import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') })

const APPLY = process.argv.includes('--apply')

const PUBLIC_BASE = (process.env.CLOUD_PUBLIC_URL ?? '').replace(/\/+$/, '')

function toKey(val) {
  if (!val) return val
  if (PUBLIC_BASE && val.startsWith(PUBLIC_BASE + '/')) return val.slice(PUBLIC_BASE.length + 1)
  if (PUBLIC_BASE && val === PUBLIC_BASE)               return ''
  if (typeof val === 'string' && val.startsWith('http')) {
    try { return new URL(val).pathname.replace(/^\//, '') } catch { return val }
  }
  return val
}

const FIELDS = ['thumb', 'preview', 'large', 'original']

function transformUrls(urls) {
  if (!urls) return { changed: false, urls }
  const next = { ...urls }
  let changed = false
  for (const f of FIELDS) {
    if (urls[f] == null) continue
    const v = toKey(urls[f])
    if (v !== urls[f]) { next[f] = v; changed = true }
  }
  return { changed, urls: next }
}

async function main() {
  const { MONGODB_ADDR, MONGO_USERNAME, MONGO_PWD, MONGO_DBNAME } = process.env
  if (!MONGODB_ADDR || !MONGO_USERNAME || !MONGO_PWD || !MONGO_DBNAME) {
    console.error('MongoDB env 누락 (MONGODB_ADDR/MONGO_USERNAME/MONGO_PWD/MONGO_DBNAME)')
    process.exit(1)
  }
  const uri = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME}?authSource=admin`

  console.log(`mode:        ${APPLY ? 'APPLY (실제 업데이트)' : 'DRY-RUN (집계만)'}`)
  console.log(`PUBLIC_BASE: ${PUBLIC_BASE || '(미설정)'}`)
  console.log(`db:          ${MONGO_DBNAME}`)
  console.log()

  const client = new MongoClient(uri)
  await client.connect()
  const col = client.db(MONGO_DBNAME).collection('images')

  const cursor = col.find({}, { projection: { image_id: 1, urls: 1 } })
  let scanned = 0
  let willChange = 0
  let updated = 0
  const sample = []

  while (await cursor.hasNext()) {
    const d = await cursor.next()
    scanned++
    const { changed, urls } = transformUrls(d.urls)
    if (!changed) continue
    willChange++
    if (sample.length < 5) sample.push({ image_id: d.image_id, before: d.urls, after: urls })
    if (APPLY) {
      await col.updateOne({ _id: d._id }, { $set: { urls } })
      updated++
    }
  }

  console.log(`scanned:     ${scanned}`)
  console.log(`will-change: ${willChange}`)
  if (APPLY) console.log(`updated:     ${updated}`)
  if (sample.length) {
    console.log('\nsample (최대 5건):')
    for (const s of sample) console.log(JSON.stringify(s, null, 2))
  }

  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
