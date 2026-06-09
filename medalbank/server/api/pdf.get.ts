// GET /api/pdf?token=...&name=... — POST /api/pdf 가 만든 임시 PDF를 한글 파일명으로 반환.
// 새 탭이 이 URL로 이동하면 브라우저 PDF 뷰어가 표시하고, 저장 시 name 파일명을 사용한다.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const q     = getQuery(event)
  const token = String(q.token || '')
  const name  = (String(q.name || 'medalbank-results.pdf')).slice(0, 200)

  if (!/^[a-f0-9-]{8,64}$/i.test(token)) {
    throw createError({ statusCode: 400, statusMessage: '잘못된 요청입니다.' })
  }

  const file = join(pdfTmpDir(event), `${token}.pdf`)
  let buf: Buffer
  try {
    buf = await readFile(file)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'PDF를 찾을 수 없습니다. 다시 시도해 주세요.' })
  }

  // RFC 5987: 한글은 filename*= 로, ASCII 폴백은 filename= 로
  const asciiName = (name.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '') || 'medalbank-results.pdf')
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition',
    `inline; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`)
  setHeader(event, 'Cache-Control', 'no-store')
  return buf
})
