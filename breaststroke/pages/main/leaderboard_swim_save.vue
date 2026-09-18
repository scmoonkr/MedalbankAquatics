<template>
  <div class="leaderboard-wrapper">
    <!-- 실제 이미지로 변환된 전광판 (처음엔 숨겨져 있음) -->
    <img v-if="imageDataUrl" :src="imageDataUrl" alt="전광판 이미지" class="converted-image" :class="[`width-${width}`]" />

    <!-- 원본 전광판 (이미지로 변환되기 전에만 표시) -->
    <div v-if="!imageDataUrl" class="swimming-leaderboard" :class="[`width-${width}`]" ref="leaderboardRef"
      id="board-to-convert">
      <div class="leaderboard-header">
        <h3 class="leaderboard-title">{{ generateTitle }}</h3>
      </div>
      <div class="leaderboard-body">
        <div v-for="timeRecord in leaderboard.times" :key="timeRecord.rank" class="leaderboard-row"
          :class="{ 'empty-row': !timeRecord.name }">
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
          <div class="swimmer-time">{{ timeRecord.time }}</div>
        </div>
        <!-- 빈 레코드 표시 (8개까지) -->
        <div v-for="i in getEmptyRows" :key="`empty-${i}`" class="leaderboard-row empty-row">
          <div class="rank-container">
            <div class="rank-circle">
              {{ leaderboard.times.length + i }}
            </div>
          </div>
          <div class="swimmer-name"></div>
          <div class="swimmer-time"></div>
        </div>
      </div>
      <div class="leaderboard-footer">
        <div class="date-info">{{ dateInfo }}</div>
        <div class="source-info">{{ sourceInfo }}</div>
      </div>
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
import { computed, ref, onMounted } from 'vue';
import type { LeaderboardCategory } from '@/types/main';

type WidthType = 'small' | 'medium' | 'large';

// refs
const leaderboardRef = ref<HTMLElement | null>(null);
const imageDataUrl = ref<string | null>(null);

// props 정의
const props = defineProps({
  leaderboard: {
    type: Object as () => LeaderboardCategory,
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

// 타이틀 생성 함수
const generateTitle = computed(() => {
  const genderText = props.leaderboard.gender === 'men' ? '남자' :
    props.leaderboard.gender === 'women' ? '여자' : '혼성';

  const styleText = props.leaderboard.style === 'freestyle' ? '자유형' :
    props.leaderboard.style === 'backstroke' ? '배영' :
      props.leaderboard.style === 'breaststroke' ? '평영' :
        props.leaderboard.style === 'butterfly' ? '접영' :
          props.leaderboard.style === 'individualMedley' ? '개인혼영' :
            props.leaderboard.style === 'medleyRelay' ? '혼계영' :
              props.leaderboard.style;

  const courseText = props.leaderboard.course === 'SCM' ? 'SCM' :
    props.leaderboard.course === 'LCM' ? 'LCM' :
      props.leaderboard.course;

  return `${genderText} ${styleText} ${props.leaderboard.distance} ${courseText} (전국)`;
});

// 빈 행 수 계산 (최대 8행까지 표시)
const getEmptyRows = computed(() => {
  const maxRows = 8;
  const currentRows = props.leaderboard.times.length;
  return currentRows < maxRows ? maxRows - currentRows : 0;
});

// HTML 요소를 이미지로 변환하는 함수
const convertToImage = async () => {
  if (!leaderboardRef.value) return;

  try {
    // html2canvas 라이브러리 import
    const { default: html2canvas } = await import('html2canvas');

    // 전광판 요소를 캔버스로 변환
    const canvas = await html2canvas(leaderboardRef.value, {
      backgroundColor: null,
      scale: 2, // 고해상도를 위해 2배 스케일
      useCORS: true,
      logging: false,
      allowTaint: true
    });

    // 캔버스를 이미지 데이터 URL로 변환
    imageDataUrl.value = canvas.toDataURL('image/png');

  } catch (error) {
    console.error('이미지 변환 중 오류 발생:', error);
  }
};

// 컴포넌트 마운트 시 이미지로 변환
onMounted(async () => {
  // 요소가 렌더링된 후 이미지로 변환
  await nextTick();
  await convertToImage();
});
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
.leaderboard-wrapper {
  position: relative;
  display: inline-block;
}

.swimming-leaderboard,
.converted-image {
  background: linear-gradient(180deg, #0a1729 0%, #0d1f36 100%);
  border-radius: 12px;
  overflow: hidden;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.converted-image {
  display: block;
  /* 이미지 표시 */
}

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

/* 모바일 반응형 */
@media (max-width: 480px) {

  .width-large,
  .width-medium {
    width: 100%;
    max-width: 450px;
  }
}
</style>