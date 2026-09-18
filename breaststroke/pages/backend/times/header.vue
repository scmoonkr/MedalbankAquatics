<template>
	<div class="flex items-center space-x-3 mb-3">
      <input
				type="text"
				v-model="competitionID"
				required
				placeholder="cid"
				class="form-input w-[60px]"
        @keyup.enter="clickSearch"
			/>
      <input
				type="text"
				v-model="timeID"
				required
				placeholder="timeID"
				class="form-input w-[80px]"
        @keyup.enter="clickSearch"
			/>
      <input
				type="text"
				v-model="time"
				required
				placeholder="time"
				class="form-input w-[100px]"
        @keyup.enter="clickSearch"
			/>
      <input
				type="text"
				v-model="name"
				required
				placeholder="선수명"
				class="form-input w-[200px]"
        @keyup.enter="clickSearch"
			/>

      <button
				type="button"
				@click="clickSearch"
				class="upload-button w-[70px]"
				title="선수명 조회"
			>
        <strong>조회</strong>
      </button>
	</div>
  
  <div>
    <FilterTimes
      :options="timeStore.filter as TimeFilter"
      @change-discipline="onFilterChange"
    />
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
import FilterTimes from './filter_times.vue';
import type { TimeFilter } from '~/types/times';

const router = useRouter();

const authStore = useAuthStore();
const timeStore = useTimeStore();


const emit = defineEmits([
  'change-filter',
]);

// 상태 관리
const name = ref('');
const time = ref('');
const competitionID = ref('');
const timeID = ref('');

///########################################################
///########################################################
const onFilterChange = (options: any, field: string) => {
  timeStore.filter = options;
  if (JSON.stringify(timeStore.filter) !== JSON.stringify(options)) {
    timeStore.filter = options;
  }
	emit('change-filter', options, field);
}
const clickSearch = () => {
  if (timeID.value != "") {
  	onFilterChange({ timeID: timeID.value }, 'timeID');
    competitionID.value  = "";
  } else if (competitionID.value != "") {
  	onFilterChange({ competitionID: competitionID.value }, 'competitionID');
    competitionID.value  = "";
  } else if (time.value != "") {
  	onFilterChange({ time: time.value }, 'time');
    time.value  = "";
  } else {
  	onFilterChange({ name: name.value }, 'name');
    name.value = "";
  }
	console.log("clickSearch, ", timeStore.filter);
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