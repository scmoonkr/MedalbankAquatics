<template>
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <TheBreadcrumb :menus="menus" />
  </TheSection>

  <TheSection background="#ffffff,#ffffff" :narrow="true">
			<ReportPDF
				:markdown="reportMarkdown"
				:summary="summaryMarkdown"
				:times="swimmingTimes"
				filename="수영기록분석보고서.pdf"
			/>
  </TheSection>
</template>

<script setup>
	
import ReportPDF from './ReportPDF.vue';
const reportMarkdown = ref(`
# 수영 기록 분석 보고서

## 선수 정보
- **이름**: 홍길동
- **종목**: 자유형 100M
- **분석 기간**: 2025년 1월 ~ 3월

## 훈련 내용
지속적인 **인터벌 트레이닝**과 **기술 향상 훈련**을 통해 
기록이 꾸준히 개선되고 있습니다.
`)

const summaryMarkdown = ref(`
## 분석 결과

### 주요 성과
- 최고 기록: **58.23초** (2025-03-08)
- 평균 기록 개선: **2.5초** 향상
- 일관성: 최근 5경기 **표준편차 0.8초**

### 향후 목표
다음 대회에서 **58초 벽 돌파**를 목표로 합니다.
`)

const swimmingTimes = ref([
  { timeStamp: 0.0254, datetime: '2025-01-15' },
  { timeStamp: 0.0248, datetime: '2025-02-01' },
  { timeStamp: 0.0245, datetime: '2025-02-15' },
  { timeStamp: 0.0242, datetime: '2025-03-01' },
  { timeStamp: 0.0240, datetime: '2025-03-08' }
])
</script>