// POST /api/backend/canon/update
// records 컬렉션 → mergedTimes 동기화
// 대상: updateTimes 없는 records만
// 중복 체크: name + gender + discipline + course + distance + time
// 없으면 insert, 처리한 records 전체(insert+skip)에 updateTimes 기록

import { getBasetime, calcWAPoints } from '~/server/utils/wapoints'
import { ObjectId } from 'mongodb'

// style 필드 정규화: "freestyle" / "FR" 모두 → "FR"
const STYLE_TO_DISC: Record<string, string> = {
  FR: 'FR', freestyle: 'FR',
  BA: 'BA', backstroke: 'BA', back: 'BA',
  BR: 'BR', breaststroke: 'BR', breast: 'BR',
  FL: 'FL', butterfly: 'FL', fly: 'FL',
  IM: 'IM', medley: 'IM',
}

// "Gwangju, KOR" → "광주" 불가능하므로 KOR이면 앞 도시명(영문) 반환, 아니면 "해외"
function parseSido(location: string): string {
  if (!location) return '해외'
  const match = location.match(/^(.+),\s*KOR$/i)
  if (match) return match[1].trim()
  return '해외'
}

export default defineEventHandler(async (event) => {
  const db = await getDb()

  // 1. updateTimes 없는 records만 가져오기
  const records = await db.collection('records').find({ updateTimes: { $exists: false } }).toArray()

  // 2. mergedTimes 최대 timeID 조회 → 채번
  const maxDoc = await db
    .collection('mergedTimes')
    .findOne({}, { sort: { timeID: -1 }, projection: { timeID: 1 } })
  let nextTimeID = ((maxDoc?.timeID as number) ?? 0) + 1

  const now = new Date()
  const allIds: ObjectId[] = []   // 처리 대상 전체 (insert + skip)
  let inserted = 0
  let skipped = 0

  for (const rec of records) {
    const discipline = rec.discipline || STYLE_TO_DISC[rec.style || ''] || ''
    allIds.push(rec._id as ObjectId)

    // 3. 중복 체크 (6개 필드 — isMasters 제외)
    const exists = await db.collection('mergedTimes').findOne({
      name:       rec.name,
      gender:     rec.gender,
      discipline,
      course:     rec.course    || 'LCM',
      distance:   rec.distance,
      time:       rec.time,
    })

    if (exists) {
      skipped++
      continue
    }

    // 4. sido 파싱
    const location = (rec.location as string) || ''
    const sido = parseSido(location)

    // 5. waPoints 계산
    const basetime = getBasetime(
      rec.course    || 'LCM',
      rec.gender    || '',
      discipline,
      rec.distance  || '',
    )
    const waPoints =
      basetime !== null && rec.timeStamp
        ? calcWAPoints(basetime, rec.timeStamp as number)
        : 0

    // 6. mergedTimes insert
    await db.collection('mergedTimes').insertOne({
      timeID:          nextTimeID++,
      isMasters:       rec.isMasters ?? false,
      gender:          rec.gender,
      course:          rec.course    || 'LCM',
      distance:        rec.distance,
      type:            rec.type,
      time:            rec.time,
      timeStamp:       rec.timeStamp,
      name:            rec.name,
      team:            rec.team      || '',
      datetime:        rec.datetime  || '',
      competitionName: '미확인 대회',
      competitionID:   1,
      sido,
      pool:            location,
      discipline,
      waPoints,
    })

    inserted++
  }

  // 7. 처리한 records 전체(insert + skip)에 updateTimes 기록
  if (allIds.length > 0) {
    await db.collection('records').updateMany(
      { _id: { $in: allIds } },
      { $set: { updateTimes: now } },
    )
  }

  return { inserted, skipped }
})
