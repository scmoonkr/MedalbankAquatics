<template>
  <Transition name="fade">
    <div v-if="show" class="tooltip-dialog-overlay" @click.self="close(false)">
      <div class="tooltip-dialog-box">
        <p class="tooltip-dialog-message">{{ message }}</p>
        <button class="button-default button-cancel mr-2" @click="close(true)">{{ props.button || '확인' }}</button>
        <button class="button-default button-cancel" @click="close(false)">취소</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const props = defineProps<{
  message: string;
  button?: string,
  show: boolean;
}>();

const emit = defineEmits(['update:show']);

const close = (value: boolean) => {
  emit('update:show', value);
};
</script>

<style scoped>
/* 오버레이 전체 화면 */
.tooltip-dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 모달 박스 */
.tooltip-dialog-box {
  background-color: white;
  padding: 20px 24px;
  /* border-radius: 12px; */
  width: 90%;
  max-width: 320px;
  /* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); */
}

/* 안내 문구 */
.tooltip-dialog-message {
  font-size: 15px;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* 확인 버튼 */
.button-default.button-confirm {
  padding: 10px 20px;
  font-size: 14px;
  background-color: #0d4fad;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button-default.button-confirm:hover {
  background-color: #0b3f96;
}

/* 확인 버튼 */
.button-default.button-cancel {
  @apply bg-gray-200 text-gray-800;
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button-default.button-cancel:hover {
  @apply bg-gray-100 text-gray-800;
}

/* 페이드 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
