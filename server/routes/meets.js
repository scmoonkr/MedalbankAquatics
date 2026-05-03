import { meets } from '../models/Meet.js'
import { images } from '../models/Image.js'

export default function (app) {
  app.get('/api/admin/meets', async (req, res) => {
    try {
      const docs = await meets()
        .find({}, { projection: { _id: 0 } })
        .sort({ date: -1 })
        .toArray()
      res.json(docs)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/admin/meets', async (req, res) => {
    try {
      const { label, short, date, location, competition_id } = req.body
      const last = await meets().find({}).sort({ meet_id: -1 }).limit(1).toArray()
      const meet_id = (last[0]?.meet_id ?? 0) + 1
      await meets().insertOne({
        meet_id,
        label: label || '',
        short: short || '',
        date: date ? new Date(date) : null,
        location: location || '',
        competition_id: competition_id || '',
      })
      res.json({ ok: true, meet_id })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.put('/api/admin/meets/:id', async (req, res) => {
    try {
      const meet_id = parseInt(req.params.id)
      const { label, short, date, location, competition_id } = req.body
      await meets().updateOne(
        { meet_id },
        { $set: { label, short: short || '', date: date ? new Date(date) : null, location: location || '', competition_id: competition_id || '' } }
      )
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.delete('/api/admin/meets/:id', async (req, res) => {
    try {
      const meet_id = parseInt(req.params.id)
      await meets().deleteOne({ meet_id })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/meets', async (req, res) => {
    try {
      const [meetList, counts] = await Promise.all([
        meets().find({}).sort({ date: -1 }).toArray(),
        images().aggregate([
          { $group: { _id: '$meet_id', count: { $sum: 1 } } },
        ]).toArray(),
      ])

      const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]))
      const total = counts.reduce((s, c) => s + c.count, 0)

      res.json({
        total,
        meets: meetList.map(m => ({
          meet_id:     m.meet_id,
          label:       m.label,
          short:       m.short,
          date:        m.date,
          location:    m.location,
          photo_count: countMap[m.meet_id] ?? 0,
        })),
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
