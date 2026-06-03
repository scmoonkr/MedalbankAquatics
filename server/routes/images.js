import { images } from '../models/Image.js'
import { getDB } from '../db.js'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

let _s3, _bucket
function getS3() {
  if (!_s3) {
    _bucket = process.env.CLOUD_BUCKET
    _s3 = new S3Client({
      endpoint: process.env.CLOUD_ENDPOINT,
      region: process.env.CLOUD_REGION ?? 'auto',
      credentials: {
        accessKeyId: process.env.CLOUD_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY,
      },
      forcePathStyle: false,
    })
  }
  return { s3: _s3, bucket: _bucket }
}

const publicBase = () => process.env.CLOUD_PUBLIC_URL ?? ''

function toUrl(key) {
  if (!key) return null
  if (key.startsWith('http')) return key
  return `${publicBase()}/${key}`
}

function toKey(val) {
  if (!val) return null
  const base = process.env.CLOUD_PUBLIC_URL ?? ''
  if (base && val.startsWith(base + '/')) return val.slice(base.length + 1)
  if (base && val === base)               return ''
  if (val.startsWith('http')) {
    try { return new URL(val).pathname.replace(/^\//, '') } catch { return null }
  }
  return val
}

function stripUrls(urls) {
  if (!urls) return urls
  return {
    thumb:    toKey(urls.thumb),
    preview:  toKey(urls.preview),
    large:    toKey(urls.large),
    original: toKey(urls.original),
  }
}

function resolveUrls(urls) {
  if (!urls) return urls
  return {
    thumb:    toUrl(urls.thumb),
    preview:  toUrl(urls.preview),
    large:    toUrl(urls.large),
    original: toUrl(urls.original),
  }
}

const PER_PAGE = 50

export default function (app) {
  app.get('/api/admin/images', async (req, res) => {
    try {
      const db = getDB()
      const [docs, athletes, meets] = await Promise.all([
        images()
          .find({}, { projection: { image_id: 1, athlete_id: 1, meet_id: 1, date: 1, consent_date: 1, urls: 1, tags: 1, category: 1, filename: 1 } })
          .sort({ image_id: -1 })
          .toArray(),
        db.collection('athletes').find({}, { projection: { _id: 0, athlete_id: 1, name: 1 } }).toArray(),
        db.collection('meets').find({}, { projection: { _id: 0, meet_id: 1, label: 1, short: 1 } }).toArray(),
      ])

      const athleteMap = Object.fromEntries(athletes.map(a => [a.athlete_id, a.name]))
      const meetMap    = Object.fromEntries(meets.map(m => [m.meet_id, m]))

      res.json(docs.map(d => ({
        ...d,
        _id:          d._id.toString(),
        urls:         resolveUrls(d.urls),
        athlete_name: athleteMap[d.athlete_id] ?? '',
        meet_label:   meetMap[d.meet_id]?.label ?? '',
        meet_short:   meetMap[d.meet_id]?.short ?? '',
      })))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/admin/images/bulk-tags', async (req, res) => {
    try {
      const { image_ids, tags, action } = req.body
      if (!Array.isArray(image_ids) || !image_ids.length) return res.status(400).json({ error: 'image_ids 필요' })
      const tagList = Array.isArray(tags) ? tags : (tags ?? '').split(',').map(t => t.trim()).filter(Boolean)
      const update  = action === 'remove'
        ? { $pullAll: { tags: tagList } }
        : { $addToSet: { tags: { $each: tagList } } }
      await images().updateMany({ image_id: { $in: image_ids.map(Number) } }, update)
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.put('/api/admin/images/:id', async (req, res) => {
    try {
      const image_id = parseInt(req.params.id)
      const { athlete_id, meet_id, date, consent_date, urls, tags, category } = req.body
      const update = { athlete_id: parseInt(athlete_id), meet_id: parseInt(meet_id), date }
      if (consent_date) update.consent_date = new Date(consent_date)
      else update.consent_date = null
      if (urls) update.urls = stripUrls(urls)
      update.tags     = Array.isArray(tags)     ? tags     : (tags     ? tags.split(',').map(t => t.trim()).filter(Boolean)     : [])
      update.category = Array.isArray(category) ? category : (category ? category.split(',').map(t => t.trim()).filter(Boolean) : [])
      await images().updateOne({ image_id }, { $set: update })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.delete('/api/admin/images/:id', async (req, res) => {
    try {
      const image_id = parseInt(req.params.id)
      const doc = await images().findOne({ image_id })

      if (doc?.urls) {
        const { s3, bucket } = getS3()
        const keys = [doc.urls.thumb, doc.urls.preview, doc.urls.original, doc.urls.large]
          .map(toKey).filter(Boolean)
        await Promise.allSettled(keys.map(key =>
          s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
        ))
      }

      await images().deleteOne({ image_id })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })


  app.post('/api/admin/images/bulk-category', async (req, res) => {
    try {
      const { image_ids, category, action } = req.body
      if (!Array.isArray(image_ids) || !image_ids.length) return res.status(400).json({ error: 'image_ids 필요' })
      const catList = Array.isArray(category) ? category : (category ?? '').split(',').map(t => t.trim()).filter(Boolean)
      const update  = action === 'remove'
        ? { $pullAll: { category: catList } }
        : { $addToSet: { category: { $each: catList } } }
      await images().updateMany({ image_id: { $in: image_ids.map(Number) } }, update)
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/categories', async (req, res) => {
    try {
      const result = await images().aggregate([
        { $unwind: '$category' },
        { $group: { _id: '$category' } },
        { $sort: { _id: 1 } },
      ]).toArray()
      res.json(result.map(r => r._id))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/tags', async (req, res) => {
    try {
      const result = await images().aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $sort: { _id: 1 } },
      ]).toArray()
      res.json(result.map(r => r._id))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/gallery', async (req, res) => {
    try {
      const filter = {}
      if (req.query.meet_id !== undefined) {
        filter.meet_id = parseInt(req.query.meet_id)
      } else {
        const tag = req.query.tag ? String(req.query.tag) : '대표사진'
        filter.tags = tag
      }
      const docs = await images()
        .find(filter, { projection: { _id: 0, image_id: 1, filename: 1, 'urls.thumb': 1, 'urls.preview': 1, 'urls.large': 1, 'urls.original': 1 } })
        .sort({ date: -1 })
        .toArray()
      res.json(docs.map(d => ({ ...d, filename: d.filename ?? null, urls: resolveUrls(d.urls) })))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/images/by-ids', async (req, res) => {
    try {
      const ids = String(req.query.ids || '').split(',').map(Number).filter(Boolean)
      if (!ids.length) return res.json([])
      const docs = await images()
        .find({ image_id: { $in: ids } }, { projection: { _id: 0, image_id: 1, 'urls.preview': 1, 'urls.thumb': 1 } })
        .toArray()
      res.json(docs.map(d => ({ ...d, urls: resolveUrls(d.urls) })))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/images', async (req, res) => {
    try {
      const page    = Math.max(1, parseInt(req.query.page) || 1)
      const perPage = Math.min(200, parseInt(req.query.per_page) || PER_PAGE)
      const meetId  = req.query.meet_id ? parseInt(req.query.meet_id) : null

      const tag        = req.query.tag         ? String(req.query.tag)         : null
      const category   = req.query.category    ? String(req.query.category)    : null
      const excludeTag = req.query.exclude_tag ? String(req.query.exclude_tag) : null

      const consented = req.query.consented !== 'false'
      const filter = { consent_date: { $exists: consented } }
      if (meetId)     filter.meet_id  = meetId
      else            filter.meet_id  = { $gt: 0 }  // 명예의전당(meet_id:0) 제외
      if (tag)        filter.tags     = tag
      if (category)   filter.category = category
      if (excludeTag) filter.tags     = { ...(filter.tags ?? {}), $ne: excludeTag }

      const [total, docs] = await Promise.all([
        images().countDocuments(filter),
        images()
          .find(filter)
          .sort({ created_at: -1, image_id: 1 })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .toArray(),
      ])

      res.json({
        images: docs.map(d => ({
          image_id: d.image_id,
          meet_id:  d.meet_id,
          date:     d.date,
          filename: d.filename ?? null,
          urls:     resolveUrls(d.urls),
        })),
        total,
        page,
        per_page: perPage,
        pages: Math.ceil(total / perPage),
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
