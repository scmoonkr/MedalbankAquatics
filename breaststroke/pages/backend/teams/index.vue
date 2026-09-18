<!-- pages/times/list.vue -->
<template>
  <div class="times-list-page pl-5 pr-5">
    <!-- 페이지 헤더 -->
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Teams</h1>
    </div>


    <Header
      @change-filter="onChangeFilter"
    />

    <!-- 기록/훈련 탭 메뉴 -->
    <!-- <ButtonInput title="" :items="searchButtonNames" width="medium" height="medium" @update:modelValue="onNameSearch" />
    <ButtonGroup title="" :items="selectButtonNames" v-model="selectedName" width="medium" height="medium" @update:modelValue="onNameChange" /> -->
    <!-- sido 탭 메뉴 -->
    <!-- <ButtonSido title="" v-model="sidoField" all="전체" width="xsmall" height="medium"
      @update:modelValue="onSidoChange" /> -->

    <div class="flex space-x-3 items-start">
      <div class="w-2/3 self-start">
        <!----------------------->
        <!-- DataTable 컴포넌트 -->
        <!----------------------->
        <TeamsDataTable
          :teams="teamStore.teamList"
          :totalPages="teamStore.pagination.totalPages" 
          :page="currentPage"
          :key="'teams-' + currentPage"
          @page-change="handlePageChange"
          @click-cell="handleClickCell"
          @select-item="handleSelectItem"
        />
      </div>
      
      <div class="w-1/3 self-start">
        <Form
          :form="form"
          @save-form="onSaveForm"
          @delete-form="onDeleteForm"
          @merge-form="onMergeForm"
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
import { TeamSortField } from '~/types/teams';
import type { TeamModel } from '~/models/teams';
import { useTeamStore } from '~/stores/teams';
import { useAuthStore } from '~/stores/useAuthStore';

import ButtonGroup from '~/components/common/TheButtonGroup.vue';
import ButtonInput from '~/components/common/TheButtonInput.vue';

import TeamsDataTable from './teams_table.vue';
import Header from './header.vue';
import Form from './form.vue';

const router = useRouter();

const authStore = useAuthStore();
const teamStore = useTeamStore();

// 상태 관리
const isLoading = ref(false);
const currentPage = ref(1);
const selectedName = ref('가');
const selectedItems = ref<number[]>([]);
const form = ref<Partial<TeamModel>>({
  teamID: 0,
  name: '',
  names: [],
  teamCode: '',
});

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  isLoading.value = true;
  try {
    isLoading.value = true;
    teamStore.filter = {
      name: '',
      course: '',
      sido: '',
      mongo: 'mongo',
      teamID: 0,
      sortField: 'dateStart',
      sortDirection: 'desc',
    };
    teamStore.pagination.rowsPerPage = 100; // UI_CONFIG.rowsPerPage;

    teamStore.filter.sortField = TeamSortField.NAME;
    teamStore.filter.sortDirection = SortDirection.ASC;
    currentPage.value = 1;

    await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
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
  if (value.length < 2) return;

  teamStore.filter.name = value;
  await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
}

const onSaveForm = async (form: TeamModel) => {
  const index = teamStore.teamList.findIndex(el => el.teamID === form.teamID);
  if (index !== -1) {
    teamStore.teamList[index] = form;
  } else {
    teamStore.teamList.splice(0, 0, form)
  }
  await teamStore.updateTeam(form);
}
const onDeleteForm = async (teamID: number) => {
  const index = teamStore.teamList.findIndex(el => el.teamID === teamID);
  if (index !== -1) {
    teamStore.teamList.splice(index, 1);
  await teamStore.deleteTeam(teamID);
  }
}
const onMergeForm = async (teamID: number) => {
  const teamIDs = teamStore.teamList.filter(el => el.checkbox).map(el => el.teamID);
  if (teamIDs.length >= 2) {
    await teamStore.mergeTeam(teamID, teamIDs);
  }
}


const handleSelectItem = async (timeIDs: number[]) => {
  selectedItems.value = timeIDs;
  // await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
};

const handleClickCell = async (item: TeamModel) => {
  form.value = JSON.parse(JSON.stringify(item));
  // await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
};
// 부모 컴포넌트에 추가
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
};
//======================================================================
// Button
//======================================================================
const searchButtonNames = [
  { value: '', label: '모든수영장' },
  { value: 'name', label: '특정수영장' },
];
const selectButtonNames = [
  { value: '', label: '전체' },
  { value: '0', label: '0-9' },
  { value: 'A', label: 'a-Z' },
  { value: '가', label: '가' },
  { value: '나', label: '나' },
  { value: '다', label: '다' },
  { value: '라', label: '라' },
  { value: '마', label: '마' },
  { value: '바', label: '바' },
  { value: '사', label: '사' },
  { value: '아', label: '아' },
  { value: '자', label: '자' },
  { value: '차', label: '차' },
  { value: '카', label: '카' },
  { value: '타', label: '타' },
  { value: '파', label: '파' },
  { value: '하', label: '하' },
];
const onNameSearch = async (value: string) => {
  
  if (value.length < 2) return;
  teamStore.filter.name = value;

  isLoading.value = true;
  currentPage.value = 1;
  await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
  isLoading.value = false;
};
const onNameChange = async (value: string) => {
  selectedName.value = value;
  teamStore.filter.name = value + "%";

  isLoading.value = true;
  currentPage.value = 1;
  await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
  isLoading.value = false;
};

const sidoField = ref('');
const onSidoChange = async (value: string) => {
  teamStore.filter.sido = value;

  isLoading.value = true;
  currentPage.value = 1;
  await teamStore.fetchTeamListBackend(currentPage.value, teamStore.pagination.rowsPerPage);
  isLoading.value = false;
};

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
