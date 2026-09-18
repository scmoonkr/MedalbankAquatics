<template>
  <Transition name="fade">
    <div v-if="show" class="tooltip-dialog-overlay" @click.self="close(false)">
      <div class="tooltip-dialog-box">
        <p class="tooltip-dialog-message">{{ message }}</p>
        <button class="button-default button-confirm" @click="close(false)">확인</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const props = defineProps<{
  message: string;
  show: boolean;
}>();

const emit = defineEmits(['update:show']);

const close = (value: boolean) => {
  emit('update:show', value);
};
</script>

<style scoped>

</style>
