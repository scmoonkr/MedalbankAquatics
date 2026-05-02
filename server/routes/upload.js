import multer from 'multer'
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { images } from '../models/Image.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

let _s3, _bucket, _region

function getS3() {
  if (!_s3) {
    const endpoint = process.env.idrivee2_endpoint
    _region  = endpoint?.split('.')[1] ?? 'ap-northeast-1'
    _bucket  = process.env.idrivee2_bucket
    const keyId  = process.env['idrivee2-access_key_id']
    const secret = process.env['idrivee2-access_key']
    _s3 = new S3Client({
      endpoint: `https://${endpoint}`,
      region: _region,
      credentials: { accessKeyId: keyId, secretAccessKey: secret },
      forcePathStyle: false,
    })
  }
  return { s3: _s3, bucket: _bucket, region: _region }
}

function publicUrl(key, region, bucket) {
  return `https://${bucket}.s3.${region}.idrivee2.com/${key}`
}

async function s3Upload(buffer, key) {
  const { s3, bucket, region } = getS3()
  await s3.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: buffer,
    ContentType: 'image/jpeg', ACL: 'public-read',
  }))
  return publicUrl(key, region, bucket)
}

async function resizeLongest(buf, px) {
  return sharp(buf).resize(px, px, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()
}

async function resizeGrayscale(buf, px) {
  return sharp(buf).resize(px, px, { fit: 'inside', withoutEnlargement: true }).grayscale().jpeg({ quality: 80 }).toBuffer()
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

        const [thumbBuf, previewBuf, fullBuf] = await Promise.all([
          resizeLongest(buf, 400),
          resizeGrayscale(buf, 320),
          resizeLongest(buf, 1600),
        ])

        const [thumbUrl, previewUrl, fullUrl, xlUrl] = await Promise.all([
          s3Upload(thumbBuf,   `images/thumbs/${id}.jpg`),
          s3Upload(previewBuf, `images/previews/${id}.jpg`),
          s3Upload(fullBuf,    `images/full/${id}.jpg`),
          s3Upload(buf,        `images/xl/${id}.jpg`),
        ])

        await images().insertOne({
          image_id:   imageId,
          athlete_id: 0,
          meet_id,
          date,
          urls: { thumb: thumbUrl, preview: previewUrl, full: fullUrl, xl: xlUrl },
          tags: [],
          created_at: new Date(),
        })

        results.push({ image_id: imageId, urls: { thumb: thumbUrl, preview: previewUrl, full: fullUrl, xl: xlUrl } })
      }

      res.json({ ok: true, count: results.length, results })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: e.message })
    }
  })
}
