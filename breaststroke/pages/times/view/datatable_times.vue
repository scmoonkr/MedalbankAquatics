<template>

  <DataTable :columns="columns" :data="tableData" @click-cell="clickTableCell">
    <!-- <template #column-style="{ row }">
      <CellDiscipline :text="(row as TimeModel).discipline ?? ''" />
    </template> -->
    <template #column-style="{ value, row }">
      <CellDiscipline :text1="`${getGenderByEng((row as TimeModel).gender) ?? ''} ${getStyleKorByEng((row as TimeModel).style) ?? ''} ${(row as TimeModel).distance ?? ''}`" :text2="`${(row as TimeModel).course ?? ''}`" />
    </template>

    <template #column-time="{ row }">
      <CellTimeDate :time="(row as TimeModel).time ?? 0" :date="(row as TimeModel).datetime ?? ''" />
    </template>

    <template #column-name="{ row }">
      <CellAthleteText :image="getImageURL((row as TimeModel).thumbnail ?? '')" :name="(row as TimeModel).name ?? ''" :id="(row as TimeModel).athleteID ?? 0" :text="(row as TimeModel).ageGroup ?? ''" :unregistered="!(row as TimeModel).athleteID" />
    </template>

    <template #column-location="{ row }">
      <CellCompetitionText :competition="(row as TimeModel).competitionName ?? ''" :text="(row as TimeModel).pool ?? ''" />
    </template>
  </DataTable>

  <TheTooltipDialog :show="showTooltip" message="아직 등록하지 않은 선수입니다." @click="showTooltip = false" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import type { TimeModel } from '~/models/times';

import CellNumber from '~/components/common/cells/CellNumber.vue'
import CellDiscipline from '~/components/common/cells/CellDiscipline.vue'
import CellTimeDate from '~/components/common/cells/CellTimeDate.vue'
import CellAthleteText from '~/components/common/cells/CellAthleteText.vue'
import CellCompetitionText from '~/components/common/cells/CellCompetitionText.vue'

import DataTable from '@/components/common/DataTable.vue';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';

const showTooltip = ref(false);
const router = useRouter();

// 상태 관리
const selectedItems = ref<number[]>([]);

const props = defineProps({
  times: {
    type: Array as () => TimeModel[],
    default: () => [] as TimeModel[],
  },
  page: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
});

//--------------------------------------------
// 계산된 속성들
//--------------------------------------------
const tableData = computed(() => {
  return props.times.map((time: TimeModel) => ({
    ...time,
    checked: selectedItems.value.includes(time.timeID),
  }));
});

//--------------------------------------------
// DataTable 컬럼 정의
//--------------------------------------------
const columns = [
  { key: 'name', label: '선수', sortable: false },
  { key: 'style', label: '종목', sortable: false },
  { key: 'time', label: '기록', sortable: false },
  { key: 'location', label: '장소', sortable: false },
];

//--------------------------------------------
// 셀 클릭 핸들러
//--------------------------------------------
const clickTableCell = async (item: TimeModel, column: string) => {
  switch (column) {
    case "style": // leaderboard gender, style, distance, course
      router.push(`/leaderboards?style=${(item as any).style}&gender=${(item as any).gender}&course=${(item as any).course}&distance=${(item as any).distance}`)
      break;
    // case "time":
    //   router.push(`/time/${(item as any).timeID}`)
    //   break;
    case "name":
      if ((item as any).athleteID) {
        router.push(`/athlete/${(item as any).athleteID}`)
      } else {
        showTooltip.value = true;
      }
      break;
    case "location":
      if ((item as any).competitionID) {
        router.push(`/competition/${(item as any).competitionID}`)
      } else if ((item as any).poolID) {
        router.push(`/pool/${(item as any).poolID}`)
      }
      break;
  }
};
</script>

<style scoped></style>
