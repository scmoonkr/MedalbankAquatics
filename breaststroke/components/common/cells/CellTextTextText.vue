<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-text-text-text1" :class="unregistered ? 'opacity-10' : 'opacity-80'">{{ text1 }}</div>
      <div class="cell-text-text-text2" :class="unregistered ? 'opacity-10' : 'opacity-60'">{{ text2 }}</div>
      <div class="cell-text-text-text3" :class="unregistered ? 'opacity-10' : 'opacity-40'">{{ text3 }}</div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  text1: [String, Number],
  text2: [String, Number],
  text3: [String, Number],
  unregistered: Boolean,
})
</script>
