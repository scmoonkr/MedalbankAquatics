<template>
  <div class="flex items-center">
    <template v-if="image && image.length > 0">
      <img :src="image" :alt="name" class="cell-athlete-photo-image w-[72px] h-[72px]" />
    </template>
    <template v-else>
      <div class="cell-athlete-photo-image w-[72px] h-[72px]" :class="(unregistered || !id || id === 0) ? 'bg-gray-200' : 'bg-black'" :style="(unregistered || !id || id === 0) ? { filter: `brightness(${0.4 + Math.random() * 0.4})`, opacity: 0.2 } : { filter: `brightness(${0.8 + Math.random() * 0.8})`, opacity: 0.4 }"></div>
    </template>
  </div>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: String,
  name: [String, Number],
  id: [String, Number],
  text: [String, Number],
  unregistered: Boolean
})

const resolvedImage = computed(() => {
  if (props.image && props.image.length > 0) return props.image
  if (props.unregistered) return '/images/athlete_unregistered.jpg'
  return '/images/athlete_registered.jpg'
})
</script>