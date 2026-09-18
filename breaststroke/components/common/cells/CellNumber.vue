<template>
  <div class="cell-padding">
    <div class="flex flex-col">
      <div class="cell-number font-mono" :class="opacity ? 'opacity-10' : ''">
        {{ number }}
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
interface Props {
  number: string | number
  opacity?: boolean
}

// const { number, opacity } = withDefaults(defineProps<Props>(), {
//   opacity: false,
// })
const { number, opacity = false } = defineProps<Props>()
</script>