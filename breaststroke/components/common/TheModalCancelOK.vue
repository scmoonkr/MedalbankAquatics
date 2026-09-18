<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
        </div>
        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button 
            v-if="showCancelButton" 
            class="button-default button-cancel w-[80px]" 
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button 
            class="button-default button-confirm w-[80px]" 
            @click="handleOk"
          >
            {{ okText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { withDefaults, defineEmits } from 'vue';

interface Props {
  title?: string;
  message?: string;
  show: boolean;
  showCancelButton?: boolean;
  cancelText?: string;
  okText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  showCancelButton: true,
  cancelText: '취소',
  okText: '확인'
});

const emit = defineEmits(['update:show', 'cancel', 'ok']);

const handleCancel = () => {
  emit('cancel');
  emit('update:show', false);
};

const handleOk = () => {
  emit('ok');
  emit('update:show', false);
};
</script>

<style scoped>
/* 오버레이 전체 화면 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 모달 박스 */
.modal-box {
  background-color: white;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 모달 헤더 */
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

/* 제목 */
.modal-title {
  font-size: 18px;
  color: #333;
  font-weight: 600;
  margin: 0;
}

/* 본문 영역 */
.modal-body {
  padding: 20px;
}

/* 메시지 텍스트 */
.modal-message {
  font-size: 15px;
  color: #333;
  line-height: 1.5;
  margin: 0;
}

/* 푸터 영역 */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 기본 버튼 스타일 */
.button-default {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 취소 버튼 */
.button-cancel {
  background-color: #f2f2f2;
  color: #666;
  border: 1px solid #ddd;
}

.button-cancel:hover {
  background-color: #e5e5e5;
}

/* 확인 버튼 */
.button-confirm {
  background-color: #0d4fad;
  color: white;
  border: none;
}

.button-confirm:hover {
  background-color: #0b3f96;
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