<template>
  <TheSection :title="title" :subtitle="`${subtitle}`" :narrow="true">

    <TheFilters
      :course="selectedCourse"
      :filters="filters"
      @change-field="onFilterFieldChange"
    />

    <div class="search-field mt-6">
      <input
        v-model="rawInputTimeNew"
        @input="handleTimeInput"
        inputmode="numeric"
        maxlength="6"
        placeholder="숫자만 입력 (1234 → 00:12.34)"
      />
      <button class="button-default button-search cursor-not-allowed" disabled>
        기록
      </button>
    </div>

    <div class="search-field mt-6">
      <input
        v-model="rawInputDate"
        @input="handleDateInput"
        inputmode="numeric"
        maxlength="8"
        placeholder="숫자만 입력 (YYYYMMDD → 2025-01-01)"
      />
      <button class="button-default button-search cursor-not-allowed" disabled>
        날짜
      </button>
    </div>

    <div v-if="options.typeTime == '대회기록'" class="mt-6">
      <SearchCompetition :competitionName="rawInputCompetition" @update-competition="searchCompetition" />
    </div>

    <div v-else class="mt-6">
      <SearchPool :poolName="rawInputPool" @update-pool="searchPool" />
    </div>

    <div class="mt-6">
      <button class="w-full py-4 bg-orange-500 text-white rounded-full text-lg font-bold" @click="submitForm">
        수정한 정보 저장하기
      </button>
    </div>
  </TheSection>

<TheTooltipDialog :show="showTooltip" :message="showMessage" @update:show="exitOK" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
//-----> models
import { type TimeModel } from '~/models/times';
//-----> types
import type { JsonOptions, FilterItem } from '~/types/common';
//-----> stores
import { useTimeStore } from '~/stores/times';
import { useAuthStore } from '~/stores/useAuthStore';
//-----> components
import TheSection from '~/components/common/TheSection.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';
import TheFilters from '~/components/common/TheFilters.vue';
import ButtonGroup from '~/components/common/TheButtonGroup.vue';
import SearchPool from './SearchPool.vue';
import SearchCompetition from './SearchCompetition.vue';
import { type CompetitionNames } from './SearchCompetition.vue';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
const showTooltip = ref(false);
const showMessage = ref('');


const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const timeStore = useTimeStore();

//-----> 상태 관리
const selectedCourse = ref('LCM');
const customDate = ref('');
const selectedPool = ref({ name: '', poolID: 0 });
const selectedCompetition = ref<Partial<CompetitionNames>>({});
const isLoading = ref(false);
const title = ref('자유형 50M LCM 대회기록 수정하기');
const subtitle = ref('');
const rawInputTime = ref('');
const rawInputTimeNew = ref('');
const rawInputCompetition = ref('');
const rawInputPool = ref('');
const timeID = ref(0);

const filters = ref([
  { field: 'style', selected: '자유형', options: ['자유형', '배영', '평영', '접영', '개인혼영'] },
  { field: 'distance', selected: '50M', options: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'] },
  { field: 'course', selected: 'LCM', options: ['LCM', 'SCM'] },
  { field: 'typeTime', selected: '대회기록', options: ['훈련기록', '대회기록'] },
]);
const options = ref<JsonOptions>({
  style: 'freestyle',
  distance: '50M',
  course: 'LCM',
  typeTime: '대회기록',
});

//-----> 시작할떼떼
onMounted(() => {
  selectedDate.value = dateOptions.value[0].value;
});const rawInputDate = ref('');

async function loadServerData() {

  try {
    isLoading.value = true;
    await nextTick();

    const timeIdStr = route.params.timeID;
    timeID.value = parseInt(timeIdStr as string, 10);
    if (timeID.value == 0) {
      title.value = makeTimesTitle(options.value) + " 새로 올리기";
    } else {
      //-------------------------------
      // server에서 time 가져오기
      //-------------------------------
      await timeStore.fetchTimeById(timeID.value);
      if (timeStore.currentTime?.time) {
        options.value = {
          style: timeStore.currentTime?.style ?? '',
          distance: timeStore.currentTime?.distance ?? '',
          course: timeStore.currentTime?.course ?? '',
          typeTime: timeStore.currentTime?.type ?? '',
        };
        title.value = makeTimesTitle(options.value) + " 수정하기";
        selectedPool.value = { name: timeStore.currentTime?.pool ?? '', poolID: timeStore.currentTime?.poolID ?? 0 };
        if (timeStore.currentTime?.competitionID > 0) {
          selectedCompetition.value = { fullname: timeStore.currentTime?.competitionName ?? '', competitionID: timeStore.currentTime?.competitionID ?? 0 };
        }
      }
      filters.value = setFiltersSelected(filters.value, options.value);
    }
    subtitle.value = makeSubtitle(timeStore.currentTime?.time ?? '', timeStore.currentTime?.datetime ?? '', selectedPool.value, {});  
  } catch (error) {
    console.error("Error in onMounted:", error);
  } finally {
    isLoading.value = false;
  }
}

// 컴포저블 함수 사용
usePageNavigation(loadServerData);

//---> event
function onFilterFieldChange(field: string, value: string) {
  const item = filters.value.find(f => f.field === field);
  if (item) item.selected = value;
  if (field === 'course') selectedCourse.value = value;
  options.value[field] = value; 
  title.value = makeTimesTitle(options.value) + " " + (timeID.value > 0 ? "수정하기" : "새로 올리기");
}

//-----> utils function
function makeSubtitle(time:string, datetime:string, pool:any, competition: any) {
  let title = "";

  title = `${displayFormattedTime(time)} / ${datetime} / `; 
  if (competition && competition.competitionID > 0 ) {
    title += competition.fullname;
  } else if (pool.poolID > 0 ) {
    title += pool.name;
  } else {
    title += "수영장 미입력";
  }
  return title;
}
const handleTimeInput = (event: any) => {
  const value = event.target.value;
  subtitle.value = makeSubtitle(value, rawInputDate.value, selectedPool.value, selectedCompetition.value);
};
const handleDateInput = (event: any) => {
  rawInputDate.value = event.target.value;
  subtitle.value = makeSubtitle(rawInputTimeNew.value, dateValue.value, selectedPool.value, selectedCompetition.value);
};

const timeValue = computed(() => {
  const value = rawInputTime.value.replace(/\D/g, '').padStart(6, '0').slice(-6);
  const mm = value.slice(0, 2);
  const ss = value.slice(2, 4);
  const hs = value.slice(4, 6);
  return `${mm}:${ss}.${hs}`;
});

const dateValue = computed(() => {
  const value = rawInputDate.value.replace(/\D/g, '').padStart(8, '0').slice(-8);
  const yyyy = value.slice(0, 4);
  const mm = value.slice(4, 6);
  const dd = value.slice(6, 8);
  return `${yyyy}년 ${mm}월 ${dd}일`;
});

const displayFormattedDate = computed(() => {
  return selectedDate.value || '날짜 미입력';
});

const displayPool = computed(() => {
  return selectedPool.value.name || '수영장 미입력';
});


const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

const dateOptions = computed(() => [
  { label: `오늘 (${formatDate(today)})`, value: formatDate(today) },
  { label: `어제 (${formatDate(yesterday)})`, value: formatDate(yesterday) },
  { label: '다른 날짜', value: '0000-00-00' }
]);

const dateOptionsWithEmpty = computed(() => [
  ...dateOptions.value,
  { label: '기록 날짜 없음', value: '' },
]);

const selectedDate = ref('');

function number2TimeString(value: string) {
  value = "000000" + value;
  const mm = value.slice(-6,-4);
  const ss = value.slice(-4,-2);
  const tt = value.slice(-2);

  return `${mm}:${ss}.${tt}`;
}
const submitForm = async () => {
  const data = {
    athleteID: authStore.currentUser?.athleteID,

    style: getStyleEngByKor(filters.value[0].selected),
    distance: filters.value[1].selected,
    course: filters.value[2].selected,

    time: number2TimeString(rawInputTimeNew.value),
    datetime: customDate.value || selectedDate.value,
    // competition: selectedCompetition.value || {},
  } as TimeModel;

  data.type = getTypeTimes(options.value.typeTime);
  if (selectedCompetition.value) {
    if (selectedCompetition.value.competitionID! > 0) data.competitionID = selectedCompetition.value.competitionID!;
    if (selectedCompetition.value.fullname) data.competitionName = selectedCompetition.value.fullname;
    if (selectedCompetition.value.poolID! > 0) data.poolID = selectedCompetition.value.poolID!;
    if (selectedCompetition.value.pool) data.pool = selectedCompetition.value.pool;
  }
  if (selectedPool.value) {
    if (selectedPool.value.poolID! > 0) data.poolID = selectedPool.value.poolID!;
    if (selectedPool.value.name) data.pool = selectedPool.value.name;
  }


  // saveTimeResult
  const result = await timeStore.saveTimeResult(data);
  showTooltip.value = true;
};
const exitOK = () => {
  showTooltip.value = false;
  router.push(`/time/${timeStore.currentTime?.timeID}`);
}

const searchPool = (pool: any) => {
  selectedPool.value = pool;
  rawInputPool.value = pool.name;
  rawInputCompetition.value = '';
  
  selectedCompetition.value = { competitionID: 0, fullname:'' };
  subtitle.value = makeSubtitle(rawInputTimeNew.value, dateValue.value, selectedPool.value, selectedCompetition.value);
};

const searchCompetition = (competition: any) => {
  selectedPool.value = competition;
  selectedCompetition.value = competition;
  rawInputCompetition.value = competition.fullname;
  rawInputPool.value = '';
  selectedPool.value = { poolID: 0, name: '' }; // { poolID: competition.poolID, name: competition.pool };

  subtitle.value = makeSubtitle(rawInputTimeNew.value, dateValue.value, selectedPool.value, selectedCompetition.value);
};
</script>

<style scoped>
.search-field {
  display: flex;
  width: 100%;
  overflow: hidden;
}

.search-field input {
  flex: 1;
  padding: 1rem 1.4rem;
  border: none;
  outline: none;
  font-size: 16px;
  color: #000000;
  background-color: rgba(0, 0, 0, 0.03);
}

.search-field input::placeholder {
  color: #aaa;
  font-size: 14px;
}

.button-search {
  @apply bg-gray-200 text-gray-400;
  padding: 0 24px;
}

.pool-result-button {
  padding: 10px;
  text-align: left;
  background-color: #f8f8f8;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  /* 버튼이 자연스럽게 흐르도록 flex-grow 제거 */
  flex: 0 0 auto;
}

.pool-result-button:hover {
  background-color: #e0e0e0;
}
</style>