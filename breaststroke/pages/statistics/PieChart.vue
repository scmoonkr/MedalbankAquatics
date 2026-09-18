<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ArcElement, Tooltip, Legend, PieController, ChartDataLabels);

interface ChartDataItem {
  count: number;
  discipline: string;
  course: string;
  distance: string;
}

const props = defineProps<{
  data: ChartDataItem[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = props.data.map(
    item => item.label ? item.label : `${item.discipline}-${item.course}-${item.distance}`
  );
  const counts = props.data.map(item => item.count);
  const colors = generateColors(props.data.length);

  chartInstance = new Chart(chartCanvas.value, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 40  // 외부 라벨을 위한 여백
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value}회 (${percentage}%)`;
            }
          }
        },
        datalabels: {
          color: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            // 작은 조각(10% 미만)은 검은색, 큰 조각은 흰색
            return percentage < 10 ? '#000' : '#fff';
          },
          font: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            return {
              weight: 'bold',
              size: percentage < 10 ? 11 : 14  // 작은 조각은 작은 글씨
            };
          },
          formatter: (value, context) => {
            const label = context.chart.data.labels?.[context.dataIndex];
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}\n${value}회\n(${percentage}%)`;
          },
          // 모든 라벨 표시
          display: true,
          // 작은 조각은 외부에 표시
          anchor: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            return percentage < 10 ? 'end' : 'center';
          },
          align: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            return percentage < 10 ? 'end' : 'center';
          },
          // 외부 라벨에 연결선 추가
          offset: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            return percentage < 10 ? 10 : 0;
          },
          // 배경색 추가 (가독성 향상)
          backgroundColor: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            return percentage < 10 ? 'rgba(255, 255, 255, 0.8)' : 'transparent';
          },
          borderColor: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            return percentage < 10 ? '#ccc' : 'transparent';
          },
          borderWidth: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex] as number;
            const percentage = (currentValue / total) * 100;

            return percentage < 10 ? 1 : 0;
          },
          borderRadius: 4,
          padding: 6
        }
      }
    }
  });
};

const generateColors = (count: number): string[] => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#E7E9ED', '#8DD1E1', '#FFB1C1', '#A8E6CF',
    '#FFD3B6', '#FFAAA5', '#B4A7D6', '#C7CEEA', '#FFDAC1'
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

onMounted(() => {
  createChart();
});

watch(() => props.data, () => {
  createChart();
}, { deep: true });

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.chart-container {
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