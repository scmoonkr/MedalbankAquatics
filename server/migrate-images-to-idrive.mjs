import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') })

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '../nuxt/public')

const BUCKET = process.env.idrivee2_bucket
const REGION = process.env['idrivee2-region_code']
const ENDPOINT = `https://${process.env.idrivee2_endpoint}`

const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: process.env['idrivee2-access_key_id'],
    secretAccessKey: process.env['idrivee2-access_key'],
  },
  forcePathStyle: false,
})

const MONGO_URL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PWD}@${process.env.MONGODB_ADDR}/${process.env.MONGO_DBNAME}?authSource=admin`

function urlToFilePath(url) {
  return join(PUBLIC_DIR, url)
}

function urlToS3Key(url) {
  return url.startsWith('/') ? url.slice(1) : url
}

function toPublicUrl(key) {
  return `https://${BUCKET}.s3.${REGION}.idrivee2.com/${key}`
}

async function uploadFile(url) {
  const filePath = urlToFilePath(url)
  const key = urlToS3Key(url)
  const body = await readFile(filePath)
  const contentType = url.endsWith('.png') ? 'image/png' : 'image/jpeg'

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
  }))

  return toPublicUrl(key)
}

async function main() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  const db = client.db(process.env.MONGO_DBNAME)
  const images = db.collection('images')

  const docs = await images.find({}).toArray()
  console.log(`총 ${docs.length}개 이미지 처리 시작\n`)

  let ok = 0, fail = 0

  for (const doc of docs) {
    try {
      const { thumb, preview, xl, full } = doc.urls

      const [thumbUrl, previewUrl, xlUrl, fullUrl] = await Promise.all([
        uploadFile(thumb),
        uploadFile(preview),
        uploadFile(xl),
        uploadFile(full),
      ])

      await images.updateOne(
        { _id: doc._id },
        { $rename: { urls: 'urls-backup' } }
      )
      await images.updateOne(
        { _id: doc._id },
        { $set: { urls: { thumb: thumbUrl, preview: previewUrl, xl: xlUrl, full: fullUrl } } }
      )

      console.log(`✓ image_id: ${doc.image_id}`)
      ok++
    } catch (e) {
      console.error(`✗ image_id: ${doc.image_id} — ${e.message}`)
      fail++
    }
  }

  console.log(`\n완료: 성공 ${ok}개, 실패 ${fail}개`)
  await client.close()
}

main().catch(console.error)
