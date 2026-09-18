<!-- athletes/index.vue -->
<template>
	<TheSection background="#ffffff,#ffffff" :narrow="true">
		<TheBreadcrumb :menus="menus" />
	</TheSection>

	<TheSection background="#ffffff,#ffffff" :narrow="true">
		<FilterButtons :filters="filters" @change-field="onFilterChange" />
	</TheSection>
	<TheSpacer />

	<div ref="pdfContent" class="pdf-container">
		<TheSection title="선수 목록" :tooltip="COPY.disclaimer" :narrow="true">
			<div class="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fit,80px)] sm:justify-start">
				<div v-for="(athlete, index) of athletesData" :key="index" class="cursor-pointer hover:font-bold" @click="clickAthlete(athlete)">
					<div class="w-full sm:w-[80px]">
						<TheImageProfile :athleteID="athlete?.athleteID" :featured="getImageURL(athlete?.thumbnail)" @change-image="handleImageChange" @remove-image="handleImageRemove" ref="profileRef" />
						<TheSpacer size="xs" />
						<div class="leading-tight">
							<div class="text-xs truncate">{{ athlete?.name || '' }}</div>
							<div class="text-xs opacity-70 truncate">#{{ athlete?.athleteID || '' }}</div>
						</div>

					</div>

				</div>
			</div>
			<!-- <SectionMedals :times="athleteStore.currentAthlete?.times || athleteData?.times" /> -->
		</TheSection>

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
import { ref } from 'vue';
import { COPY } from '~/constants/copy';
import { useRouter, useRoute } from 'vue-router';
import { useAthleteStore } from '~/stores/athletes';
import type { JsonOptions, FilterItem } from '~/types/common';
import TheSection from '~/components/common/TheSection.vue';
import UtilAnaysis from '~/utils/anaysisLibrary';
import TheSpacer from '~/components/common/TheSpacer.vue';
import TheImageProfile from '~/components/common/TheImageProfile.vue';
import FilterButtons from '~/components/common/TheFilters.vue';
import TheBreadcrumb from '~/components/layout/TheBreadcrumb.vue';


const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig()
const athleteStore = useAthleteStore()

// 반응형 상태 정의
const pdfContent = ref(null)

const featured = ref('')
const isLoading = ref(false)

const receivedData = ref([]);
const athletesData = ref([]);
const utilAnaysis = new UtilAnaysis();
const menus = ref([
	{ label: '홈', path: '/' },
	{ label: '선수명단', path: '/athletes' },
])

// ref로 사용할 때의 타입
const filters = ref<FilterItem[]>([
	{ field: 'gender', selected: '전체', options: ['전체', '남자', '여자'] },
	{ field: 'sort', selected: '가입순서순정렬', options: ['가입순서순정렬', '이름순정렬'] },
]);

///########################################################
useSeoContent({
	title: "선수명단",
	url: route.fullPath,
	description: '평영 선수명단',
	type: 'article',
	image: "/images/brststrk_logo_meta.png",
	site_name: '선수명단',
} as SeoOptions)
///########################################################

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
	try {
		isLoading.value = true;

		// 초기 필터 설정

		const response = await athleteStore.fetchAthleteListBR(1, 1000);
		receivedData.value = [...response];
		athletesData.value = [...receivedData.value]
		// if (response.data.length > 0) {
		// 	athleteData.value = response;
		// 	utilAnaysis.times = response.times;
		// 	markdownTable.value = utilAnaysis.makeProfileTable();
		// }
	} catch (error) {
		console.error("데이터 로드 오류:", error);
	} finally {
		isLoading.value = false;
	}
}

// 컴포저블 함수 사용
// history back시 onMount 처리
usePageNavigation(loadServerData);
/*
try {
	athletesData.value = [];
	// 기존 API 엔드포인트 사용
	const response = await $fetch(`${config.public.apiBase}/BR/athletes`, {
		method: 'POST',
		body: {}
	})
	console.log("athletes =====>", response);
	if (response.data && Array.isArray(response.data)) {
		athletesData.value = response.data;
	}


} catch (error) {
	console.error('SSR 선수 데이터 로딩 실패:', error)
	throw createError({
		statusCode: 404,
		statusMessage: 'Athlete not found'
	})
}
*/
const onFilterChange = async (field: string, value: string) => {
	const body = { sort: "athleteID" };
	switch (field) {
		case "sort":
			athletesData.value = value == '가입순서순정렬'
				? athletesData.value.sort((a, b) => a.athleteID - b.athleteID)
				: athletesData.value.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case "gender":
			if (value) {
				switch (value) {
					case "남자":
						athletesData.value = receivedData.value.filter(el => el.gender == 'men').map(el => ({ ...el }))
						break
					case "여자":
						athletesData.value = receivedData.value.filter(el => el.gender == 'women').map(el => ({ ...el }))
						break
				}
			}
			break;
		default:
			return;
	}
}

const handleImageRemove = () => { }
const handleImageChange = () => { }


const clickAthlete = (athlete) => {
	router.push({
		path: `/athlete/${athlete.athleteID}`,
	});
}

onMounted(() => {
	if (process.client) {
		// import('mermaid').then(({ default: mermaid }) => {
		//   mermaid.initialize({ 
		//     startOnLoad: true,
		//     theme: 'default'
		//   });
		//   mermaid.contentLoaded();
		// });
	}
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