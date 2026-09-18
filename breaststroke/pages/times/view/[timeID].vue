// /pages/times/view/[timeID].vue
<template>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <SectionLoading v-if="isLoading"></SectionLoading>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- 필터 버튼 영역 -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <div v-if="authStore.currentUser?.athleteID == timeStore.currentTime?.athleteID" class="button-group-filters">
      <!-- <button @click="" class="font-medium" :class="본인 기록이면 ? 'button-group-filters-selected' : 'button-group-filters-unselected'"> -->
      <button @click="clickNotMyTime" class="font-medium button-group-filters-unselected'">
        제 기록이 아니에요
      </button>
      <button v-if="timeStore.currentTime?.type == 'time'" @click="clickModify" class="font-medium button-group-filters-unselected'">
        수정하기
      </button>
      <!-- <button @click="clickDelete" class="font-medium button-group-filters-unselected'">
        삭제하기
      </button>
      <button @click="clickTest" class="font-medium button-group-filters-unselected'">
        test
      </button> -->
    </div>
  </TheSection>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- <TheSection :title="timeStore.currentTime?.name ?? ''" :subtitle="timeStore.currentTime?.timeID ?? ''"> -->
  <TheSection :title="title" :subtitle="subtitle" tooltip="모든 기록은 소중합니다.">
    <DataTableTimes :times="timeList" :totalPages="timeStore.pagination.totalPages" :page="currentPage" :key="'leaderboard-' + currentPage" />
    <!--<TheSpacer size="xs" />
    <span class="text-sm text-gray-400">이 기록은 홍길동#33333 님에 의해 대리 작성되었습니다. 작성일자 2025년 1월 1일.</span>-->
  </TheSection>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- <TheSection title="33333" subtitle="33333">
    <DisplayImages :time="timeStore.currentTime as TimeModel" :athleteID="authStore.currentUser?.athleteID ?? 0" />
  </TheSection> -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- <TheSection title="33333" subtitle="33333">
    <h1 class="text-title">대회 시리즈</h1>
    <DisplayResultAnaysis :time="(timeStore.currentTime as TimeModel)" />
  </TheSection> -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- <TheSection title="33333" subtitle="33333">
    <h1 class="text-title">경기기록 종합결과</h1>
    <DisplayDistanceAnaysis :time="(timeStore.currentTime as TimeModel)" />
  </TheSection> -->
  <TheTooltipDialog :show="showTooltip" :message="showMessage" @update:show="showTooltip = false" />
  <TheTooltipConfirm :show="showTooltipNotMyTime" :message="showMessage" :button="buttonMessage" @update:show="confirmNotMyTime" />
  <TheTooltipConfirm :show="showTooltipModify" :message="showMessage" :button="buttonMessage" @update:show="confirmModify" />

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

import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePageNavigation } from '~/composables/usePageNavigation';

import type { TimeModel } from '~/models/times';
import { useTimeStore } from '~/stores/times';
import { useAuthStore } from '~/stores/useAuthStore';

import DataTableTimes from './datatable_times.vue';

import DisplayImages from '~/pages/times/view/display_images.vue';
import DisplayResultAnaysis from './display_result_analysis.vue';
import DisplayDistanceAnaysis from './display_distance_analysis.vue';

import TheSection from '~/components/common/TheSection.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
import TheTooltipConfirm from '~/components/common/TheTooltipRun.vue';
const showTooltip = ref(false);
const showTooltipModify = ref(false);
const showTooltipNotMyTime = ref(false);
const showMessage = ref('');
const buttonMessage = ref('삭제');


const authStore = useAuthStore();
const timeStore = useTimeStore();

const route = useRoute()
const router = useRouter();

// 상태 관리
const isLoading = ref(false);
const currentPage = ref(1);
const title = ref('');
const subtitle = ref('');
const timeList = ref<TimeModel[]>([]);

//################################################################
//  initialize
//################################################################
// router 설정 파일 또는 컴포넌트에서
// 라우트 변경 감지

async function loadServerData() {

  try {
    isLoading.value = true;
    await nextTick();

    const timeIdStr = route.params.timeID;
    const timeId = parseInt(timeIdStr as string, 10);

    // 비동기 작업 완료 후 상태 확인
    await timeStore.fetchTimeById(timeId);
    if (timeStore.currentTime?.time) {
      timeList.value = [timeStore.currentTime];
      title.value = timeStore.currentTime?.time;
      subtitle.value = makeTimesTitle(timeStore.currentTime);
    }

  } catch (error) {
    console.error("Error in onMounted:", error);
  } finally {
    isLoading.value = false;
  }
}

// 컴포저블 함수 사용
usePageNavigation(loadServerData);

const clickNotMyTime = () => {
  if (!authStore.isAuthenticated) {
    showTooltip.value = true;
    showMessage.value = "로그인이 필요합니다!";
  } else {
    showMessage.value = `${timeStore.currentTime?.time}: 제 기록이 아니에요`;
    buttonMessage.value = "제 기록이 아니에요";
    showTooltipNotMyTime.value = true;
    // showMessage.value = `제 기록이 아니에요 timeID: ${timeStore.currentTime?.timeID}, athleteID: ${timeStore.currentTime?.athleteID}`;
  }
}
const confirmNotMyTime = async (value: boolean) => {
    showTooltipNotMyTime.value = false;
    if (value) {
      await timeStore.notMyTime(timeStore.currentTime?.timeID!);
      showMessage.value = "제 기록이 아니에요 처리 ok";
      showTooltip.value = true;
    } 
}

const clickModify = () => {
  if (!authStore.isAuthenticated) {
    showTooltip.value = true;
    showMessage.value = "로그인이 필요합니다!";
  } else {
    showTooltipModify.value = true;
    buttonMessage.value = "수정";
    showMessage.value = `수정 timeID: ${timeStore.currentTime?.timeID}, athleteID: ${timeStore.currentTime?.athleteID}`;
  }
}
const confirmModify = (value: boolean) => {
    showTooltipModify.value = false;
    if (value) {
      // showMessage.value = "수정 처리 ok -> goto edit";
      // showTooltip.value = true;
      
      router.push(`/time/${timeStore.currentTime?.timeID}/edit`);
    }
}
const clickTest = () => {
  showMessage.value = "test message";
  buttonMessage.value = "삭제";
  showTooltipModify.value = true;
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
.form-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
}

.form-subtitle {
  font-size: 24px;
  font-weight: 700;
  margin-top: 60px;
  margin-bottom: 30px;
}

.swim-record-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  font-weight: bold;
}

/* 시간 입력 디스플레이 */
.time-display-container {
  margin-bottom: 30px;
}

.time-display {
  width: 100%;
  font-size: 3.5rem;
  padding: 20px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f8f8f8;
  font-family: monospace;
  letter-spacing: 4px;
}

.time-hint {
  margin-top: 8px;
  color: #666;
  font-size: 0.9rem;
}

/* 탭 메뉴 */
.filter-tabs {
  display: flex;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.tab-button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.tab-button.active {
  background-color: #08102c;
  color: white;
}

/* 선택 행 (거리, 코스) */
.selection-row {
  display: flex;
  margin-bottom: 15px;
  gap: 5px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.selection-button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.selection-button.active {
  background-color: #08102c;
  color: white;
}

.select-hint {
  margin-bottom: 10px;
  color: #666;
}

/* 날짜 선택 */
.date-selection {
  margin-bottom: 15px;
}

.date-button {
  width: 100%;
  padding: 12px;
  background-color: #08102c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

/* 팀 입력 */
.team-input-container {
  margin-top: 20px;
  margin-bottom: 20px;
}

.team-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.hint-text {
  margin-top: 8px;
  color: #666;
  font-size: 0.9rem;
}

/* 제출 버튼 */
.submit-button-container {
  margin-top: 30px;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background-color: #ff9500;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}

.notes {
  margin-top: 30px;
  color: #666;
  font-size: 0.9rem;
}
</style>