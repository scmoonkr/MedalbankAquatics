import { getDB } from '../db.js'

// 초성/첫 알파벳 그룹 (저장 안 함 — 조회 시 JS 처리)
// email_masked (저장 안 함 — 조회 시 JS 처리)
// photo_count  (저장 안 함 — images.countDocuments({ athlete_id }))
// last_date    (저장 안 함 — images.findOne({ athlete_id }, sort: { date: -1 }))

export function athletes() {
  return getDB().collection('athletes')
}
