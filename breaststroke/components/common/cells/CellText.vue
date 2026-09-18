<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-text" :class="opacity ? 'opacity-20' : 'opacity-100'">
        {{ text }}
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  text: [String, Number],
  opacity: Boolean, // 불투명도 조절용 boolean prop
})
</script>