// '/components/TheFindSelectTeam.vue'
<template>
  <div v-if='isSelected === false' class="team-search-container">
    <div class="search-input-container">
      <input type="text" v-model="searchQuery" class="team-input" placeholder="Team 이름 검색" @input="handleSearch" />
    </div>

    <div v-if="isLoading" class="search-status">
      <p>검색 중...</p>
    </div>

    <div v-else-if="searchError" class="search-status error">
      <p>{{ searchError }}</p>
    </div>

    <div v-else-if="searchResults.length > 0" class="search-results">
      <button v-for="team in searchResults" :key="team.teamID" class="team-result-button" @click="selectTeam(team)">
        {{ team.name }}
      </button>
    </div>

    <div v-else-if="searchQuery.length >= 2 && !isLoading" class="search-status cursor-not-allowed">
      <p>검색 결과가 없거나 현재 로딩중입니다.</p>
    </div>

    <p class="hint-text">Team 이름을 선택해주세요. 검색되지 않는 Team은 메일로만 처리 바랍니다.</p>
  </div>
  <!-- <div v-if="selectedTeam" class="selected-team">
    <p>선택된 Team: <strong>{{ selectedTeam.name }}</strong></p>
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
import { useTeamStore } from '~/stores/teams';
import { TeamSortField } from '~/types/teams';

const teamStore = useTeamStore();

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Object,
    default: () => ({ name: '', teamID: null })
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
const selectedTeam = ref(null);

// 초기값 설정 (있을 경우)
if (props.modelValue && props.modelValue.name) {
  searchQuery.value = props.modelValue.name;
  selectedTeam.value = props.modelValue;
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
    await teamStore.fetchTeamNames(searchQuery.value);
    // const response = await fetch(`/api/teams/search?query=${searchQuery.value}`);
    // if (!response.ok) throw new Error('검색 중 오류가 발생했습니다.');
    // const data = await response.json();
    // searchResults.value = data;

    // 테스트용 가상 데이터 (실제로는 API 호출 결과로 대체)
    // await new Promise(resolve => setTimeout(resolve, 100)); // 검색 시간 시뮬레이션

    // const mockResults = [
    //   { name: `${searchQuery.value} Team`, nameID: 1 },
    //   { name: `${searchQuery.value} 스포츠센터`, nameID: 2 },
    //   { name: `올림픽 ${searchQuery.value}`, nameID: 3 },
    //   { name: `${searchQuery.value} 아쿠아틱센터`, nameID: 4 }
    // ];

    searchResults.value = teamStore.searchNames;
  } catch (error) {
    console.error('검색 오류:', error);
    searchError.value = error.message || '검색 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
}, 300);

// Team 선택 처리
const selectTeam = (team) => {
  selectedTeam.value = team;
  searchQuery.value = team.name;
  searchResults.value = []; // 결과 목록 닫기
  isSelected.value = false;
  emit('update:modelValue', team);
};

// modelValue 변경 감지
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.name) {
    searchQuery.value = newValue.name;
    selectedTeam.value = newValue;
  } else {
    searchQuery.value = '';
    selectedTeam.value = null;
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
.team-search-container {
  margin-bottom: 20px;
}

.search-input-container {
  margin-bottom: 10px;
}

.team-input {
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

.team-result-button {
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

.team-result-button:hover {
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

.selected-team {
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