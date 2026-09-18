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

    <template #column-names="{ value, row }">
      <span>{{ (value ||[]).join(',') }}</span>
    </template>
  </DataTable>
  <!-- <template -->
  <!----------------------->
  <!----------------------->
  <!----------------------->
  

</template>
<!---------------------------------------
  편집 다이얼로그
  ----------------------------------------->
<!---------------------------------------
  상세 정보 다이얼로그
  ----------------------------------------->

<!---------------------------------------
  삭제 확인 모달
  ----------------------------------------->
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
import { TeamSortField } from '~/types/teams';
import type { TeamModel } from '~/models/teams';
import { useTeamStore } from '~/stores/teams';
import { useAuthStore } from '~/stores/useAuthStore';

import DataTable from '~/components/common/DataTable.vue';
import TheModalForm from '~/components/common/TheModalForm.vue';
import TheModalView from '~/components/common/TheModalView.vue';
import TheModelCancelOK from '~/components/common/TheModalCancelOK.vue';
// DataTable 설정
import { tableColumns } from './tableColumns';

const router = useRouter();

const authStore = useAuthStore();
const teamStore = useTeamStore();

// editingItem 타입 수정
interface EditableTeam extends TeamModel {
  [key: string]: any; // 추가 속성 허용
}

// 상태 관리
const isLoading = ref(false);
const selectedItems = ref<number[]>([]);

const props = defineProps({
  teams: {
    type: Array as () => TeamModel[],
    default: () => [] as TeamModel[],
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  page: {
    type: Number,
    default: 1,
  },
});
const tableData = ref<TeamModel[]>([]);

const currentPage = computed(() => props.page);

//===================================
// computed: 상태변화
//===================================
// modelValue 변경 감지
watch(() => props.teams, (newValue) => {
  tableData.value = newValue;
}, { deep: true });
// const tableData = computed(() => {
//   // return teamStore.filteredTimeList;
//   return props.teams.map((data:TeamModel) => {
//     // checked 속성 추가
//     return {
//       ...data,
//       checked: selectedItems.value.includes(data.teamID)
//     };
//   });
// });

///########################################################
///####################DataTable###########################
///########################################################

// Table header sort changed
const sortColumnChanged = async (column: string) => {
  teamStore.filter.sortField = column as TeamSortField;
  teamStore.filter.sortDirection = teamStore.filter.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;
  await teamStore.fetchTeamListBackend(1, teamStore.pagination.rowsPerPage);
};

const clickTableCell = async (item: TeamModel, column: string) => {
  // router.push(`/team/${item.teamID}`);
  emit('click-cell', item);
};


// 페이지 변경 처리
const pageChanged = async (page: number) => {
  emit('page-change', page);
};

const emit = defineEmits([
  'page-change',
  'click-cell',
  'select-item',
]);

///########################################################
///################# DataTable action button ##############
///########################################################
const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedItems.value = tableData.value.map(item => (item as any).teamID);
  } else {
    selectedItems.value = [];
  }
  emit("select-item", selectedItems.value);
};

const toggleSelectItem = (id: number, checked: boolean) => {
  if (checked) {
    if (!selectedItems.value.includes(id)) {
      selectedItems.value.push(id);
    }
  } else {
    selectedItems.value = selectedItems.value.filter(itemId => itemId !== id);
  }
  emit("select-item", selectedItems.value);
};

const showEditFormModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

const editingItem = ref(null);
const viewItem = ref(null);
const itemToDelete = ref(null);

// 체크된 항목 관리 함수
const toggleAllChecked = (checked: boolean) => {
  tableData.value.forEach(item => item.checked = checked);
};

const toggleItemChecked = (teamID: number, checked: boolean) => {
  const item = tableData.value.find(item => (item as any).teamID === teamID);
  if (item) item.checked = checked;
};
// 삭제 관련 함수
const confirmDelete = (teamID: any) => {
  itemToDelete.value = teamID;
  showDeleteModal.value = true;
};

const confirmDeleteItem = () => {
  if (itemToDelete.value != undefined) {
    tableData.value = tableData.value.filter(item => (item as any).teamID != (itemToDelete.value as any).teamID);
  }
  // close Modal
  showDeleteModal.value = false;
};

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
    style: 'freestyle',
    course: 'LCM',
    distance: '50M',
    time: '',
    rank: '',
    status: '',
  };
  showEditFormModal.value = true;
};

// 편집 관련 함수
const editItemModal = (item: any) => {
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
const viewEditedItem = (item: any) => {
  showViewModal.value = false;
  showEditFormModal.value = true;
  editingItem.value = { ...item };
};
const saveEditedItem = () => {
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
  const index = tableData.value.findIndex(item => (item as any).teamID === (editingItem as any).value.teamID);
  if (index !== -1) {
    tableData.value[index] = { ...(editingItem as any).value };
  }
  closeEditDialog();
};

// 상세 보기 관련 함수
const viewItemModal = (item: any) => {
  viewItem.value = { ...item };
  showViewModal.value = true;
};

const closeDetailDialog = () => {
  showViewModal.value = false;
  viewItem.value = null;
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
</style>