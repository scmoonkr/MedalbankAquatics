<!-- pages/times/list.vue -->
<template>

  <DataTable
    :columns="columns"
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
    @edit="editRecord"
    @delete="confirmDelete" @goto-view-page="viewRecordDetails">
  </DataTable>
  <!----------------------->
  <!----------------------->
  <!----------------------->
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
// import { TimeSortField } from '~/types/times';
// import type {
//   TimeFilter,
//   UItimesFilters,
//   TimeStats
// } from '~/types/times';
import type { TimeModel } from '~/models/times';
import { useTimeStore } from '~/stores/times';
import { useAuthStore } from '~/stores/useAuthStore';

import DataTable from '~/components/common/DataTable.vue';

const router = useRouter();

const authStore = useAuthStore();
const timeStore = useTimeStore();

// editingItem 타입 수정
interface EditableTime extends TimeModel {
  [key: string]: any; // 추가 속성 허용
}

// 상태 관리
const isLoading = ref(false);
const selectedItems = ref<number[]>([]);
const timeToDelete = ref<number | null>(null);
const rowsPerPage = UI_CONFIG.rowsPerPage;

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

const tableData = ref<TimeModel[]>([]);

const currentPage = computed(() => props.page);

//===================================
// computed: 상태변화
//===================================
// modelValue 변경 감지
watch(() => props.times, (newValue) => {
  tableData.value = newValue;
}, { deep: true });
// const tableData = computed(() => {
//   // return timeStore.filteredTimeList;
//   return props.times.map((data:TimeModel) => {
//     // checked 속성 추가
//     return {
//       ...data,
//       checked: selectedItems.value.includes(data.timeID)
//     };
//   });
// });

///########################################################
///####################DataTable###########################
///########################################################
// DataTable 설정
const columns = [
  // { key: 'checkbox', label: 'v', width: '50px', },
  // { key: 'timeID', label: 'id', width: '50px', sortable: true, edit: false },
  // { key: 'competitionID', label: 'cid', width: '50px', sortable: true, edit: false },
  { key: 'name', label: '이름', width: '100px', sortable: true },
  { key: 'ageGroup', label: '연령대', width: '150px', sortable: true },
  { key: 'gender', label: '성별', options: ["men", "women", "mixed"], width: '100px', sortable: true },
  { key: 'discipline', label: '종목', options: ["FR", "BA", "BR", "FL", "IM"], width: '100px', sortable: true },
  { key: 'course', label: '코스', options: ["LCM", "SCM"], width: '60px', sortable: true },
  { key: 'distance', label: '거리', width: '60px', sortable: true },
  { key: 'time', label: '기록', width: '60px', sortable: true },
  // { key: 'rank', label: 'rank', width: '50px', sortable: true, edit: true },
  { key: 'status', label: 'status', width: '80px', sortable: true, edit: true },
  // { key: 'pool', label: 'pool', width: '30%', sortable: false, className: 'nowrap-text' },
  // { key: 'datetime', label: 'datetime', width: '20%', sortable: false },
  // { key: 'actions', label: '액션', width: '80px', sortable: false, },
];

const showDeleteButton = computed(() => selectedItems.value.length > 0);

// Table header sort changed
const sortColumnChanged = async (column: string) => {
  timeStore.sortField = column as any;
  timeStore.sortDirection = timeStore.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;
  await timeStore.fetchTimeList(1, rowsPerPage);
};

const clickTableCell = async (item: TimeModel, column: string) => {
  // router.push(`/time/${item.timeID}`);
  emit('click-cell', item, column);
};



// 페이지 변경 처리
const pageChanged = async (page: number) => {
  emit('page-change', page);
};

const emit = defineEmits([
  'page-change',
  'click-cell',
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

const showEditFormModal = ref(false);
const editingItem = ref(null);
const showViewModal = ref(false);
const detailItem = ref(null);
const showDeleteModal = ref(false);
const itemToDelete = ref(null);


const editRecord = (id: number) => {
  router.push(`/times/${id}/edit`);
};

const viewRecordDetails = (timeID: number) => {
  router.push(`/times/${timeID}`);
};
// 체크된 항목 관리 함수
const toggleAllChecked = (checked: boolean) => {
  // tableData.value.forEach(item => item.checked = checked);
};

const toggleItemChecked = (timeID: number, checked: boolean) => {
  const item = tableData.value.find(item => (item as any).timeID === timeID);
  // if (item) item.checked = checked;
};

// 삭제 관련 함수
const confirmDelete = (timeID: any) => {
  itemToDelete.value = timeID;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const confirmDeleteAction = () => {
  if (itemToDelete.value) {
    // 단일 항목 삭제
    tableData.value = tableData.value.filter(item => (item as any).timeID != Number(itemToDelete.value));
    // const newData = [...tableData.value.filter(item => (item as any).timeID != Number(itemToDelete.value))];
    // tableData.value = newData;
  } else {
    // 선택된 항목 삭제
    // tableData.value = tableData.value.filter(item => !item.checked);
  }

  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const deleteCheckedItems = () => {
  // if (tableData.value.some(item => item.checked)) {
  //   // 바로 삭제하지 않고 확인 모달 표시
  //   showDeleteModal.value = true;
  // }
};

// 저장 함수
const saveData = () => {
  // 여기서 데이터 저장 로직 구현
  alert('데이터가 저장되었습니다.');
};

// 편집 관련 함수
const editItem = (item: any) => {
  // 상세 정보 창이 열려있으면 닫기
  if (showViewModal.value) {
    closeDetailDialog();
  }

  editingItem.value = { ...item };
  showEditFormModal.value = true;
};

const closeEditDialog = () => {
  showEditFormModal.value = false;
  editingItem.value = null;
};

const saveEditedItem = () => {
  const index = tableData.value.findIndex(item => (item as any).timeID === (editingItem as any).value.timeID);
  if (index !== -1) {
    tableData.value[index] = { ...(editingItem as any).value };
  }
  closeEditDialog();
};

// 상세 보기 관련 함수
const viewItemDetails = (item: any) => {
  detailItem.value = { ...item };
  showViewModal.value = true;
};

const closeDetailDialog = () => {
  showViewModal.value = false;
  detailItem.value = null;
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
<style scoped>
.main-container {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 20px;
}

/* 버튼 스타일 */
.edit-btn,
.delete-btn,
.view-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;
  color: white;
}

.edit-btn {
  background-color: #3498db;
}

.delete-btn {
  background-color: #e74c3c;
}

.view-btn {
  background-color: #2ecc71;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.view-btn:hover {
  background-color: #27ae60;
}

/* 편집 다이얼로그 스타일 */
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-dialog {
  background-color: white;
  width: 500px;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.edit-dialog h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
}

.cancel-button,
.confirm-button,
.delete-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #333;
}

.confirm-button {
  background-color: #3498db;
  color: white;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #d0d0d0;
}

.confirm-button:hover {
  background-color: #2980b9;
}

.delete-button:hover {
  background-color: #c0392b;
}

/* 상세 정보 다이얼로그 스타일 */
.detail-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.detail-dialog {
  background-color: white;
  width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  max-height: 85vh;
  overflow: auto;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  z-index: 2;
}

.close-button:hover {
  color: #333;
}

.detail-header {
  padding: 24px 24px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.detail-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.detail-status.활성 {
  background-color: #d4f8e8;
  color: #2ecc71;
}

.detail-status.비활성 {
  background-color: #ffe5e5;
  color: #e74c3c;
}

.detail-status.대기중 {
  background-color: #f5e3ca;
  color: #f39c12;
}

.detail-content {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 1.1rem;
  color: #34495e;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  width: 120px;
  font-weight: 600;
  color: #555;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-memo {
  margin: 0;
  line-height: 1.5;
  color: #555;
}

.detail-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.detail-edit-button,
.detail-close-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.detail-edit-button {
  background-color: #3498db;
  color: white;
}

.detail-close-button {
  background-color: #e0e0e0;
  color: #333;
}

.detail-edit-button:hover {
  background-color: #2980b9;
}

.detail-close-button:hover {
  background-color: #d0d0d0;
}

.textarea-container {
  width: 100%;
  margin: 2rem 0;
  box-sizing: border-box;
  /* 내부 여백(패딩), 테두리를 총 너비에 포함 */
  font-family: sans-serif;
  /* border: 1px solid #ccc;    // 제거 */
  /* border-radius: 4px;        // 제거 */
  /* padding: 1rem;             // 필요에 따라 조정 가능 */
}

.textarea-container label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.textarea-container textarea {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  box-sizing: border-box;
}
</style><!-- pages/times/list.vue -->
