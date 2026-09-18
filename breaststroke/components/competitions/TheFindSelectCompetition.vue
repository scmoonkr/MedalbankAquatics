// '/components/TheFindSelectCompetition.vue'
<template>
  <div v-if='isSelected === false' class="competition-search-container">
    <div class="search-input-container">
      <input type="text" v-model="searchQuery" class="competition-input" placeholder="대회 이름 검색" @input="handleSearch" />
    </div>

    <div v-if="isLoading" class="search-status">
      <p>검색 중...</p>
    </div>

    <div v-else-if="searchError" class="search-status error">
      <p>{{ searchError }}</p>
    </div>

    <div v-else-if="searchResults.length > 0" class="search-results">
      <button v-for="competition in searchResults" :key="competition.competitionID" class="competition-result-button"
        @click="selectCompetition(competition)">
        {{ competition.fullname }}
      </button>
    </div>

    <div v-else-if="searchQuery.length >= 2 && !isLoading" class="search-status cursor-not-allowed">
      <p>검색 결과가 없거나 현재 로딩중입니다.</p>
    </div>

    <p class="hint-text">대회 이름을 선택해주세요. 검색되지 않는 대회은 메일로만 처리 바랍니다.</p>
  </div>
  <!-- <div v-if="selectedCompetition" class="selected-competition">
    <p>선택된 대회: <strong>{{ selectedCompetition.name }}</strong></p>
  </div> -->

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
<script setup>
import { ref, watch } from 'vue';
import { debounce } from 'lodash'; // lodash 사용 (필요시 설치)
import { useCompetitionStore } from '~/stores/competitions';
import { CompetitionSortField } from '~/types/competitions';

const competitionStore = useCompetitionStore();

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Object,
    default: () => ({ fullname: '', competitionID: null })
  },
  width: {
    type: String,
    default: 'medium',
    validator: (value) => ['flex', 'xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge'].includes(value)
  },
});

const emit = defineEmits(['update:modelValue']);

const searchQuery = ref('');
const searchResults = ref([]);
const isLoading = ref(false);
const isSelected = ref(false);
const searchError = ref('');
const selectedCompetition = ref(null);

// 초기값 설정 (있을 경우)
if (props.modelValue && props.modelValue.fullname) {
  searchQuery.value = props.modelValue.fullname;
  selectedCompetition.value = props.modelValue;
}

// 디바운싱된 검색 함수 (타이핑 중 과도한 API 호출 방지)
const handleSearch = debounce(async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  // emit('update:modelValue', value);

  try {
    isLoading.value = true;
    searchError.value = '';

    // 실제 API 호출 (실제 구현 필요)
    await competitionStore.fetchCompetitionNames(searchQuery.value);
    // const response = await fetch(`/api/competitions/search?query=${searchQuery.value}`);
    // if (!response.ok) throw new Error('검색 중 오류가 발생했습니다.');
    // const data = await response.json();
    // searchResults.value = data;

    // 테스트용 가상 데이터 (실제로는 API 호출 결과로 대체)
    // await new Promise(resolve => setTimeout(resolve, 100)); // 검색 시간 시뮬레이션

    // const mockResults = [
    //   { name: `${searchQuery.value} 대회`, nameID: 1 },
    //   { name: `${searchQuery.value} 스포츠센터`, nameID: 2 },
    //   { name: `올림픽 ${searchQuery.value}`, nameID: 3 },
    //   { name: `${searchQuery.value} 아쿠아틱센터`, nameID: 4 }
    // ];

    searchResults.value = competitionStore.searchNames;
  } catch (error) {
    searchError.value = error.message || '검색 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
}, 300);

// 대회 선택 처리
const selectCompetition = (competition) => {
  selectedCompetition.value = competition;
  searchQuery.value = competition.fullname;
  searchResults.value = []; // 결과 목록 닫기
  isSelected.value = false;
  emit('update:modelValue', competition);
};

// modelValue 변경 감지
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.fullname) {
    searchQuery.value = newValue.fullname;
    selectedCompetition.value = newValue;
  } else {
    searchQuery.value = '';
    selectedCompetition.value = null;
  }
}, { deep: true });
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
.competition-search-container {
  margin-bottom: 20px;
}

.search-input-container {
  margin-bottom: 10px;
}

.competition-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
}

.search-results {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  /* 버튼 사이의 간격을 5px로 설정 */
  margin-bottom: 15px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
}

.competition-result-button {
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

.competition-result-button:hover {
  background-color: #e0e0e0;
}

.search-status {
  padding: 10px;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

.search-status.error {
  color: #e53e3e;
}

.selected-competition {
  margin: 10px 0;
  padding: 10px;
  background-color: #e6f7ff;
  border-radius: 6px;
}

.hint-text {
  margin-top: 8px;
  color: #666;
  font-size: 0.9rem;
}
</style>