<!-- pages/times/list.vue -->
<template>
  <div class="times-list-page pl-5 pr-5">
    <!-- 페이지 헤더 -->
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-800">대회</h1>
    </div>

    <Header
      @change-filter="onChangeFilter"
    />
    <!----------------------->
    <!-- DataTable 컴포넌트 -->
    <!----------------------->

      
    <div class="flex space-x-3 items-start">
      <div class="w-2/3 self-start">
        <!----------------------->
        <!-- DataTable 컴포넌트 -->
        <!----------------------->
        <CompetitionsDataTable
          :competitions="competitionStore.competitionList"
          :totalPages="competitionStore.pagination.totalPages"
          :page="currentPage"
          :key="'competitions-' + currentPage"
          @page-change="handlePageChange"
          @cell-click="clickCell" />
        <!----------------------->
        <!----------------------->
      </div>
      <div class="w-1/3 self-start">
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
import { SortDirection } from '~/types/common';
import { CompetitionSortField } from '~/types/competitions';
import { CompetitionModel } from '~/models/competitions';
import { useCompetitionStore } from '~/stores/competitions';
import { useAuthStore } from '~/stores/useAuthStore';

import CompetitionsDataTable from './competitions_table.vue';

import ButtonSido from '~/components/common/TheSelectSido.vue';
import ButtonInput from '~/components/common/TheButtonInput.vue';
import TheBreadcrumb from '~/components/layout/TheBreadcrumb.vue';
import ButtonGroup from '~/components/common/TheButtonGroup.vue';
import Header from './header.vue';
import Form from './form.vue';

const menus = [
  { menu: '기록', url: '/times' },
  { menu: '선수', url: '/athletes' },
  { menu: '대회', url: '/competitions' },
];

const router = useRouter();

const authStore = useAuthStore();
const competitionStore = useCompetitionStore();

// 상태 관리
const isLoading = ref(false);
const currentPage = ref(1);
const selectedYear = ref('');
const selectButtonYears = [
  { value: '', label: '전체' },
];
const form = ref<CompetitionModel>(CompetitionModel.initialize());

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  isLoading.value = true;
  try {

    // years계산
    const noOfYear = 9;
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - (noOfYear - 1); year--) {
      selectButtonYears.push({ value:year.toString(), label: year.toString() });
    }
    selectedYear.value = currentYear.toString();

    isLoading.value = true;
    competitionStore.filter = {
      name: '',
      course: '',
      sido: '',
      competitionID: 0,
      sortField: 'competitionID',
      sortDirection: 'desc',
    };
    competitionStore.pagination.rowsPerPage = UI_CONFIG.rowsPerPage;

    competitionStore.filter.sortField = "competitionID"; // CompetitionSortField.NAME;
    competitionStore.filter.sortDirection = SortDirection.DESC;

    await competitionStore.fetchCompetitionList(1, competitionStore.pagination.rowsPerPage);
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
///########################################################
///########################################################

const onChangeFilter = async (field: string, value: string) => {
  isLoading.value = true;
  currentPage.value = 1;
  switch (field) {
    case "competitionID":
      competitionStore.filter.competitionID = Number(value);
      break;
    case "competitionName":
      competitionStore.filter.name = value;
      break;
    case "sido":
      competitionStore.filter.sido = value;
      break;
    case "year":
      if (value.length < 4) return;
      competitionStore.filter.year = value;
      break;
    default:
      return;
  }
  await competitionStore.fetchCompetitionList(currentPage.value, competitionStore.pagination.rowsPerPage);
  isLoading.value = false;
}

const onSaveForm = async (form: CompetitionModel) => {
  await competitionStore.updateCompetition(form);
  const index = competitionStore.competitionList.findIndex(el => el.poolID === form.poolID);
  if (index !== -1) {
    competitionStore.competitionList[index] = form;
  } else {
    form.competitionID = competitionStore.currentCompetition!.competitionID;
    competitionStore.competitionList.splice(0, 0, form)
  }
}
const onDeleteForm = async (competitionID: number) => {
  await competitionStore.deleteCompetition(competitionID);
  const index = competitionStore.competitionList.findIndex(el => el.competitionID === competitionID);
  if (index !== -1) {
    competitionStore.competitionList.splice(index, 1);
  }
}

const clickCell = (item: CompetitionModel, column: string) => {
  form.value = JSON.parse(JSON.stringify(item));
}
// 부모 컴포넌트에 추가
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await competitionStore.fetchCompetitionList(currentPage.value, competitionStore.pagination.rowsPerPage);
};
//======================================================================
// Button
//======================================================================
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
