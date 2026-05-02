import { getDB } from '../db.js'

function requests() { return getDB().collection('request') }

function maskName(name) {
  if (!name) return '○○○'
  return name[0] + '○'.repeat(Math.max(1, name.length - 1))
}

function maskTeam(team) {
  if (!team || team.length <= 2) return team || ''
  return '○○' + team.slice(2)
}

export default function (app) {
  app.get('/api/admin/requests', async (req, res) => {
    try {
      const docs = await requests()
        .find({}, { projection: { _id: 0 } })
        .sort({ created_at: -1 })
        .toArray()
      res.json(docs)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.put('/api/admin/requests/:id', async (req, res) => {
    try {
      const request_id = parseInt(req.params.id)
      const { status, name, team, email, meet, date, message } = req.body
      await requests().updateOne(
        { request_id },
        { $set: { status, name, team, email, meet, date, message } }
      )
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.delete('/api/admin/requests/:id', async (req, res) => {
    try {
      const request_id = parseInt(req.params.id)
      await requests().deleteOne({ request_id })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/requests', async (req, res) => {
    try {
      const docs = await requests()
        .find({}, { projection: { _id: 0, request_id: 1, status: 1, name: 1, team: 1, meet: 1, date: 1, message: 1, created_at: 1 } })
        .sort({ created_at: -1 })
        .toArray()

      res.json(docs.map(d => ({
        ...d,
        name: maskName(d.name),
        team: maskTeam(d.team),
      })))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/requests', async (req, res) => {
    try {
      const { name, team, email, meet, date, message } = req.body
      if (!name || !message) return res.status(400).json({ error: '이름과 내용은 필수입니다.' })

      const maxDoc = await requests().find({}).sort({ request_id: -1 }).limit(1).next()
      const request_id = (maxDoc?.request_id ?? 0) + 1

      await requests().insertOne({
        request_id,
        status: 'review',
        name,
        team:    team    || '',
        email:   email   || '',
        meet:    meet    || '',
        date:    date    || '',
        message,
        created_at: new Date(),
      })

      res.json({ ok: true, request_id })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
