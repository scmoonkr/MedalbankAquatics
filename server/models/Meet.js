import { getDB } from '../db.js'

// photo_count (저장 안 함 — images.countDocuments({ meet_id }))

export function meets() {
  return getDB().collection('meets')
}
