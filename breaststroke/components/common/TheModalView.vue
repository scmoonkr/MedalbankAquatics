<template>
  <Transition name="fade">
    <div v-if="show" class="detail-dialog-overlay">
      <div class="detail-dialog">
        <button @click="closeEditDialog" class="close-button">×</button>

        <div class="detail-header">
          <h2>{{ title }}</h2>
        </div>

        <div class="detail-content">
          <div v-for="(column, colIndex) in columns" class="detail-section">
            <div class="detail-item" v-if="!['checkbox', 'actions'].includes(column.key)">
              <span class="detail-label">{{ column.label }}:</span>
              <span class="detail-value">{{ (value as any)[column.key] }}</span>
            </div>
          </div>
        </div>

        <div class="detail-footer">
          <button @click="showEditItem(value)" class="detail-edit-button">편집</button>
          <button @click="closeEditDialog" class="detail-close-button">닫기</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { withDefaults, defineEmits } from 'vue';

// const value = ref(null);

interface Column {
  // 실제 컬럼 속성을 여기에 정의
  key: string;
  label: string;
  // 필요한 다른 속성들...
}

interface value {
  // 필요한 속성 정의
  [key: string]: any; // 또는 구체적인 타입 지정
}

interface Props {
  title: string;
  value?: value;
  columns?: Column[];
  show?: boolean;
  showCancelButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  value: () => ({}), // 함수로 반환
  columns: () => ([]), // 함수로 반환
  show: false,
  showCancelButton: true,
});
const emit = defineEmits(['update:show', 'cancel', 'edit']);

const closeEditDialog = () => {
  emit('cancel');
  emit('update:show', false);
};

const showEditItem = (value: any) => {
  emit('edit');
  emit('update:show', false);
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 20px;
}

/* 버튼 스타일 */
.edit-btn,
.delete-btn,
.view-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;
  color: white;
}

.edit-btn {
  background-color: #3498db;
}

.delete-btn {
  background-color: #e74c3c;
}

.view-btn {
  background-color: #2ecc71;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.view-btn:hover {
  background-color: #27ae60;
}

/* 편집 다이얼로그 스타일 */
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-dialog {
  background-color: white;
  width: 500px;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.edit-dialog h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
}

.cancel-button,
.confirm-button,
.delete-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #333;
}

.confirm-button {
  background-color: #3498db;
  color: white;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #d0d0d0;
}

.confirm-button:hover {
  background-color: #2980b9;
}

.delete-button:hover {
  background-color: #c0392b;
}

/* 상세 정보 다이얼로그 스타일 */
.detail-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.detail-dialog {
  background-color: white;
  width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  max-height: 85vh;
  overflow: auto;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  z-index: 2;
}

.close-button:hover {
  color: #333;
}

.detail-header {
  padding: 24px 24px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.detail-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.detail-status.활성 {
  background-color: #d4f8e8;
  color: #2ecc71;
}

.detail-status.비활성 {
  background-color: #ffe5e5;
  color: #e74c3c;
}

.detail-status.대기중 {
  background-color: #f5e3ca;
  color: #f39c12;
}

.detail-content {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 1.1rem;
  color: #34495e;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  padding-top: 7px;
  width: 80px;
  font-weight: 600;
  color: #555;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-memo {
  margin: 0;
  line-height: 1.5;
  color: #555;
}

.detail-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.detail-edit-button,
.detail-close-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.detail-edit-button {
  background-color: #3498db;
  color: white;
}

.detail-close-button {
  background-color: #e0e0e0;
  color: #333;
}

.detail-edit-button:hover {
  background-color: #2980b9;
}

.detail-close-button:hover {
  background-color: #d0d0d0;
}

.textarea-container {
  width: 100%;
  margin: 2rem 0;
  box-sizing: border-box;
  /* 내부 여백(패딩), 테두리를 총 너비에 포함 */
  font-family: sans-serif;
  /* border: 1px solid #ccc;    // 제거 */
  /* border-radius: 4px;        // 제거 */
  /* padding: 1rem;             // 필요에 따라 조정 가능 */
}

.textarea-container label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.textarea-container textarea {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  box-sizing: border-box;
}
input[type="checkbox"] {
  width: 18px;
  height: 18px;
}
.default-checkbox {
  -webkit-appearance: checkbox;
  appearance: checkbox;
  border-radius: 0;
}
</style><!-- pages/times/list.vue -->
