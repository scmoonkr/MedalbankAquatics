import { athletes } from '../models/Athlete.js'
import { images } from '../models/Image.js'
import { getDB } from '../db.js'

const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

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
        images().find({ athlete_id: athleteId, consent_date: { $exists: true } })
          .sort({ date: -1, image_id: 1 }).toArray(),
      ])

      if (!athlete) return res.status(404).json({ error: '선수를 찾을 수 없습니다.' })

      const meetIds = [...new Set(imgDocs.map(i => i.meet_id))]
      const meetDocs = await getDB().collection('meets')
        .find({ meet_id: { $in: meetIds } }).toArray()
      const meetsMap = Object.fromEntries(meetDocs.map(m => [m.meet_id, m]))

      const dates = imgDocs.map(i => i.date).filter(Boolean).sort()

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
        })).sort((a, b) => b.date.localeCompare(a.date)),
        images: imgDocs.map(i => ({
          image_id: i.image_id,
          meet_id:  i.meet_id,
          date:     i.date,
          urls:     i.urls,
        })),
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
