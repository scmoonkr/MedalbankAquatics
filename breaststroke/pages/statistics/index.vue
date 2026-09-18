<!-- components/times/TheImageCard.vue -->
<template>

	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<TheSection background="#ffffff,#ffffff" :narrow="true">
		<TheBreadcrumb :menus="menus" />
	</TheSection>



  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <TheSection :narrow="true">
		<div class="search-field">
			<input
				ref="searchInput" 
				type="text"
				v-model="searchQuery"
				placeholder="선수명 검색"
				@keyup.enter="clickSearch"
			/>
			<button class="button-default button-search" @click="clickSearch">
				검색
			</button>
		</div>
		<TheSpacer size="sm" />
  </TheSection>

	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<TheSection background="#ffffff,#ffffff" :narrow="true">
		<div class="button-group-filters">
			<TheButton text="리더보드" :onClick="() => router.push('/leaderboards')" />
			<TheButton text="올림피아드" :onClick="() => router.push('/olympiad')" />
			<TheButton text="명예의전당" :onClick="() => router.push('/halloffame')" />
		</div>
	</TheSection>
	<TheSpacer />

	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<SectionLoading v-if="isLoading"></SectionLoading>

	<TheSection title="그냥 평영을 좋아하는, 평영을 하는 사람들" subtitle="소속 상관 없이, 여러분 모두의 더 나은 평영을 위해 항상 더 고민하고 실천하겠습니다. 성심을 다해 보조하겠습니다. 평영 화이팅." tooltip="가입순서나 경기실적과는 전혀 무관하게 12명의 선수들이 항상 랜덤으로 표시됩니다. 새로고침시 다른 선수들로 변경됩니다. 프로필 이미지가 흑백으로 되어 있는 경우, 본인의 얼굴이 아닌 A.I.가 임의로 생성한 이미지일 수 있으며, 본인의 사진으로 업데이트를 희망하는 경우 오른쪽 상단의 설문조사를 통해 가능합니다. 참고해주세요. 감사합니다." :narrow="true">
		<div class="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fit,80px)] sm:justify-start">
			<div v-for="(item, index) in markdownTimes.athletes" :key="index">
				<div @click="clickAthlete(item)" class="cursor-pointer hover:font-bold">
					<TheImageProfile :athleteID="item.athleteID" :featured="getImageURL(item?.featured)" @change-image="clickAthlete(item)" @remove-image="handleImageRemove" ref="profileRef" />
					<TheSpacer size="xs" />
					<div class="leading-tight">
						<div class="text-xs truncate">{{ item.name }}</div>
						<div class="text-xs opacity-70 truncate">#{{ item.athleteID }}</div>
					</div>
				</div>
			</div>
			<div class="cursor-pointer hover:font-bold">
				<div @click="gotoAthletes" class="relative w-full aspect-[4/5] sm:h-[100px] sm:aspect-auto overflow-hidden bg-slate-100">
					<img src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%22100%22><rect width=%2280%22 height=%22100%22 fill=%22%23e5e7eb%22/></svg>' ; />
				</div>
				<TheSpacer size="xs" />
				<div class="leading-tight text-[#eee]">
					<div class="text-xs truncate">더 보기</div>
					<div class="text-xs opacity-70 truncate">전체</div>
				</div>
			</div>
		</div>
		<!-- <SectionMedals :times="athleteStore.currentAthlete?.times || athleteData?.times" /> -->
	</TheSection>
	<TheSpacer size="lg" />




	<div ref="pdfContent" class="pdf-container">
		<TheSection title="평영 신기록 현황" subtitle="평영 각 종목의 최고기록을 확인하세요." :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">
		</TheSection>
		<TheSection background="#ffffff,#ffffff" :narrow="true">
			<FilterButtons :filters="filters" @change-field="onFilterChange" />
		</TheSection>
		<TheSpacer />
		<TheSection background="#ffffff,#ffffff" :narrow="true">
			<!-- <DatatableLeaderboards :times="markdownTable.top3[key].top3Times" :key="'leaderboard-' + currentPage" @page-change="handlePageChange" /> -->
			<!-- {{markdownTable.top1}} -->
			<MarkdownViewer v-if="markdownTable.top1Markdown.length > 0" :content="markdownTable.top1Markdown" :showToc="false" :showStats="false" />
			<!-- <TheDataTable
				v-if="markdownTable.top1 && markdownTable.top1.length > 0"
				:times="markdownTable.top1"
				:options="optionsStatisticsTop1"
			/> -->
			<TheSpacer />
		</TheSection>





		<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
		<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
		<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
		<div v-for="(key, index) of Object.keys(markdownTable.top3)" :key="index">
			<TheSection :title="markdownTable.top3[key].label.replace(' M ', ' ')" :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">
				<!-- <DatatableLeaderboards :times="markdownTable.top3[key].top3Times" :key="'leaderboard-' + currentPage" @page-change="handlePageChange" /> -->

				<MarkdownViewer v-if="markdownTable.top3[key].top3Markdown.length > 0" :content="markdownTable.top3[key].top3Markdown" :showToc="false" :showStats="false" />
				<!-- <DataTable :times="markdownTable.top3[key].top3Times" :options="options" /> -->
				<TheSpacer />
			</TheSection>
		</div>
	</div>
	<TheSpacer size="lg" />

	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<TheSection title="평영 통계" :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">
		<MarkdownViewer v-if="markdownTable.totalMarkdown" :content="markdownTable.totalMarkdown" :showToc="false" :showStats="false" />
	</TheSection>
	<TheSpacer size="lg" />

	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<TheSection title="기록 평균" :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">
		<MarkdownViewer v-if="markdownTable.averageMarkdown" :content="markdownTable.averageMarkdown" :showToc="false" :showStats="false" />
	</TheSection>
	<TheSpacer size="lg" />

	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<TheSection title="기록 백분율" :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">
		<MarkdownViewer v-if="markdownTable.percentageMarkdown" :content="markdownTable.percentageMarkdown" :showToc="false" :showStats="false" />
	</TheSection>
	<TheSpacer size="lg" />

	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
	<TheSection title="재미로 보는 통계" subtitle="본 사이트 내에 수집된 자료의 통계이므로 일반적인 평영 통계와는 무관합니다." :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">
		<div v-if="graphData!.type && graphData!.type.length > 0">
			<HorizontalBarChart :items="graphData!.type" count-unit="" />
		</div>
		<TheSpacer />
		<div v-if="graphData!.course && graphData!.course.length > 0">
			<HorizontalBarChart :items="graphData!.course" />
		</div>
		<TheSpacer />
		<div v-if="graphData!.isMasters && graphData!.isMasters.length > 0">
			<HorizontalBarChart :items="graphData!.isMasters" />
		</div>
		<TheSpacer />
		<div v-if="graphData!.isJunior && graphData!.isJunior.length > 0">
			<HorizontalBarChart :items="graphData!.isJunior" />
		</div>
		<TheSpacer />
		<div v-if="graphData!.distance && graphData!.distance.length > 0">
			<HorizontalBarChart :items="graphData!.distance" />
		</div>
		<TheSpacer />
		<div v-if="graphData!.gender && graphData!.gender.length > 0">
			<HorizontalBarChart :items="graphData!.gender" />
		</div>

	</TheSection>
	<TheSpacer size="lg" />

	<TheSection title="종목별 비율" subtitle=" 본 사이트 내에 수집된 자료의 통계이므로 일반적인 평영 통계와는 무관합니다." :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">

		<div v-if="graphData!.heat && graphData!.heat.length > 0">
			<!-- <label class="text-2xl font-bold">영법/코스/거리별 비율</label> -->
			<BarChart :data="graphData!.heat" />
		</div>


	</TheSection>
	<TheSpacer size="lg" />

	<TheSection title="남자 평영 50M LCM 기록 분포" subtitle=" 본 사이트 내에 수집된 자료의 통계이므로 일반적인 평영 통계와는 무관합니다." :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">

		<div v-if="graphData!.eventMen && graphData!.eventMen.length > 0">
			<!-- <label class="text-2xl font-bold">남자 시간대별 기록 분포</label> -->`
			<BarChart :data="graphData!.eventMen" :horizontal="false" />
		</div>
	</TheSection>
	<TheSpacer />

	<TheSection title="여자 평영 50M LCM 기록 분포" subtitle="" :tooltip="COPY.disclaimer" background="#ffffff,#ffffff" :narrow="true">
		<div v-if="graphData!.eventWomen && graphData!.eventWomen.length > 0">
			<!-- <label class="text-2xl font-bold">여자 시간대별 기록 분포</label> -->
			<BarChart :data="graphData!.eventWomen" :horizontal="false" />
		</div>

	</TheSection>
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


import { useMainStore } from '~/stores/main';
import type { GraphData, Graph, Statistics } from '~/types/statistics';
import UtilAnaysis from '~/utils/anaysisLibrary';
import FilterButtons from '~/components/common/TheFilters.vue';
import TheButton from '~/components/common/TheButton.vue';
import TheSection from '~/components/common/TheSection.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';
import MarkdownViewer from '~/components/common/MarkdownViewer.vue';
import TheImageProfile from '~/components/common/TheImageProfile.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';
import TheBreadcrumb from '~/components/layout/TheBreadcrumb.vue';
import SectionSearch from '~/components/common/TheSectionSearch.vue';
import PieChart from './PieChart.vue';
import BarChart from './BarChart.vue';
import HorizontalBarChart from './HorizontalBarChart.vue';
import TheDataTable from '../../components/common/TheDataTable.vue';
const { toHtml, extractHeadings, getWordCount, getReadingTime, generateMarkdownTable } = useMarkdown()

import { type FilterItem } from '~/types/common';


const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig()
const mainStore = useMainStore()

const utilAnaysis = new UtilAnaysis();

// 반응형 상태 정의
const pdfContent = ref(null)

const featured = ref('')
const isLoading = ref(false)
const statisticsData = ref({})
const selectedData = ref({})
const markdownTimes = ref({ totals: [], top1: [], top3: {}, average: [], percentage: [], });
const markdownTable = ref({
	athletesMarkdown: '',
	totalMarkdown: '',
	averageMarkdown: "",
	percentageMarkdown: "",
	top1Markdown: '',
	top3: {}
});
const graphData = ref<Graph | null>({
	course: [],
	distance: [],
	eventMen: [],
	eventWomen: [],
	gender: [],
	heat: [],
	isJunior: [],
	isMasters: [],
	type: [],
});
const filters = ref<FilterItem[]>([
	{ field: 'view', selected: '한국기록작성자 포함', options: ['한국기록작성자 포함', '한국기록작성자 제외'] },
]);
const menus = ref([
	{ label: '홈', path: '/' },
])

///########################################################
useSeoContent({
	title: "평영",
	url: route.fullPath,
	description: '편리하고 체계화된 대한민국 평영의 오늘',
	type: 'article',
	image: "/images/brststrk_logo_meta.png",
	site_name: '평영',
} as SeoOptions)
///########################################################

//-----------------------------------------------
// 통계청 table options
//-----------------------------------------------
const optionsStatisticsTop1 = [
   { header: "종목", cell: '[label]' },
   { header: "남자", cell: 
      `
		 <span class="font-mono whitespace-nowrap">
            [menTime]
         </span>
         <br />
         <span class="font-mono whitespace-nowrap">
            [menDatetime]
         </span>
         <br />
		 <a href="/athlete/[menAthleteID]" class="whitespace-nowrap">
            [menName]
         </a>
      `
   },
   { header: "여자", cell: 
      `
         <span class="font-mono whitespace-nowrap">
            [womenTime]
         </span>
         <br />
         <span class="font-mono whitespace-nowrap">
            [womenDatetime]
         </span>
         <br />
         <a href="/athlete/[womenAthleteID]" class="whitespace-nowrap">
            [womenName]
         </a>
      `
   },
]
const optionsStatisticsTop3 = [
   {
   header: "선수",
   cell: `
   <span class="whitespace-nowrap">
		[medal]
      <a href="/athlete/[athleteID]">
         [name]
      </a>
	  </span>
      `
   ,
   },
   { header: "결과", cell: 
      `
      <span class="font-mono text-lg whitespace-nowrap">
            [time]
         </span>
      `
   },
   { header: "대회", cell: 
      `
         [competitionName]
		<br />
		<span class="font-mono font-normal whitespace-nowrap">
		[datetime]
		</span>
      `
   },
]
const optionsStatisticsTotal = [
   { header: "구분", cell: '[label]' },
   { header: "내용", cell: 
      `
         [count]
      `
   },
]
const optionsStatisticsAverage = [
   { header: "종목", cell: '[label]' },
   { header: "전체", cell: 
      `
         <span class="font-mono">
            [all]
         </span>
      `
   },
   { header: "남자", cell: 
      `
         <span class="font-mono">
            [men]
         </span>
      `
   },
   { header: "여자", cell: 
      `
         <span class="font-mono">
            [women]
         </span>
      `
   },
]
const optionsStatisticsPercentage = [
   { header: "종목", cell: '[label]' },
   { header: "백분위", cell: '[percentage]' },
   { header: "전체", cell: 
      `
         <span class="font-mono">
            [all]
         </span>
      `
   },
   { header: "남자", cell: 
      `
         <span class="font-mono">
            [men]
         </span>
      `
   },
   { header: "여자", cell: 
      `
         <span class="font-mono">
            [women]
         </span>
      `
   },
]

const searchQuery = ref('');

const clickSearch = () => {
  // if (!searchQuery.value.trim()) return;
  router.push("/search?name=" + searchQuery.value)
};
///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
function makeMarkdownTable(statistics: any) {
	selectedData.value = JSON.parse(JSON.stringify(statistics));
	graphData.value = selectedData.value.graph as Graph;
	if (graphData.value) {
		graphData.value.distance = graphData.value.distance.map(el => {
									if (el.distance) el.distance = el.distance.replace('M', '');
									return el;
								})
								.sort((a, b) => parseInt(a.distance!)-parseInt(b.distance!));
	}

	markdownTimes.value = utilAnaysis.makeStatisticsTable(selectedData.value);

	markdownTable.value.totalMarkdown = generateMarkdownTable(markdownTimes.value.totals, optionsStatisticsTotal);
	markdownTable.value.averageMarkdown = generateMarkdownTable(markdownTimes.value.average, optionsStatisticsAverage);
	markdownTable.value.percentageMarkdown = generateMarkdownTable(markdownTimes.value.percentage, optionsStatisticsPercentage);
	markdownTable.value.top1Markdown = generateMarkdownTable(markdownTimes.value.top1, optionsStatisticsTop1);
	for (const key of Object.keys(markdownTimes.value.top3)) {
		markdownTable.value.top3[key] = markdownTimes.value.top3[key];
		markdownTable.value.top3[key].top3Markdown = generateMarkdownTable(markdownTimes.value.top3[key].top3, optionsStatisticsTop3);
	}
}

async function loadServerData() {
	try {
		isLoading.value = true;

		await onFilterChange("", "한국기록작성자 포함");
	} catch (error) {
		console.error("데이터 로드 오류:", error);
	} finally {
		isLoading.value = false;
	}
}

// 컴포저블 함수 사용
// history back시 onMount 처리
usePageNavigation(loadServerData);

const onFilterChange = async (field: string, value: string) => {
	const record = value == '한국기록작성자 포함' ? "all" : "";
	const response = await mainStore.fetchStatistics(record); // 전체
	if (response.data != undefined) {
		makeMarkdownTable(response.data);
	}
}

const clickAthlete = (athlete: any) => {
	router.push({
		path: `/athlete/${athlete.athleteID}`,
	});
}

const gotoAthletes = () => {
	router.push({
		path: `/athletes`,
	});
}

const handleImageRemove = () => { }

onMounted(() => {
	if (process.client) {
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
<style scoped>

/* 검색 필드 */
.search-field {
  display: flex;
  width: 100%;
  /* border-radius: 16px; */
  overflow: hidden;
  /* background-color: #ffffff; */
  /* border: 1px solid #ddd; */
}

.search-field input {
  flex: 1;
  padding: 1rem 1.4rem;
  border: none;
  outline: none;
  font-size: 16px;
  color: #000000;
  background-color: rgba(0, 0, 0, 0.03);
  /* border-radius: 16px 0 0 16px !important; */
  /* ← 왼쪽만 둥글게 */
}

.search-field input::placeholder {
  color: #aaa;
  font-weight: 400;
}

.button-search {
  /* background-color: #0066cc; */
  background-color: #000000;
  color: white;
  padding: 0 24px;
  /* border-radius: 0 16px 16px 0 !important; */
  /* ← 오른쪽만 둥글게 */
}

.button-search:hover {
  /* background-color: #0055aa; */
  background-color: #111111;
}
</style>