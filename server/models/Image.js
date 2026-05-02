import { getDB } from '../db.js'

// sort_order (저장 안 함 — 조회 시 date 기준 JS 정렬)
// athlete 정보 조회 — athlete_id로 join ($lookup)

export function images() {
  return getDB().collection('images')
}

// indexes: athlete_id, meet_id (서버 시작 시 ensureIndexes() 호출)
export async function ensureIndexes() {
  const col = images()
  await col.createIndex({ athlete_id: 1 })
  await col.createIndex({ meet_id: 1 })
}
