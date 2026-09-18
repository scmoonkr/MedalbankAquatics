<!-- pages/leaderboard/index.vue -->
<template>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <TheBreadcrumb :menus="menus" />
  </TheSection>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <SectionSearch
      :setFocus="setFocus"
      initial-value="문성중 문성태 고희경"
      @changed-field="onChangedField"
      @click-search="onClickSearch" />
      <!-- <button @click="copyToClipboard">
        clipboard
      </button> -->
  </TheSection>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- 필터 버튼 영역 -->
  <FilterTimesOneAthlete v-if="selectedNameArr.length <= 1" :options="timeStore.filter" :names="selectedNames" @change-discipline="onFilterChange" />
  <FilterTimes v-else :names="selectedNames" :options="timeStore.filter" :isElite="isElite" @change-discipline="onFilterChange" />

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <SectionLoading v-if="isLoading"></SectionLoading>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <TheSection :title="pageTitle" :subtitle="selectedNames">
    <!-- <DatatableTimes
      :names="selectedNameArr"
      :times="selectedTimeList"
      :totalPages="timeStore.pagination.totalPages"
      :page="currentPage"
      :key="'leaderboard-' + currentPage"
      @page-change="handlePageChange" /> -->
      <!-- <TheDataTable
				v-if="selectedTimeList && selectedTimeList.length > 0"
				:times="selectedTimeList"
				:options="options"
			/> -->
      <MarkdownViewer
        v-if="markdownTimeList.length > 0"
        :content="markdownTimeList"
        :showToc="false"
        :showStats="false"
      />
  </TheSection>

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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

import { usePageNavigation } from '~/composables/usePageNavigation';

import UI_CONFIG from '~/config/ui';
import { type SwimStyle } from '~/types/common';
import type { TimeFilter } from '~/types/times';
import type { TimeModel } from '~/models/times';

import { useAuthStore } from '~/stores/useAuthStore';
import { useTimeStore } from '~/stores/times';
import TheBreadcrumb from '~/components/layout/TheBreadcrumb.vue';

import TheSection from '~/components/common/TheSection.vue';
// import TheDataTable from '~/components/common/TheDataTable.vue';
import MarkdownViewer from '~/components/common/MarkdownViewer.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';

import DatatableTimes from './datatable_leaderboards.vue';
import SectionSearch from '~/components/common/TheSectionSearch.vue';
// import TimesFilter from '~/components/common/TheFiltersTimes.vue';
import FilterTimes from './filter_times.vue';
import FilterTimesOneAthlete from './filter_timesOneAthlete.vue';
const { toHtml, extractHeadings, getWordCount, getReadingTime, generateMarkdownTable } = useMarkdown()

const route = useRoute();
const authStore = useAuthStore();
const timeStore = useTimeStore();

// 상태 관리
const setFocus = ref(0);
const isLoading = ref(false);
const isElite = ref(false);
const markdownTimeList = ref('');
const rowsPerPage = ref(UI_CONFIG.rowsPerPage);
const currentPage = ref(1);
const selectedNameArr = ref<String[]>([]);
const selectedNames = ref('');
const selectedTimeList = ref<TimeModel[]>([]);

const menus = [
  { menu: '리더보드', url: '/leaderboards' },
  { menu: '훈련기록/대회기록', url: '#' },
  { menu: '등록/비등록', url: '#' },
  { menu: '자유형', url: '#' },
  { menu: '50M', url: '#' },
  { menu: 'LCM', url: '#' },
];

const medals = ['', '<span class="text-yellow-300"> (金)</span>', '<span class="text-gray-500"> (銀)</span>', '<span class="text-amber-800"> (銅)</span>'];
const options = [
   {
   header: "#",
   cell: `
   <span class="whitespace-nowrap">
		[rank]
	  </span>
      `
   ,
   },
   {
   header: "선수",
   cell: `
   <span class="whitespace-nowrap">
      <a href="/athlete/[athleteID]">
         [name]
      </a>
      <br />
      [datetime]
	  </span>
      `
   ,
   },
   { header: "결과", cell: 
      `
      <span class="font-mono text-lg whitespace-nowrap">
            [time]
         </span>
            <br />
            [team]
      `
   },
   { header: "대회", cell: 
      `
         [competitionName]
		<br />
		<span class="font-mono font-normal whitespace-nowrap">
		[pool]
		</span>
      `
   },
]

///########################################################
/// wnth 치ㅑㅔㅠㅐㅁㄱㅇ qhrtk
///########################################################
const copyToClipboard = async () => {
  const encodedUrl = window.location.href; // 복사할 URL
  
  try {
    const decodedUrl = decodeURIComponent(encodedUrl);
    await navigator.clipboard.writeText(decodedUrl);
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
  }
};
///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  isLoading.value = true;
  try {
    await nextTick();
    isLoading.value = true;
    timeStore.filter = {};
    timeStore.filter.name = '';
    timeStore.filter.discipline = 'BR';
    timeStore.filter.course = 'LCM';
    timeStore.filter.distance = '50M';
    const encodedUrl = window.location.href;;
    // 디코딩하여 표시
    const decodedUrl = decodeURIComponent(encodedUrl);


    if (route.query.name) {
      timeStore.filter.name = route.query.name as string;
      onClickSearch(timeStore.filter.name );
    }

    // 초기 필터 설정
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

//--------------------------------------------
// 동적 타이틀 생성 computed 속성
//--------------------------------------------
const pageTitle = computed(() => {
  let title = makeTimesTitle(timeStore.filter);
  if (selectedNames.value) title = `${title}`;
  return title;
});

//--------------------------------------------
// page 변경 event
//--------------------------------------------
const handlePageChange = async (page: number) => {
  // currentPage.value = page;
  // await timeStore.fetchTimeList(currentPage.value, rowsPerPage.value);
};
//--------------------------------------------
// 필터 변경 처리
//--------------------------------------------
const onFilterChange = async (field: String, filters: TimeFilter) => {

  isLoading.value = true;

  try {

    if (field == 'names') {
      selectedTimeList.value = [];
      timeStore.timeList = [];
      selectedNames.value = '';
      setFocus.value++;
      return;
    }

    filters.masters = filters.masters || '전체'
    timeStore.filter.discipline = filters.discipline;
    timeStore.filter.course = filters.course;
    timeStore.filter.distance = filters.distance;

    const originalTimeList = JSON.parse(JSON.stringify(timeStore.timeList)) as TimeModel[];
  console.log("2=========> search..value=", originalTimeList);

    if (field == 'search' && selectedNameArr.value.length == 1) {
      selectedTimeList.value = originalTimeList;
    } else {
      selectedTimeList.value = originalTimeList.filter(time =>
                                                  (!filters.discipline || filters.discipline=="전체" as SwimStyle || time.discipline === filters.discipline) &&
                                                  (!filters.course || filters.course=="전체" as any || time.course === filters.course) &&
                                                  (!filters.distance || filters.distance=="전체" ||time.distance === filters.distance)
                                                );
    }
    let rank = 0;
    const isMasters = [...new Set(selectedTimeList.value.map(el => el.isMasters))];
    isElite.value = isMasters.length > 1;
    
    if (isElite.value && filters.masters=="비등록") {
      selectedTimeList.value = selectedTimeList.value.filter(time => time.isMasters == true);
    }
    let bfTimeStamp = 999;
    if (filters.sort === '최근순') {
      selectedTimeList.value = selectedTimeList.value.sort((a, b) => (b as any).datetime - (a as any).datetime)
                                                      .reduce((arr: TimeModel[], tm: TimeModel) => {
                                                        tm.rank = ++rank;
                                                        tm.medal = tm.rank > 3 ? tm.rank : medals[tm.rank];
                                                        arr.push(tm);
                                                        return arr;
                                                      }, []);
    } else { // 기록순
      selectedTimeList.value = selectedTimeList.value.sort((a, b) => a.timeStamp - b.timeStamp)
                                                      .reduce((arr: TimeModel[], tm: TimeModel) => {
                                                        if (bfTimeStamp > tm.timeStamp) {
                                                          rank++;
                                                        }
                                                        tm.rank = rank;
                                                        tm.medal = tm.rank > 3 ? tm.rank : medals[tm.rank];
                                                        arr.push(tm);
                                                        return arr;
                                                      }, []);
    }

    markdownTimeList.value = generateMarkdownTable(selectedTimeList.value, options);
    // console.log(isElite.value, filters.masters, );
  } catch (error) {
    console.error("필터 적용 중 오류:", error);
  } finally {
    isLoading.value = false;
  }
}
// 검색 필드 입력 값 바뀔 때
const onChangedField = async (value: string) => {
  // if (value.length < 2) return;
};
// 검색 필드 click search
const onClickSearch = async (value: string) => {
  const query = parsingNameStyleDistance(value);

  timeStore.filter.name = query.name.join(',');
  if (query.name == "") {
    selectedNames.value = '';
    return;
  }
  selectedNames.value = timeStore.filter.name as string;
  if (query.distance) timeStore.filter.distance = query.distance;
  if (query.discipline) timeStore.filter.discipline = query.discipline as SwimStyle;

  isLoading.value = true;
  currentPage.value = 1;
  isLoading.value = false;
  console.log("1=========> search..value=", value);
  await timeStore.fetchNamesTimeList(value);
  isLoading.value = false;

  selectedNameArr.value = query.name.sort((a: string, b: string) => a.localeCompare(b));
  onFilterChange("search", timeStore.filter);
};

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