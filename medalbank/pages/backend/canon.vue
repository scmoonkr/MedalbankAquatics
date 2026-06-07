<template>
  <div class="cn-root">

    <!-- Toolbar -->
    <div class="cn-bar">
      <nav class="cn-tabs">
        <button
          v-for="tab in TABS"
          :key="tab.disc"
          class="cn-tab"
          :class="{ active: activeDisc === tab.disc }"
          @click="activeDisc = tab.disc"
        >{{ tab.ko }}</button>
      </nav>
      <div class="cn-bar-right">
        <span v-if="result" class="cn-result" :class="result.error ? 'cn-result-err' : 'cn-result-ok'">
          {{ result.msg }}
        </span>
        <button class="btn-update" :disabled="updating" @click="runUpdate">
          <span v-if="updating" class="cn-spinner"></span>
          {{ updating ? '진행 중…' : 'Update' }}
        </button>
      </div>
    </div>

    <!-- Info -->
    <div class="cn-info">
      <strong>Update</strong> 버튼을 누르면 <code>records</code> 컬렉션의 모든 도큐먼트를 <code>mergedTimes</code>로 동기화합니다.
      중복 체크 기준: <strong>name · gender · isMasters · discipline · course · distance · time</strong>.
      이미 존재하면 skip, 없으면 신규 insert합니다. insert된 레코드에는 <code>updateTimes</code>가 기록됩니다.
    </div>

    <!-- Table -->
    <div v-if="loaded" class="cn-table-wrap">
      <table class="cn-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>성별</th>
            <th>거리</th>
            <th>기록</th>
            <th>이름</th>
            <th>팀</th>
            <th>날짜</th>
            <th>장소</th>
            <th>UpdateTimes</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="filteredRecs.length">
            <tr v-for="r in filteredRecs" :key="r.id">
              <td><span class="rt-badge">{{ r.type }}</span></td>
              <td class="td-gen">{{ r.gender === 'men' ? '남자' : '여자' }}</td>
              <td class="td-mono">{{ r.distance }}</td>
              <td class="td-mono td-time">{{ r.time }}</td>
              <td>{{ r.name }}</td>
              <td class="td-team">{{ r.team }}</td>
              <td class="td-mono td-date">{{ r.datetime }}</td>
              <td class="td-loc">{{ r.location }}</td>
              <td class="td-mono td-upd" :class="r.updateTimes ? 'upd-done' : 'upd-none'">
                {{ r.updateTimes ? r.updateTimes.slice(0, 10) : '—' }}
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="9" class="cn-empty">해당 영법 기록 없음</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="cn-loading">불러오는 중…</div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'backend' })
useHead({ title: 'Cannon Update — 메달뱅크 Backend' })

// ── 영법 탭 ──────────────────────────────────────────────────────────
const TABS = [
  { disc: 'FR', ko: '자유형' },
  { disc: 'BA', ko: '배영'   },
  { disc: 'BR', ko: '평영'   },
  { disc: 'FL', ko: '접영'   },
  { disc: 'IM', ko: '개인혼영' },
] as const

type Disc = typeof TABS[number]['disc']

const activeDisc = ref<Disc>('FR')

// style 필드 → disc 정규화 (records.style = 'FR' or 'freestyle')
const STYLE_TO_DISC: Record<string, string> = {
  FR: 'FR', freestyle: 'FR',
  BA: 'BA', backstroke: 'BA', back: 'BA',
  BR: 'BR', breaststroke: 'BR', breast: 'BR',
  FL: 'FL', butterfly: 'FL', fly: 'FL',
  IM: 'IM', medley: 'IM',
}

// ── 데이터 ───────────────────────────────────────────────────────────
interface RecRow {
  id:          string
  type:        string
  gender:      string
  distance:    string
  time:        string
  name:        string
  team:        string
  datetime:    string
  location:    string
  discipline:  string
  updateTimes: string | null
}

const recs   = ref<RecRow[]>([])
const loaded = ref(false)

async function loadRecs() {
  loaded.value = false
  const data = await $fetch<any[]>('/api/backend/records')
  recs.value = data.map((d: any) => ({
    id:          d.id,
    type:        d.type        || '—',
    gender:      d.gender      || '—',
    distance:    d.distance    || '—',
    time:        d.time        || '—',
    name:        d.name        || '—',
    team:        d.team        || d.nationality || '—',
    datetime:    d.datetime    || '—',
    location:    d.location    || d.pool        || '—',
    discipline:  d.discipline  || d.style       || '',
    updateTimes: d.updateTimes || null,
  }))
  loaded.value = true
}

const filteredRecs = computed(() =>
  recs.value.filter(r => {
    const disc = r.discipline ? (STYLE_TO_DISC[r.discipline] || r.discipline) : ''
    return disc === activeDisc.value
  })
)

// ── Update ────────────────────────────────────────────────────────────
const updating = ref(false)
const result   = ref<{ msg: string; error: boolean } | null>(null)
let resultTimer: ReturnType<typeof setTimeout> | null = null

async function runUpdate() {
  if (updating.value) return
  updating.value = true
  result.value = null
  try {
    const res = await $fetch<{ inserted: number; skipped: number }>(
      '/api/backend/canon/update',
      { method: 'POST' },
    )
    result.value = {
      msg:   `✓ ${res.inserted}건 추가  /  ${res.skipped}건 중복 skip`,
      error: false,
    }
    await loadRecs() // updateTimes 반영을 위해 새로고침
  } catch (e: any) {
    result.value = {
      msg:   `오류: ${e?.data?.message || e?.message || '알 수 없는 오류'}`,
      error: true,
    }
  } finally {
    updating.value = false
    // 5초 후 자동 소멸
    if (resultTimer) clearTimeout(resultTimer)
    resultTimer = setTimeout(() => { result.value = null }, 5000)
  }
}

onMounted(() => loadRecs())
onUnmounted(() => { if (resultTimer) clearTimeout(resultTimer) })
</script>

<style scoped>
.cn-root { font-family: var(--sans); }

/* ── Toolbar ── */
.cn-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; gap: 12px; flex-wrap: wrap;
}
.cn-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.cn-tab {
  height: 32px; padding: 0 14px; border: 1px solid #ddd; background: #fff;
  font-size: 13px; color: #555; cursor: pointer; border-radius: 3px;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  font-family: var(--sans);
}
.cn-tab:hover  { background: #f5f5f3; color: #0a0a0a; }
.cn-tab.active { background: #0a1d3a; color: #fff; border-color: #0a1d3a; }

.cn-bar-right { display: flex; align-items: center; gap: 10px; }

.cn-result {
  font-size: 12.5px; padding: 5px 12px; border-radius: 3px;
  white-space: nowrap;
}
.cn-result-ok  { background: #dcfce7; color: #166534; }
.cn-result-err { background: #fee2e2; color: #991b1b; }

.btn-update {
  height: 32px; padding: 0 18px;
  background: #0a1d3a; color: #fff; border: 0;
  font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 3px;
  display: flex; align-items: center; gap: 8px;
  transition: background 0.15s;
}
.btn-update:hover:not(:disabled) { background: #1e3a5f; }
.btn-update:disabled { opacity: 0.55; cursor: not-allowed; }

.cn-spinner {
  width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Info ── */
.cn-info {
  padding: 12px 16px; background: #fafaf8; border: 1px solid #e8e8e4;
  border-radius: 3px; font-size: 12.5px; color: #555; line-height: 1.8;
  margin-bottom: 20px;
}
.cn-info strong { color: #0a0a0a; }
.cn-info code {
  font-family: var(--mono); font-size: 11.5px;
  background: #f0f0ee; padding: 1px 5px; border-radius: 2px; color: #333;
}

/* ── Table ── */
.cn-loading { padding: 60px; text-align: center; color: #aaa; }
.cn-table-wrap { overflow-x: auto; }
.cn-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cn-table thead th {
  padding: 8px 10px; background: #f8f8f6; border-bottom: 2px solid #e0e0e0;
  font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: #aaa; text-align: left; white-space: nowrap;
}
.cn-table tbody tr { border-bottom: 1px solid #f0f0ee; }
.cn-table tbody tr:hover { background: #fafaf8; }
.cn-table tbody td { padding: 7px 10px; color: #222; white-space: nowrap; }

.cn-empty { text-align: center; color: #bbb; padding: 40px !important; }

.rt-badge {
  display: inline-block; font-family: var(--mono); font-size: 11px;
  font-weight: 700; background: #0a1d3a; color: #fff;
  padding: 2px 7px; border-radius: 3px; letter-spacing: 0.08em;
}
.td-gen  { font-size: 12px; color: #666; }
.td-mono { font-family: var(--mono); }
.td-time { font-weight: 600; color: #0a0a0a; }
.td-team { font-family: var(--mono); font-size: 12px; color: #555; }
.td-date { font-size: 12px; color: #888; }
.td-loc  { max-width: 200px; overflow: hidden; text-overflow: ellipsis; color: #666; }
.td-upd  { font-size: 12px; }
.upd-done { color: #16a34a; }
.upd-none { color: #bbb; }
</style>
