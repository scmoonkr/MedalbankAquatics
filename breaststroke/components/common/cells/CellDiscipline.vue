<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-text-discipline-text1">{{ text1 }}</div>
      <div class="cell-text-discipline-text2">{{ text2 }}</div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  text1: [String, Number],
  text2: [String, Number],
})
</script>
