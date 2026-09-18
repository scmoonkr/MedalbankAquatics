<template>  
  <div v-if="searchPoolResults.length > 0" class="button-group-filters mt-4">
    <button v-for="pool in searchPoolResults" :key="pool.poolID" class="button-group-filters mt-1" @click="selectPool(pool)">
      {{ pool.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
//-----> models
//-----> types
//-----> stores
import { usePoolStore } from '~/stores/pools';
//-----> components

const poolStore = usePoolStore();

//-----> Interface
export interface PoolNames {
    name?: string;
    poolID?: number;
    sido: string
    course: string
}
//-----> 상태 관리
const isLoading = ref(false);
const searchPoolResults = ref<PoolNames[]>([]);

const props = defineProps({
  poolName: {
    type: String,
    default: ''
  },
});

watch(() => props.poolName, async (name) => {
  try {
    isLoading.value = true;

    // 실제 API 호출 (실제 구현 필요)
    await poolStore.fetchPoolNames(name);
    searchPoolResults.value = poolStore.searchNames;
  } catch (error) {
    console.error('검색 오류:', error);
  } finally {
    isLoading.value = false;
  }
}, { deep: true, immediate: true }); // deep과 immediate 옵션 추가


const emit = defineEmits(['select-pool']);

// 수영장 선택 처리
const selectPool = (pool: any) => {
  searchPoolResults.value = []; // 결과 목록 닫기
  emit('select-pool', pool);
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