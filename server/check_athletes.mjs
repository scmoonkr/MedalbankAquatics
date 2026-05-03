import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// CLI 인자로 .env 경로 지정 가능: node check_athletes.mjs /path/to/.env
const envPath = process.argv[2] ?? path.join(__dirname, '.env')
dotenv.config({ path: envPath })

const { MONGODB_ADDR, MONGO_USERNAME, MONGO_PWD, MONGO_DBNAME } = process.env
if (!MONGODB_ADDR || MONGODB_ADDR === 'undefined') {
  console.error('❌ .env 로드 실패. 경로를 확인하세요.')
  console.error('   사용법: node check_athletes.mjs [.env 경로]')
  console.error(`   시도한 경로: ${envPath}`)
  process.exit(1)
}

const uri = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PWD)}@${MONGODB_ADDR}/${MONGO_DBNAME}?authSource=admin`
const client = new MongoClient(uri)
await client.connect()
const db = client.db(MONGO_DBNAME)

const col = {
  athletes: db.collection('athletes'),
  images:   db.collection('images'),
  meets:    db.collection('meets'),
}

// ── 1. 전체 athlete_id 수집 ───────────────────────────────
const allAthletes = await col.athletes.find({}).toArray()
console.log(`\n총 선수 수: ${allAthletes.length}`)

// ── 2. athlete_id 타입 이상 탐지 ─────────────────────────
const typeWrong = allAthletes.filter(a => typeof a.athlete_id !== 'number')
if (typeWrong.length) {
  console.log(`\n⚠️  athlete_id가 number가 아닌 선수 ${typeWrong.length}건:`)
  typeWrong.forEach(a => console.log(`  _id=${a._id}  athlete_id=${JSON.stringify(a.athlete_id)}  name=${a.name}`))

  console.log('\n→ 자동 수정 중...')
  for (const a of typeWrong) {
    const numId = parseInt(a.athlete_id)
    if (isNaN(numId)) { console.log(`  SKIP (NaN): ${a.athlete_id}`); continue }
    await col.athletes.updateOne({ _id: a._id }, { $set: { athlete_id: numId } })
    console.log(`  수정: "${a.athlete_id}" → ${numId}  (${a.name})`)
  }
} else {
  console.log('\n✅ 모든 athlete_id 타입 정상 (number)')
}

// ── 3. 이미지 athlete_id 타입 이상 탐지 ─────────────────
const imgTypeWrong = await col.images.find({ athlete_id: { $type: 'string' } }).toArray()
if (imgTypeWrong.length) {
  console.log(`\n⚠️  images.athlete_id가 string인 문서 ${imgTypeWrong.length}건`)
  for (const img of imgTypeWrong) {
    const numId = parseInt(img.athlete_id)
    if (isNaN(numId)) continue
    await col.images.updateOne({ _id: img._id }, { $set: { athlete_id: numId } })
  }
  console.log(`  → 모두 수정 완료`)
} else {
  console.log('✅ 이미지 athlete_id 타입 정상')
}

// ── 4. 각 athlete_id 상세 검증 ───────────────────────────
console.log('\n─── 선수별 상세 검증 ───')
let ok = 0, fail = 0
const failList = []

for (const a of allAthletes) {
  const athleteId = typeof a.athlete_id === 'number' ? a.athlete_id : parseInt(a.athlete_id)
  try {
    const imgDocs = await col.images
      .find({ athlete_id: athleteId, consent_date: { $exists: true } })
      .toArray()

    const meetIds = [...new Set(imgDocs.map(i => i.meet_id))]
    const meetDocs = meetIds.length
      ? await col.meets.find({ meet_id: { $in: meetIds } }).toArray()
      : []
    const meetsMap = Object.fromEntries(meetDocs.map(m => [m.meet_id, m]))

    // meets 정렬 시뮬레이션 (수정된 코드 기준)
    const meetsSorted = meetIds
      .map(id => meetsMap[id])
      .filter(Boolean)
      .map(m => ({ meet_id: m.meet_id, date: m.date }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    ok++
    if (ok <= 5 || a.athlete_id % 100 === 0) {
      process.stdout.write(`  ✅ ${a.athlete_id} ${a.name} — 이미지 ${imgDocs.length}장, 대회 ${meetsSorted.length}건\n`)
    }
  } catch (e) {
    fail++
    failList.push({ athlete_id: athleteId, name: a.name, error: e.message })
    console.log(`  ❌ ${athleteId} ${a.name} — ${e.message}`)
  }
}

// ── 5. 결과 요약 ─────────────────────────────────────────
console.log(`\n═══════════════════════════════`)
console.log(`✅ 정상: ${ok}건  ❌ 오류: ${fail}건`)
if (failList.length) {
  console.log('\n실패 목록:')
  failList.forEach(f => console.log(`  athlete_id=${f.athlete_id}  ${f.name}  → ${f.error}`))
}

// ── 6. 중복 athlete_id 탐지 ─────────────────────────────
const idCounts = {}
allAthletes.forEach(a => {
  const k = String(a.athlete_id)
  idCounts[k] = (idCounts[k] ?? 0) + 1
})
const dups = Object.entries(idCounts).filter(([, c]) => c > 1)
if (dups.length) {
  console.log(`\n⚠️  중복 athlete_id: ${dups.map(([k, c]) => `${k}(${c}건)`).join(', ')}`)
} else {
  console.log('\n✅ 중복 athlete_id 없음')
}

await client.close()
console.log('\n완료.')
