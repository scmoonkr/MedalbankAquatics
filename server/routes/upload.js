import multer from 'multer'
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { images } from '../models/Image.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

let _s3, _bucket, _publicBase

function getS3() {
  if (!_s3) {
    _bucket     = process.env.R2_BUCKET
    _publicBase = process.env.R2_PUBLIC_URL
    _s3 = new S3Client({
      endpoint: process.env.R2_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: false,
    })
  }
  return { s3: _s3, bucket: _bucket }
}

function publicUrl(key) {
  return `${_publicBase}/${key}`
}

async function s3Upload(buffer, key) {
  const { s3, bucket } = getS3()
  await s3.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: buffer,
    ContentType: 'image/jpeg',
  }))
  return publicUrl(key)
}

async function resizeWidth(buf, width) {
  return sharp(buf).resize(width, null, { withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()
}

async function resizeWidthGrayscale(buf, width) {
  return sharp(buf).resize(width, null, { withoutEnlargement: true }).grayscale().jpeg({ quality: 80 }).toBuffer()
}

async function nextImageId() {
  const max = await images().find({}).sort({ image_id: -1 }).limit(1).next()
  return (max?.image_id ?? 0) + 1
}

export default function (app) {
  app.post('/api/admin/upload-images', upload.array('files'), async (req, res) => {
    try {
      const meet_id = parseInt(req.body.meet_id)
      const date    = req.body.date ? new Date(req.body.date) : null
      const files   = req.files

      if (!files?.length) return res.status(400).json({ error: '파일이 없습니다.' })

      const results = []

      for (const file of files) {
        const buf     = file.buffer
        const imageId = await nextImageId()
        const id      = String(imageId)

        const [thumbBuf, previewBuf, largeBuf] = await Promise.all([
          resizeWidth(buf, 400),
          resizeWidthGrayscale(buf, 320),
          resizeWidth(buf, 1600),
        ])

        const prefix = `meet-${meet_id}`
        const [thumbUrl, previewUrl, largeUrl, originalUrl] = await Promise.all([
          s3Upload(thumbBuf,   `${prefix}/thumbs/${id}.jpg`),
          s3Upload(previewBuf, `${prefix}/previews/${id}.jpg`),
          s3Upload(largeBuf,   `${prefix}/large/${id}.jpg`),
          s3Upload(buf,        `${prefix}/original/${id}.jpg`),
        ])

        await images().insertOne({
          image_id:   imageId,
          athlete_id: 0,
          meet_id,
          date,
          urls: { thumb: thumbUrl, preview: previewUrl, large: largeUrl, original: originalUrl },
          tags: [],
          created_at: new Date(),
        })

        results.push({ image_id: imageId, urls: { thumb: thumbUrl, preview: previewUrl, large: largeUrl, original: originalUrl } })
      }

      res.json({ ok: true, count: results.length, results })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: e.message })
    }
  })
}
