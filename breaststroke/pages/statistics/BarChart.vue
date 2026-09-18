<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, BarController, ChartDataLabels)

interface ChartDataItem {
  label: string
  count: number
}

interface Props {
  data: ChartDataItem[]
  title?: string
  horizontal?: boolean
  showLegend?: boolean
  showDataLabels?: boolean
  colorScheme?: 'default' | 'gradient' | 'monochrome' | 'rainbow'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  horizontal: false,
  showLegend: false,
  showDataLabels: false, // 색인값 표시
  colorScheme: 'default'
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const labels = props.data.map(item => item.label)
  const counts = props.data.map(item => item.count)
  const colors = generateColors(props.data.length, props.colorScheme)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: props.title || '데이터',
        data: counts,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: props.horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 30,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      scales: {
        x: {
          grid: {
            display: !props.horizontal,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: props.horizontal,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 12,
              weight: '500'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: props.showLegend,
          position: 'top',
          labels: {
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 15
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || ''
              const value = context.parsed.y || context.parsed.x || 0
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value}회 (${percentage}%)`
            }
          }
        },
        datalabels: {
          display: props.showDataLabels,
          color: '#333',
          font: {
            weight: 'bold',
            size: 13
          },
          anchor: 'end',
          align: 'top',
          formatter: (value: number, context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${value}회\n(${percentage}%)`
          },
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: '#ddd',
          borderWidth: 1,
          borderRadius: 4,
          padding: 6
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  })
}

const generateColors = (count: number, scheme: string) => {
  let baseColors: string[] = []

  switch (scheme) {
    case 'gradient':
      // 그라데이션 효과
      baseColors = generateGradientColors(count, '#4F46E5', '#EC4899')
      break
    case 'monochrome':
      // 단색 계열
      baseColors = generateMonochromeColors(count, '#3B82F6')
      break
    case 'rainbow':
      // 무지개색
      baseColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#E7E9ED', '#8DD1E1', '#FFB1C1', '#A8E6CF',
        '#FFD3B6', '#FFAAA5', '#B4A7D6', '#C7CEEA', '#FFDAC1'
      ]
      break
    default:
      // 기본 색상
      baseColors = [
        '#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6',
        '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
      ]
  }

  const background = []
  const border = []

  for (let i = 0; i < count; i++) {
    const color = baseColors[i % baseColors.length]
    background.push(color + 'CC') // 80% opacity
    border.push(color)
  }

  return { background, border }
}

const generateGradientColors = (count: number, startColor: string, endColor: string): string[] => {
  const colors = []
  const start = hexToRgb(startColor)
  const end = hexToRgb(endColor)

  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1)
    const r = Math.round(start.r + ratio * (end.r - start.r))
    const g = Math.round(start.g + ratio * (end.g - start.g))
    const b = Math.round(start.b + ratio * (end.b - start.b))
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }

  return colors
}

const generateMonochromeColors = (count: number, baseColor: string): string[] => {
  const colors = []
  const base = hexToRgb(baseColor)

  for (let i = 0; i < count; i++) {
    const lightness = 1 - (i / count) * 0.6 // 0.4 ~ 1.0
    const r = Math.round(base.r * lightness)
    const g = Math.round(base.g * lightness)
    const b = Math.round(base.b * lightness)
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }

  return colors
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  createChart()
}, { deep: true })

watch([
  () => props.horizontal,
  () => props.showLegend,
  () => props.showDataLabels,
  () => props.colorScheme
], () => {
  createChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  height: 400px;
  position: relative;
  width: 100%;
  background: #fff;
  border: 1px solid rgb(209 213 219/var(--tw-border-opacity, 1));
  border-radius: 0;
  box-shadow: 0;
  padding: 0;
}

canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>