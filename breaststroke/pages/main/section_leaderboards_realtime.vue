<template>

  <div class="records-header">
    <h2 class="records-title">실시간 통계</h2>
  </div>

  <div class="leaderboards-grid">
    <SwimmingLeaderboardTitle v-for="realtimeItem in realtimeStatisticsTable" :title="realtimeItem.title"
      :key="realtimeItem.title" :field="realtimeItem.field" :times="realtimeData[realtimeItem.items] as Array<any>"
      width="small" date-info="2025년 03월 27일 월요일" source-info="sourceInfo" class="leaderboard-item"
      @row-click="(row) => handleLeaderboardRowClick(row, realtimeItem.items)" />
  </div>


  <div class="records-header">
    <p class="records-info">※ 실시간 통계는 훌륭한 재미요소가 될 예정이지만, 현재 잠시 운영을 보류합니다. 더 중요한 데이터의 처리가 완료되면 즉시 가동하겠습니다.</p>
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
const router = useRouter();
import UI_CONFIG from '~/config/ui';
import type { TimeModel } from '~/models/times';
import SwimmingLeaderboardTitle from './leaderboard_swim_title.vue';
import type { LeaderboardModel } from '~/models/leaderboard';

type WidthType = 'small' | 'medium' | 'large';

const props = defineProps({
  realtime: {
    type: Object,
    required: true
  },
  dateInfo: {
    type: String,
    default: '순위'
  },
  sourceInfo: {
    type: String,
    default: '기준 (실시간)'
  },
  width: {
    type: String as () => WidthType,
    default: 'large',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  }
});

const realtimeData = computed(() => {
  const realtimeData: any = props.realtime ?? {};
  const obj: { [key: string]: unknown[] } = {
    joinedRecently: Array.isArray(realtimeData['joinedRecently']) ? realtimeData['joinedRecently'] : [],

    measuredMostly: Array.isArray(realtimeData['measuredMostly']) ? realtimeData['measuredMostly'] : [],
    measuredRecently: Array.isArray(realtimeData['measuredRecently']) ? realtimeData['measuredRecently'] : [],

    athleteMostly: Array.isArray(realtimeData['athleteMostly']) ? realtimeData['athleteMostly'] : [],
    athleteRecently: Array.isArray(realtimeData['athleteRecently']) ? realtimeData['athleteRecently'] : [],

    searchMostly: Array.isArray(realtimeData['searchMostly']) ? realtimeData['searchMostly'] : [],
    searchRecently: Array.isArray(realtimeData['searchRecently']) ? realtimeData['searchRecently'] : [],

    competitionsMostly: Array.isArray(realtimeData['competitionsMost']) ? realtimeData['competitionsMost'] : [],
    competitionsRecently: Array.isArray(realtimeData['competitionsRecently']) ? realtimeData['competitionsRecently'] : [],
  };
  return obj;
});

const realtimeStatisticsTable = [
  { items: 'joinedRecently', title: '최근합류한선수', field: "datetime" },

  { items: 'measuredRecently', title: '최근측정한선수', field: "datetime" },
  { items: 'measuredMostly', title: '최다측정한선수', field: "datetime" },

  { items: 'athleteMostly', title: '최다검색된선수', field: "datetime" },
  { items: 'athleteRecently', title: '최근검색된선수', field: "datetime" },

  { items: 'searchRecently', title: '최근검색어', field: "datetime" },
  { items: 'searchMostly', title: '최다검색어', field: "datetime" },

  { items: 'competitionsRecently', title: '최근검색된대회', field: "datetime" },
  { items: 'competitionsMostly', title: '최다검색된대회', field: "datetime" },
];

const handleLeaderboardRowClick = (row: {}, rowType: string) => {
  switch (rowType) {
    case 'joinedRecently':
    case 'athleteRecently':
      router.push(`/athlete/${(row as TimeModel).athleteID}`)
      break;
    case 'searchMostly':
      router.push(`/athletes/search`)
      break;
    case 'searchRecently':
      router.push(`/athletes/search`)
      break;
    case 'competitionsRecently':
    case 'competitionsMostly':
      router.push(`/competitions/${(row as TimeModel).competitionID}`)
      break;
    default:
      break;
  }
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
.records-header {
  margin-bottom: 20px;
}

.records-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.add-button {
  margin-left: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: none;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-button:hover {
  background-color: #d0d0d0;
}

.records-info {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
}

.leaderboards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.leaderboard-item {
  /* flex-basis를 이용하여 다음 줄로 넘어가는 시점 제어 */
  flex: 0 0 auto;
  margin-bottom: 5px;
}

/* 다양한 화면 크기에 대응하는 반응형 디자인 */
@media (max-width: 975px) and (min-width: 650px) {

  /* 중간 크기 화면에서는 최대 2개씩 표시 */
  .leaderboard-item {
    max-width: calc(50% - 10px);
  }
}

@media (max-width: 649px) {

  /* 작은 화면에서는 한 줄에 하나씩 */
  .leaderboard-item {
    width: 100%;
    max-width: 450px;
  }

  .leaderboards-grid {
    justify-content: center;
  }
}
</style>