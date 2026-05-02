import { athletes } from '../models/Athlete.js'
import { images } from '../models/Image.js'

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
}
