<!-- pages/times/list.vue -->
<template>
  <div class="pl-5 pl-5 pr-5">
    <!-- 페이지 헤더 -->
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Times</h1>
    </div>

    
    <Header
      @search="onSearch"
    /> 

    <!----------------------->
    <!-- DataTable 컴포넌트 -->
    <!-----------------------><div class="flex space-x-3 items-start">
    <div class="w-3/5 self-start">
      <!----------------------->
      <!-- DataTable 컴포넌트 -->
      <!----------------------->
      <TimesDataTable
        :times="timeStore.timeList"
        :totalPages="timeStore.pagination.totalPages"
        :page="currentPage"
        :key="'times-' + currentPage"
        @page-change="handlePageChange"
        @click-cell="clickCell" />
      <!----------------------->
      <!----------------------->
    </div>
    <div class="w-2/5 self-start">
      <Form
        :form="form"
        @save-form="onSaveForm"
        @delete-form="onDeleteForm"
      />
    </div>

  </div>

    <!----------------------->
    <!----------------------->
  </div>
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
import { usePageNavigation } from '~/composables/usePageNavigation';

import UI_CONFIG from '~/config/ui';
// import { SortDirection } from '~/types/common';
// import { TimeSortField } from '~/types/times';
// import type { UItimesFilters } from '~/types/times';
import { TimeModel } from '~/models/times';
import { useTimeStore } from '~/stores/times';
import { useAuthStore } from '~/stores/useAuthStore';

import TimesDataTable from './times_table.vue';
import Header from './header.vue';
import Form from './form.vue';

import TimesFilterCard from '~/components/times/TimesFilterCard.vue';
import ButtonGroup from '~/components/common/TheButtonGroup.vue';

const menus = [
  { menu: '기록', url: '/times' },
  { menu: '선수', url: '/athletes' },
  { menu: '대회', url: '/times' },
];

const sorts = [
  { value: 'datetime', label: '최근순' },
  { value: 'timeStamp', label: '기록순' },
];

const typeTimes = [
  { value: 'timeResult', label: '훈련기록' },
  { value: 'eventResult', label: '대회기록' },
];

const router = useRouter();

const authStore = useAuthStore();
const timeStore = useTimeStore();

// 상태 관리
const isLoading = ref(false);
const currentPage = ref(1);
const form = ref<Partial<TimeModel>>(TimeModel.initialize());

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
// 초기 로딩에서는 필터 버튼 기본값만 세팅하고 API 는 호출하지 않는다 (조회 버튼에서만 호출)
async function loadServerData() {
  timeStore.filter = {
    isMasters: true,
    isAdult: true,
    gender: 'women',
    style: 'breaststroke',
    course: 'LCM',
    distance: '50M',
    type: 'event',
  };
  timeStore.pagination.rowsPerPage = UI_CONFIG.backendRowsLimit;
}

// 컴포저블 함수 사용
// history back시 onMount 처리
usePageNavigation(loadServerData);
///########################################################
///########################################################


const clickCell = async (item: TimeModel) => {
  form.value = JSON.parse(JSON.stringify(item));
  // await timeStore.fetchTeamListBackend(currentPage.value, timeStore.pagination.rowsPerPage);
};
// 페이지 이동: 마지막 조회 조건(searchQuery)을 그대로 유지한다
const handlePageChange = async (page: number) => {
  if (!timeStore.searchQuery) return;
  currentPage.value = page;
  await timeStore.fetchTimeList(page, UI_CONFIG.backendRowsLimit, timeStore.searchQuery);
};
//======================================================================
// Button
//======================================================================
const DISCIPLINE_CODE: Record<string, string> = {
  freestyle: 'FR',
  backstroke: 'BA',
  breaststroke: 'BR',
  butterfly: 'FL',
  individualMedley: 'IM',
};

// 필터 버튼 상태 + 입력값 → 서버 조회 조건
const buildQuery = (inputs: { competitionID: string; timeID: string; time: string; name: string }) => {
  if (inputs.timeID) return { timeID: Number(inputs.timeID) };
  const f = timeStore.filter ?? {};
  const query: Record<string, any> = {
    gender: f.gender,
    discipline: f.discipline ?? DISCIPLINE_CODE[f.style],
    course: f.course,
    distance: f.distance,
    isMasters: f.isMasters,
    adult: f.isAdult ? '성인' : '학생',
    includeNoTime: true, // time 이 없는 기록(DQ/DNS 등)도 backend 에서는 모두 보여준다
  };
  if (f.isMasters && f.type) query.typeTime = f.type === 'event' ? 'eventResult' : 'timeResult';
  if (inputs.competitionID) query.competitionID = Number(inputs.competitionID);
  if (inputs.time) query.time = inputs.time;
  if (inputs.name) query.name = inputs.name;
  return query;
};

const onSearch = async (inputs: { competitionID: string; timeID: string; time: string; name: string }, source = 'button') => {
  // 입력 조건이 모두 비어 있으면 조회하지 않는다 (필터 버튼에서는 조용히 무시)
  if (!inputs.competitionID && !inputs.timeID && !inputs.time && !inputs.name) {
    if (source === 'button') alert('조회 조건(cid, timeID, time, 선수명 중 하나)을 입력해주세요.');
    return;
  }
  currentPage.value = 1;
  await timeStore.fetchTimeList(1, UI_CONFIG.backendRowsLimit, buildQuery(inputs));
};


const onSaveForm = async (form: TimeModel) => {
  const time = {};
  Object.keys(form).forEach(key => {
    if ((form as any)[key] !== undefined) (time as any)[key] = (form as any)[key];
  });
  const result = await timeStore.saveTimeResult(time);
  form.timeID = result!.timeID;

  const index = timeStore.timeList.findIndex(el => el.timeID === form.timeID);
  if (index !== -1) {
    timeStore.timeList[index] = form;
  } else {
    timeStore.timeList.splice(0, 0, form)
  }

}
const onDeleteForm = async (timeID: number) => {
  const index = timeStore.timeList.findIndex(el => el.timeID === timeID);
  if (index !== -1) {
    timeStore.timeList.splice(index, 1);
  }
  await timeStore.deleteTime(timeID);
}

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
<style scoped>
/* 필요한 스타일을 추가하세요 */
.times-list-page {
  width: 100%;
}
</style>
