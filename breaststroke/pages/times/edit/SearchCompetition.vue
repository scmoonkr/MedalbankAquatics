<template>  
  <div class="search-field">
    <input
      type="text"
      v-model="rawInputCompetition"
      @input="handleCompetitionInput"
      placeholder="미선택"
    />
    <button class="button-default button-search cursor-not-allowed" disabled>
      대회
    </button>
  </div>
  <div v-if="searchCompetitionResults.length > 0" class="button-group-filters mt-4">
    <button v-for="competition in searchCompetitionResults" :key="competition.competitionID" class="button-group-filters mt-1" @click="selectCompetition(competition)">
      {{ competition.fullname }}({{ competition.dateStart?.slice(0,4) }})
      <!-- {{ competition.fullname }} -->
    </button>
  </div>
  <!-- <div class="button-group-filters mt-4">
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
  </div> -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
//-----> models
//-----> types
//-----> stores
import { useCompetitionStore } from '~/stores/competitions';
//-----> components

const competitionStore = useCompetitionStore();

//-----> Interface
export interface CompetitionNames {
    fullname?: string;
    competitionID?: number;
    pool?: string;
    poolID?: number;
    sido: string;
    course: string;
    dateStart?: string;
}
//-----> 상태 관리
const selectedCompetition = ref({ name: '', competitionID: 0 });
const isLoading = ref(false);
const rawInputCompetition = ref('');
const searchCompetitionResults = ref<CompetitionNames[]>([]);

const props = defineProps({
  competitionName: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(['update-competition']);
// 대회 선택 처리
const selectCompetition = (competition: any) => {
  selectedCompetition.value = competition;
  selectedCompetition.value = competition.fullname;
  rawInputCompetition.value = competition.fullname;
  searchCompetitionResults.value = []; // 결과 목록 닫기
  emit('update-competition', competition);
};

const handleCompetitionInput = async (event: any) => {
  rawInputCompetition.value = event.target.value;
if (rawInputCompetition.value.length < 2) {
    searchCompetitionResults.value = [];
    return;
  }

  try {
    isLoading.value = true;

    // 실제 API 호출 (실제 구현 필요)
    await competitionStore.fetchCompetitionNames(rawInputCompetition.value);
    searchCompetitionResults.value = competitionStore.searchNames;
  } catch (error) {
    console.error('검색 오류:', error);
  } finally {
    isLoading.value = false;
  }
  // subtitle.value = makeSubtitle(rawInputTimeNew.value, dateValue.value, selectedCompetition.value);
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