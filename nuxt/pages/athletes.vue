<template>
  <main class="ath-shell">
    <div class="ath-head">
      <div class="eyebrow"><span class="num">{{ athletes.length.toString().padStart(2, '0') }}</span>Athletes · 선수목록</div>
      <h1><span class="em">선수목록.</span></h1>
      <p class="lead">
        본인 이름을 클릭하시면, 동의된 사진들이 <strong>대회별 또는 시간순</strong>으로 정리된 페이지로 이동합니다.
      </p>
      <p class="meta-line">전체 <span style="color:var(--fg)">{{ athletes.length }}</span>명 · 동의된 사진 <span style="color:var(--fg)">{{ totalPhotos.toLocaleString() }}</span>장</p>
    </div>

    <div class="sort-toggle" role="tablist">
      <button v-for="s in sorts" :key="s.key" type="button"
        :class="{ active: sort === s.key }"
        :aria-selected="sort === s.key"
        role="tab"
        @click="sort = s.key">{{ s.label }}</button>
    </div>

    <nav v-show="sort === 'name'" class="index-bar" aria-label="이니셜 인덱스">
      <template v-for="g in HANGUL" :key="g">
        <button type="button" :class="['ix', { empty: !byGroup[g], active: activeGroup === g }]"
          @click="byGroup[g] && jumpTo(g)">{{ g }}</button>
      </template>
      <span class="divider"></span>
      <template v-for="g in engGroups" :key="g">
        <button type="button" :class="['ix', { active: activeGroup === g }]"
          @click="jumpTo(g)">{{ g }}</button>
      </template>
    </nav>

    <!-- 이름순 -->
    <template v-if="sort === 'name'">
      <section v-for="g in groupOrder" :key="g" class="group" :id="`g-${encodeURIComponent(g)}`">
        <div class="group-head">
          <span class="group-letter">{{ g }}</span>
          <span class="group-count"><span class="n">{{ byGroup[g].length }}</span> {{ byGroup[g].length === 1 ? 'name' : 'names' }}</span>
        </div>
        <div class="name-grid">
          <NuxtLink v-for="a in byGroup[g]" :key="a.id" class="name-link" :to="`/athlete?id=${a.id}`">
            <span class="nm">{{ a.name }}</span>
            <span class="ct">{{ a.photo_count }}</span>
          </NuxtLink>
        </div>
      </section>
    </template>

    <!-- 사진보유순 / 최신순 -->
    <template v-else>
      <section class="flat-section">
        <div class="head">{{ sort === 'photos' ? `사진보유순 · ${athletes.length} names` : `최신순 · ${athletes.length} names` }}</div>
        <div class="name-grid">
          <NuxtLink v-for="a in sortedAthletes" :key="a.id" class="name-link" :to="`/athlete?id=${a.id}`">
            <span class="nm">{{ a.name }}</span>
            <span class="ct">{{ a.photo_count }}</span>
          </NuxtLink>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
useHead({ title: '메달뱅크 아쿠아틱스 — 선수목록' })

const HANGUL = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const ENG    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const sorts  = [{ key: 'name', label: '이름순' }, { key: 'photos', label: '사진보유순' }, { key: 'recent', label: '최신순' }]

const { data: raw } = await useFetch('/data/athletes.json')
const athletes = computed(() => (raw.value as any)?.athletes ?? [])
const totalPhotos = computed(() => athletes.value.reduce((s: number, a: any) => s + a.photo_count, 0))

const byGroup = computed(() => {
  const m: Record<string, any[]> = {}
  athletes.value.forEach((a: any) => { if (!m[a.group]) m[a.group] = []; m[a.group].push(a) })
  return m
})
const groupOrder  = computed(() => [...HANGUL, ...ENG].filter(g => byGroup.value[g]))
const engGroups   = computed(() => ENG.filter(g => byGroup.value[g]))

const sort = ref('name')
const activeGroup = ref('')

const sortedAthletes = computed(() => {
  const list = [...athletes.value]
  if (sort.value === 'photos') return list.sort((a, b) => b.photo_count - a.photo_count || a.name.localeCompare(b.name, 'ko'))
  return list.sort((a, b) => b.last_date.localeCompare(a.last_date) || b.photo_count - a.photo_count)
})

function jumpTo(g: string) {
  const el = document.getElementById(`g-${encodeURIComponent(g)}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
body { overflow-x: hidden; }
.ath-shell { min-height: 100vh; min-height: 100dvh; padding-top: 96px; padding-bottom: 40px; }
.ath-head { padding: 8px 32px 24px; }
.ath-head .eyebrow { color: var(--fg-faint); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; margin-bottom: 22px; }
.ath-head .eyebrow .num { font-family: var(--font-serif); font-style: italic; font-size: 14px; margin-right: 10px; color: var(--accent); letter-spacing: -0.01em; }
.ath-head h1 { font-family: var(--font-myungjo); font-size: clamp(36px,5vw,56px); font-weight: 400; line-height: 1.18; letter-spacing: -0.018em; margin-bottom: 18px; }
.ath-head h1 .em { font-family: var(--font-serif); font-style: italic; color: var(--accent); font-weight: 400; letter-spacing: -0.02em; }
.ath-head .lead { font-family: var(--font-myungjo); font-size: clamp(15px,1.3vw,17px); line-height: 1.7; color: var(--fg-dim); letter-spacing: -0.005em; max-width: 720px; }
.ath-head .meta-line { margin-top: 18px; color: var(--fg-faint); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
@media (max-width: 768px) { .ath-head { padding: 4px 18px 20px; } .ath-head .lead { font-size: 14.5px; } }
.index-bar { padding: 14px 32px 16px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; overflow-x: auto; scrollbar-width: none; }
.index-bar::-webkit-scrollbar { display: none; }
.index-bar .ix { font-family: var(--font-serif); font-style: italic; font-size: 17px; color: var(--fg-faint); letter-spacing: -0.01em; line-height: 1; padding: 8px 11px; cursor: pointer; background: none; border: 0; transition: color 0.25s ease, background 0.25s ease; border-radius: 4px; flex-shrink: 0; }
.index-bar .ix:hover { color: var(--fg); }
.index-bar .ix.active { color: var(--accent); background: rgba(56,182,255,0.08); }
.index-bar .ix.empty { opacity: 0.25; cursor: default; }
.index-bar .divider { width: 1px; height: 16px; background: var(--line); margin: 0 6px; flex-shrink: 0; }
@media (max-width: 768px) { .index-bar { padding: 14px 18px; } .index-bar .ix { font-size: 15px; padding: 6px 9px; } }
.sort-toggle { padding: 0 32px 18px; display: flex; gap: 0; align-items: center; flex-wrap: wrap; }
.sort-toggle button { background: none; border: 0; padding: 12px 22px 14px 0; margin-right: 18px; color: var(--fg-faint); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; position: relative; transition: color 0.3s ease; }
.sort-toggle button:hover { color: var(--fg-dim); }
.sort-toggle button.active { color: var(--fg); }
.sort-toggle button.active::after { content: ''; position: absolute; left: 0; bottom: -1px; width: 100%; height: 2px; background: var(--accent); }
@media (max-width: 768px) { .sort-toggle { padding: 0 18px 14px; } .sort-toggle button { font-size: 11px; padding: 10px 18px 12px 0; margin-right: 12px; } }
.flat-section { padding: 36px 32px 56px; }
.flat-section .head { margin-bottom: 24px; color: var(--fg-faint); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; }
@media (max-width: 768px) { .flat-section { padding: 24px 18px 44px; } }
.group { padding: 48px 32px 56px; border-bottom: 1px solid var(--line); }
.group:last-child { border-bottom: 0; }
.group:target { scroll-margin-top: 78px; }
.group-head { display: flex; align-items: baseline; gap: 24px; margin-bottom: 32px; }
.group-letter { font-family: var(--font-serif); font-style: italic; font-size: clamp(64px,8vw,110px); color: var(--fg); line-height: 0.9; letter-spacing: -0.02em; flex-shrink: 0; }
.group-count { font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fg-faint); font-variant-numeric: tabular-nums; }
.group-count .n { font-family: var(--font-serif); font-style: italic; font-size: 18px; color: var(--accent); letter-spacing: -0.02em; margin-right: 4px; }
.name-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 28px; }
@media (max-width: 1199px) { .name-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .group { padding: 36px 18px 44px; } .group-head { margin-bottom: 24px; gap: 16px; } .name-grid { grid-template-columns: repeat(2, 1fr); gap: 2px 20px; } }
.name-link { position: relative; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 12px 0 12px 14px; color: var(--fg); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.3s, color 0.3s; }
.name-link::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%) scale(0); width: 5px; height: 5px; border-radius: 50%; background: var(--accent); transition: transform 0.3s var(--ease-out); }
.name-link:hover { border-bottom-color: var(--line); }
.name-link:hover::before { transform: translateY(-50%) scale(1); }
.name-link .nm { font-family: var(--font-myungjo); font-size: 18px; font-weight: 400; letter-spacing: -0.005em; transition: color 0.3s; }
.name-link:hover .nm { color: var(--accent); }
.name-link .ct { font-family: var(--font-serif); font-style: italic; font-size: 14px; color: var(--fg-faint); letter-spacing: -0.01em; font-variant-numeric: tabular-nums; flex-shrink: 0; }
@media (max-width: 768px) { .name-link { padding: 10px 0 10px 11px; } .name-link .nm { font-size: 16px; } .name-link .ct { font-size: 13px; } }
</style>
