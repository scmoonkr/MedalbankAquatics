<template>
  <!-- 검색 섹션 -->
  <TheSection title="items" background="#ffffff,#ffffff" :narrow="true">
    <FiltersButtons 
      :filters="filters" 
      @change-field="onFilterChange" 
      class="mb-5"
    />
  <div class="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="(item, index) in itemList" :key="index" class="flex mb-10">
        <div class="flex gap-[20px]" @click="clickItem(item)">
          <TheGallery :item="item" />
        </div>
      </div>
    </div>
  </TheSection>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { type Item } from '~/types/items';
import { useItemStore } from '~/stores/items';
import { ItemModel } from '~/models/items';
import type { JsonOptions, FilterItem } from '@/types/common';
import TheSection from '@/components/common/TheSection.vue';
import FiltersButtons from '@/components/common/TheFilters.vue';
// import TheGallery from './TheGallery.vue';
import TheGallery from './TheBookCard.vue';

definePageMeta({
  layout: 'simplified'
});

const route = useRoute();
const router = useRouter();
// ============================
// 스토어 및 상태 관리 (반응성 수정)
// ============================
const itemStore = useItemStore();


// 필터 설정
const filters = ref<FilterItem[]>([
  { field: 'type', selected: 'Type전체', options: ['Type전체', 'Originals', 'Studio', "Lab", "Recommendations"] },
  { field: 'brand', selected: 'Brand전체', options: ['Brand전체', 'Medalbank', 'FrogSpit', 'SportCount', 'SAMMY', "Speedo", "Arena"] },
  { field: 'category', selected: 'Category전체', options: ['Category전체', 'Meshcaps', 'Collections'] },
]);

const isLoading = ref(false);

const itemList = ref<ItemModel[]>([]);
///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  isLoading.value = true;
  try {
    isLoading.value = true;
    
    // await itemStore.fetchItemList(1); 
    // itemList.value.push(itemStore.currentItem as ItemModel);
    // itemList.value.push(itemStore.currentItem as ItemModel);
    // itemList.value.push(itemStore.currentItem as ItemModel);

    
    await itemStore.fetchItemList(); 
    itemList.value = itemStore.itemList;

    isLoading.value = false;
  } catch (error) {
    console.error("데이터 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
}

// 컴포저블 함수 사용
// history back시 onMount 처리
usePageNavigation(loadServerData);

const clickSmartStore = (url: string) => {
  console.log("click smart store.", url);
  // router.push(url)
}
const clickItem = (item: ItemModel) => {
  console.log("click item row.", item);
  router.push(`/MB/items/view/${item.itemID}`)
}

const onFilterChange = (field: string, value: string) => {
  console.log("onFilterChange.", field, value);
}
// ============================
// 계산된 값들 (반응성 수정)
// ============================
</script>

<style scoped>
</style>