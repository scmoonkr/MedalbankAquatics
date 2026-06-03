// POST /api/submit — 기록 제보를 errata 컬렉션에 저장
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const {
    timeID, name, time, gender, isMasters, group,
    discipline, distance, course, rank, sido, team,
    datetime, competitionName, pool, note,
    evidenceUrls,
  } = body

  if (!name || !time || !gender || !discipline || !distance || !course || !datetime || !competitionName) {
    throw createError({ statusCode: 400, statusMessage: '필수 항목을 모두 입력해 주세요.' })
  }

  const db  = await getDb()
  const now = new Date()
  const tid = Number(timeID) || 0

  // ── no: PK (sequential) ───────────────────────────────────
  const count = await db.collection('errata').countDocuments()
  const no    = count + 1

  // ── reporter: 제보자 이름이 선수 이름과 같으면 "본인" ────────
  const reporter = name === session.user.name
    ? `${session.user.name} 본인`
    : session.user.name

  // ── category ──────────────────────────────────────────────
  const category = tid > 0 ? '오류 정정' : '누락건 신규 등재'

  // ── before: timeID > 0이면 원본 mergedTimes 기록 저장 ─────
  let before: Record<string, unknown> | null = null
  if (tid > 0) {
    const original = await db.collection('mergedTimes').findOne({ tid })
    if (original) {
      before = {
        name:            original.name            ?? '',
        time:            original.time            ?? '',
        gender:          original.gender          ?? '',
        discipline:      original.discipline      ?? '',
        distance:        original.distance        ?? '',
        course:          original.course          ?? '',
        rank:            original.rank            ?? null,
        sido:            original.sido            ?? '',
        team:            original.team            ?? '',
        datetime:        original.datetime        ?? '',
        competitionName: original.competitionName ?? '',
        pool:            original.pool            ?? '',
      }
    }
  }

  // ── 저장 ──────────────────────────────────────────────────
  await db.collection('errata').insertOne({
    no,
    category,
    reporter,
    report_date: now.toISOString().slice(0, 10),
    timeID: tid,
    time: {
      name, time, gender,
      isMasters: Boolean(isMasters),
      group:     String(group || ''),
      discipline, distance, course,
      rank:            rank != null ? Number(rank) : null,
      sido:            String(sido || ''),
      team:            String(team || ''),
      datetime:        String(datetime),
      competitionName: String(competitionName),
      pool:            String(pool || ''),
    },
    before,
    note: String(note || ''),
    evidenceUrls: evidenceUrls ?? null,
    submittedBy: {
      id:    session.user.id,
      name:  session.user.name,
      email: session.user.email ?? null,
    },
    submittedAt: now,
    status: 'pending',
  })

  await writeLog('submit', {
    userId: session.user.id,
    name,
    category,
    timeID: tid,
    discipline,
    distance,
    course,
  })

  return { ok: true }
})
