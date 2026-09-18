<!-- pages/leaderboard/leaderboard_table.vue -->
<template>
  <!-- DataTable 컴포넌트 -->
  <DataTable :columns="props.names.length == 1 ? columnsOneAthlete : columns" :data="tableData" :pagination="false" :totalPage="props.totalPages" :currentPage="currentPage" :itemsPerPage="rowsPerPage" :search="false" :isLoading="isLoading" :serverSide="true" :alternateRowColors="true" @sort-column="sortColumnChanged" @click-cell="clickTableCell" @page-change="pageChanged">

    <template #column-discipline="{ value, row }">
      <CellDiscipline :text1="`${getGenderByEng((row as TimeModel).gender) ?? ''} ${getStyleKorByEng((row as TimeModel).discipline) ?? ''} ${(row as TimeModel).distance ?? ''}`" :text2="`${(row as TimeModel).course ?? ''}`" />
    </template>

    <!-- 기록 시간 -->
    <template #column-time="{ value, row }">
      <CellTimeDate :time="value ?? ''" :date="(row as any).datetime ?? ''" />
    </template>

    <!-- 선수 이름과 팀 -->
    <template #column-name="{ value, row }">
      <CellAthleteText :image="getImageURL((row as any).thumbnail ?? '')" :name="value ?? ''" :id="(row as any).athleteID ?? 0" :text="(row as any).team ?? ''" />
    </template>

    <!-- 대회 -->
    <template #column-competition="{ value, row }">
      <CellCompetitionText :competition="(row as any).competitionName ?? ''" :text="(row as any).pool ?? ''" :unregistered="!(row as any).athleteID" />
    </template>
  </DataTable>

  <TheTooltipDialog :show="showTooltip" message="아직 등록하지 않은 선수입니다." @click="showTooltip = false" />

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

import UI_CONFIG from '~/config/ui';
import type { TimeModel } from '~/models/times';
import type { Gender, SwimCourse, SwimStyle, Individual } from '~/types/common';
import { isValidStyle, SortDirection } from '~/types/common';
import { LeaderboardSortField } from '~/types/leaderboard';
import type { LeaderboardFilter, TimeRecord } from '~/types/leaderboard';

import { useLeaderboardStore } from '~/stores/leaderboard';

import DataTable from '~/components/common/DataTable.vue';

import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
import CellDiscipline from '~/components/common/cells/CellDiscipline.vue'
import CellTimeDate from '~/components/common/cells/CellTimeDate.vue'
import CellAthleteText from '~/components/common/cells/CellAthleteText.vue'
import CellCompetitionText from '~/components/common/cells/CellCompetitionText.vue'
const showTooltip = ref(false);

const router = useRouter();
const leaderboardStore = useLeaderboardStore();

// 상태 관리
const isLoading = ref(false);
const rowsPerPage = UI_CONFIG.rowsPerPage;
// const currentPage = ref(1);

const props = defineProps({
  names: {
    type: Array as () => String[],
    default: () => [] as [],
  },
  times: {
    type: Array as () => TimeRecord[],
    default: () => [] as TimeRecord[],
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  page: {
    type: Number,
    default: 1,
  },
});

// DataTable 설정 - 기록 위주 컬럼
const columns = [
  { key: 'rank', label: '#', sortable: false },
  // { key: 'gender', label: 'gender', sortable: false },
  // { key: 'discipline', label: 'discipline', sortable: false },
  // { key: 'course', label: 'course', sortable: false },
  // { key: 'distance', label: 'distance', sortable: false },
  { key: 'time', label: '기록', sortable: false },
  { key: 'name', label: '선수', sortable: false },
  { key: 'competition', label: '대회/장소', sortable: false, class: 'flex-grow' },
];
const columnsOneAthlete = [
  { key: 'rank', label: '#', sortable: false },
  { key: 'discipline', label: '종목', sortable: false },
  // { key: 'discipline', label: 'discipline', sortable: false },
  // { key: 'course', label: 'course', sortable: false },
  // { key: 'distance', label: 'distance', sortable: false },
  { key: 'time', label: '기록', sortable: false },
  { key: 'name', label: '선수', sortable: false },
  { key: 'competition', label: '대회/장소', sortable: false, class: 'flex-grow' },
];

const currentPage = computed(() => props.page);

// 테이블 데이터 계산 속성 - 안전하게 처리
const tableData = computed(() => {
  return props.times || [];
});

// 정렬 변경 처리
const sortColumnChanged = async (column: string) => {
  leaderboardStore.filter.sortField = column as LeaderboardSortField;
  leaderboardStore.filter.sortDirection =
    leaderboardStore.filter.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;

  isLoading.value = true;
  try {
    await leaderboardStore.fetchLeaderboardList("Breaststroke", 1, rowsPerPage);
  } catch (error) {
    console.error("정렬 적용 중 오류:", error);
  } finally {
    isLoading.value = false;
  }
};

// 페이지 변경 처리
const pageChanged = async (page: number) => {
  emit('page-change', page);
};

const emit = defineEmits([
  'page-change',
]);

// 테이블 셀 클릭 처리
const clickTableCell = (item: TimeRecord, column: string) => {
  switch (column) {
    case "discipline": // 종목
      router.push(`/leaderboards?discipline=${(item as any).discipline}&gender=${(item as any).gender}&course=${(item as any).course}&distance=${(item as any).distance}`)
      break;
    case "rank":
      break;
    case "time":
      router.push(`/times/view/${(item as any).timeID}`)
      break;
    case "name":
      if ((item as any).athleteID) {
        router.push(`/athlete/${(item as any).athleteID}`)
      } else {
        showTooltip.value = true;
      }
      break;
    case "competition":
      if ((item as any).competitionID) {
        router.push(`/competitions/view/${(item as any).competitionID}`)
      }
      break;
  }
};

// 이미지 로드 실패 처리
const handleImageError = (event: Event): void => {
  (event.target as HTMLImageElement).src = '/images/notfound.jpg';
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
<style scoped></style>