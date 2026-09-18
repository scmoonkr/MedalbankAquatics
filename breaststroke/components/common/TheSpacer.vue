<template>
  <div :class="computedClass"></div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  size: {
    type: String,
    default: ''
  }
});

const computedClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'spacer-xs';
    case 'sm':
      return 'spacer-sm';
    case 'md':
      return 'spacer';
    case 'lg':
      return 'spacer-lg';
    case 'xl':
      return 'spacer-xl';
    case 'huge':
      return 'spacer-huge';
    default:
      return 'spacer';
  }
});
</script>