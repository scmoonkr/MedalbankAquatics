// GET /racingcaps — serve static HTML without redirect
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  return readFileSync(join(process.cwd(), 'public/racingcaps/index.html'), 'utf-8')
})
