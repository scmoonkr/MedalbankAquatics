<template>
  <div class="cell-padding">
    <div class="flex flex-col" :class="error ? 'bg-red-500 text-white' : ''">
      <div class="cell-text bg-transparent">
        {{ text }}
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  text: [String, Number],
  error: Boolean, // 오류 표시용 boolean prop
})
</script>