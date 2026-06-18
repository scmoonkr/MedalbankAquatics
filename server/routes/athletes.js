import { athletes } from '../models/Athlete.js'
import { images } from '../models/Image.js'
import { getDB } from '../db.js'

const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

const toUrl = (key) => {
  if (!key) return null
  if (key.startsWith('http')) return key
  return `${process.env.CLOUD_PUBLIC_URL ?? ''}/${key}`
}

const resolveUrls = (urls) => {
  if (!urls) return urls
  return {
    thumb:    toUrl(urls.thumb),
    preview:  toUrl(urls.preview),
    large:    toUrl(urls.large),
    original: toUrl(urls.original),
  }
}

function getGroup(name) {
  const first = name?.[0]
  if (!first) return '?'
  const code = first.charCodeAt(0)
  if (code >= 0xAC00 && code <= 0xD7A3)
    return CHOSEONG[Math.floor((code - 0xAC00) / 28 / 21)]
  if (/[A-Za-z]/.test(first)) return first.toUpperCase()
  return first
}

export default function (app) {
  app.get('/api/admin/athletes', async (req, res) => {
    try {
      const docs = await athletes()
        .find({}, { projection: { _id: 0, athlete_id: 1, name: 1, email: 1, consent_date: 1, lang: 1 } })
        .sort({ athlete_id: 1 })
        .toArray()
      res.json(docs)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/admin/athletes', async (req, res) => {
    try {
      const { name, email, consent_date, lang } = req.body
      const last = await athletes().find({}).sort({ athlete_id: -1 }).limit(1).toArray()
      const athlete_id = (last[0]?.athlete_id ?? 0) + 1
      const doc = { athlete_id, name: name || '', email: email || '', lang: lang || '', consent_date: consent_date ? new Date(consent_date) : null }
      await athletes().insertOne(doc)
      res.json({ ok: true, athlete_id })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.put('/api/admin/athletes/:id', async (req, res) => {
    try {
      const athlete_id = parseInt(req.params.id)
      const { name, email, consent_date, lang } = req.body
      const update = { name, email: email || '', lang: lang || '' }
      if (consent_date) update.consent_date = new Date(consent_date)
      else update.consent_date = null
      await athletes().updateOne({ athlete_id }, { $set: update })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.delete('/api/admin/athletes/:id', async (req, res) => {
    try {
      const athlete_id = parseInt(req.params.id)
      await athletes().deleteOne({ athlete_id })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/athletes', async (req, res) => {
    try {
      const [athleteList, stats] = await Promise.all([
        athletes().find({}).sort({ name: 1 }).toArray(),
        images().aggregate([
          { $group: { _id: '$athlete_id', photo_count: { $sum: 1 }, last_date: { $max: '$date' } } },
        ]).toArray(),
      ])

      const statsMap = Object.fromEntries(stats.map(s => [s._id, s]))

      res.json(athleteList.map(a => ({
        athlete_id:  a.athlete_id,
        name:        a.name,
        lang:        a.lang,
        group:       getGroup(a.name),
        photo_count: statsMap[a.athlete_id]?.photo_count ?? 0,
        last_date:   statsMap[a.athlete_id]?.last_date   ?? null,
      })))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/athletes/:id', async (req, res) => {
    try {
      const athleteId = parseInt(req.params.id)
      if (isNaN(athleteId)) return res.status(400).json({ error: '유효하지 않은 ID' })

      const [athlete, imgDocs] = await Promise.all([
        athletes().findOne({ athlete_id: athleteId }),
        images().find({ athlete_id: athleteId, consent_date: { $ne: null } })
          .sort({ date: -1, image_id: 1 }).toArray(),
      ])

      if (!athlete) return res.status(404).json({ error: '선수를 찾을 수 없습니다.' })

      const meetIds = [...new Set(imgDocs.map(i => i.meet_id))]
      const meetDocs = await getDB().collection('meets')
        .find({ meet_id: { $in: meetIds } }).toArray()
      const meetsMap = Object.fromEntries(meetDocs.map(m => [m.meet_id, m]))

      const dates = imgDocs.map(i => i.date).filter(Boolean).sort((a, b) => new Date(a) - new Date(b))

      res.json({
        athlete_id:   athlete.athlete_id,
        name:         athlete.name,
        consent_date: athlete.consent_date ?? null,
        first_date:   dates[0] ?? null,
        last_date:    dates[dates.length - 1] ?? null,
        photo_count:  imgDocs.length,
        meets: meetIds.map(id => meetsMap[id]).filter(Boolean).map(m => ({
          meet_id: m.meet_id,
          label:   m.label,
          short:   m.short,
          date:    m.date,
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        images: imgDocs.map(i => ({
          image_id: i.image_id,
          meet_id:  i.meet_id,
          date:     i.date,
          urls:     resolveUrls(i.urls),
        })),
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
