<template>  
  <div v-if="searchAthleteResults.length > 0" class="button-group-filters mt-4">
    <button v-for="athlete in searchAthleteResults" :key="athlete.athleteID" class="button-group-filters mt-1" @click="selectAthlete(athlete)">
      {{ athlete.name }}#{{ athlete.athleteID }}{{ athlete.gender.slice(0,2) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
//-----> models
//-----> types
//-----> stores
import { useAthleteStore } from '~/stores/athletes';
//-----> components

const athleteStore = useAthleteStore();

//-----> Interface
export interface AthleteNames {
    name?: string;
    athleteID?: number;
    gender: string
}
//-----> 상태 관리
const isLoading = ref(false);
const searchAthleteResults = ref<AthleteNames[]>([]);

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
});

watch(() => props.name, async (name) => {
  try {
    isLoading.value = true;

    // 실제 API 호출 (실제 구현 필요)
    // await athleteStore.searchAthleteNames(name);
    // searchAthleteResults.value = athleteStore.searchNames;
  } catch (error) {
    console.error('검색 오류:', error);
  } finally {
    isLoading.value = false;
  }
}, { deep: true, immediate: true }); // deep과 immediate 옵션 추가


const emit = defineEmits(['select-athlete']);

// 수영장 선택 처리
const selectAthlete = (athlete: any) => {
  searchAthleteResults.value = []; // 결과 목록 닫기
  emit('select-athlete', athlete);
};
</script>

<style scoped>
.search-field {
  display: flex;
  width: 100%;
  overflow: hidden;
}

.search-field input {
  flex: 1;
  padding: 1rem 1.4rem;
  border: none;
  outline: none;
  font-size: 16px;
  color: #000000;
  background-color: rgba(0, 0, 0, 0.03);
}

.search-field input::placeholder {
  color: #aaa;
  font-size: 14px;
}

.button-search {
  @apply bg-gray-200 text-gray-400;
  padding: 0 24px;
}

</style>