<!-- index.vue -->
<template>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <TheBreadcrumb :menus="menus" />
  </TheSection>

  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <SearchCompetition 
      :competitionName="rawInputCompetition" 
      @update-competition="searchCompetition" 
    />
  </TheSection>
  <TheSpacer />

  
   <TheSection background="#ffffff,#ffffff" :narrow="true">
    <div class="flex gap-3">
      <input 
        type="text"
        v-model="competitionName"
        @input="onChangeCompetitionName"
        class="w-[500px] team-input"
        placeholder="대회명1" 
      />
      <input 
        type="text" 
        v-model="typeName" 
        class="w-[300px] team-input" 
        placeholder="데회기록 / 순위" 
      />
      
      <button 
        class="w-[100px] button-group-filters mt-1" 
        @click="handleDownload"
        :disabled="isDownloading"
      >
        <span v-if="!isDownloading">download</span>
        <span v-else>
          {{ downloadProgress.completed }}/{{ downloadProgress.total }}
        </span>
      </button>
      
      <!-- 디버깅 버튼 (선택사항) -->
      <button 
        class="w-[80px] button-group-filters mt-1 ml-2" 
        @click="debugLeaderboardList"
        style="font-size: 12px;"
      >
        debug
      </button>

      
    </div>
    
    <!-- 상세 진행상황 표시 -->
    <div v-if="isDownloading" class="mt-2 text-sm">
      <div class="text-gray-700">
        📊 컴포넌트: {{ downloadProgress.completed }}/{{ downloadProgress.total }} 완료
      </div>
      <div class="text-gray-600">
        🖼️ 예상 이미지: {{ downloadProgress.expected }}개 (stories + posts)
      </div>
      <div class="text-gray-500">
        ⏳ 각 컴포넌트당 2개 이미지 다운로드 중...
      </div>
    </div>
  </TheSection>

  <TheSpacer />

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- 필터 버튼 영역 -->
  <FilterTimes
    :options="leaderboardStore.filter"
    @change-discipline="onFilterChange"
    @change-capture="onCaptureChange"
  />

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <SectionLoading v-if="isLoading"></SectionLoading>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->

<TheSection :narrow="true" >
    
  <TheSpacer />
  competitionName: {{ competitionName }}
    
  </TheSection>
  <TheSpacer />


  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓stories▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <div class="flex flex-col gap-[10px]">
    <div class="overflow-x-auto w-full">
      <div class="flex gap-[10px]">
        <ViewImage
          v-for="(leaderboard, index) in leaderboardList" 
          :key="`${leaderboard.style}-${leaderboard.course}-${leaderboard.distance}`"
          :leaderboard="leaderboard"
          :times="leaderboard.times"
          :subtitle="competitionName"
          :adult="leaderboardStore.filter.adult"
          :imageType="captureType"
          :typeName="typeName"
          :datetime="currentDatetime"
          :triggerDownload="triggerDownload"
          @downloaded="onDownloadComplete"
        />
      </div>
    </div>
  </div>
  
  <TheSpacer />

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓posts▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- <div class="flex flex-col gap-[10px]">
    <div class="overflow-x-auto w-full">
      <div class="flex gap-[10px]">
        <ViewImage
          v-for="(leaderboard, index) in leaderboardList" 
          :key="`${leaderboard.style}-${leaderboard.course}-${leaderboard.distance}`"
          :leaderboard="leaderboard"
          :times="leaderboard.times"
          :subtitle="competitionName"
          :adult="leaderboardStore.filter.adult"
          imageType="posts"
          :typeName="typeName"
          :datetime="currentDatetime"
          :triggerDownload="triggerDownload"
          @downloaded="onDownloadComplete"
        />
      </div>
    </div>
  </div> -->

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
</template>


<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->

<script setup lang="ts">

definePageMeta({
  layout: 'backend',
});
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

import { usePageNavigation } from '~/composables/usePageNavigation';

import UI_CONFIG from '~/config/ui';
import type { LeaderboardFilter, LeaderboardStruct } from '~/types/leaderboard';

import { useAuthStore } from '~/stores/useAuthStore';
import { useLeaderboardStore } from '~/stores/leaderboard';
import TheBreadcrumb from '~/components/layout/TheBreadcrumb.vue';
import type { TimeModel } from '~/models/times';

import TheSection from '~/components/common/TheSection.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';

import TheSpacer from '~/components/common/TheSpacer.vue';

import SearchCompetition from './SearchCompetition.vue';
import ViewImage from './view_image.vue';
import { type CompetitionNames } from './SearchCompetition.vue';
import FilterTimes from './filter_times.vue';

const authStore = useAuthStore();
const leaderboardStore = useLeaderboardStore();

const route = useRoute();

// State management
const isLoading = ref(false);
const isDownloading = ref(false);
const captureType = ref('stories');
const competitionName = ref('');
const typeName = ref('대회기록');
const rowsPerPage = 100;
const currentPage = ref(1);
const triggerDownload = ref(0); // Use number instead of boolean
const competitionID = ref(0);
const currentDatetime = ref('');

const leaderboardList = ref<LeaderboardStruct[]>([]);
const pendingDownloads = ref(0);
const downloadProgress = ref({
  total: 0,
  completed: 0,
  expected: 0
});


const menus = [
  { menu: '리더보드', url: '/leaderboards' },
  { menu: '훈련기록/대회기록', url: '#' },
  { menu: '등록/비등록', url: '#' },
  { menu: '자유형', url: '#' },
  { menu: '50M', url: '#' },
  { menu: 'LCM', url: '#' },
];

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  isLoading.value = true;
  try {
    isLoading.value = true;

    // 초기 필터 설정
    leaderboardStore.filter.ageGroup = '';
    leaderboardStore.filter.sido = '';
    competitionID.value = 0;

    leaderboardStore.filter.adult = route.query.adult ? route.query.adult as string : '전체';
    leaderboardStore.filter.masters = route.query.masters ? route.query.masters as string : '비등록';
    leaderboardStore.filter.typeTime = route.query.typeTime ? route.query.typeTime as string : 'eventResult';
    leaderboardStore.filter.gender = route.query.gender ? route.query.gender as string : 'women';
    // leaderboardStore.filter.style = route.query.style ? route.query.style as string : 'breaststroke';
    // leaderboardStore.filter.course = route.query.course ? route.query.course as string : 'LCM';
    // leaderboardStore.filter.distance = route.query.distance ? route.query.distance as string : '50M';

    currentPage.value = 1;

    onFilterChange(leaderboardStore.filter);
  } catch (error) {
    console.error("데이터 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
}

// 컴포저블 함수 사용
// history back시 onMount 처리
usePageNavigation(loadServerData);
///########################################################
///########################################################

const selectedCompetition = ref<Partial<CompetitionNames>>({});
const rawInputCompetition = ref('');

const onChangeCompetitionName = (event: any) => {
  competitionName.value = event.target.value;
}
const searchCompetition = async (competition: any) => {
  selectedCompetition.value = competition;
  rawInputCompetition.value = competition.fullname;
  competitionName.value = competition.fullname;
  competitionID.value = competition.competitionID;

  leaderboardStore.filter.competitionID = competitionID.value;
  await onFilterChange(leaderboardStore.filter);

};
//--------------------------------------------
// 필터 변경 처리
//--------------------------------------------
// const pageTitle = ref('');
const pageTitle = computed(() => {

	let title = leaderboardStore.filter.masters;
	title += " " + leaderboardStore.filter.adult + "부";

  // let title = leaderboardStore.filter.masters == "masters" ? "비등록" : "등록";
  const typeTime = leaderboardStore.filter.typeTime;
  leaderboardStore.filter.typeTime = "";
  title += ' ' + makeTimesTitle(leaderboardStore.filter);
  title += ' ' + typeName.value;
  leaderboardStore.filter.typeTime = typeTime;
  return title;
});

// 실제 렌더링될 컴포넌트 수 계산
const getActualComponentCount = () => {
  // 조건부 렌더링을 고려한 실제 개수 계산
  return leaderboardList.value.filter(leaderboard => {
    // v-if 조건과 동일한 조건으로 필터링
    return leaderboard && 
           leaderboard.times && 
           leaderboard.times.length > 0;
  }).length;
};

const handleDownload = async () => {
  if (isDownloading.value || leaderboardList.value.length === 0) return;
  
  try {
    isDownloading.value = true;
    
    // 실제 렌더링되는 컴포넌트 수 계산
    const actualComponents = getActualComponentCount();
    const expectedImages = actualComponents * 2; // stories + posts
    
    downloadProgress.value = {
      total: actualComponents,
      completed: 0,
      expected: expectedImages,
      actualDownloaded: 0
    };
    
    // 렌더링된 컴포넌트 목록 로깅
    const renderedComponents = leaderboardList.value
      .filter(lb => lb && lb.times && lb.times.length > 0)
      .map(lb => `${lb.style}-${lb.course}-${lb.distance}`);
    
    // DOM 준비 대기
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 다운로드 트리거
    triggerDownload.value++;
    
  } catch (error) {
    console.error('❌ 다운로드 초기화 오류:', error);
    isDownloading.value = false;
    downloadProgress.value = { total: 0, completed: 0, expected: 0, actualDownloaded: 0 };
  }
};

const onDownloadComplete = () => {
  downloadProgress.value.completed++;
  
  // 모든 컴포넌트 다운로드 완료 확인
  if (downloadProgress.value.completed >= downloadProgress.value.total) {
    // 약간의 지연 후 최종 카운트 확인
    setTimeout(() => {
      checkFinalDownloadCount();
    }, 3000); // 3초 후 확인
  }
};

// 최종 다운로드 개수 확인
const checkFinalDownloadCount = () => {
  // 다운로드 폴더에서 실제 파일 개수를 확인할 수는 없지만,
  // 로그를 통해 성공한 다운로드 개수를 추정
  const estimatedDownloads = downloadProgress.value.completed * 2; // 각 컴포넌트당 2개
    
  // 상태 초기화
  isDownloading.value = false;
  setTimeout(() => {
    downloadProgress.value = { total: 0, completed: 0, expected: 0, actualDownloaded: 0 };
  }, 2000);
};

// 디버깅을 위한 리더보드 목록 확인 함수
const debugLeaderboardList = () => {
  
  leaderboardList.value.forEach((lb, index) => {
    const hasData = lb && lb.times && lb.times.length > 0;
  });
  
  const actualCount = getActualComponentCount();
};

// buildLeaderboard 함수 개선
const buildLeaderboard = () => {
  leaderboardList.value = [];
  
  const styles = ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"];
  const courses = ["LCM", "SCM"];
  const distances = ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"];
  console.log("++++++++++++++++++++++++++++++++++++ leaderboardStore.leaderboardList:", leaderboardStore.leaderboardList);
  if (leaderboardStore.leaderboardList.length == 0) {
    alert("리더보드 데이터가 없습니다.");
    return;
  }
  
  let totalFound = 0;
  
  for (const style of styles) {
    for (const course of courses) {
      for (const distance of distances) {
        const times = leaderboardStore.leaderboardList.filter(el => 
          el.style === style && 
          el.course === course && 
          el.distance === distance
        );
        const timeSorted = sortAndRankTimes((times));
        if (times.length > 0) {
          leaderboardList.value.push({
            isMasters: times[0].isMasters,
            isAdult: times[0].isAdult,
            gender: times[0].gender,
            type: times[0].type,
            style: times[0].style,
            course: times[0].course,
            distance: times[0].distance,
            times: timeSorted,
          });
          totalFound++;
        } else {
        }
      }
    }
  }
  
  leaderboardList.value = leaderboardList.value; // .slice(0, 3)
  
  // 디버깅 정보 출력
  debugLeaderboardList();
};
const onCaptureChange = async (value: string) => {
  console.log("onCaptureChange=", value);
  captureType.value = value;
};
const onFilterChange = async (newFilters: LeaderboardFilter) => {
  isLoading.value = true;
  
  leaderboardStore.filter.competitionID = newFilters.competitionID || 0;
  leaderboardStore.filter.gender = newFilters.gender;
  // leaderboardStore.filter.style = newFilters.style;
  // leaderboardStore.filter.course = newFilters.course;
  // leaderboardStore.filter.distance = newFilters.distance;
  leaderboardStore.filter.typeTime = newFilters.typeTime;
  leaderboardStore.filter.masters = newFilters.masters;
  leaderboardStore.filter.adult = newFilters.adult;
  typeName.value = newFilters.typeTime! == "eventResult" ? "대회기록" : "훈련기록";
console.log("onFilterChange.filter=", leaderboardStore.filter);

  try {
    leaderboardStore.filter = newFilters;
    await leaderboardStore.fetchCaptureList(currentPage.value, rowsPerPage);
    buildLeaderboard();

    currentDatetime.value = (competitionID.value > 0 ? leaderboardStore.leaderboardList[0].datetime || '' : '');
  } catch (error) {
    console.error("필터 적용 중 오류:", error);
  } finally {
    isLoading.value = false;
  }
}

// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
</script>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<style scoped></style>
