// GET /uploads/[...path] — data/uploads/ 디렉터리의 업로드 파일 서빙
import { createReadStream, existsSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'

const MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.pdf':  'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls':  'application/vnd.ms-excel',
  '.hwp':  'application/x-hwp',
  '.hwpx': 'application/x-hwpx',
}

export default defineEventHandler((event) => {
  const paramPath = (event.context.params as any)?.path ?? ''
  // path traversal 방지: normalize 후 절대 경로 이탈 차단
  const safe = normalize(paramPath).replace(/^(\.\.(\/|\\|$))+/, '')
  const base     = useRuntimeConfig().uploadDir || join(process.cwd(), 'data', 'uploads')
  const filePath = join(base, safe)

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const ext      = extname(filePath).toLowerCase()
  const mimeType = MIME[ext] ?? 'application/octet-stream'

  setHeader(event, 'Content-Type', mimeType)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(filePath))
})
