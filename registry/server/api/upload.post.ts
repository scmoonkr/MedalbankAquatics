// POST /api/upload — 증빙자료 파일 업로드
import { readMultipartFormData } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

const ALLOWED_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',          // 전광판 이미지
  '.pdf', '.xlsx', '.xls', '.hwp', '.hwpx',          // 기록지
])
const MAX_BYTES = 20 * 1024 * 1024  // 20 MB

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
    throw createError({ statusCode: 400, statusMessage: '허용되지 않는 파일 형식입니다.' })
  }
  if (part.data.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: '파일 크기는 20MB 이하여야 합니다.' })
  }

  const filename  = `${randomUUID()}${ext}`
  const base      = useRuntimeConfig(event).uploadDir || join(process.cwd(), 'data', 'uploads')
  const uploadDir = join(base, 'errata')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), part.data)

  return { url: `/uploads/errata/${filename}`, originalName: part.filename }
})
