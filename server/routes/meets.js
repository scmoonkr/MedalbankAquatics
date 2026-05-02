import { meets } from '../models/Meet.js'
import { images } from '../models/Image.js'

export default function (app) {
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
