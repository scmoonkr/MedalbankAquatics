<template>
  <div class="cell-padding">
    <div class="flex items-center space-x-4">
      <div class="flex flex-col">
        <div class="cell-athlete-text-name text-[16px]" :class="(unregistered || !id || id === 0) ? 'opacity-10' : ''">
          <template v-if="unregistered">
            미등록
          </template>
          <template v-else>
            <span class="relative inline-block whitespace-nowrap text-[16px] font-bold">
              {{ name }}
              <span class="invisible select-none absolute">홍길동</span>
            </span>
          </template>
        </div>
        <div v-if="!unregistered && id && id !== 0" class="cell-athlete-text-text" :class="unregistered ? 'opacity-10' : 'opacity-40'">
          {{ text }}
        </div>
      </div>
    </div>
  </div>

</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: [String, Number],
  id: [String, Number],
  text: [String, Number],
  unregistered: Boolean
})
</script>