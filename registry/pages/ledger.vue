<template>
  <div>
    <div class="stub-shell">
      <div class="eyebrow">03 · The Ledger · 기록대장</div>
      <h1>The <span class="em">Ledger.</span></h1>
      <p class="lede">새로 발굴·등재된 기록이 이곳에 시간순으로 기록됩니다.</p>
      <div class="stub-foot">{{ ledgerList.length }} entries</div>
    </div>

    <div class="page-body">
      <section class="block">
        <div class="block-head">
          <h2>최근 등재된 <span class="em">기록들.</span></h2>
          <span class="meta">{{ ledgerList.length }} ENTRIES · 최신순</span>
        </div>

        <div v-if="pending" class="empty-state">불러오는 중…</div>
        <div v-else-if="!ledgerList.length" class="empty-state">데이터를 불러올 수 없습니다.</div>
        <div v-else class="ledger-feed">
          <article v-for="(doc, i) in pagedRows" :key="i" class="ledger-entry kind-record">
            <div class="tag">
              {{ doc.event }}
              <span class="label-ko">{{ doc.group }}</span>
            </div>
            <div class="body">
              <h3>{{ doc.name }}</h3>
              <div class="athlete">
                <span class="rank">·</span>
                {{ doc.city }} · {{ doc.team }}
              </div>
              <p>{{ doc.meet }}</p>
            </div>
            <div class="figures">
              <span class="time">{{ doc.time }}</span>
              <span class="when">
                {{ doc.date }}
                <template v-if="doc.report_date"><br />등재 {{ doc.report_date }}</template>
              </span>
            </div>
          </article>
        </div>

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
          <h2>기록대장에 대하여.</h2>
          <span class="meta">ABOUT</span>
        </div>
        <p style="font-family:var(--serif-ko);font-size:16px;line-height:1.85;color:var(--fg-dim);max-width:760px;">
          The Ledger는 Korean Swimming Registry에 가장 최근에 등재된 기록들을 시간순으로 보여주는 페이지입니다. 새로 발굴되거나 정정을 통해 새롭게 반영된 기록들이 이곳에 순차적으로 기록됩니다. 제보를 통해 이 등재부에 처음으로 이름을 올려보세요.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'The Ledger — KSR · Korean Swimming Registry' })

const PER_PAGE = 25
const page = ref(1)

interface LedgerDoc {
  event: string
  group: string
  name: string
  city: string
  team: string
  time: string
  date: string
  meet: string
  report_date: string | null
}

const { data: ledgerData, pending } = await useFetch<LedgerDoc[]>('/api/ledger')
const ledgerList = computed(() => ledgerData.value ?? [])
const totalPages = computed(() => Math.max(1, Math.ceil(ledgerList.value.length / PER_PAGE)))
const pagedRows  = computed(() => ledgerList.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(ledgerList, () => { page.value = 1 })
</script>
