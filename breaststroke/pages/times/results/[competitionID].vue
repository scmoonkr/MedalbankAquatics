<!-- pages/times/list/section_times.vue -->
<template>

    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓Times ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- 필터 버튼 영역 -->
    <TheSection background="#ffffff,#ffffff" :narrow="true">
      <FiltersTimes :filters="filters" :course="course" @change-field="onFilterChange" />
    </TheSection>
    

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <SectionLoading v-if="isLoading"></SectionLoading>

    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <TheSection :title="timeTitle" :subtitle="competitionTitle" tooltip="기록지가 전부 입력된 대회도 있고, 아닌 대회도 있습니다. 대회측에서 제공한 기록지 정보에도 오류가 있을 수 있습니다. 오류를 발견하셨거나 혹은 대회결과 기록지 파일 보유하신 분은 제보해주시면 업데이트 하겠습니다.">
      <DataTableTimes :times="timeList" :totalPages="timeStore.pagination.totalPages" :page="currentPage" :key="'leaderboard-' + currentPage" />
    </TheSection>

    <TheTooltipRun :show="showTooltip" message="대회를 변경하려면 확인을 누르세요." @update:show="confirmDialog" />

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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePageNavigation } from '~/composables/usePageNavigation';

import UI_CONFIG from '~/config/ui';
//-----> types
import type { JsonOptions, FilterItem } from '~/types/common';
import type { TimeModel } from '~/models/times';
import { useTimeStore } from '~/stores/times';

import DataTableTimes from './datatable_times.vue';
import TheSection from '~/components/common/TheSection.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';
import FiltersTimes from '~/components/common/TheFiltersTimes.vue';
import TheTooltipRun from '~/components/common/TheTooltipRun.vue';
const showTooltip = ref(false);

const router = useRouter();
const route = useRoute();

const timeStore = useTimeStore();

///########################################################
/// parent로부터 전달 받을 값 정의
///########################################################
const isLoading = ref(false);
const currentPage = ref(1);
const timeList = ref<TimeModel[]>([]);
const course = ref("LCM");
const competitionTitle = ref("");
const timeTitle = ref("");
const rowsPerPage = 100;
const sliceAgeGroup = ref(3);
const rounds = ref<string[]>([]);

const ageGroups = ref<string[]>([]);
const options = ref<JsonOptions>({
  gender: 'women',
  discipline: 'BR',
  distance: '50M',
});

const filters = ref<FilterItem[]>([
  { field: 'competition', selected: '2024 고양 전국마스터즈 수영대회', options: ['2024 고양 전국마스터즈 수영대회'] },
  { field: 'round', selected: 'finals', options: ['finals'] },
  { field: 'gender', selected: '여자', options: ['남자', '여자'] },
  { field: 'discipline', selected: '평영', options: ['자유형', '배영', '평영', '접영', '개인혼영'] },
  { field: 'distance', selected: '50M', options: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'] },
  { field: 'ageGroup', selected: '전체그룹', options: ['전체그룹'] },
]);

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  try {
    isLoading.value = true;
    await nextTick();

    const competitionIDStr = route.params.competitionID;
    timeStore.filter = {};
    timeStore.filter.competitionID = parseInt(competitionIDStr as string, 10);
    timeStore.rowsPerPage = 5000;
    currentPage.value = 1;

    await timeStore.fetchTimeList(currentPage.value, rowsPerPage);
    console.log("++++++++++", timeStore.timeList);
    if (timeStore.timeList.length > 0) {
      const athleteNames = [...new Set(timeStore.timeList.map(el => el.name))];
      competitionTitle.value = `${formatKoreanDateWithDay(timeStore.timeList[0].datetime ?? '')}, ${timeStore.timeList[0].competitionName}, ${timeStore.timeList[0].pool}, 참가자 ${athleteNames.length}명`;
      course.value = timeStore.timeList[0].course;
      filters.value[0].selected = timeStore.timeList[0].competitionName!;
      filters.value[0].options = [timeStore.timeList[0].competitionName!];

      rounds.value = [... new Set(timeStore.timeList.map(el => el.round))];
      if (rounds.value.length <= 1) {
        filters.value = filters.value.filter(el => el.field !== 'round');
        delete options.value.round;
        sliceAgeGroup.value = 4;
      } else {
        rounds.value = rounds.value.map(round => getRoundKorByEng(round));
        options.value.round = rounds.value[0];
        filters.value[1].options = rounds.value;
        filters.value[1].selected = rounds.value[0];
        sliceAgeGroup.value = 5;
      }
    }

    isLoading.value = false;

    options.value.gender = "women";
    options.value.discipline = "BR";
    options.value.distance = "50M";
    options.value.ageGroup = "전체그룹";
    options.value.round = "";
    console.log("options.value=", options.value);
    filterTimes();
  } catch (error) {
    console.error("데이터 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
}

// history back시 onMount 처리
usePageNavigation(loadServerData);

///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################

///########################################################
///########################################################
// 필터 변경 처리
const onFilterChange = async (field: string, value: string) => {
  try {
    switch (field) {
      case 'discipline':
        options.value.discipline = getStyleEngByKor(value);
        break;
      case 'gender':
        options.value.gender = getGenderByKor(value);
        break;
      case 'round':
        options.value.round = getRoundEngByKor(value);
        break;
      case 'competition':
        showTooltip.value = true;

        // router.push(`/times/competitions`);
        return;
      default:
        options.value[field] = value;
        break;
    }
  } catch (error) {
    console.error("필터 적용 중 오류:", error);
  } finally {
    filterTimes();
  }
}
const confirmDialog = (value: boolean) => {
  showTooltip.value = false;
  if (value) {
    router.push(`/times/competitions`);
  }
}


//======================================================================
// Button
//======================================================================

//--------------------------------------------
// 필터 변경 처리
//--------------------------------------------
function filterTimes() {
  const originalTimeList = JSON.parse(JSON.stringify(timeStore.timeList)) as TimeModel[];
  timeList.value = originalTimeList.filter(time => time.discipline === options.value.discipline &&
    time.gender === options.value.gender &&
    time.distance === options.value.distance &&
    (rounds.value.length <= 1 || time.round === options.value.round)
  )
  console.log("options=", options.value, timeList.value);

  ageGroups.value = ["전체그룹", ...new Set(timeList.value.map(el => el.ageGroup))];

  if (!options.value.ageGroup) options.value.ageGroup = ageGroups.value[0];
  if (options.value.ageGroup != "전체그룹") {
    timeList.value = timeList.value.filter(time => time.ageGroup === options.value.ageGroup);
  }


  // ageGroup 체크
  filters.value = filters.value.slice(0, sliceAgeGroup.value);
  // filters.value = filters.value.slice(0, 4);

  const ageGroup: FilterItem = { field: 'ageGroup', selected: options.value.ageGroup, options: ageGroups.value };
  filters.value.push(ageGroup);
  timeTitle.value = makeTimesTitle(options.value); // utils/swimStyles.js
}

// 날짜 양식 변경
function formatKoreanDateWithDay(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = days[date.getDay()];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일 ${dayName}`;
}
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
/* 필요한 스타일을 추가하세요 */
.times-list-page {
  width: 100%;
}

.submit-btn {
  background-color: #3498db;
  border: none;
  color: white;
}

.submit-btn:hover {
  background-color: #2980b9;
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}
</style>