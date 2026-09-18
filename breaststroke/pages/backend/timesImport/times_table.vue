<!-- pages/times/list.vue -->
<template>

  <DataTable
    :columns="tableColumns"
    :data="tableData"
    :pagination="true"
    :totalPage="totalPages"
    :currentPage="currentPage"
    :itemsPerPage="UI_CONFIG.rowsPerPage"
    :search="false"
    :isLoading="isLoading"
    :serverSide="true"
    :alternateRowColors="true"
    :alternateColumnColors="true"
    @sort-column="sortColumnChanged"
    @click-cell="clickTableCell"
    @page-change="pageChanged"
    @toggle-all="toggleSelectAll"
    @toggle-item="toggleSelectItem"
    @insert="insertItemModal"
    @edit="editItemModal"
    @delete="confirmDelete"
    @view="viewItemModal">
    <!-- name, ageGroup -->
    <template #column-gender="{ value, row }">
      <div class="flex flex-col">
        <span class="font-mono">{{ getGenderByEng((row as TimeModel).gender) }}</span>
      </div>
    </template>
    <template #column-discipline="{ value, row }">
      <div class="flex flex-col">
        <span class="font-mono">{{ getStyleKorByEng((row as TimeModel).discipline) }}</span>
      </div>
    </template>
  </DataTable>
  <!----------------------->
  <!----------------------->
  <!----------------------->

  <!---------------------------------------
  편집 다이얼로그
  ----------------------------------------->
  <TheModalForm
    title="Times 수정"
    :show="showEditFormModal"
    :value="editingItem ?? {}"
    :columns="tableColumns"
    @cancel="showEditFormModal = false"
    @ok="saveEditedItem(editingItem)"
  />

  <!---------------------------------------
  상세 정보 다이얼로그
  ----------------------------------------->
  <TheModalView
    title="Times 정보"
    :show="showViewModal"
    :value="viewItem ?? {}"
    :columns="tableColumns"
    @cancel="showViewModal = false"
    @edit="viewEditedItem(viewItem)"
  />

  <!---------------------------------------
  삭제 확인 모달
  ----------------------------------------->
  <TheModelCancelOK
    v-model:show="showDeleteModal"
    title="삭제 확인"
    message="정말로 이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    @cancel="showDeleteModal = false"
    @ok="confirmDeleteItem"
  />
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

import UI_CONFIG from '~/config/ui';
import { SortDirection } from '~/types/common';
import { TimeModel } from '~/models/times';
import { useTimeStore } from '~/stores/times';
import { useAuthStore } from '~/stores/useAuthStore';

import DataTable from '~/components/common/DataTable.vue';
import TheModalForm from '~/components/common/TheModalForm.vue';
import TheModalView from '~/components/common/TheModalView.vue';
import TheModelCancelOK from '~/components/common/TheModalCancelOK.vue';
// DataTable 설정
import { tableColumns } from './tableColumns';

const router = useRouter();

const authStore = useAuthStore();
const timeStore = useTimeStore();

// editingItem 타입 수정
interface EditingItemType {
  checkbox: boolean;
  isMasters: boolean;
  isAdult: boolean;
  name: string;
  team: string;
  ageGroup: string;
  gender: string;
  discipline: string;
  course: string;
  distance: string;
  time: string;
  rank: string;
  status: string;
}

// 상태 관리
const editingItem = ref<EditingItemType | null>(null);
const isLoading = ref(false);
const selectedItems = ref<number[]>([]);
const rowsPerPage = UI_CONFIG.rowsPerPage; const showEditFormModal = ref(false);
const showViewModal = ref(false);
const viewItem = ref(null);
const showDeleteModal = ref(false);
const itemToDelete = ref(TimeModel);

const tableData = ref<TimeModel[]>([]);


const props = defineProps({
  times: {
    type: Array as () => TimeModel[],
    default: () => [] as TimeModel[],
  },
  page: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
});

const currentPage = computed(() => props.page);

//===================================
// computed: 상태변화
//===================================

// modelValue 변경 감지
watch(() => props.times, (newValue) => {
  tableData.value = newValue;
}, { deep: true });

///########################################################
///####################DataTable###########################
///########################################################
// Table header sort changed
const sortColumnChanged = async (column: string) => {
  timeStore.sortField = column as any;
  timeStore.sortDirection = timeStore.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;
  await timeStore.fetchTimeList(1, rowsPerPage);
};

const clickTableCell = async (item: TimeModel, column: string) => {
};



// 페이지 변경 처리
const pageChanged = async (page: number) => {
  emit('page-change', page);
};

const emit = defineEmits([
  'page-change',
  'insert-time',
  'edit-time',
  'delete-time',
]);

///########################################################
///################# DataTable action button ##############
///########################################################
const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedItems.value = tableData.value.map(item => (item as any).timeID);
  } else {
    selectedItems.value = [];
  }
};

const toggleSelectItem = (id: number, checked: boolean) => {
  if (checked) {
    if (!selectedItems.value.includes(id)) {
      selectedItems.value.push(id);
    }
  } else {
    selectedItems.value = selectedItems.value.filter(itemId => itemId !== id);
  }
};
// 체크된 항목 관리 함수
const toggleAllChecked = (checked: boolean) => {
  // tableData.value.forEach(item => item.checked = checked);
};

const toggleItemChecked = (timeID: number, checked: boolean) => {
  const item = tableData.value.find(item => (item as any).timeID === timeID);
  // if (item) item.checked = checked;
};

//--------------------------------------------
// 삭제 관련 함수
//--------------------------------------------
const confirmDelete = (timeID: any) => {
  itemToDelete.value = timeID;
  showDeleteModal.value = true;
};

const confirmDeleteItem = () => {
  if (itemToDelete.value != undefined) {
    tableData.value = tableData.value.filter(item => (item as any).timeID != (itemToDelete.value as any).timeID);
  }
  // close Modal
  showDeleteModal.value = false;
  emit("delete-time", (itemToDelete.value as any).timeID);
};

//--------------------------------------------
// edit 관련 함수
//--------------------------------------------
// 편집 관련 함수
const editItemModal = (item: any) => {
  // 상세 정보 창이 열려있으면 닫기
  if (showViewModal.value) {
    closeDetailDialog();
  }

  editingItem.value = { ...item };
  showEditFormModal.value = true;
};
const saveEditedItem = (item: any) => {
  //-------------------------------
  // update time to server
  //-------------------------------
  const time = {};
  for (const column of tableColumns) {
    if (column.edit === false || "checkbox,actions".includes(column.key)) continue;
    if (editingItem.value == undefined) continue;
    (time as any)[column.key] = (editingItem as any).value[column.key];
  }
  //-------------------------------
  const index = tableData.value.findIndex(item => (item as any).timeID === (editingItem as any).value.timeID);
  if (index !== -1) {
    tableData.value[index] = { ...(editingItem as any).value };
  }
  showEditFormModal.value = false;
  editingItem.value = null;
  emit("edit-time", item);
};

//--------------------------------------------
// 상세 보기 관련 함수
//--------------------------------------------
const insertItemModal = (id: number) => {
  // 상세 정보 창이 열려있으면 닫기
  if (showViewModal.value) {
    closeDetailDialog();
  }
  editingItem.value = {
    checkbox: false,
    isMasters: false,
    isAdult: false,
    name: '',
    team: '',
    ageGroup: '',
    gender: 'men',
    discipline: 'FR',
    course: 'LCM',
    distance: '50M',
    time: '',
    rank: '',
    status: '',
  };
  showEditFormModal.value = true;
};
const viewEditedItem = (item: any) => {
  showViewModal.value = false;
  showEditFormModal.value = true;
  editingItem.value = { ...item };
};
const viewItemModal = (item: any) => {
  viewItem.value = { ...item };
  showViewModal.value = true;
};

const closeDetailDialog = () => {
  showViewModal.value = false;
  viewItem.value = null;
  emit("edit-time", viewItem.value);
};
///########################################################
///########################################################
///########################################################
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
<style scoped></style><!-- pages/times/list.vue -->
