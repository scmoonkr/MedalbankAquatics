import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { getDB } from '../db.js'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function getSecret() {
  return process.env.CONSENT_TOKEN_SECRET ?? 'medalbank-consent-secret-change-me'
}

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig  = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verifyToken(token) {
  const dot = token.lastIndexOf('.')
  if (dot < 0) return null
  const data = token.slice(0, dot)
  const sig  = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) return null
  } catch {
    return null
  }
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
  if (Date.now() > payload.exp) return null
  return payload
}

function makeTransport() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

function buildEmailHtml({ name, images, verifyUrl, siteUrl }) {
  const cols = 3
  const rows = []
  for (let i = 0; i < images.length; i += cols) {
    const cells = images.slice(i, i + cols).map(img => {
      const cloudBase = process.env.CLOUD_PUBLIC_URL ?? ''
      const thumb = img.urls.thumb ?? ''
      const thumbUrl = thumb.startsWith('http') ? thumb : `${cloudBase}/${thumb}`
      return `<td width="33%" style="padding:3px;">
        <img src="${thumbUrl}" width="176" alt="#${img.image_id}"
          style="display:block;width:176px;height:118px;object-fit:cover;border:0;"/>
      </td>`
    })
    while (cells.length < cols) cells.push('<td width="33%" style="padding:3px;"></td>')
    rows.push(`<tr>${cells.join('')}</tr>`)
  }
  const imgGrid = `<table width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>`

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0b0b0b;color:#e8e8e8;font-family:'Nanum Myeongjo',Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;padding:0 20px;">
  <tr><td>
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#555;margin:0 0 32px;">Medalbank Aquatics · 공개 동의 인증</p>
    <h1 style="font-size:28px;font-weight:400;line-height:1.2;margin:0 0 24px;letter-spacing:-.01em;">${name}님,<br/>인증 링크를 확인해주세요.</h1>
    <p style="font-size:15px;line-height:1.7;color:#aaa;margin:0 0 32px;">
      아래 버튼을 클릭하시면 선택하신 <strong style="color:#e8e8e8;">${images.length}장</strong>의 사진 공개에 동의가 완료됩니다.
    </p>
    <div style="margin:0 0 36px;">
      <a href="${verifyUrl}" style="display:inline-block;padding:16px 40px;background:#38b6ff;color:#000;font-family:sans-serif;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">동의 완료하기 →</a>
    </div>
    <div style="border-top:1px solid #222;padding-top:24px;margin-bottom:32px;">
      <p style="font-size:12px;color:#666;margin:0 0 14px;letter-spacing:.06em;text-transform:uppercase;">선택하신 사진 (${images.length}장)</p>
      ${imgGrid}
    </div>
    <p style="font-size:12px;color:#555;line-height:1.6;margin:0 0 8px;">링크가 작동하지 않으면 아래 주소를 브라우저에 붙여넣으세요:</p>
    <p style="font-size:11px;color:#444;word-break:break-all;margin:0 0 36px;">${verifyUrl}</p>
    <p style="font-size:11px;color:#444;line-height:1.6;border-top:1px solid #1a1a1a;padding-top:20px;margin:0;">
      본인이 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다. 인증 링크는 <strong style="color:#666;">24시간</strong> 동안 유효합니다.
    </p>
  </td></tr>
</table>
</body>
</html>`
}

export default function (app) {
  // POST /api/consent — DB 저장 없이 HMAC 서명 토큰을 이메일로 발송
  app.post('/api/consent', async (req, res) => {
    try {
      const { name, email, minor = false, image_ids = [], consents: consentItems = {} } = req.body

      if (!name || !email || !image_ids.length) {
        return res.status(400).json({ error: '이름, 이메일, 사진 목록은 필수입니다.' })
      }

      const token   = signToken({ name, email, minor, image_ids, consents: consentItems, exp: Date.now() + TOKEN_TTL_MS })
      const siteUrl = process.env.SITE_URL ?? 'http://localhost:6631'
      const verifyUrl = `${siteUrl}/verify?token=${token}`

      const imageDocs = await getDB().collection('images')
        .find({ image_id: { $in: image_ids } }, { projection: { _id: 0, image_id: 1, 'urls.thumb': 1 } })
        .toArray()

      const transport = makeTransport()
      await transport.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      email,
        subject: `[메달뱅크 아쿠아틱스] ${name}님, 공개 동의 인증을 완료해주세요`,
        html:    buildEmailHtml({ name, images: imageDocs, verifyUrl, siteUrl }),
      })

      res.json({ ok: true })
    } catch (e) {
      console.error('consent error:', e)
      res.status(500).json({ error: e.message })
    }
  })

  // GET /api/consent/verify/:token — 인증 링크 클릭 시 처리
  app.get('/api/consent/verify/:token', async (req, res) => {
    try {
      const { token } = req.params

      const payload = verifyToken(token)
      if (!payload) return res.status(400).json({ error: '유효하지 않거나 만료된 링크입니다.' })

      const { name, email, minor, image_ids, consents: consentItems } = payload

      // 중복 처리 방지 — 토큰 해시로 이미 처리된 요청 확인
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      const logCol    = getDB().collection('consent_log')
      const existing  = await logCol.findOne({ token_hash: tokenHash })
      if (existing) {
        return res.json({ ok: true, already: true, name, athlete_id: existing.athlete_id })
      }

      const now        = new Date()
      const athleteCol = getDB().collection('athletes')

      // athlete 없으면 이 시점에 신규 생성
      let athleteDoc = await athleteCol.findOne({ email })
      if (!athleteDoc) {
        const maxDoc = await athleteCol.find({}, { projection: { athlete_id: 1 } })
          .sort({ athlete_id: -1 }).limit(1).next()
        const athleteId = (maxDoc?.athlete_id ?? 1000) + 1
        await athleteCol.insertOne({ athlete_id: athleteId, name, email, lang: 'ko', created_at: now })
        athleteDoc = { athlete_id: athleteId }
      }

      const athleteId = athleteDoc.athlete_id

      // athletes — consent_date, first_date 업데이트
      const setFields = { consent_date: now }
      if (!athleteDoc.first_date) setFields.first_date = now
      await athleteCol.updateOne({ athlete_id: athleteId }, { $set: setFields })

      // images — athlete_id, consent_date 업데이트
      const imgIds = Array.isArray(image_ids) ? image_ids.map(Number).filter(Boolean) : []
      let modifiedCount = 0
      if (imgIds.length > 0) {
        const updateResult = await getDB().collection('images').updateMany(
          { image_id: { $in: imgIds } },
          { $set: { athlete_id: athleteId, consent_date: now } }
        )
        modifiedCount = updateResult.modifiedCount
        console.log(`[consent verify] image_ids=${JSON.stringify(imgIds)} modified=${modifiedCount}`)
      } else {
        console.warn('[consent verify] image_ids is empty')
      }

      // 처리 완료 로그 기록 (중복 방지용)
      await logCol.insertOne({
        token_hash:  tokenHash,
        athlete_id:  athleteId,
        name,
        email,
        minor,
        image_ids:   imgIds,
        consents:    consentItems,
        verified_at: now,
        modified_count: modifiedCount,
      })

      res.json({ ok: true, name, image_ids: imgIds, athlete_id: athleteId, modified_count: modifiedCount })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
