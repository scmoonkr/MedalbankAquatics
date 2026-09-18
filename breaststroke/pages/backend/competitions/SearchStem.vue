<template>  
  <div v-if="stemList.length > 0" class="button-group-filters mt-4">
    <button v-for="stem in stemList" :key="stem.stemID" class="button-group-filters mt-1" @click="selectStem(stem)">
      {{ stem.stem }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
//-----> models
//-----> types
//-----> stores
import { useStemStore } from '~/stores/stems';
import { type StemModel } from '~/models/stems';
//-----> components

const stemStore = useStemStore();

//-----> 상태 관리
const isLoading = ref(false);
const stemList = ref<StemModel[]>([]);

const props = defineProps({
  stemName: {
    type: String,
    default: ''
  },
});

watch(() => props.stemName, async (name) => {
  try {
    isLoading.value = true;

    stemStore.filter.stem = name;
    // 실제 API 호출 (실제 구현 필요)
    await stemStore.fetchStemList(0, 1);
    stemList.value = stemStore.stemList;
  console.log("watch.stemName=", name, stemStore.stemList);
  } catch (error) {
    console.error('검색 오류:', error);
  } finally {
    isLoading.value = false;
  }
}, { deep: true, immediate: true }); // deep과 immediate 옵션 추가


const emit = defineEmits(['select-stem']);

// 수영장 선택 처리
const selectStem = (stem: any) => {
  stemList.value = []; // 결과 목록 닫기
  emit('select-stem', stem);
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