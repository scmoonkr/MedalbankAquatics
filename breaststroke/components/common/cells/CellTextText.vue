<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-text-text-text1">{{ text1 }}</div>
      <div class="cell-text-text-text2">{{ text2 }}</div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  text1: [String, Number],
  text2: [String, Number],
})
</script>
