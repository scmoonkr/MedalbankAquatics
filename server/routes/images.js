import { images } from '../models/Image.js'
import { getDB } from '../db.js'

const PER_PAGE = 50

export default function (app) {
  app.get('/api/admin/images', async (req, res) => {
    try {
      const db = getDB()
      const [docs, athletes, meets] = await Promise.all([
        images()
          .find({}, { projection: { _id: 0, image_id: 1, athlete_id: 1, meet_id: 1, date: 1, consent_date: 1, urls: 1 } })
          .sort({ image_id: -1 })
          .toArray(),
        db.collection('athletes').find({}, { projection: { _id: 0, athlete_id: 1, name: 1 } }).toArray(),
        db.collection('meets').find({}, { projection: { _id: 0, meet_id: 1, label: 1 } }).toArray(),
      ])

      const athleteMap = Object.fromEntries(athletes.map(a => [a.athlete_id, a.name]))
      const meetMap    = Object.fromEntries(meets.map(m => [m.meet_id, m.label]))

      res.json(docs.map(d => ({
        ...d,
        athlete_name: athleteMap[d.athlete_id] ?? '',
        meet_label:   meetMap[d.meet_id] ?? '',
      })))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.put('/api/admin/images/:id', async (req, res) => {
    try {
      const image_id = parseInt(req.params.id)
      const { athlete_id, meet_id, date, consent_date, urls } = req.body
      const update = { athlete_id: parseInt(athlete_id), meet_id: parseInt(meet_id), date }
      if (consent_date) update.consent_date = new Date(consent_date)
      else update.consent_date = null
      if (urls) update.urls = urls
      await images().updateOne({ image_id }, { $set: update })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.delete('/api/admin/images/:id', async (req, res) => {
    try {
      const image_id = parseInt(req.params.id)
      await images().deleteOne({ image_id })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })


  app.get('/api/gallery', async (req, res) => {
    try {
      const docs = await images()
        .find({}, { projection: { _id: 0, image_id: 1, 'urls.thumb': 1, 'urls.xl': 1 } })
        .sort({ date: -1 })
        .toArray()
      res.json(docs)
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
      res.json(docs)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/images', async (req, res) => {
    try {
      const page    = Math.max(1, parseInt(req.query.page) || 1)
      const perPage = Math.min(200, parseInt(req.query.per_page) || PER_PAGE)
      const meetId  = req.query.meet_id ? parseInt(req.query.meet_id) : null

      const consented = req.query.consented !== 'false'
      const filter = { consent_date: { $exists: consented } }
      if (meetId) filter.meet_id = meetId

      const [total, docs] = await Promise.all([
        images().countDocuments(filter),
        images()
          .find(filter)
          .sort({ date: -1, image_id: 1 })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .toArray(),
      ])

      res.json({
        images: docs.map(d => ({
          image_id: d.image_id,
          meet_id:  d.meet_id,
          date:     d.date,
          urls:     d.urls,
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
