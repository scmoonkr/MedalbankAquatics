// 숫자 업무키(athleteID / poolID / teamID / stemID) 채번.
// 해당 컬렉션의 현재 최대값 + 1 을 돌려준다. timeID 는 별도 counters 기반(utils/tid.ts)을 쓴다.
import type { Db } from 'mongodb'

export async function nextSeq(db: Db, collection: string, field: string): Promise<number> {
  const top = await db
    .collection(collection)
    .find({ [field]: { $type: 'number' } }, { projection: { [field]: 1, _id: 0 } })
    .sort({ [field]: -1 })
    .limit(1)
    .next()
  return ((top?.[field] as number) ?? 0) + 1
}

// 검색어를 정규식 리터럴로 안전하게 감싼다.
export function safeRegex(input: unknown): string {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 초성 버튼("가%", "0%", "A%")을 이름 범위 질의로 바꾼다.
// 상한은 다음 초성 음절이라 가~나 구간이 각·간·깋 처럼 겹받침·된소리까지 모두 포함한다.
// (구 medalbank Express 의 swimmingCFG.charTable 과 동일한 경계)
const CHAR_RANGE: Array<{ char: string; gte: string; lt: string }> = [
  { char: '0', gte: '0', lt: ':' },
  { char: 'A', gte: 'A', lt: '{' },
  { char: '가', gte: '가', lt: '나' },
  { char: '나', gte: '나', lt: '다' },
  { char: '다', gte: '다', lt: '라' },
  { char: '라', gte: '라', lt: '마' },
  { char: '마', gte: '마', lt: '바' },
  { char: '바', gte: '바', lt: '사' },
  { char: '사', gte: '사', lt: '아' },
  { char: '아', gte: '아', lt: '자' },
  { char: '자', gte: '자', lt: '차' },
  { char: '차', gte: '차', lt: '카' },
  { char: '카', gte: '카', lt: '타' },
  { char: '타', gte: '타', lt: '파' },
  { char: '파', gte: '파', lt: '하' },
  { char: '하', gte: '하', lt: '힣' },
]

export function initialRange(head: string): { $gte: string; $lt: string } | null {
  const hit = CHAR_RANGE.find(el => el.char === head)
  return hit ? { $gte: hit.gte, $lt: hit.lt } : null
}
