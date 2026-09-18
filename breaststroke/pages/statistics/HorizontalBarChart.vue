<template>
  <div class="chart-wrapper">
    <h3 v-if="title" class="chart-title">{{ title }}</h3>
    <div class="horizontal-bar-chart">
      <div 
        v-for="(item, index) in chartData" 
        :key="index" 
        class="bar-item" 
        :style="{ 
          backgroundColor: item.color,
          flex: `0 0 ${item.percentage}%` // ✅ 비율에 따라 너비 설정
        }"
      >
        <div class="bar-content">
          <div class="bar-label">{{ item.label }}</div>
          <div class="bar-count">{{ formatNumber(item.count) }}{{ countUnit }}</div>
          <div class="bar-percentage">{{ item.percentage }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BarItem {
  label: string
  count: number
  color?: string
}

interface Props {
  items: BarItem[]
  title?: string
  countUnit?: string
  colors?: string[]
  height?: string
  paddingY?: string
  gap?: string
  decimalPlaces?: number
  formatCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  countUnit: '',
  height: '100px',
  paddingY: '20px',
  gap: '0px',
  decimalPlaces: 1,
  formatCount: true
})

const chartData = computed(() => {
  const total = props.items.reduce((sum, item) => sum + item.count, 0)

  const defaultColors = [
    '#B8D4E8', // 연한 파랑
    '#F5C6D9', // 연한 분홍
    '#C8E6C9', // 연한 초록
    '#FFE0B2', // 연한 주황
  ]

  return props.items.map((item, index) => {
    const percentage = total > 0
      ? Number(((item.count / total) * 100).toFixed(props.decimalPlaces))
      : 0

    const color = item.color || (props.colors && props.colors[index]) || defaultColors[index % defaultColors.length]

    return {
      label: item.label,
      count: item.count,
      percentage: percentage, // ✅ 숫자로 반환
      color: color
    }
  })
})

const formatNumber = (num: number): string => {
  if (!props.formatCount) return String(num)
  return num.toLocaleString('ko-KR')
}
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 0;
  box-shadow: 0;
  padding: 0;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  padding-left: 4px;
}

.horizontal-bar-chart {
  display: flex;
  width: 100%;
  overflow: hidden;
  gap: v-bind(gap);
}

.bar-item {
  position: relative;
  /* ✅ flex: 1 제거 - 이제 인라인 스타일로 비율 적용 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 20px 0;
  min-width: 0; /* ✅ flex 자식 요소가 축소 가능하도록 */
}

.bar-item:hover {
  transform: scale(1.02);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bar-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 16px 12px;
  width: 100%; /* ✅ 내용이 부모 너비를 따르도록 */
}

.bar-label {
  @apply text-sm sm:text-lg mb-3;
  color: #333;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.bar-count {
  @apply text-lg sm:text-xl mb-3;
  color: #222;
  font-weight: 800;
  line-height: 1.2;
}

.bar-percentage {
  @apply text-xs sm:text-sm;
  color: #555;
  font-weight: 600;
  line-height: 1.2;
}

/* 반응형 */
@media (max-width: 768px) {
  .chart-wrapper {
    padding: 15px 0;
  }

  .horizontal-bar-chart {
    flex-direction: column;
    height: auto;
  }

  .bar-item {
    min-height: 110px;
    /* ✅ 모바일에서는 전체 너비 사용 */
    flex: 0 0 auto !important;
    width: 100% !important;
  }

  .bar-content {
    padding: 18px 14px;
  }

  .bar-label {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .bar-count {
    font-size: 1.3rem;
    margin-bottom: 6px;
  }

  .bar-percentage {
    font-size: 0.95rem;
  }
}
</style>