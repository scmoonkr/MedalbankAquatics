<script setup lang="ts">
// 경로 기반 필터 URL 지원 — e.g. /men/breaststroke/50/lcm/
// 인식된 세그먼트를 query param으로 변환해 index(/)로 리다이렉트

const route = useRoute()
const slug  = (route.params.slug as string[]) ?? []

const GENDER: Record<string, string> = {
  men: 'm', m: 'm', male: 'm',
  women: 'f', f: 'f', female: 'f', woman: 'f',
}
const STROKE: Record<string, string> = {
  breaststroke: 'breast', breast: 'breast',
  freestyle: 'free', free: 'free',
  backstroke: 'back', back: 'back',
  butterfly: 'fly', fly: 'fly',
  im: 'im', medley: 'im', individualmedley: 'im',
}
const COURSE: Record<string, string> = {
  lcm: 'lcm', long: 'lcm',
  scm: 'scm', short: 'scm',
}
const DIVISION: Record<string, string> = {
  elite: 'elite', 전문체육: 'elite',
  masters: 'masters', 마스터즈: 'masters',
  all: 'all', 전체: 'all',
}

const q: Record<string, string | number> = {}
for (const seg of slug) {
  const s = seg.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')
  if (GENDER[s])   { q.gender = GENDER[s]; continue }
  if (STROKE[s])   { q.stroke = STROKE[s]; continue }
  if (COURSE[s])   { q.course = COURSE[s]; continue }
  if (DIVISION[s]) { q.division = DIVISION[s]; continue }
  const n = parseInt(s, 10)
  if (!isNaN(n) && n > 0) { q.distance = n; continue }
}

await navigateTo({ path: '/', query: q }, { replace: true })
</script>

<template><div></div></template>
