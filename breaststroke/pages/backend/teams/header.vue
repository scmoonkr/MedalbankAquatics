<template>
	<div class="flex items-center space-x-3 mb-4">
      <input
				type="text"
				v-model="poolName"
				required
				placeholder="수영장명"
				class="form-input w-[300px]"
				@input="clickSearch"
			/>
      <button
				type="button"
				@click="clickSearch"
				class="upload-button w-[70px]"
				title="수영장명 조회"
			>
        <strong>조회</strong>
      </button>

      <!-- <button
				type="button"
				@click="clickSearch"
				class="upload-button w-[70px]"
				title="수영장명 조회"
			>
        <strong>조회</strong>
      </button>

			<FiltersButtons
				:filters="filters"
				@change-field="onFilterChange" /> -->
	</div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { TimeModel } from '~/models/times';
import { useTimeStore } from '~/stores/times';
import { useAuthStore } from '~/stores/useAuthStore';
//-----> types
import type { JsonOptions, FilterItem } from '~/types/common';

import FiltersButtons from '~/components/common/TheFilters.vue';

const router = useRouter();

const authStore = useAuthStore();
const timeStore = useTimeStore();


const emit = defineEmits([
  'change-filter',
]);

// 상태 관리
const poolName = ref('');
const selectedFile = ref<File | null>(null);

const filters = ref<FilterItem[]>([
  // { field: 'competition', selected: '2024 고양 전국마스터즈 수영대회', options: ['2024 고양 전국마스터즈 수영대회'] },
  { field: 'course', selected: '전체', options: ['전체', 'LCM', 'SCM'] },
  { field: 'sido', selected: '전국', options: ['전국', '서울', '부산', '인천', '경기', '대구', '광주', '울산', '대전', '세종', '제주', '강원', '충남', '충북', '경남', '경북', '전남', '전북', '해외'] },
]);

///########################################################
///########################################################
const onFilterChange = (field: string, value: string) => {
	emit('change-filter', field, value);
}
const clickSearch = () => {
	onFilterChange('name', poolName.value);
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