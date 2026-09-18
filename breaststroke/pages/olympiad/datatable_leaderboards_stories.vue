<template>
  <!-- DataTable 컴포넌트 -->
  <DataTableStories :fixed="true" :title="props.title" subtitle="대회명 대회명 대회명" date="(0000-00-00)" :columns="columns" :data="tableData" :pagination="false" :totalPage="props.totalPages" :currentPage="currentPage" :itemsPerPage="rowsPerPage" :search="false" :isLoading="isLoading" :serverSide="true" :alternateRowColors="true" @sort-column="sortColumnChanged" @click-cell="clickTableCell" @page-change="pageChanged">
    <!-- 시간 셀 -->
    <template #column-time="slotProps">
      <div class="flex flex-col justify-center items-end text-right bg-white/5 h-[152px] !px-[64px] !mr-[40px] gap-[4px]">
        <div class="font-mono font-bold text-[40px] leading-[48px]" style="font-variant-numeric: tabular-nums;" aria-placeholder="00:00.00">
          {{ (slotProps.row as any).time ?? '' }}
        </div>
        <div class="font-mono text-white/50 text-[28px] leading-[40px]" style="font-variant-numeric: tabular-nums;" aria-placeholder="0000-00-00">
          {{ (slotProps.row as any).datetime ?? '' }}
        </div>
      </div>
    </template>

    <!-- 이름 셀 -->
    <template #column-name="slotProps">
      <div class="flex items-center text-left gap-[64px]">
        <template v-if="(slotProps.row as any).thumbnail && (slotProps.row as any).thumbnail.length > 0">
          <img :src="getImageURL((slotProps.row as any).thumbnail)" :alt="(slotProps.row as any).name" class="object-cover w-[152px] h-[152px]" />
        </template>
        <template v-else>
          <div class="w-[152px] h-[152px] object-cover" :class="(!(slotProps.row as any).athleteID) ? 'bg-[#0f172a]/10' : 'bg-white/20'"></div>
        </template>

        <div class="flex flex-col text-[40px] leading-[48px] mt-[4px] gap-[4px]">
          <div :class="(!(slotProps.row as any).athleteID) ? 'text-white/10' : 'text-white'">
            <template v-if="!(slotProps.row as any).athleteID">
              미등록
            </template>
            <template v-else>
              <span class="relative inline-block whitespace-nowrap">
                {{ (slotProps.row as any).name }}
                <span class="invisible select-none absolute font-bold">홍길동</span>
              </span>
            </template>
          </div>
          <div v-if="(slotProps.row as any).athleteID" class="text-white/50 text-[28px] leading-[40px]">
            {{ (slotProps.row as any).team ?? '' }}
          </div>
          <div v-else class="text-white/5 text-[28px] leading-[40px]">
            미등록
          </div>
        </div>
      </div>
    </template>
  </DataTableStories>

  <TheTooltipDialog :show="showTooltip" message="아직 등록하지 않은 선수입니다." @click="showTooltip = false" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import UI_CONFIG from '~/config/ui';
import type { TimeRecord } from '~/types/leaderboard';
import { useLeaderboardStore } from '~/stores/leaderboard';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
import DataTableStories from '~/components/common/DataTableStories.vue';

const showTooltip = ref(false);
const router = useRouter();
const leaderboardStore = useLeaderboardStore();
const isLoading = ref(false);
const rowsPerPage = UI_CONFIG.rowsPerPage;

const props = defineProps({
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
  title: {
    type: String,
    default: '',
  },
  date: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['page-change']);

const columns = [
  { key: 'rank', label: '#', sortable: false },
  { key: 'name', label: '선수', sortable: false },
  { key: 'time', label: '기록', sortable: false },
];

const currentPage = computed(() => props.page);

const tableData = computed(() => {
  if (!props.times) return [];
  return props.times.slice(0, 10);
});

const sortColumnChanged = async (column: string) => {
  leaderboardStore.filter.sortField = column as any;
  leaderboardStore.filter.sortDirection =
    leaderboardStore.filter.sortDirection === 'ASC' ? 'DESC' : 'ASC';
  isLoading.value = true;
  try {
    await leaderboardStore.fetchLeaderboardList("Breaststroke", 1, rowsPerPage);
  } catch (error) {
    console.error('정렬 적용 중 오류:', error);
  } finally {
    isLoading.value = false;
  }
};

const pageChanged = async (page: number) => {
  emit('page-change', page);
};

const clickTableCell = (item: TimeRecord, column: string) => {
  switch (column) {
    case 'time':
      router.push(`/time/${(item as any).timeID}`);
      break;
    case 'name':
      if ((item as any).athleteID) {
        router.push(`/athlete/${(item as any).athleteID}`);
      } else {
        showTooltip.value = true;
      }
      break;
    case 'competition':
      if ((item as any).competitionID) {
        router.push(`/competition/${(item as any).competitionID}`);
      }
      break;
  }
};
</script>

<style scoped></style>
