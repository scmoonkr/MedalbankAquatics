<template>
  <div>
    <div class="stub-shell">
      <div class="eyebrow">02 · The Errata · 정오표</div>
      <h1>The <span class="em">Errata.</span></h1>
      <p class="lede">
        바로잡힌 한 자리, 누락에서 발견으로 옮겨간 모든 변동이
        이곳에 시간순으로 보존됩니다.
      </p>
      <div class="stub-foot">{{ errataList.length }} corrections</div>
    </div>

    <div class="page-body">
      <section class="block">
        <div class="block-head">
          <h2>모든 정정의 <span class="em">기록.</span></h2>
          <span class="meta">{{ errataList.length }} ENTRIES · 시간순</span>
        </div>

        <div v-if="pending" class="empty-state">불러오는 중…</div>
        <div v-else-if="!errataList.length" class="empty-state">데이터를 불러올 수 없습니다.</div>
        <table v-else class="errata-list">
          <thead>
            <tr>
              <th class="c-idx">No.</th>
              <th class="c-kind">분류</th>
              <th class="c-entry">정정 내용</th>
              <th class="c-reporter">제보자</th>
              <th class="c-date">제보일</th>
              <th class="c-issue">반영호</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in pagedRows" :key="doc.no">
              <td class="idx">{{ String(doc.no).padStart(2, '0') }}</td>
              <td class="kind">{{ doc.category }}</td>
              <td class="entry" v-html="buildEntry(doc)"></td>
              <td class="reporter">{{ doc.reporter }}</td>
              <td class="date">{{ doc.report_date }}</td>
              <td class="issue">{{ doc.magazine }}</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button class="page-btn prev" :disabled="page <= 1" @click="page--">← Prev</button>
          <span class="page-info">
            Page <strong>{{ String(page).padStart(2, '0') }}</strong>
            <span class="total"> / </span>
            <span>{{ String(totalPages).padStart(2, '0') }}</span>
          </span>
          <button class="page-btn next" :disabled="page >= totalPages" @click="page++">Next →</button>
        </div>
      </section>

      <section class="block">
        <div class="block-head">
          <h2>정정의 <span class="em">방식.</span></h2>
          <span class="meta">PROCESS</span>
        </div>
        <p style="font-family:var(--serif-ko);font-size:16px;line-height:1.85;color:var(--fg-dim);max-width:760px;">
          모든 제보는 실명 또는 검증 가능한 익명으로 접수됩니다. 위원의 1차 확인 후, 공식 결과지·전광판 영상·사진 증빙을 통해 교차 검증되며, 검증이 완료된 정정은 온라인 등재부에 반영되는 동시에 다음 호의 인쇄본에도 반영됩니다. 한번 반영된 정정은 <strong>The Errata</strong>에 영구히 기록되며, 사후 재정정 될 수 있으나, 삭제되지는 않습니다.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'The Errata — 메달뱅크 · Medalbank' })

const PER_PAGE = 100
const page = ref(1)

interface TimeData {
  name?: string; time?: string; gender?: string; discipline?: string
  distance?: string; course?: string; rank?: number | null
  datetime?: string; competitionName?: string; pool?: string
  sido?: string; team?: string
}

interface ErrataDoc {
  no:          number
  category:    string
  timeID:      number
  time:        TimeData
  before:      TimeData | null
  note:        string
  reporter:    string
  report_date: string
  magazine:    string
}

const { data: errataData, pending } = await useFetch<ErrataDoc[]>('/api/errata')
const errataList = computed(() => errataData.value ?? [])
const totalPages = computed(() => Math.max(1, Math.ceil(errataList.value.length / PER_PAGE)))
const pagedRows  = computed(() => errataList.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(errataList, () => { page.value = 1 })

const GENDER_LABEL: Record<string, string> = { men: '남자', women: '여자' }
const DISC_LABEL:   Record<string, string> = { BR: '평영', FR: '자유형', BA: '배영', FL: '접영', IM: '개인혼영' }

function esc(s: unknown): string {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m as string] ?? m))
}

function eventLabel(t: TimeData): string {
  return [GENDER_LABEL[t.gender ?? ''] ?? t.gender, DISC_LABEL[t.discipline ?? ''] ?? t.discipline, t.distance, t.course].filter(Boolean).join(' ')
}

function buildEntry(doc: ErrataDoc): string {
  const t     = doc.time   ?? {}
  const b     = doc.before ?? null
  const isNew = !doc.timeID

  const evtLabel = esc(eventLabel(t))
  const nameStr  = esc(t.name)
  const noteHtml = doc.note ? ` <span class="note-text">— ${esc(doc.note)}</span>` : ''

  if (isNew) {
    const rank = t.rank ? `${t.rank}위 ` : ''
    const tail = [t.datetime, t.competitionName, t.pool].filter(Boolean).map(esc).join(' ')
    return [
      evtLabel,
      rank + `<strong>${nameStr}</strong>`,
      `<span class="mono">${esc(normTime(t.time))}</span>`,
      '누락 등재',
      tail ? `<span class="tail">(${tail})</span>` : '',
      noteHtml,
    ].filter(Boolean).join(' ')
  }

  // 오류정정: "[종목] [이름] 오류정정. [bTime] [aTime] · [bDate] [aDate] · [bVenue] [aVenue]"
  const pairs: string[] = []

  const addPair = (bVal: unknown, aVal: unknown, mono = false) => {
    const bStr = String(bVal ?? '').trim()
    const aStr = String(aVal ?? '').trim()
    if (!bStr && !aStr) return
    const fmt = (v: string) => mono ? `<span class="mono">${esc(v)}</span>` : esc(v)
    pairs.push(`<span class="before">${fmt(bStr)}</span> <span class="after">${fmt(aStr)}</span>`)
  }

  if (b) {
    addPair(normTime(b.time),  normTime(t.time),  true)
    addPair(b.datetime,        t.datetime)
    addPair(b.competitionName ?? b.pool, t.competitionName ?? t.pool)
  } else {
    if (t.time)            pairs.push(`<span class="mono">${esc(normTime(t.time))}</span>`)
    if (t.datetime)        pairs.push(esc(t.datetime))
    if (t.competitionName) pairs.push(esc(t.competitionName))
  }

  const diffStr = pairs.join(' · ')
  return [evtLabel, nameStr, `오류정정.`, diffStr, noteHtml].filter(Boolean).join(' ')
}
</script>
