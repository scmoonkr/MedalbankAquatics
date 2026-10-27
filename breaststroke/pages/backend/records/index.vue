<!-- pages/backend/records/index.vue : Breaststroke.records 조회 (읽기 전용) -->
<template>
  <div class="pl-5 pr-5">
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Records</h1>
    </div>

    <!-- 조회 조건 -->
    <div class="flex flex-wrap items-center gap-3 mb-3">
      <select v-model="filter.type" class="form-input" @change="search">
        <option value="">기록종류(전체)</option>
        <option v-for="o in typeOptions" :key="o" :value="o">{{ o }}</option>
      </select>
      <select v-model="filter.gender" class="form-input" @change="search">
        <option value="">성별(전체)</option>
        <option value="men">men</option>
        <option value="women">women</option>
        <option value="mixed">mixed</option>
      </select>
      <select v-model="filter.discipline" class="form-input" @change="search">
        <option value="">종목(전체)</option>
        <option v-for="o in disciplineOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <select v-model="filter.distance" class="form-input" @change="search">
        <option value="">거리(전체)</option>
        <option v-for="o in distanceOptions" :key="o" :value="o">{{ o }}</option>
      </select>
      <select v-model="filter.course" class="form-input" @change="search">
        <option value="">코스(전체)</option>
        <option value="LCM">LCM</option>
        <option value="SCM">SCM</option>
      </select>
      <select v-model="mastersFilter" class="form-input" @change="search">
        <option value="">전체</option>
        <option value="masters">마스터즈</option>
        <option value="general">일반</option>
      </select>
      <input
        type="text"
        v-model="filter.name"
        placeholder="이름"
        class="form-input w-[160px]"
        @keyup.enter="search"
      />
      <button type="button" class="upload-button w-[70px]" title="조회" @click="search">
        <strong>조회</strong>
      </button>
      <span class="text-sm text-gray-500">{{ totalCount }}건</span>
      <button
        type="button"
        class="manual-button ml-auto"
        title="JSON 으로 직접 입력"
        :disabled="isCrawling"
        @click="openCreate"
      >
        <strong>직접입력</strong>
      </button>
      <button
        type="button"
        class="korswim-button"
        title="대한수영연맹 신기록 확인"
        :disabled="isCrawling"
        @click="checkExternal('korswim')"
      >
        <strong>{{ crawlingSource === 'korswim' ? '확인 중...' : '수영연맹' }}</strong>
      </button>
      <button
        type="button"
        class="korswim-button"
        title="World Aquatics 세계/올림픽/아시아 기록 확인"
        :disabled="isCrawling"
        @click="checkExternal('wa')"
      >
        <strong>{{ crawlingSource === 'wa' ? '확인 중...' : 'WA' }}</strong>
      </button>
    </div>

    <div class="records-table-scroll">
      <DataTable
        :columns="columns"
        :data="records"
        :pagination="false"
        :search="false"
        :isLoading="isLoading"
        :serverSide="true"
        :alternateRowColors="true"
        :alternateColumnColors="true"
        :rowClickable="true"
        :cellClickable="true"
        @click-cell="openEdit"
      />
    </div>

    <RecordDrawer
      :show="showDrawer"
      :record="drawerRecord"
      @cancel="showDrawer = false"
      @done="onDrawerDone"
    />

    <UpdateModal
      :title="sourceTitle[updateSource]"
      :show="showUpdateModal"
      :items="updateItems"
      :isSaving="isApplying"
      @cancel="showUpdateModal = false"
      @apply="applyExternal"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'backend',
});
import { ref, computed, onMounted } from 'vue';
import UI_CONFIG from '~/config/ui';
import recordApi from '~/api/recordApi';
import DataTable from '~/components/common/DataTable.vue';
import UpdateModal from './update_modal.vue';
import RecordDrawer from './record_drawer.vue';

const columns = [
  { key: 'type', label: '종류', width: '60px', sortable: false },
  { key: 'isMasters', label: 'masters', width: '50px', sortable: false },
  { key: 'isAdult', label: 'adult', width: '50px', sortable: false },
  { key: 'gender', label: '성별', width: '70px', sortable: false },
  { key: 'ageGroup', label: '연령대', width: '100px', sortable: false },
  { key: 'discipline', label: '종목', width: '60px', sortable: false },
  { key: 'course', label: '코스', width: '60px', sortable: false },
  { key: 'distance', label: '거리', width: '70px', sortable: false },
  { key: 'time', label: '기록', width: '80px', sortable: false },
  { key: 'name', label: '이름', width: '160px', sortable: false },
  { key: 'team', label: '팀', width: '120px', sortable: false },
  { key: 'sido', label: '시도', width: '60px', sortable: false },
  { key: 'datetime', label: '일자', width: '100px', sortable: false },
  { key: 'location', label: '장소', width: '180px', sortable: false },
  { key: 'group', label: 'group', width: '80px', sortable: false },
];

const typeOptions = ['WR', 'WMR', 'OR', 'AR', 'ER', 'KR', 'KMR'];
const disciplineOptions = [
  { value: 'FR', label: '자유형' },
  { value: 'BA', label: '배영' },
  { value: 'BR', label: '평영' },
  { value: 'FL', label: '접영' },
  { value: 'IM', label: '개인혼영' },
  { value: 'FRR', label: '자유형 계영' },
  { value: 'MR', label: '혼계영' },
];
const distanceOptions = ['50M', '100M', '200M', '400M', '800M', '1500M'];

const filter = ref({ type: '', gender: '', discipline: '', distance: '', course: '', name: '' });
const mastersFilter = ref('');
const records = ref<any[]>([]);
const totalCount = ref(0);
const isLoading = ref(false);

async function search() {
  isLoading.value = true;
  try {
    const params: Record<string, any> = { maxRows: UI_CONFIG.backendRowsLimit };
    for (const [key, value] of Object.entries(filter.value)) {
      if (value) params[key] = typeof value === 'string' ? value.trim() : value;
    }
    if (mastersFilter.value) params.isMasters = mastersFilter.value === 'masters';

    const response = await recordApi.getRecordList(params);
    records.value = response.data ?? [];
    totalCount.value = response.count ?? 0;
  } finally {
    isLoading.value = false;
  }
}

// 외부 신기록(대한수영연맹 / World Aquatics) 확인 -> 갱신된 기록을 modal 로 보여주고, 체크한 것만 업데이트
type Source = 'korswim' | 'wa';
const sourceTitle: Record<Source, string> = { korswim: '수영연맹', wa: 'World Aquatics' };

const crawlingSource = ref<Source | ''>('');
const isCrawling = computed(() => crawlingSource.value !== '');
const isApplying = ref(false);
const showUpdateModal = ref(false);
const updateSource = ref<Source>('korswim');
const updateItems = ref<any[]>([]);

async function checkExternal(source: Source) {
  crawlingSource.value = source;
  try {
    const response = source === 'wa' ? await recordApi.checkWa() : await recordApi.checkKorswim();
    if (response.failed && response.failed.length > 0) {
      alert(`${sourceTitle[source]} 일부 요청이 실패했습니다 (${response.failed.length}건). 결과가 일부일 수 있으니 다시 확인해 보세요.`);
    }
    if (!response.data || response.data.length === 0) {
      alert(response.message || `${sourceTitle[source]}에서 갱신된 신기록이 없습니다.`);
      return;
    }
    updateSource.value = source;
    updateItems.value = response.data;
    showUpdateModal.value = true;
  } finally {
    crawlingSource.value = '';
  }
}

async function applyExternal(keys: string[]) {
  isApplying.value = true;
  try {
    const response = updateSource.value === 'wa' ? await recordApi.applyWa(keys) : await recordApi.applyKorswim(keys);
    if (response.message) {
      alert(response.message);
      return;
    }
    alert(`${response.count}건 업데이트했습니다.`);
    showUpdateModal.value = false;
    await search();
  } finally {
    isApplying.value = false;
  }
}

// 직접입력 / 행 수정 drawer: 항목별 입력(form)·JSON 입력 탭. 반영이 끝나면 닫고 목록을 새로 조회
const showDrawer = ref(false);
const drawerRecord = ref<Record<string, any> | null>(null);

function openCreate() {
  drawerRecord.value = null;
  showDrawer.value = true;
}

function openEdit(row: Record<string, any>) {
  drawerRecord.value = { ...row };
  showDrawer.value = true;
}

async function onDrawerDone() {
  showDrawer.value = false;
  await search();
}

onMounted(search);
</script>

<style scoped>
.form-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.upload-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background-color: #c7f784;
  color: #333;
}

.manual-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background-color: #6b7280;
  color: #fff;
}

.manual-button:hover:not(:disabled) {
  background-color: #4b5563;
}

.manual-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.korswim-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background-color: #3498db;
  color: #fff;
}

.korswim-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.korswim-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.upload-button:hover {
  background-color: #d0d0d0;
}

/* 페이지가 아니라 table 영역에서만 스크롤 (헤더 고정) */
.records-table-scroll :deep(.overflow-x-auto) {
  max-height: calc(100vh - 280px);
  overflow: auto;
}
.records-table-scroll :deep(.datatable thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #e5e7eb; /* gray-200 */
}
</style>
