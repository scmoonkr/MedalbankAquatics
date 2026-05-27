// POST /api/upload-sheet — 기록지 파일 업로드 + errata 저장
import { readMultipartFormData } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

const ALLOWED_EXT = new Set(['.xlsx', '.xls', '.pdf'])
const MAX_BYTES   = 30 * 1024 * 1024  // 30 MB

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const parts = await readMultipartFormData(event)
  const part  = parts?.find(p => p.name === 'file')
  if (!part?.filename) {
    throw createError({ statusCode: 400, statusMessage: '파일이 없습니다.' })
  }

  const ext = extname(part.filename).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) {
    throw createError({ statusCode: 400, statusMessage: '허용되지 않는 파일 형식입니다. (.xlsx, .pdf)' })
  }
  if (part.data.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: '파일 크기는 30MB 이하여야 합니다.' })
  }

  // ── 파일 저장 ──────────────────────────────────────────────
  const filename  = `${randomUUID()}${ext}`
  const base      = useRuntimeConfig().uploadDir || join(process.cwd(), 'data', 'uploads')
  const uploadDir = join(base, 'sheets')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), part.data)

  const filePath = `uploads/sheets/${filename}`

  // ── errata 저장 ────────────────────────────────────────────
  const db  = await getDb()
  const now = new Date()

  const count = await db.collection('errata').countDocuments()
  const no    = count + 1

  await db.collection('errata').insertOne({
    no,
    category:     '기록지업로드',
    reporter:     session.user.name  || '',
    submittedBy:  session.user.email || session.user.id || '',
    report_date:  now.toISOString().slice(0, 10),
    submittedAt:  now,
    status:       'pending',
    file: {
      path:         filePath,
      originalName: part.filename,
    },
  })

  return { ok: true, no }
})
