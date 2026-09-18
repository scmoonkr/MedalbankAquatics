<template>
  <div>

    <button @click="downloadPDF" >
      📥 PDF 다운로드
    </button>
    <!-- PDF로 변환할 전체 컨텐츠 -->
    <div ref="pdfContent" class="pdf-container">
      <!-- Markdown 컨텐츠 -->
      <div class="markdown-section">
        <div v-html="renderedMarkdown"></div>
      </div>

      <!-- Chart.js 차트 -->
      <div class="chart-section">
        <h2>기록 변화 그래프</h2>
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- 추가 Markdown 컨텐츠 -->
      <div class="markdown-section">
        <div v-html="renderedSummary"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  markdown: {
    type: String,
    default: '# 수영 기록 분석 보고서\n\n## 개요\n이 문서는...'
  },
  summary: {
    type: String,
    default: '## 분석 결과\n\n최근 기록이 향상되고 있습니다.'
  },
  times: {
    type: Array,
    required: true
  },
  filename: {
    type: String,
    default: 'swimming-report.pdf'
  }
})

const pdfContent = ref(null)
const chartCanvas = ref(null)
let chartInstance = null

// Markdown 렌더링
const renderedMarkdown = computed(() => marked(props.markdown))
const renderedSummary = computed(() => marked(props.summary))

// Chart.js 차트 생성
const createChart = async () => {
  if (!chartCanvas.value) return

  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  const sortedTimes = [...props.times].sort(
    (a, b) => new Date(a.datetime) - new Date(b.datetime)
  )

  const labels = sortedTimes.map(t => {
    const date = new Date(t.datetime)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  const data = sortedTimes.map(t => (t.timeStamp * 24 * 60 * 60).toFixed(2))

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '기록 (초)',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          reverse: true,
          title: {
            display: true,
            text: '기록 (초)'
          }
        },
        x: {
          title: {
            display: true,
            text: '날짜'
          }
        }
      }
    }
  })
}

// PDF 다운로드
const downloadPDF = async () => {
  const { default: jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')

  if (!pdfContent.value) return

  try {
    // 로딩 표시 (선택사항)
    console.log('PDF 생성 중...')

    // HTML을 캔버스로 변환
    const canvas = await html2canvas(pdfContent.value, {
      scale: 2, // 고해상도
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    
    // PDF 생성
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // 첫 페이지
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 여러 페이지 처리
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // PDF 저장
    pdf.save(props.filename)
    console.log('PDF 저장 완료!')
  } catch (error) {
    console.error('PDF 생성 실패:', error)
    alert('PDF 생성에 실패했습니다.')
  }
}

onMounted(() => {
  createChart()
})
</script>

<style scoped>
.pdf-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  font-family: 'Noto Sans KR', -apple-system, sans-serif;
}

.markdown-section {
  margin-bottom: 30px;
  line-height: 1.8;
}

.markdown-section :deep(h1) {
  font-size: 32px;
  margin-bottom: 20px;
  color: #1a1a1a;
  border-bottom: 3px solid #3b82f6;
  padding-bottom: 10px;
}

.markdown-section :deep(h2) {
  font-size: 24px;
  margin: 30px 0 15px;
  color: #333;
}

.markdown-section :deep(p) {
  margin: 15px 0;
  color: #444;
}

.markdown-section :deep(strong) {
  color: #1a1a1a;
  font-weight: 600;
}

.chart-section {
  margin: 40px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.chart-section h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

.chart-section canvas {
  width: 100% !important;
  height: 400px !important;
}

.btn-download {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  z-index: 1000;
}

.btn-download:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* 인쇄용 스타일 */
@media print {
  .btn-download {
    display: none;
  }
}
</style>