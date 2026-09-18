<template>  
  <div class="search-field">
    <input
      type="text"
      v-model="rawInputPool"
      @input="handlePoolInput"
      placeholder="미선택"
    />
    <button class="button-default button-search cursor-not-allowed" disabled>
      수영장
    </button>
  </div>
  <div v-if="searchPoolResults.length > 0" class="button-group-filters mt-4">
    <button v-for="pool in searchPoolResults" :key="pool.poolID" class="button-group-filters mt-1" @click="selectPool(pool)">
      {{ pool.name }}
    </button>
  </div>
  <!-- <div class="button-group-filters mt-4">
    <button class="font-medium button-group-filters-unselected'">
      미선택
    </button>
    <button class="font-medium button-group-filters-unselected'">
      33333
    </button>
    <button class="font-medium button-group-filters-unselected'">
      33333
    </button>
    <button class="font-medium button-group-filters-unselected'">
      33333
    </button>
  </div> -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
//-----> models
//-----> types
//-----> stores
import { usePoolStore } from '~/stores/pools';
//-----> components
import ButtonGroup from '~/components/common/TheButtonGroup.vue';

const poolStore = usePoolStore();

//-----> Interface
export interface PoolNames {
    name?: string;
    poolID?: number;
    sido: string
    course: string
}
//-----> 상태 관리
const selectedPool = ref({ name: '', poolID: 0 });
const isLoading = ref(false);
const rawInputPool = ref('');
const searchPoolResults = ref<PoolNames[]>([]);

const props = defineProps({
  poolName: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(['update-pool']);
// 수영장 선택 처리
const selectPool = (pool: any) => {
  selectedPool.value = pool;
  rawInputPool.value = pool.name;
  searchPoolResults.value = []; // 결과 목록 닫기
  emit('update-pool', pool);
};

const handlePoolInput = async (event: any) => {
  rawInputPool.value = event.target.value;
if (rawInputPool.value.length < 2) {
    searchPoolResults.value = [];
    return;
  }

  try {
    isLoading.value = true;

    // 실제 API 호출 (실제 구현 필요)
    await poolStore.fetchPoolNames(rawInputPool.value);
    searchPoolResults.value = poolStore.searchNames;
  } catch (error) {
    console.error('검색 오류:', error);
  } finally {
    isLoading.value = false;
  }
  // subtitle.value = makeSubtitle(rawInputTimeNew.value, dateValue.value, selectedPool.value);
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