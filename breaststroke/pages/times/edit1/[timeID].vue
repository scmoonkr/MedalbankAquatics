<template>
  <TheSection :title="pageTitle" :subtitle="`${displayFormattedTime} / ${displayFormattedDate} / ${displayPool}`" :narrow="true">

    <TheFilters :course="selectedCourse" :filters="filters" @change-field="onFilterFieldChange" />

    <div class="search-field mt-6">
      <input v-model="rawInput" inputmode="numeric" maxlength="6" placeholder="숫자만 입력 (1234 → 00:12.34)" />
      <button class="button-default button-search cursor-not-allowed" disabled>
        기록
      </button>
    </div>

    <div class="search-field mt-6">
      <input v-model="rawInput" inputmode="numeric" maxlength="6" placeholder="숫자만 입력 (YYYYMMDD → 2025-01-01)" />
      <button class="button-default button-search cursor-not-allowed" disabled>
        날짜
      </button>
    </div>

    <div class="mt-6">

      <div class="search-field">
        <input type="text" v-model="poolQuery" placeholder="미선택" />
        <button class="button-default button-search cursor-not-allowed" disabled>
          수영장
        </button>
      </div>
      <div class="button-group-filters mt-4">
        <button class="font-medium button-group-filters-unselected'">
          미선택
        </button>
        <button class="font-medium button-group-filters-unselected'">
          33333
        </button>
        <button class="font-medium button-group-filters-unselected'">
          33333
        </button>
        <button class="font-medium button-group-filters-unselected'">
          33333
        </button>
      </div>
    </div>

    <div class="mt-6">
      <button class="w-full py-4 bg-orange-500 text-white rounded-full text-lg font-bold" @click="submitForm">
        수정한 정보 저장하기
      </button>
    </div>

  </TheSection>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheSection from '~/components/common/TheSection.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';
import TheFilters from '~/components/common/TheFilters.vue';
import ButtonGroup from '~/components/common/TheButtonGroup.vue';

const rawInput = ref('');
const timeValue = computed(() => {
  const value = rawInput.value.replace(/\D/g, '').padStart(6, '0').slice(-6);
  const mm = value.slice(0, 2);
  const ss = value.slice(2, 4);
  const hs = value.slice(4, 6);
  return `${mm}:${ss}.${hs}`;
});

const displayFormattedTime = computed(() => {
  const value = rawInput.value.replace(/\D/g, '').padStart(6, '0').slice(-6);
  const mm = value.slice(0, 2);
  const ss = value.slice(2, 4);
  const hs = value.slice(4, 6);
  return `${mm}분 ${ss}초 ${hs}`;
});

const displayFormattedDate = computed(() => {
  return selectedDate.value || '날짜 미입력';
});

const displayPool = computed(() => {
  return selectedPool.value.name || '수영장 미입력';
});

const selectedCourse = ref('LCM');
const customDate = ref('');
const selectedPool = ref({ name: '', id: 0 });
const poolQuery = ref('');
const filteredPools = ref([]);
const poolSelectMode = ref('');
const router = useRouter();
const route = useRoute();
const timeID = ref(route.query.timeID || null);

const filters = ref([
  { field: 'style', selected: '자유형', options: ['자유형', '배영', '평영', '접영', '개인혼영'] },
  { field: 'distance', selected: '50M', options: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'] },
  { field: 'course', selected: 'LCM', options: ['LCM', 'SCM'] },
]);

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
function formatDate(date) {
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

onMounted(() => {
  selectedDate.value = dateOptions.value[0].value;
});

const pageTitle = computed(() => {
  return `${filters.value[0].selected} ${filters.value[1].selected} ${filters.value[2].selected} 대회기록 ${timeID.value ? '수정하기' : '새로 올리기'}`;
});

const onDateChange = (val) => {
  if (val !== '0000-00-00') customDate.value = val;
};

const onPoolModeChange = (val) => {
  if (val === 'custom') {
    selectedPool.value = { name: '', id: 0 };
    poolQuery.value = '';
  } else if (val === 'none') {
    selectedPool.value = { name: '', id: 0 };
  }
};

const selectPool = (당구) => {
  selectedPool.value = pool;
  poolSelectMode.value = pool;
};

function onFilterFieldChange(field, value) {
  const item = filters.value.find(f => f.field === field);
  if (item) item.selected = value;
  if (field === 'course') selectedCourse.value = value;
}

const submitForm = () => {
  const data = {
    time: timeValue.value,
    style: filters.value[0].selected,
    distance: filters.value[1].selected,
    course: filters.value[2].selected,
    date: customDate.value || selectedDate.value,
    pool: selectedPool.value.name || null,
  };

  alert('기록이 저장되었습니다!');
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
</style>