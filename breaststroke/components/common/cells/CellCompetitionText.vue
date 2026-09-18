<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-competition-text-competition" :class="(unregistered || opacity) ? 'opacity-10' : ''">
        {{ competition }}
      </div>
      <div class="cell-competition-text-text" :class="(unregistered || opacity) ? 'opacity-10' : 'opacity-40'">
        {{ text }}
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  competition: [String, Number],
  text: [String, Number],
  opacity: Boolean,
  unregistered: Boolean,
})
</script>