<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-text-discipline-text1 text-[16px] font-bold">{{ text1 }}</div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  text1: [String, Number],
})
</script>
