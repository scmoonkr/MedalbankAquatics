<template>
  <div class="cell-padding">
    <div class="flex items-center space-x-4">
      <template v-if="image && image.length > 0">
        <img :src="image" class="cell-athlete-text-image" :alt="name" />
      </template>
      <template v-else>
        <div class="cell-athlete-text-image" :style="{ backgroundColor: unregistered ? '#e5e7eb' : darkColor }"></div>
      </template>

      <div class="flex flex-col">
        <div class="cell-athlete-text-name" :class="unregistered ? 'opacity-10' : ''">
          <template v-if="unregistered">
            미등록<span class="cell-athlete-text-id opacity-0">#33333</span>
          </template>
          <template v-else>
            <span class="relative inline-block whitespace-nowrap min-w-[112px]">
              {{ name }}<span class="cell-athlete-text-id !text-gray-400">#{{ id }}</span>
              <span class="invisible select-none absolute">홍길동#33333</span>
            </span>
          </template>
        </div>
        <div class="cell-athlete-text-text" :class="unregistered ? 'opacity-10' : 'opacity-40'">
          {{ text1 }} | {{ text2 }}
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: String,
  name: [String, Number],
  id: [String, Number],
  text1: [String, Number],
  text2: [String, Number],
  unregistered: Boolean
})

// athleteID 기반 고정 어두운 컬러 생성
const darkColor = computed(() => {
  const hash = [...String(props.id)].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hue = hash % 360
  const saturation = 40 + (hash % 30)       // 40~70%
  const lightness = 10 + (hash % 15)        // 10~25%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
})
</script>
