<template>
  <!-- 검색 섹션 -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <!-- <SearchCompetition :competitionName="rawInputCompetition" @update-competition="searchCompetition" /> -->

    <!-- <div v-if="searchCompetitionResults.length > 0" class="button-group-filters mt-4">
      <button v-for="competition in searchCompetitionResults" :key="competition.competitionID" class="button-group-filters mt-1" @click="clickCompetition(competition)">
        {{ competition.competitionName }}
      </button>
    </div> -->
    <TheSpacer size="xs" />
    <FiltersButtons :filters="filters" @change-field="onFilterChange" />
  </TheSection>

  <!-- 이미지 섹션 -->
  <TheSection :title="sectionTitle" subtitle="" background="#ffffff,#ffffff" :narrow="false">
    <div class="grid gap-1" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
      <div v-for="(file, index) in selectedFiles" :key="file.imageID" class="overflow-hidden bg-black">
        <img :src="file.medium" :alt="file.name" :class="[
          'w-full h-[140px] transition-all duration-300 cursor-pointer',
          isPortrait(file) ? 'object-contain' : 'object-cover'
        ]" loading="lazy" @click="openLightbox(index)" />
      </div>
    </div>

    <!-- 커스텀 Lightbox -->
    <div v-if="lightboxVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" @click="closeLightbox">
      <div class="relative max-w-full max-h-full" @click.stop>
        <!-- 이미지 -->
        <img 
          :src="currentLightboxImage" 
          :alt="`Image ${lightboxIndex + 1}`"
          class="max-w-full max-h-screen object-contain"
        />
        
        <!-- 닫기 버튼 -->
        <button 
          @click="closeLightbox"
          class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors"
        >
          ×
        </button>
        
        <!-- 이전/다음 버튼 -->
        <button 
          v-if="lightboxIndex > 0"
          @click="previousImage"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors"
        >
          ‹
        </button>
        
        <button 
          v-if="lightboxIndex < selectedFiles.length - 1"
          @click="nextImage"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors"
        >
          ›
        </button>
        
        <!-- 이미지 카운터 -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
          {{ lightboxIndex + 1 }} / {{ selectedFiles.length }}
        </div>
      </div>
      
      <!-- 원본 저장 버튼 -->
      <a 
        v-if="currentOriginalImage" 
        :href="currentOriginalImage" 
        target="_blank" 
        download 
        class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-black rounded px-4 py-2 text-base font-semibold shadow-lg transition duration-300 opacity-80 hover:opacity-100"
        @click.stop
      >
        원본 저장하기
      </a>
    </div>
  </TheSection>

  <!-- 툴피 -->
  <TheTooltipDialog :show="showTooltip" message="대회를 선택하세요" @update:show="showTooltip = $event" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { JsonOptions, FilterItem } from '~/types/common';
import { useImageBBStore } from '~/stores/imgbb';
import TheSection from '~/components/common/TheSection.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
import SearchCompetition from './SearchCompetition.vue';
import FiltersButtons from '~/components/common/TheFilters.vue';

const imageBBStore = useImageBBStore();
const isStoreReady = ref(false);
const showTooltip = ref(false);
const selectedCompetition = ref<any>({});
const rawInputCompetition = ref('');
const imageFiles = ref([]);
const selectedFiles = ref([]);
const searchCompetitionResults = ref([]);
const filters = ref<FilterItem[]>([
  { field: 'competition', selected: '', options: [''] },
  { field: 'style', selected: '전체', options: ['전체', '자유형', '배영', '평영', '접영', '하이라이트', '기타'] },
]);
const isLoading = ref(false);
const options = ref<JsonOptions>({ style: '전체' });

// Lightbox 상태
const lightboxVisible = ref(false);
const lightboxIndex = ref(0);

// computed로 안정화
const sectionTitle = computed(() => selectedCompetition.value?.competitionName || '');

const currentLightboxImage = computed(() => {
  if (!selectedFiles.value.length || lightboxIndex.value < 0 || lightboxIndex.value >= selectedFiles.value.length) {
    return '';
  }
  return selectedFiles.value[lightboxIndex.value]?.medium || '';
});

const currentOriginalImage = computed(() => {
  if (!selectedFiles.value.length || lightboxIndex.value < 0 || lightboxIndex.value >= selectedFiles.value.length) {
    return '';
  }
  return selectedFiles.value[lightboxIndex.value]?.url || '';
});

const openLightbox = (index: number) => {
  lightboxIndex.value = index;
  lightboxVisible.value = true;
  document.body.style.overflow = 'hidden'; // 스크롤 방지
};

const closeLightbox = () => {
  lightboxVisible.value = false;
  lightboxIndex.value = 0;
  document.body.style.overflow = ''; // 스크롤 복원
};

const nextImage = () => {
  if (lightboxIndex.value < selectedFiles.value.length - 1) {
    lightboxIndex.value++;
  }
};

const previousImage = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--;
  }
};

// 키보드 이벤트
const handleKeydown = (event: KeyboardEvent) => {
  if (!lightboxVisible.value) return;
  
  switch (event.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      previousImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
  }
};

const isPortrait = (file: any) => {
  return file?.height > file?.width;
};

const filterImages = () => {
  if (!imageFiles.value.length) return;
  
  selectedFiles.value = imageFiles.value.filter(file => {
    return (file.style === options.value.style || options.value.style === '전체');
  });
};

const searchCompetition = async (competition: any) => {
  selectedCompetition.value = competition;
  rawInputCompetition.value = competition.fullname;
  const result = await imageBBStore.fetchImageList(competition, { type: 'medium', ...options.value });
  
  imageFiles.value = result.data;
  filterImages();
};

const clickCompetition = async (competition: any) => {
  await searchCompetition(competition);
};

const onFilterChange = async (field: string, value: string) => {
  try {
    switch (field) {
      case 'style':
        options.value.style = getStyleEngByKor(value);
        break;
      case 'competition':
        // showTooltip.value = true;
        const competition = searchCompetitionResults.value.find(el => el.competitionName == value);
        await clickCompetition(competition);

        return;
      default:
        options.value[field] = value;
        break;
    }
    filterImages();
  } catch (error) {
    console.error('필터 오류:', error);
  }
};

onMounted(() => {
  try {
    imageBBStore.initialize();
    isStoreReady.value = true;
    loadServerData();
    
    // 키보드 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeydown);
  } catch (error) {
    console.error('스토어 초기화 실패:', error);
  }
});

onUnmounted(() => {
  // 키보드 이벤트 리스너 제거
  document.removeEventListener('keydown', handleKeydown);
  // 스크롤 복원
  document.body.style.overflow = '';
});

const loadServerData = async () => {
  const result = await imageBBStore.fetchCompetitionList();
  if (result.data.length == 0) return;
  searchCompetitionResults.value = result.data;
  filters.value[0].selected = result.data[0].competitionName;
  filters.value[0].options = result.data.map(el => el.competitionName);
  await clickCompetition(result.data[0]);
  isLoading.value = false;
};
</script>