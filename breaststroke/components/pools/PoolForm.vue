// pages/times/edit.vue
<template>
  <div>
    <h1 class="page-title">{{ pageTitle }}</h1>

    <!-- 시간 입력 부분 (큰 디스플레이) -->
    <div class="time-display-container">
      <input v-model="timeDisplay" class="time-display" placeholder="00:00.00" @input="formatTimeInput" />
      <p class="time-hint">결과: {{ timeCalculationHint }}</p>
    </div>

    <!-- style 탭 메뉴 -->
    <ButtonGroup title="영법을 선택해주세요." :items="styles" v-model="selectedStyle" width="small"
      @update:modelValue="onStyleChange" />

    <!-- 거리 선택 -->
    <ButtonGroup title="거리를 선택해주세요." :items="distances" v-model="selectedDistance" width="small"
      @update:modelValue="onDistanceChange" />

    <ButtonGroup title="코스를 선택해주세요." :items="courses" v-model="selectedCourse" width="small"
      @update:modelValue="onCourseChange" />

    <DateButton title="날자를 선택해주세요." :items="dates" v-model="selectedDate" width="large"
      @update:modelValue="onDateChange" />

    <FindSelectPool title="수영장을 선택해주세요." v-model="selectedPool" width="large" @update:modelValue="onPoolChange" />


    <!-- <FindSelectTeam 
      title="코스를 선택해주세요."
      :items="courses"
      v-model="selectedCourse"
      @update:modelValue="onCourseChange"
    /> -->
    <!-- 팀 입력 -->
    <div class="team-input-container">
      <input type="text" v-model="team" class="team-input" placeholder="팀 검색" />
      <p class="hint-text">팀명을 선택해주세요. 검색되지 않는 팀은 메일로만 처리 바랍니다.</p>
    </div>

    <!-- 제출 버튼 -->
    <div class="submit-button-container">
      <button class="submit-button" @click="submitForm">
        수정한 정보 저장하기
      </button>
    </div>

    <div class="notes">
      <p>※ 지금 선택하신 기록은 공식 대회에서 나온 기록입니다.</p>
      <p>※ 전화번호나 기록지에 적혀있는 기록입니다.</p>
    </div>
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
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ButtonGroup from '~/components/common/TheButtonGroup.vue';
import DateButton from '~/components/common/TheDateSelectButton.vue';
import FindSelectTeam from '~/components/TheFindSelectTeam.vue';
import FindSelectPool from '~/components/TheFindSelectPool.vue';


// 라우트 파라미터 가져오기
const route = useRoute();
const router = useRouter();
const timeID = ref(null);

// 상태 관리
const timeDisplay = ref('00:00.00');
const activeTab = ref('자유형');
const selectedDistance = ref('50M');
const selectedStyle = ref('backstroke');
const selectedCourse = ref('LCM');
const selectedGender = ref('men');
const selectedDate = ref('2025-03-17');// 날자직접입력
const selectedPool = ref({ team: '', teamID: null });
const team = ref('');
const timeData = ref(null);
const isLoading = ref(true);

const onStyleChange = (value) => {
  selectedStyle = value;
  // 필요한 추가 로직 구현
};
const onDistanceChange = (value) => {
  selectedDistance = value;
  // 필요한 추가 로직 구현
};
const onCourseChange = (value) => {
  selectedCourse = value;
  // 필요한 추가 로직 구현
};
const onDateChange = (value) => {
  selectedDate = value;
  // 필요한 추가 로직 구현
};
const onPoolChange = (value) => {
  selectedDate = value;
  // 필요한 추가 로직 구현
};
const onTeamChange = (value) => {
  selectedDate = value;
  // 필요한 추가 로직 구현
};
// 현재 날짜 포맷
const today = new Date();
const formatDate = computed(() => {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
});

// 페이지 타이틀 생성
const pageTitle = computed(() => {
  const style = getStyleName(activeTab.value);
  return `${style} ${selectedDistance.value} ${selectedCourse.value} 대회기록 ${timeID.value ? '수정하기' : '새로 올리기'}`;
});

// 필터 탭 설정
const styles = [
  { value: 'freestyle', label: '자유형' },
  { value: 'backstroke', label: '배영' },
  { value: 'butterfly', label: '접영' },
  { value: 'individualMedley', label: '개인혼영' }
];

const dates = [
  { value: '2025-03-17', label: '오늘(2025-03-17)' },
  { value: '2025-03-16', label: '어제(2025-03-16)' },
  { value: '0000-00-00', label: '다른날자' }
];

// 영법 이름 매핑
const getStyleName = (styleId) => {
  const styleMap = {
    'freestyle': '자유형',
    'backstroke': '배영',
    'butterfly': '접영',
    'individualMedley': '개인혼영'
  };
  return styleMap[styleId] || styleMap[styleId] || '자유형';
};

// 영법 ID 매핑
const getStyleId = (styleName) => {
  const styleMap = {
    '자유형': 'freestyle',
    '배영': 'backstroke',
    '접영': 'butterfly',
    '개인혼영': 'individualMedley'
  };
  return styleMap[styleName] || 'freestyle';
};

// 거리 옵션
const distances = [
  { value: '25M', label: '25M' },
  { value: '50M', label: '50M' },
  { value: '100M', label: '100M' },
  { value: '200M', label: '200M' },
  { value: '400M', label: '400M' },
  { value: '800M', label: '800M' },
  { value: '1500M', label: '1500M' }
];

// 코스 옵션
const courses = [
  { value: 'LCM', label: 'LCM' },
  { value: 'SCM', label: 'SCM' }
];

// URL 파라미터 변경 감지 및 업데이트
watch([activeTab, selectedDistance, selectedCourse, selectedGender], () => {
  updateURL();
});

// URL 업데이트 함수
const updateURL = () => {
  router.push({
    path: '/times/edit',
    query: {
      timeID: timeID.value,
      gender: selectedGender.value,
      style: getStyleId(activeTab.value),
      course: selectedCourse.value,
      distance: selectedDistance.value
    }
  });
};

// 시간 형식화 함수
const formatTimeInput = () => {
  // 숫자와 콜론, 점만 허용
  let input = timeDisplay.value.replace(/[^0-9:.]/g, '');

  // 형식에 맞게 조정 (00:00.00)
  if (input.length > 0) {
    const parts = input.split(/[:.]/);
    let minutes = parts[0] || '00';
    let seconds = parts[1] || '00';
    let hundredths = parts[2] || '00';

    // 각 부분을 두 자리로 제한
    minutes = minutes.padStart(2, '0').substring(0, 2);
    seconds = seconds.padStart(2, '0').substring(0, 2);
    hundredths = hundredths.padStart(2, '0').substring(0, 2);

    timeDisplay.value = `${minutes}:${seconds}.${hundredths}`;
  }
};

// 시간 계산 힌트 (예시: 00:29.99 = 00분 29초 99)
const timeCalculationHint = computed(() => {
  if (!timeDisplay.value) return '';

  const parts = timeDisplay.value.split(/[:.]/);
  const minutes = parseInt(parts[0] || '0');
  const seconds = parseInt(parts[1] || '0');
  const hundredths = parseInt(parts[2] || '0');

  return `${minutes > 0 ? minutes + '분 ' : ''}${seconds}초 ${hundredths}`;
});

// 기록 데이터 로드
const loadTimeData = async () => {
  if (!timeID.value) {
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    // API 호출 예시 (실제 구현 필요)
    // const response = await fetch(`/api/times/${timeID.value}`);
    // const data = await response.json();

    // 임시 데이터 (테스트용)
    const data = {
      timeID: timeID.value,
      style: 'freestyle',
      course: 'LCM',
      distance: '50M',
      gender: 'men',
      time: '00:29.99',
      team: '수영팀'
    };

    timeData.value = data;

    // 데이터로 폼 채우기
    timeDisplay.value = data.time;
    activeTab.value = data.style === 'freestyle' ? '자유형' :
      data.style === 'backstroke' ? '배영' :
        data.style === 'butterfly' ? '접영' : '개인혼영';
    selectedDistance.value = data.distance;
    selectedCourse.value = data.course;
    selectedGender.value = data.gender;
    team.value = data.team;

  } catch (error) {
    console.error('데이터 로드 오류:', error);
  } finally {
    isLoading.value = false;
  }
};

// 폼 제출 처리
const submitForm = async () => {
  try {
    // 시간 문자열을 초 단위로 변환 (필요시)
    const timePartsRaw = timeDisplay.value.split(/[:.]/);
    const minutes = parseInt(timePartsRaw[0] || '0');
    const seconds = parseInt(timePartsRaw[1] || '0');
    const hundredths = parseInt(timePartsRaw[2] || '0');
    const totalTimeInSeconds = minutes * 60 + seconds + (hundredths / 100);

    const formData = {
      timeID: timeID.value,
      style: getStyleId(activeTab.value),
      course: selectedCourse.value,
      distance: selectedDistance.value,
      gender: selectedGender.value,
      timeStamp: totalTimeInSeconds,
      time: timeDisplay.value,
      team: team.value,
      // 기타 필요한 데이터
    };

    // API 호출 예시 (실제 구현 필요)
    /*
    const response = await fetch(`/api/times/${timeID.value || 'new'}`, {
      method: timeID.value ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error('저장 실패');
    }
    
    const result = await response.json();
    
    // 성공 후 처리 (예: 목록 페이지로 이동)
    router.push('/times');
    */

    alert('기록이 저장되었습니다!');

  } catch (error) {
    console.error('폼 제출 오류:', error);
    alert('저장 중 오류가 발생했습니다.');
  }
};

// 컴포넌트 마운트 시 URL 파라미터 처리
onMounted(() => {
  // URL에서 파라미터 읽기
  timeID.value = route.query.timeID || null;

  if (route.query.style) {
    const styleName = getStyleName(route.query.style);
    activeTab.value = styleName;
  }

  if (route.query.course) {
    selectedCourse.value = route.query.course;
  }

  if (route.query.distance) {
    selectedDistance.value = route.query.distance;
  }

  if (route.query.gender) {
    selectedGender.value = route.query.gender;
  }

  // 데이터 로드
  loadTimeData();
});
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
.filter-styles {
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

/* 로딩 상태 */
.loading {
  text-align: center;
  padding: 20px;
  font-size: 1.2rem;
  color: #666;
}
</style>