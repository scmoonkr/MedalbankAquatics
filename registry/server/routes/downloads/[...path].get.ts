import { createReadStream, existsSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'

const MIME: Record<string, string> = {
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls':  'application/vnd.ms-excel',
  '.pdf':  'application/pdf',
  '.zip':  'application/zip',
  '.csv':  'text/csv',
}

export default defineEventHandler((event) => {
  const paramPath = (event.context.params as any)?.path ?? ''
  const safe = normalize(paramPath).replace(/^(\.\.(\/|\\|$))+/, '')
  const config = useRuntimeConfig(event)
  const base = config.downloadDir || join(process.cwd(), 'public', 'downloads')
  const filePath = join(base, safe)

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const ext      = extname(filePath).toLowerCase()
  const mimeType = MIME[ext] ?? 'application/octet-stream'
  const fileName = safe.split('/').pop() ?? safe

  setHeader(event, 'Content-Type', mimeType)
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return sendStream(event, createReadStream(filePath))
})
