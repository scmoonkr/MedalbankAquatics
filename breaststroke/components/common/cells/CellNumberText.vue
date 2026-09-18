<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-number-text-number">{{ number }}</div>
      <div class="cell-number-text-text">{{ text }}</div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  number: [String, Number],
  text: [String, Number],
})
</script>
