// POST /api/pdf — 클라이언트 HTML을 Puppeteer로 렌더링해 임시 PDF로 저장하고 토큰을 반환.
// 새 탭은 GET /api/pdf?token=...&name=... 로 이 PDF를 받아 한글 파일명으로 보여준다.
// (인쇄 대화상자 없이 새 탭에서 PDF를 바로 표시하기 위함)
import type { Browser } from 'puppeteer'
import { writeFile, mkdir, readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

// 요청마다 브라우저를 띄우면 느리므로 프로세스당 하나만 재사용
let browserPromise: Promise<Browser> | null = null
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const puppeteer = await import('puppeteer')
    browserPromise = puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    browserPromise.then(b => b.on('disconnected', () => { browserPromise = null }))
      .catch(() => { browserPromise = null })
  }
  return browserPromise
}

// SSRF 방지: 동일 출처 / 구글 폰트 / data: 만 허용
const ALLOWED_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com'])

// 10분 지난 임시 PDF 정리 (best-effort)
async function cleanupOld(dir: string) {
  try {
    const now = Date.now()
    for (const f of await readdir(dir)) {
      if (!f.endsWith('.pdf')) continue
      const p = join(dir, f)
      const s = await stat(p).catch(() => null)
      if (s && now - s.mtimeMs > 10 * 60_000) await unlink(p).catch(() => {})
    }
  } catch { /* ignore */ }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ html?: string }>(event)
  const html = body?.html
  if (!html || typeof html !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'html이 없습니다.' })
  }
  if (html.length > 8_000_000) {
    throw createError({ statusCode: 413, statusMessage: 'HTML이 너무 큽니다.' })
  }

  const origin  = getRequestURL(event).origin
  const browser = await getBrowser()
  const page    = await browser.newPage()
  let pdf: Buffer
  try {
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      const url = req.url()
      if (url.startsWith('data:') || url.startsWith('about:')) return req.continue()
      try {
        const u = new URL(url)
        if (u.origin === origin || ALLOWED_HOSTS.has(u.hostname)) return req.continue()
      } catch { /* fall through */ }
      return req.abort()
    })

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30_000 })
    pdf = Buffer.from(await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    }))
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `PDF 생성 실패: ${err?.message ?? err}` })
  } finally {
    await page.close().catch(() => {})
  }

  const dir   = pdfTmpDir(event)
  const token = randomUUID()
  await mkdir(dir, { recursive: true })
  cleanupOld(dir)
  await writeFile(join(dir, `${token}.pdf`), pdf)

  return { token }
})
