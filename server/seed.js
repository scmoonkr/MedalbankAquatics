import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') })

import { MongoClient } from 'mongodb'

const { MONGODB_ADDR, MONGO_USERNAME, MONGO_PWD, MONGO_DBNAME } = process.env
const uri = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME}?authSource=admin`

// ── Source data ───────────────────────────────────────────────────────────────
const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../html/data/athletes.json')
const { athletes: srcAthletes, meets: srcMeets } = JSON.parse(readFileSync(SRC, 'utf8'))

// ── Meet location map (src id → location string) ──────────────────────────────
const LOCATIONS = {
  'gn-2604': '강남 실내수영장',
  'sl-2603': '잠실 올림픽 수영장',
  'bs-2602': '부산 시민 수영장',
  'kr-2601': '국민체육진흥공단 수영장',
  'jp-2512': '도쿄 아쿠아틱스 센터',
  'kr-2510': '국민체육진흥공단 수영장',
  'in-2508': '인천 스포츠콤플렉스 수영장',
  'sl-2505': '잠실 올림픽 수영장',
  'kr-2503': '국민체육진흥공단 수영장',
  'gn-2410': '강남 실내수영장',
  'kr-2406': '국민체육진흥공단 수영장',
  'kr-2403': '국민체육진흥공단 수영장',
}

// ── Image url helper (idx 1~150) ──────────────────────────────────────────────
function idxToUrls(idx) {
  const n = String(idx).padStart(3, '0')
  return {
    thumb:   `/images/thumbs/thumb-${n}.jpg`,
    preview: `/images/previews/preview-${n}.jpg`,
    xl:      `/images/xl/xl-${n}.jpg`,
    full:    `/images/full/full-${n}.jpg`,
  }
}

// ── Email helper (masked → plausible fake) ────────────────────────────────────
function fakeEmail(masked, athleteId) {
  const domain = masked.split('@')[1] ?? 'example.com'
  const first  = masked[0] ?? 'a'
  return `${first}${athleteId}@${domain}`
}

async function seed() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(MONGO_DBNAME)
  console.log('Connected:', MONGO_DBNAME)

  await db.collection('images').deleteMany({})
  await db.collection('meets').deleteMany({})
  await db.collection('athletes').deleteMany({})
  console.log('Cleared existing data')

  const now = new Date()

  // ── Meets (meet_id: 1~) ────────────────────────────────────────────────────
  // srcMeets 순서 그대로 1번부터 부여 (최신순 → 1이 가장 최신)
  const meetIdMap = {}   // src string id → numeric meet_id
  const meetDocs  = srcMeets.map((m, i) => {
    const meet_id = i + 1
    meetIdMap[m.id] = meet_id
    return {
      meet_id,
      label:      m.label,
      short:      m.short,
      date:       new Date(m.date),
      location:   LOCATIONS[m.id] ?? '',
      created_at: now,
    }
  })
  await db.collection('meets').insertMany(meetDocs)
  console.log(`Meets: ${meetDocs.length}개 삽입`)

  // ── Athletes + Images ──────────────────────────────────────────────────────
  let imageIdCounter = 1
  const athleteDocs = []
  const imageDocs   = []

  for (const a of srcAthletes) {
    // athlete_id: "ath-013" → 1013
    const num        = parseInt(a.id.split('-')[1], 10)
    const athlete_id = 1000 + num

    const first_date = a.first_date ? new Date(a.first_date) : null
    // 70% 동의 처리 (first_date 기준 동의)
    const consent_date = first_date && Math.random() > 0.3 ? first_date : null

    athleteDocs.push({
      athlete_id,
      name:         a.name,
      email:        fakeEmail(a.email_masked, athlete_id),
      lang:         a.lang,
      consent_date,
      first_date,
      created_at:   now,
    })

    // 해당 선수의 photos → image 문서
    for (const p of a.photos ?? []) {
      const meet_id = meetIdMap[p.meet_id]
      if (!meet_id) continue
      imageDocs.push({
        image_id:     imageIdCounter++,
        athlete_id,
        meet_id,
        date:         new Date(p.date),
        consent_date: consent_date,
        urls:         idxToUrls(p.idx),
        tags:         [],
        created_at:   now,
      })
    }
  }

  await db.collection('athletes').insertMany(athleteDocs)
  console.log(`Athletes: ${athleteDocs.length}명 삽입`)

  await db.collection('images').insertMany(imageDocs)
  console.log(`Images: ${imageDocs.length}장 삽입`)

  // ── Indexes ────────────────────────────────────────────────────────────────
  await db.collection('athletes').createIndex({ athlete_id: 1 }, { unique: true })
  await db.collection('meets').createIndex({ meet_id: 1 }, { unique: true })
  await db.collection('images').createIndex({ image_id: 1 }, { unique: true })
  await db.collection('images').createIndex({ athlete_id: 1 })
  await db.collection('images').createIndex({ meet_id: 1 })
  console.log('Indexes ensured')

  await client.close()
  console.log('Done.')
}

seed().catch(err => { console.error(err); process.exit(1) })
