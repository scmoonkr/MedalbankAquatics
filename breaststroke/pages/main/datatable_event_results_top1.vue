<template>

  <DataTable :columns="columns" :data="top1" :pagination="true" :totalPage="1" :currentPage="1" :itemsPerPage="100" :search="false" :isLoading="isLoading" :serverSide="true" :alternateRowColors="true" :alternateColumnColors="true" @click-cell="clickTableCell">

    <template #column-style="{ value, row }">
      <!-- <CellDiscipline :text1="`${getGenderByEng((row as TimeModel).gender) ?? ''} ${getStyleKorByEng((row as LeaderboardModel).style) ?? ''} ${(row as LeaderboardModel).distance ?? ''}`" :text2="`${(row as LeaderboardModel).course ?? ''}`" /> -->
      <CellDisciplineSimple :text1="`${getGenderByEng((row as TimeModel).gender) ?? ''} ${getStyleKorByEng((row as LeaderboardModel).style) ?? ''} ${(row as LeaderboardModel).distance ?? ''}`" />

    </template>

    <template #column-time="{ row }">
      <CellTime :time="(row as TimeModel).time ?? ''" :unregistered="!(row as TimeModel).athleteID" class="text-right" />

    </template>

    <template #column-photo="{ row }">
      <CellAthletePhoto :image="getImageURL((row as TimeModel).thumbnail || '')" :name="(row as TimeModel).name ?? ''" :id="(row as TimeModel).athleteID ?? 0" :text="(row as TimeModel).team ?? ''" :unregistered="!(row as TimeModel).athleteID" />
    </template>

    <template #column-name="{ row }">
      <CellAthleteText :name="(row as TimeModel).name" :id="(row as TimeModel).athleteID" :text="(row as TimeModel).team" :unregistered="!(row as TimeModel).athleteID" />

    </template>

    <template #column-competitionName="{ row }">
      <CellTextTextText :text1="formatKoreanDateWithDay((row as TimeModel).datetime ?? '')" :text2="(row as TimeModel).competitionName ?? ''" :text3="(row as TimeModel).pool ?? ''" :unregistered="!(row as TimeModel).athleteID" />


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
import { ref } from 'vue';
const router = useRouter();
import type { TimeModel } from '~/models/times';
import type { LeaderboardModel } from '~/models/leaderboard';


import CellText from '~/components/common/cells/CellText.vue'
import CellTime from '~/components/common/cells/CellTime.vue'
import CellTextText from '~/components/common/cells/CellTextText.vue'
import CellTextTextText from '~/components/common/cells/CellTextTextText.vue'
import CellDisciplineSimple from '~/components/common/cells/CellDisciplineSimple.vue'
import CellNumberText from '~/components/common/cells/CellNumberText.vue'
import CellTimeDate from '~/components/common/cells/CellTimeDate.vue'
import CellTimeAthlete from '~/components/common/cells/CellTimeAthlete.vue'
import CellAthletePhoto from '~/components/common/cells/CellAthletePhoto.vue'
import CellAthleteText from '~/components/common/cells/CellAthleteText.vue'
import CellCompetitionText from '~/components/common/cells/CellCompetitionText.vue'

import DataTable from '~/components/common/DataTable.vue';
import { getStyleKorByEng, getGenderByEng } from '~/utils/swimStyles'
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
const showTooltip = ref(false);

const isLoading = ref(false);
const showAthleteModal = ref(false);

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  top1: {
    type: Array as () => TimeModel[],
    default: () => [],
    required: true,
  },
});
// 다가오는 대회 일정 DataTable 설정
const columns = [
  { key: 'style', label: '종목', sortable: false },
  { key: 'photo', label: '', sortable: false },
  { key: 'name', label: '선수', sortable: false },
  { key: 'time', label: '결과', sortable: false, align: "right" },
  { key: 'competitionName', label: '대회', sortable: false },
];
// 이미지 로드 실패 처리
const handleImageError = (event: Event): void => {
  (event.target as HTMLImageElement).src = '/images/not_found.jpg';
};

const clickTableCell = async (item: {}, column: string) => {
  switch (column) {
    case "style": // leaderboard gender, style, distance, course
      router.push(`/leaderboards?style=${(item as any).style}&gender=${(item as any).gender}&course=${(item as any).course}&distance=${(item as any).distance}`)
      break;
    case "time":
      router.push(`/time/${(item as any).timeID}`)
      break;
    case "name":
      if ((item as any).athleteID) {
        router.push(`/athlete/${(item as any).athleteID}`)
      } else {
        showTooltip.value = true;
      }
      break;
    case "competitionName":
      if ((item as any).competitionID) {
        router.push(`/competition/${(item as any).competitionID}`)
      }
      break;
  }
};

// 날짜 양식 변경
function formatKoreanDateWithDay(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = days[date.getDay()];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일 ${dayName}`;
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
.placeholder-before {
  @apply before:absolute before:opacity-0 before:content-[attr(data-placeholder)] before:invisible before:inline-block;
}
</style>
