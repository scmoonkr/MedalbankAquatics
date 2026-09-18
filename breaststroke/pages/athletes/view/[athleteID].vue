<!-- components/times/TheImageCard.vue -->
<template>
	<TheSection background="#ffffff,#ffffff" :narrow="true">
		<TheBreadcrumb :menus="menus" />
	</TheSection>

	<ClientOnly>
		<div ref="pdfContent" class="pdf-container">

			<TheSection :narrow="true">
				<h1 class="text-title m-0 flex items-center gap-1">
					{{ athleteData?.name || '' }}#{{ athleteData?.athleteID || '' }}
				</h1>
				<TheSpacer />
				<div class="athlete-view">
					<TheImageProfile :athleteID="athleteData?.athleteID" :featured="featured" @change-image="handleImageChange" @remove-image="handleImageRemove" ref="profileRef" />
					<!-- <SectionMedals :times="athleteStore.currentAthlete?.times || athleteData?.times" /> -->
				</div>
			</TheSection>
			<TheSpacer size="lg" />

			<TheSection background="#ffffff,#ffffff" :narrow="true">
				<MarkdownViewer
					v-if="markdownTable.totalTimes && markdownTable.totalTimes.length > 0"
					:content="markdownTable.totalTimes"
					:showToc="false"
					:showStats="false" />
			</TheSection>
			<TheSpacer size="lg" />

			<TheSection title="경기실적" tooltip="대회에서 작성한 기록입니다." background="#ffffff,#ffffff" :narrow="true">
				<MarkdownViewer
					v-if="markdownTable.resultEvents && markdownTable.resultEvents.length > 0"
					:content="markdownTable.resultEvents"
					:showToc="false"
					:showStats="false"
				/>
			</TheSection>
			<TheSpacer size="lg" />

			<TheSection title="측정기록" tooltip="메달뱅크 평영 정기훈련에서 훈련 후 작성한 기록입니다." background="#ffffff,#ffffff" :narrow="true">
				<MarkdownViewer
					v-if="markdownTable.resultMedalbank && markdownTable.resultMedalbank.length > 0"
					:content="markdownTable.resultMedalbank"
					:showToc="false"
					:showStats="false"
				/>
			</TheSection>
			<TheSpacer size="lg" />

			<TheSection title="올림피아드" tooltip="메달뱅크 평영 정기훈련에서 훈련 후 작성한 기록입니다. 비정규종목이고 경영의 종목이 아니지만 평영과 밀접한 관련이 있다고 판단합니다." background="#ffffff,#ffffff" :narrow="true">
				<MarkdownViewer
					v-if="markdownTable.resultOlympiad && markdownTable.resultOlympiad.length > 0"
					:content="markdownTable.resultOlympiad"
					:showToc="false"
					:showStats="false"
				/>
			</TheSection>
			<TheSpacer size="lg" />

			<div v-for="(key, index) of Object.keys(markdownTable.statistics)">
				<TheSection
					:title="markdownTable.statistics[key].title"
					:subtitle="markdownTable.statistics[key].count ? `총 시도 ${markdownTable.statistics[key].count}번` : ''"
					background="#ffffff,#ffffff"
					:narrow="true"
				>

					<MarkdownViewer
						v-if="markdownTable.statistics[key].totals"
						:content="markdownTable.statistics[key].totals"
						:showToc="false"
						:showStats="false"
					/>
					<TheSpacer v-if="markdownTable.statistics[key].totals" y="20" />

					<MarkdownViewer
						v-if="markdownTable.statistics[key].seasons"
						:content="markdownTable.statistics[key].seasons"
						:showToc="false"
						:showStats="false"
					/>
					<TheSpacer v-if="markdownTable.statistics[key].seasons" y="20" />

					<LineChart
						v-if="utilAnaysis.disciplineTimes[key] && utilAnaysis.disciplineTimes[key].length > 3"
						:times="utilAnaysis.disciplineTimes[key]"
						:title="`${markdownTable.statistics[key].title}`"
						:height="500"
						:show-legend="false"
						:show-grid="true"
						line-color="rgb(239, 68, 68)"
						fill-color="rgba(239, 68, 68, 0.1)"
					/>
					<TheSpacer v-if="utilAnaysis.disciplineTimes[key] && utilAnaysis.disciplineTimes[key].length > 3" y="20" />

					<MarkdownViewer
						v-if="markdownTable.statistics[key].times"
						:content="markdownTable.statistics[key].times"
						:showToc="false"
						:showStats="false"
					/>
				</TheSection>
				<TheSpacer />
			</div>
		</div>
	</ClientOnly>
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
<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAthleteStore } from '~/stores/athletes';
import TheSection from '~/components/common/TheSection.vue';
import UtilAnaysis from '~/utils/anaysisLibrary';
import TheSpacer from '~/components/common/TheSpacer.vue';
import TheImageProfile from '~/components/common/TheImageProfile.vue';
import LineChart from './LineChart.vue';
import MarkdownViewer from '~/components/common/MarkdownViewer.vue';
import TheBreadcrumb from '~/components/layout/TheBreadcrumb.vue';
import { useMarkdown } from '~/composables/useMarkdown'
import { disciplineEngKor, getDisciplineByEng } from '~/utils/swimStyles'
const { toHtml, extractHeadings, getWordCount, getReadingTime, generateMarkdownTable } = useMarkdown()


const route = useRoute()
const athleteStore = useAthleteStore()
const utilAnaysis = new UtilAnaysis();
// 반응형 상태 정의

const pdfContent = ref(null)

const featured = ref('')
const isLoading = ref(false)


const athleteData = ref({});
const markdownData = ref({});
const markdownTable = ref({
	totalTimes: "",
	resultEvents: "",
	resultMedalbank: "",
	resultOlympiad: "",
	statistics: {}
});
const menus = ref([
	{ label: '홈', path: '/' },
	{ label: '선수명단', path: '/athletes' },
])

///########################################################
useSeoContent({
	title: athleteData.value.name,
	url: route.fullPath,
	description: '평영하는 사람',
	type: 'article',
	image: athleteData.value.featured ? featured.value : "/images/brststrk_logo_meta.png",
	site_name: '평영',
})
///########################################################

//-----------------------------------------------
// profile table options
//-----------------------------------------------
const optionsTotalResult = [
   { header: "종목", cell: '[label]' },
   { header: "개인최고기록", cell: 
      `
         <span class="font-mono">
            [time]
         </span>
         <br />
         <span class="font-mono">
            [datetime]
         </span>
      `
   },
];
const optionsResult = [
   { header: "종목", cell: '[label]' },
   { header: "결과", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [time]
         </span>
         <br />
         <span class="font-mono whitespace-nowrap">
            [datetime]
         </span>
      `
   },   
   { header: "인증", cell: '[type]' },
];
const optionsTotal = [
   { header: "구분", cell: '[label]' },
   { header: "기록", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [time]
         </span>
      `
   },
   { header: "일자", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [datetime]
         </span>
      `
   },
];
const optionsSeason = [
   { header: "구분", cell: '[label]' },
   { header: "최고", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [besttime]
         </span>
         <br />
         <span class="font-mono whitespace-nowrap">
            [datetime]
         </span>
      `
   },
   { header: "평균", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [average]
         </span>
      `
   },
];
const optionsTimes = [
   { header: "일자", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [datetime]
         </span>
      `
   },
   { header: "기록", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [time]
         </span>
      `
   },
   { header: "대회", cell: 
      `
         [competitionName]
         <br />
         [sido] · [pool]
      `
   },
   // { header: "장소", cell: 'sido' },
];

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################

try {
	isLoading.value = true;

	const athleteId = route.params.athleteID

	// 초기 필터 설정
	// ✅ useAsyncData로 SSR 데이터 fetch (SEO 설정)
	// const { data, error, status } = await useAsyncData(
	//     `athlete-${athleteId}`,
	//     () => athleteStore.fetchAthleteDetailBR(athleteId, "BR")
	// )
	const { data } = await useAsyncData(
		`athlete-${athleteId}`,
		async () => {
			const config = useRuntimeConfig()
			// store 거치지 않고 직접 호출
			const res = await $fetch(`${config.public.apiBase}/BR/athletes/${athleteId}/BR`)
			return res
		}
	)

	if (data.value.data?.times?.length > 0) {
		// const response = await athleteStore.fetchAthleteDetailBR(athleteId, "BR");
		// if (response.times.length > 0) {
		athleteData.value = data.value.data;
		featured.value = getImageURL(athleteData.value.featured)
		featured.value = athleteData.value.featured ? featured.value : `/cms/images/athletes/${athleteData.value.athleteID}/f`

		//-------------------------------------------
		// make profile data
		//-------------------------------------------
		utilAnaysis.times = athleteData.value.times;
		markdownData.value = utilAnaysis.makeProfileTable();
		//-------------------------------------------
		
		//-------------------------------------------
		// profile markdown
		//-------------------------------------------
		markdownTable.value.totalTimes = generateMarkdownTable(markdownData.value.totalTimes, optionsTotalResult);
		markdownTable.value.resultEvents = generateMarkdownTable(markdownData.value.resultEvents, optionsResult);
		markdownTable.value.resultMedalbank = generateMarkdownTable(markdownData.value.resultMedalbank, optionsResult);
		markdownTable.value.resultOlympiad = generateMarkdownTable(markdownData.value.resultOlympiad, optionsResult);
		markdownTable.value.statistics = {};
		for (const key of Object.keys(markdownData.value.statistics)) {
			if (!markdownTable.value.statistics[key]) markdownTable.value.statistics[key] = {};
			markdownTable.value.statistics[key].title =  markdownData.value.statistics[key].title ?? '';
			markdownTable.value.statistics[key].count =  markdownData.value.statistics[key].count ?? '';
			markdownTable.value.statistics[key].totals = generateMarkdownTable(markdownData.value.statistics[key].totals, optionsTotal);
			markdownTable.value.statistics[key].seasons = generateMarkdownTable(markdownData.value.statistics[key].seasons, optionsSeason);
			markdownTable.value.statistics[key].times = generateMarkdownTable(markdownData.value.statistics[key].times, optionsTimes);
		}
	}
} catch (error) {
	console.error("데이터 로드 오류:", error);
} finally {
	isLoading.value = false;
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
		pdf.save(`#${athleteData.value.athleteID}${athleteData.value.name}수영기록분석보고서.pdf`)
	} catch (error) {
		console.error('PDF 생성 실패:', error)
		alert('PDF 생성에 실패했습니다.')
	}
}

const handleImageRemove = () => { }
const handleImageChange = () => { }

onMounted(async () => {
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
<style scoped></style>