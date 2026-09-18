<template>
	<TheSection background="#ffffff,#ffffff" :narrow="true">
		<TheBreadcrumb :menus="menus" />
	</TheSection>
  <!-- 검색 섹션 -->
  <TheSection title="youtube" background="#ffffff,#ffffff" :narrow="true">
    <FiltersButtons 
      :filters="filters" 
      @change-field="onFilterChange" 
      class="mb-5"
    />

    <div class="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="(youtube, index) in youtubeStore.youtubeList" :key="index">
        <div @click="clickYoutube(youtube)">
          <TheBookCard :youtube="youtube" />
        </div>
      </div>
    </div>

    <div class="fjustify-center">
      <ThePagination
        :currentPage="currentPage"
        :totalPages="youtubeStore.pagination.totalPages"
        maxVisiblePages="5"
        @page-change="changeChapter" />
    </div>
  </TheSection>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { type IYoutubeData } from '~/types/youtube';
import { useYoutubeStore } from '~/stores/youtube';
import { YoutubeModel } from '~/models/youtube';
import { getYoutubeFilters } from '~/utils/swimStyles';
import type { JsonOptions, FilterItem } from '@/types/common';
import TheSection from '@/components/common/TheSection.vue';
import ThePagination from '@/components/common/ThePagination.vue';
import FiltersButtons from '@/components/common/TheFilters.vue';
import TheBookCard from './TheBookCard.vue';
// import TheGallery from './TheGallery.vue';

definePageMeta({
  layout: 'simplified'
});

const route = useRoute();
const router = useRouter();
// ============================
// 스토어 및 상태 관리 (반응성 수정)
// ============================
const youtubeStore = useYoutubeStore();


const menus = ref([
	{ label: '홈', path: '/' },
	{ label: '선수명단', path: '/athletes' },
])

// 필터 설정
const filters = ref<FilterItem[]>([
  { field: 'isRegistered', selected: '등록+비등록', options: ['등록+비등록', '등록', '비등록'] },
  { field: 'gender', selected: '남자+여자', options: ['남자+여자', '남자', '여자'] },
  { field: 'discipline', selected: '평영', options: ['평영', '자유형', '배영', '접영', 'FL', 'IM'] },
  { field: 'distance', selected: '50M', options: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'] },
  { field: 'course', selected: 'LCM', options: ['LCM', 'SCM'] },
  { field: 'classCode', selected: '그룹전체', options: ['그룹전체', '유년부', '초등부', '중등부', '고등부', '대학부', '일반부', '성인부'] },
]);
// sRegistered 등록+비등록 등록 비등록 (기본 등록+비등록)
// gender 남여전체 남자 여자 (기본 남여전체)
// distance 25 50 100 200 400 800 1500 (기본 50)
// course LCM SCM (기본 LCM)
// class 그룹전체 유년부 초등부 중등부 고등부 대학부 일반부 성인부 (기본 그룹전체)
const isLoading = ref(false);

const youtubeList = ref<YoutubeModel[]>([]);
///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  isLoading.value = true;
  try {
    isLoading.value = true;
    youtubeStore.filter ={
      isRegistered: "등록",
      gender: "",
      discipline: "BR",
      course: "LCM",
      distance: "50M",
      classCode: "",

    };
    // await youtubeStore.fetchYoutubeList(1); 
    // youtubeList.value.push(youtubeStore.currentYoutube as YoutubeModel);
    // youtubeList.value.push(youtubeStore.currentYoutube as YoutubeModel);
    // youtubeList.value.push(youtubeStore.currentYoutube as YoutubeModel);

    youtubeStore.pagination.rowsPerPage = 24;
    await youtubeStore.fetchYoutubeList(1, youtubeStore.pagination.rowsPerPage); 
    youtubeList.value = youtubeStore.youtubeList;

    console.log("months=", youtubeStore.months);
    filters.value.push(  { field: 'datetime', selected: '전체', options: youtubeStore.months },);

    isLoading.value = false;
  } catch (error) {
    console.error("데이터 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
}

const currentPage = ref(1);
const changeChapter = (page: number) => {
  currentPage.value = page;
  youtubeStore.fetchYoutubeList(page, youtubeStore.pagination.rowsPerPage);
}
// 컴포저블 함수 사용
// history back시 onMount 처리
usePageNavigation(loadServerData);

const clickSmartStore = (url: string) => {
  console.log("click smart store.", url);
  // router.push(url)
}
const clickYoutube = (youtube: YoutubeModel) => {
  console.log("click youtube row.", youtube);
  // router.push(youtube.href)
  // window.open(youtube.href, '_blank');
}

const onFilterChange = async (field: string, value: string) => {
  
    youtubeStore.filter[field] = getYoutubeFilters(field, value);
    console.log("onFilterChange=", field, value, youtubeStore.filter);
    
    await youtubeStore.fetchYoutubeList(1, youtubeStore.pagination.rowsPerPage); 
    console.log("months=", youtubeStore.months);
}
// ============================
// 계산된 값들 (반응성 수정)
// ============================
</script>

<style scoped>
</style>