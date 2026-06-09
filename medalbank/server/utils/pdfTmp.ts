import { join } from 'node:path'

// POST /api/pdf 가 임시 PDF를 저장하고 GET /api/pdf 가 읽어가는 디렉토리
export function pdfTmpDir(event: any): string {
  const base = useRuntimeConfig(event).uploadDir || join(process.cwd(), 'data', 'uploads')
  return join(base, 'pdftmp')
}
