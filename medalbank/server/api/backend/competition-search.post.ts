// POST /api/backend/competition-search
// 입력한 대회명을 바탕으로 competitions 컬렉션에서 LLM으로 최적 대회를 찾아 반환
import { getDb } from '~/server/utils/mongo'

export default defineEventHandler(async (event) => {
  const body  = await readBody(event)
  const query = String(body?.query || '').trim()
  if (!query) throw createError({ statusCode: 400, statusMessage: '검색어가 없습니다.' })

  const cfg = useRuntimeConfig(event)
  if (!cfg.nvidiaApiKey) throw createError({ statusCode: 500, statusMessage: 'NVIDIA_API_KEY 미설정' })

  const db   = await getDb()
  const coll = db.collection('competitions')

  // ── 1. MongoDB 후보 추출 ─────────────────────────────────────────
  const words   = query.split(/\s+/).filter(w => w.length > 0)
  const regexes = words.map(w => ({ competitionName: { $regex: w, $options: 'i' } }))
  const filter  = regexes.length > 1 ? { $and: regexes } : regexes[0] ?? {}

  const FULL_PROJ = { _id: 0, competitionID: 1, competitionName: 1, datetime: 1, pool: 1, sido: 1, course: 1, isMasters: 1 }

  let candidates = await coll
    .find(filter, { projection: FULL_PROJ })
    .sort({ datetime: -1 })
    .limit(40)
    .toArray()

  // AND 결과 없으면 OR 폴백
  if (candidates.length === 0 && regexes.length > 1) {
    candidates = await coll
      .find({ $or: regexes }, { projection: FULL_PROJ })
      .sort({ datetime: -1 })
      .limit(40)
      .toArray()
  }

  console.log(`[competition-search] query="${query}" candidates=${candidates.length}`)

  if (candidates.length === 0) {
    throw createError({ statusCode: 404, statusMessage: '일치하는 대회를 찾을 수 없습니다.' })
  }

  // 후보가 1개면 LLM 생략
  if (candidates.length === 1) {
    console.log(`[competition-search] single match → competitionID=${candidates[0].competitionID}`)
    return { competition: candidates[0], competitionList: candidates, candidates: 1, rawLlm: '(skipped)' }
  }

  // ── 2. NVIDIA API ─────────────────────────────────────────────────
  const listJson = JSON.stringify(
    candidates.map(c => ({ competitionID: c.competitionID, competitionName: c.competitionName, datetime: c.datetime }))
  )

  const systemPrompt = `You are a swimming competition database search assistant.
Find the competition from the list that best matches the user's input.
- If a sufficiently similar competition exists, respond with: {"competitionID": <number>}
- If no competition in the list is a reasonable match, respond with: {"competitionID": null}
Respond ONLY with valid JSON. No other text or markdown.`

  const userPrompt = `User input: "${query}"

Competition list:
${listJson}

Return JSON with the competitionID of the best match, or null if none match.`

  let rawText = ''
  try {
    const apiRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.nvidiaApiKey}`,
      },
      body: JSON.stringify({
        model:       cfg.nvidiaModelName || 'meta/llama-3.1-8b-instruct',
        messages:    [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        max_tokens:  32,
        temperature: 0.0,
      }),
    })

    if (!apiRes.ok) {
      const errText = await apiRes.text()
      console.error(`[competition-search] NVIDIA API error: ${apiRes.status} ${errText}`)
      throw createError({ statusCode: 502, statusMessage: `NVIDIA API 오류: ${apiRes.status}` })
    }

    const apiJson = await apiRes.json()
    rawText = apiJson.choices?.[0]?.message?.content?.trim() ?? ''
    console.log(`[competition-search] LLM raw: "${rawText}"`)
  } catch (e: any) {
    if (e.statusCode) throw e   // createError는 그대로 전파
    throw createError({ statusCode: 502, statusMessage: `LLM 호출 실패: ${e?.message}` })
  }

  // ── 3. LLM 응답 파싱 ─────────────────────────────────────────────
  let competitionID: number | null | undefined = undefined
  try {
    const jsonStr = rawText.match(/\{[\s\S]*?\}/)?.[0] ?? rawText
    const parsed  = JSON.parse(jsonStr)
    const raw     = parsed.competitionID ?? parsed.id
    competitionID = (raw === null || raw === 'null') ? null : Number(raw)
  } catch {
    console.warn(`[competition-search] JSON parse failed: "${rawText}"`)
    throw createError({ statusCode: 502, statusMessage: `LLM 응답 파싱 실패: ${rawText.slice(0, 80)}` })
  }

  // LLM이 명시적으로 null 반환 → 찾지 못함
  if (competitionID === null) {
    console.log(`[competition-search] LLM: no match found for "${query}"`)
    throw createError({ statusCode: 404, statusMessage: `"${query}"에 해당하는 대회를 찾지 못했습니다.` })
  }

  // 숫자가 아니거나 후보에 없는 ID → 파싱 이상
  if (!competitionID || isNaN(competitionID) || !candidates.some(c => c.competitionID === competitionID)) {
    console.warn(`[competition-search] Unexpected competitionID from LLM: ${competitionID}`)
    throw createError({ statusCode: 502, statusMessage: `LLM이 유효하지 않은 ID를 반환했습니다: ${rawText.slice(0, 80)}` })
  }

  // ── 4. LLM이 선택한 대회 (candidates에서 바로 추출)
  const competition = candidates.find(c => c.competitionID === competitionID) ?? null

  console.log(`[competition-search] result → competitionID=${competition?.competitionID}, name="${competition?.competitionName}"`)

  if (!competition) {
    throw createError({ statusCode: 404, statusMessage: `competitionID ${competitionID} 를 찾을 수 없습니다.` })
  }

  // LLM 추천 항목을 목록 맨 앞으로
  const competitionList = [
    competition,
    ...candidates.filter(c => c.competitionID !== competitionID),
  ]

  return { competition, competitionList, candidates: candidates.length, rawLlm: rawText }
})
