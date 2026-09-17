// GET /api/backend/capture
// mergedTimes 에서 리더보드 카드용 기록을 뽑는다.
// filter: competitionID, gender, masters(등록/비등록), adult(전체/성인/학생), typeTime(eventResult/timeResult)
// 반환: discipline·course·distance 별로 묶은 보드 배열 (기록 오름차순, 동순위 처리 포함)
const DISCIPLINES = ['FR', 'BA', 'BR', 'FL', 'IM'] as const
const COURSES     = ['LCM', 'SCM'] as const
const DISTANCES   = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'] as const
const TOP_N       = 10

export default defineEventHandler(async (event) => {
  const q  = getQuery(event)
  const db = await getDb()

  const match: Record<string, unknown> = {
    discipline: { $in: [...DISCIPLINES] },
    distance:   { $in: [...DISTANCES] },
  }

  const competitionID = Number(q.competitionID)
  if (Number.isFinite(competitionID) && competitionID > 0) match.competitionID = competitionID

  if (q.gender) match.gender = String(q.gender)

  // 원본 카드 제목이 isMasters=true 를 "비등록" 으로 부른다.
  if (q.masters === '비등록') match.isMasters = true
  else if (q.masters === '등록') match.isMasters = false

  if (q.adult === '성인') match.isAdult = true
  else if (q.adult === '학생') match.isAdult = false

  // eventResult → type 'event'. 이 DB 에 훈련기록(type 'time')은 아직 없다.
  if (q.typeTime === 'eventResult')     match.type = 'event'
  else if (q.typeTime === 'timeResult') match.type = 'time'

  const docs = await db
    .collection('mergedTimes')
    .find(match, {
      projection: {
        _id: 0, timeID: 1, aid: 1, name: 1, team: 1, teamID: 1,
        gender: 1, discipline: 1, course: 1, distance: 1,
        time: 1, timeStamp: 1, datetime: 1, rank: 1,
        isMasters: 1, isAdult: 1, type: 1, competitionID: 1, competitionName: 1,
      },
    })
    .sort({ timeStamp: 1 })
    .limit(20000)
    .toArray()

  if (!docs.length) return { boards: [], datetime: '' }

  // 선수 썸네일 조인 (athletes.athleteID ↔ mergedTimes.aid)
  const aids = [...new Set(docs.map(d => d.aid).filter((n): n is number => typeof n === 'number' && n > 0))]
  const thumbs = new Map<number, string>()
  if (aids.length) {
    const athletes = await db
      .collection('athletes')
      .find({ athleteID: { $in: aids } }, { projection: { _id: 0, athleteID: 1, thumbnail: 1, featured: 1 } })
      .toArray()
    for (const a of athletes) thumbs.set(a.athleteID, a.thumbnail || a.featured || '')
  }

  // discipline · course · distance 로 묶고, 각 묶음에서 상위 10건에 순위를 매긴다.
  const groups = new Map<string, any[]>()
  for (const d of docs) {
    const key = `${d.discipline}|${d.course}|${d.distance}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(d)
  }

  const boards: any[] = []
  for (const discipline of DISCIPLINES) {
    for (const course of COURSES) {
      for (const distance of DISTANCES) {
        const rows = groups.get(`${discipline}|${course}|${distance}`)
        if (!rows?.length) continue

        // 기록 없는 행(timeStamp 0/누락)은 순위에서 빼고 뒤로 보낸다.
        const scored = rows.filter(r => typeof r.timeStamp === 'number' && r.timeStamp > 0)
        const unscored = rows.filter(r => !(typeof r.timeStamp === 'number' && r.timeStamp > 0))
        // timeStamp 오름차순은 위 find 에서 이미 적용됨. 동기록은 같은 순위.
        const top = [...scored, ...unscored].slice(0, TOP_N)
        let prev = -1
        let rank = 0
        const times = top.map((r, i) => {
          if (r.timeStamp > 0 && r.timeStamp !== prev) rank = i + 1
          prev = r.timeStamp
          return {
            timeID:    r.timeID ?? null,
            athleteID: r.aid ?? 0,
            name:      r.name || '',
            team:      r.team || '',
            thumbnail: thumbs.get(r.aid) || '',
            time:      r.time || '',
            timeStamp: r.timeStamp ?? 0,
            datetime:  r.datetime ? String(r.datetime).slice(0, 10) : '',
            rank:      r.timeStamp > 0 ? rank : '',
          }
        })

        boards.push({
          discipline, course, distance,
          gender:    top[0].gender    || '',
          isMasters: top[0].isMasters ?? null,
          isAdult:   top[0].isAdult   ?? null,
          times,
        })
      }
    }
  }

  return { boards, datetime: docs[0].datetime ? String(docs[0].datetime).slice(0, 10) : '' }
})
