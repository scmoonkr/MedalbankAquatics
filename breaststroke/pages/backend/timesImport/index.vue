<!-- pages/times/list.vue -->
<template>
  <div class="times-list-page pl-5 pr-5">
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Import Times</h1>
    </div>
    <!-- 페이지 헤더 -->
    <div v-if="competitionName" class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-800"> {{ competitionName}}</h1>
    </div>

    <div class="flex items-center space-x-3">
      <input type="text" v-model="competitionID" required placeholder="competitionID" class="form-input w-[50px]" />

      <input type="file" ref="fileInputRef" accept=".xlsx, .xls" class="border border-gray-300 p-2 rounded w-[250px]"
        @change="onFileChange" />

      <button type="button" @click="clickUploadTimesExcel" class="upload-button w-[100px]" title="기록지.xlsx">
        <strong>Upload.xls</strong>
      </button>

      <button type="button" @click="clickReadTimesExcel" class="upload-button w-[100px]" title="read 기록지">
        <strong>Read</strong>
      </button>

      <button type="button" @click="clickSimulationTimesExcel" class="delete-button w-[100px]" title="read 기록지">
        <strong>Simulation</strong>
      </button>

      <button type="button" @click="showCheckModal=true" class="upload-button w-[100px]" title="check 기록지">
        <strong>Check</strong>
      </button>

      <button type="button" @click="showSaveModal=true" class="save-button w-[120px]" title="save 기록지 to DB">
        <strong>Save to DB</strong>
      </button>

      <button type="button" @click="showLoadModal=true" class="save-button w-[120px]" title="Load 기록지 from DB">
        <strong>load from DB</strong>
      </button>

      <button type="button" @click="showDeleteModal=true" class="delete-button w-[100px]" title="Delete 기록지">
        <strong>Delete</strong>
      </button>
    </div>
    <br>
    <!----------------------->
    <!-- DataTable 컴포넌트 -->
    <!----------------------->
    <TimesDataTable
      :times="timeStore.timeList"
      :totalPages="timeStore.pagination.totalPages"
      :page="currentPage"
      :key="'times-' + currentPage"
      @page-change="handlePageChange"
      @edit-time="handleEditTime"
      @delete-time="handleDeleteTime"
    />
    <!----------------------->
    <!------- Modal --------->
    <!----------------------->
    <TheModelCancelOK
      v-model:show="showCheckModal"
      title="Check Times"
      message="기록 확인이 완료되었나요?"
      @cancel="showCheckModal=false"
      @ok="clickCheckTimesExcel"
    />
    <TheModelCancelOK
      v-model:show="showSaveModal"
      title="기록 저장"
      message="정말로 이 기록을 Times에 저장하겠습니까?"
      @cancel="showSaveModal=false"
      @ok="clickSaveTimes2Mongo"
    />
    <TheModelCancelOK
      v-model:show="showLoadModal"
      title="ReLoad 기록"
      message="check 확인된 기록을 다시 load하겠습니까?"
      @cancel="showLoadModal=false"
      @ok="clickLoadImportedTimes"
    />
    <TheModelCancelOK
      v-model:show="showResult"
      :title="title"
      :message="message"
      @cancel="showLoadModal=false"
      @ok="clickLoadImportedTimes"
    />
    <TheModelCancelOK
      v-model:show="showDeleteModal"
      title="삭제 확인"
      message="정말로 이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      @cancel="showDeleteModal=false"
      @ok="clickDeleteTime"
    />
    <!----------------------->
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

definePageMeta({
  layout: 'backend',
});
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { TimeModel } from '~/models/times';
import { useTimeStore } from '~/stores/times';
import { useAuthStore } from '~/stores/useAuthStore';

import TimesDataTable from './times_table.vue';
import TheModelCancelOK from '~/components/common/TheModalCancelOK.vue';
import UI_CONFIG from '~/config/ui';

const router = useRouter();

const authStore = useAuthStore();
const timeStore = useTimeStore();

// 상태 관리
const currentPage = ref(1);
const competitionID = ref(1);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isLoading = ref(false);
const tableData = ref<Record<string, any>[]>([]);
const selectedFile = ref<File | null>(null);
const showCheckModal = ref(false);
const showSaveModal = ref(false);
const showLoadModal = ref(false);
const showDeleteModal = ref(false);
const competitionName = ref("");
const showResult = ref(false);
const title = ref("");
const message = ref("");


// 부모 컴포넌트에 추가
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await timeStore.fetchTimeList(currentPage.value, timeStore.pagination.rowsPerPage);
};
const handleEditTime = async (time: any) => {
};
const handleDeleteTime = async (timeID: number) => {
};

// 파일 변경 이벤트 핸들러
const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // handleFileUpload(file);
    selectedFile.value = file;
  }
};
const clickUploadTimesExcel = () => {
  if (selectedFile.value) {
    timeStore.uploadFile('times', 'times', competitionID.value, selectedFile.value);
		alert("Upload 완료되었습니다. Read 버튼을 눌러 기록을 확인하세요.");
	} else {
		alert("업로드할 파일을 선택해주세요.");
  }
};

const clickReadTimesExcel = async () => {
  await timeStore.readUploadedFile('times', 'times', competitionID.value);
  if (timeStore.timeList.length > 0) {
    competitionName.value = timeStore.timeList[0].competitionName;
  }
};


const clickSimulationTimesExcel = async () => {
  await timeStore.simulationUploadedFile('times', 'times', competitionID.value);
};


// '/importTimes/check'
const clickCheckTimesExcel = async () => {
  const msg = await timeStore!.checkUploadedFile(competitionID.value);
  if (msg != "") {
    title.value = "check result"
    message.value = msg.replace(/\n/gi, "|");
    showResult.value = true;
  }
};

// '/importTimes/importTimes'
const clickSaveTimes2Mongo = async () => {
  //------------------------------------------------------
  // var param = {"competitionID": competitionID};
  const msg = await timeStore!.importTimes(competitionID.value);
  if (msg != "") {
    title.value = "inserted athlete"
    message.value = msg.replace(/\n/gi, "|");
    showResult.value = true;
  }
  //------------------------------------------------------
};

// '/importTimes/importTimes'
const clickLoadImportedTimes = async () => {
  //---------------------------------
  //  delete time  from server
  //---------------------------------
  // const msg = await timeStore!.importTimes(competitionID.value);
};

// '/importTimes/importTimes'
const clickDeleteTime = async () => {
  showDeleteModal.value = false;
};

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

.form-input {
  width: 5%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.upload-button,
.save-button,
.delete-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.upload-button {
  background-color: #c7f784;
  color: #333;
}

.save-button {
  background-color: #3498db;
  color: white;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.upload-button:hover {
  background-color: #d0d0d0;
}

.save-button:hover {
  background-color: #2980b9;
}

.delete-button:hover {
  background-color: #c0392b;
}

.toolbar-btn:last-child {
  border-right: none;
}

</style>
