import { images } from '../models/Image.js'

const PER_PAGE = 50

export default function (app) {
  app.get('/api/images', async (req, res) => {
    try {
      const page    = Math.max(1, parseInt(req.query.page) || 1)
      const perPage = Math.min(200, parseInt(req.query.per_page) || PER_PAGE)
      const meetId  = req.query.meet_id ? parseInt(req.query.meet_id) : null

      const filter = meetId ? { meet_id: meetId } : {}

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
