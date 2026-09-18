<template>
  <div class="swimming-leaderboard" :class="[`width-${width}`]">
    <div class="leaderboard-header">
      <h3 class="leaderboard-title">{{ title }} {{ subtitle }}</h3>
    </div>
    <div class="leaderboard-body">
      <div v-for="timeRecord in times" :key="timeRecord.rank" class="leaderboard-row"
        :class="{ 'empty-row': !timeRecord.name, 'clickable': !!timeRecord.name }"
        @click="timeRecord.name ? handleRowClick(timeRecord) : null">
        <div class="rank-container">
          <div class="rank-circle" :class="{
            'gold': timeRecord.rank === 1,
            'silver': timeRecord.rank === 2,
            'bronze': timeRecord.rank === 3
          }">
            {{ timeRecord.rank }}
          </div>
        </div>
        <div class="swimmer-name">{{ timeRecord.name }}</div>
        <div class="swimmer-time">{{ timeRecord.value }}</div>
      </div>
    </div>
    <div class="leaderboard-footer">
      <div class="date-info">{{ dateInfo }}</div>
      <div class="source-info">{{ sourceInfo }}</div>
    </div>
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
import { computed } from 'vue';
const emit = defineEmits(['row-click']);
import type { LeaderboardModel } from '~/models/leaderboard';

type WidthType = 'small' | 'medium' | 'large';

// props 정의
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  field: {
    type: String,
    default: 'time'
  },
  times: {
    type: Array,
    default: [],
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

// 빈 행 수 계산 (최대 8행까지 표시)
const times = computed(() => {
  const timeArr = [];
  const arr = props.times ?? [];

  let i = 0;
  for (; i < props.times.length; i++) {
    const obj = {
      rank: (i + 1),
      name: (arr[i] as any).name,
      value: (arr[i] as any)[props.field ?? 'time'],
      original: arr[i] // 원본 데이터도 저장
    };
    if (props.field == 'datetime' && obj.value.length > 10) obj.value = obj.value.slice(0, 10);
    timeArr.push(obj);
  }
  for (; i < 8; i++) {
    timeArr.push({ rank: (i + 1), name: '', value: '' });
  }
  return timeArr;
});

// 행 클릭 핸들러 함수
const handleRowClick = (row: any) => {
  if (!row.name) return;

  // 원본 데이터가 있으면 원본 데이터를 emit, 없으면 현재 row를 emit
  emit('row-click', row.original || row);
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
/* 기존 스타일 유지 */
.swimming-leaderboard {
  background: linear-gradient(180deg, #0a1729 0%, #0d1f36 100%);
  border-radius: 12px;
  overflow: hidden;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

/* 클릭 가능한 행에 대한 스타일 추가 */
.clickable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 나머지 스타일 유지 */
/* 크기별 스타일 */
.width-small {
  width: 210px;
  font-size: 0.9em;
}

.width-medium {
  width: 270px;
  font-size: 1em;
}

.width-large {
  width: 365px;
  font-size: 1.1em;
}

.leaderboard-header {
  padding: 12px 15px;
  background-color: rgba(0, 0, 0, 0.2);
}

.leaderboard-title {
  margin: 0;
  font-size: 1em;
  font-weight: 600;
}

.leaderboard-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.leaderboard-row {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.leaderboard-row:last-child {
  border-bottom: none;
}

.empty-row {
  opacity: 0.5;
}

.rank-container {
  margin-right: 15px;
}

.rank-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-color: #264763;
  color: white;
}

/* 크기에 따른 동적 스타일 */
.width-small .rank-circle {
  width: 20px;
  height: 20px;
  font-size: 0.8em;
  border-radius: 50%;
}

.width-medium .rank-circle {
  width: 24px;
  height: 24px;
  font-size: 0.9em;
  border-radius: 50%;
}

.width-large .rank-circle {
  width: 30px;
  height: 30px;
  font-size: 1em;
  border-radius: 50%;
}

.gold {
  background-color: #FFD700;
  color: #000;
}

.silver {
  background-color: #C0C0C0;
  color: #000;
}

.bronze {
  background-color: #CD7F32;
  color: #000;
}

.swimmer-name {
  flex: 1;
  font-weight: 500;
}

.swimmer-time {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  margin-left: auto;
}

.width-small .swimmer-name,
.width-small .swimmer-time {
  font-size: 0.8em;
}

.width-medium .swimmer-name,
.width-medium .swimmer-time {
  font-size: 0.9em;
}

.width-large .swimmer-name,
.width-large .swimmer-time {
  font-size: 1em;
}

.leaderboard-footer {
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.width-small .leaderboard-footer {
  font-size: 9px;
}

.width-medium .leaderboard-footer {
  font-size: 11px;
}

.width-large .leaderboard-footer {
  font-size: 12px;
}

.date-info {
  margin-bottom: 4px;
}

.source-info {
  opacity: 0.8;
  white-space: pre-line;
}

.row-button {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: auto;
  cursor: pointer;
}

/* 모바일 반응형 */
@media (max-width: 480px) {

  .width-large,
  .width-medium {
    width: 100%;
    max-width: 450px;
  }
}
</style>