<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  times: {
    type: Array,
    required: true,
    // times = [{ timeStamp, datetime }, ...]
  },
  title: {
    type: String,
    default: '기록 변화'
  },
  // event: {
  //   type: String,
  //   default: ''
  // },
  // discipline: {
  //   type: String,
  //   default: ''
  // },
  // distance: {
  //   type: String,
  //   default: ''
  // },
  // course: {
  //   type: String,
  //   default: ''
  // },
  height: {
    type: Number,
    default: 400
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  lineColor: {
    type: String,
    default: 'rgb(59, 130, 246)'
  },
  fillColor: {
    type: String,
    default: 'rgba(59, 130, 246, 0.1)'
  }
})

const chartCanvas = ref(null)
let chartInstance = null

// timeStamp를 시간 문자열로 변환
const formatTimeFromTimestamp = (timestamp) => {
  const totalSeconds = timestamp * 24 * 60 * 60
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`
  } else {
    return seconds.toFixed(2)
  }
}

// 날짜 포맷 (월/일)
const formatDate = (datetime) => {
  const date = new Date(datetime)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 차트 생성
const createChart = async () => {
  if (!chartCanvas.value || !props.times?.length) return

  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  // const sortedTimes = [...props.times].sort(
  //   (a, b) => new Date(a.datetime) - new Date(b.datetime)
  // )
  const sortedTimes = props.times.filter(t => t.timeStamp)
                                 .sort((a,b) => new Date(a.datetime)-new Date(b.datetime));

  const labels = sortedTimes.map(t => formatDate(t.datetime))
  const data = sortedTimes.map(t => t.timeStamp * 24 * 60 * 60)
  const average = data.reduce((sum, val) => sum + val, 0) / data.length

  if (chartInstance) {
    chartInstance.destroy()
  }

  // ✅ 커스텀 플러그인으로 배경 그리기
  const backgroundColorPlugin = {
    id: 'customBackgroundColor',
    beforeDraw: (chart) => {
      const { ctx, chartArea: { left, right, top, bottom }, scales: { y } } = chart
      
      // 평균선의 Y 좌표 계산
      const avgY = y.getPixelForValue(average)
      
      ctx.save()
      
      // 상단 영역 (평균보다 좋은 기록 - 연한 빨강)
      ctx.fillStyle = 'rgba(252, 165, 165, 0.2)'
      ctx.fillRect(left, top, right - left, avgY - top)
      
      // 하단 영역 (평균보다 나쁜 기록 - 흰색)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillRect(left, avgY, right - left, bottom - avgY)
      
      // 평균선 그리기
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(left, avgY)
      ctx.lineTo(right, avgY)
      ctx.stroke()
      ctx.setLineDash([])
      
      ctx.restore()
    }
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '기록 (초)',
        data,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent', // 배경색 투명
        tension: 0.4,
        fill: false, // fill 비활성화
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: props.title ?? 'title', // 'FR SCM 50M 기록 변화',
          font: {
            size: 18,
            weight: 'bold'
          }
        }
      },
      // ✅ 툴팁 커스터마이징
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: "'Noto Sans KR', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Noto Sans KR', sans-serif"
        },
        callbacks: {
          // ✅ 툴팁 제목 (날짜)
          title: (context) => {
            const index = context[0].dataIndex
            const datetime = sortedTimes[index].datetime
            const date = new Date(datetime)
            
            // 년/월/일 형식으로 표시
            return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
          },
          // ✅ 툴팁 내용 (기록)
          label: (context) => {
            const index = context.dataIndex
            const timestamp = sortedTimes[index].timeStamp
            const time = formatTimeFromTimestamp(timestamp)
            
            return `기록 (초): ${time}`
          },
          // ✅ 추가 정보 (선택사항)
          afterLabel: (context) => {
            const index = context.dataIndex
            const currentTime = data[index]
            const diff = currentTime - average
            const diffFormatted = Math.abs(diff).toFixed(2)
            
            if (diff < 0) {
              return `평균보다 ${diffFormatted}초 빠름`
            } else if (diff > 0) {
              return `평균보다 ${diffFormatted}초 느림`
            } else {
              return '평균과 동일'
            }
          }
        }
      },
      scales: {
        y: {
          reverse: false, // y축 낮은 시간이 위로 (더 좋은 기록)
          title: {
            display: true,
            text: '기록 (초)'
          },
          ticks: {
            callback: (value) => formatTimeFromTimestamp(value / (24 * 60 * 60))
          }
        },
        x: {
          title: {
            display: true,
            text: '날짜'
          }
        }
      }
    },
    plugins: [backgroundColorPlugin] // ✅ 커스텀 플러그인 추가
  })
}

// 컴포넌트 마운트 시 차트 생성
onMounted(() => {
  createChart()
})

// props 변경 시 차트 재생성
watch(() => props.times, () => {
  createChart()
}, { deep: true })

// watch(() => props.event, () => {
//   const [discipline,course,distance] = props.event.split('_');
//   discipline.value = discipline;
//   course.value = course;
//   distance.value = distance;
//   createChart()
// })

// 컴포넌트 언마운트 시 차트 제거
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: v-bind('height + "px"');
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

canvas {
  max-width: 100%;
}
</style>