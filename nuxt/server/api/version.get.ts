import { execSync } from 'child_process'

const hash = (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim() }
  catch { return 'unknown' }
})()

export default defineEventHandler(() => ({ hash }))
