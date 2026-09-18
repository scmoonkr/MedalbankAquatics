<template>
	<div class="flex items-center space-x-3">
      <input
				type="text"
				v-model="stemName"
				required
				placeholder="Stem"
				class="form-input w-[300px]"
			/>

      <button
				type="button"
				@click="clickSearch"
				class="upload-button w-[70px]"
				title="Stem 조회"
			>
        <strong>조회</strong>
      </button>
	</div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';


const emit = defineEmits([
  'change-name',
]);

// 상태 관리
const stemName = ref('');

///########################################################
///########################################################
const clickSearch = () => {
	emit('change-name', stemName.value);
}
</script>

<style scoped>
/* 필요한 스타일을 추가하세요 */
.times-list-page {
  width: 100%;
}

.form-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.upload-button,
.save-button,
.delete-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.upload-button {
  background-color: #c7f784;
  color: #333;
}

.save-button {
  background-color: #3498db;
  color: white;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.upload-button:hover {
  background-color: #d0d0d0;
}

.save-button:hover {
  background-color: #2980b9;
}

.delete-button:hover {
  background-color: #c0392b;
}

.toolbar-btn:last-child {
  border-right: none;
}

</style>