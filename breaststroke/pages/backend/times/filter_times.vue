<!-- components/filter_times.vue -->
<template>
  <!-- 필터 버튼 영역 -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <DisciplineFilter
      :filters="filters"
      @change-field="onFilterChange"
    />
  </TheSection>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import type { Gender, SwimCourse, SwimStyle, Individual } from '~/types/common'
import TheSection from '~/components/common/TheSection.vue';
import type { JsonOptions, FilterItem } from '~/types/common';
import type { TimeFilter } from '~/types/times';
import DisciplineFilter from '~/components/common/TheFiltersTimes.vue';

// ===============================================
// Props 및 Emits 정의
// ===============================================
const props = defineProps({
  options: {
    type: Object as PropType<TimeFilter>,
    default: () => ({
      isMasters: true,
      isAdult: true,
      gender: 'women',
      style: 'breaststroke',
      distance: '50M',
      course: 'LCM',
      type: 'event',
    }),
  },
});

const emit = defineEmits(['change-discipline']);

// ===============================================
// 반응형 상태 관리
// ===============================================
const options = ref<TimeFilter>({
  isMasters: true,
  isAdult: true,
  gender: 'women',
  style: 'breaststroke',
  distance: '50M',
  course: 'LCM',
  type: 'event',
});

const filters = ref<FilterItem[]>([]);
const isInternalUpdate = ref(false); // 내부 업데이트 플래그

// 원본 필터 옵션들
const filtersORG = ref<FilterItem[]>([
  { field: 'masters', selected: '비등록', options: ['등록', '비등록'] },
  { field: 'adult', selected: '성인', options: ['성인', '학생'] },
  { field: 'gender', selected: '여자', options: ['남자', '여자'] },
  { field: 'style', selected: '평영', options: ['자유형', '배영', '평영', '접영', '개인혼영'] },
  { field: 'distance', selected: '50M', options: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'] },
  { field: 'course', selected: 'LCM', options: ['LCM', 'SCM'] },
  { field: 'type', selected: '대회기록', options: ['훈련기록', '대회기록'] },
]);

// ===============================================
// 초기화
// ===============================================
filters.value = JSON.parse(JSON.stringify(filtersORG.value));

// ===============================================
// 헬퍼 함수들 (한국어-영어 변환)
// ===============================================
const getGenderByEng = (eng: string): string => {
  const map: Record<string, string> = {
    'men': '남자',
    'women': '여자',
    'male': '남자',
    'female': '여자'
  };
  return map[eng] || '여자';
};

const getGenderByKor = (kor: string): string => {
  const map: Record<string, string> = {
    '남자': 'men',
    '여자': 'women'
  };
  return map[kor] || 'women';
};

const getStyleKorByEng = (eng: string): string => {
  const map: Record<string, string> = {
    'freestyle': '자유형',
    'backstroke': '배영',
    'breaststroke': '평영',
    'butterfly': '접영',
    'individualMedley': '개인혼영'
  };
  return map[eng] || '평영';
};

const getStyleEngByKor = (kor: string): string => {
  const map: Record<string, string> = {
    '자유형': 'freestyle',
    '배영': 'backstroke',
    '평영': 'breaststroke',
    '접영': 'butterfly',
    '개인혼영': 'individualMedley'
  };
  return map[kor] || 'breaststroke';
};

// ===============================================
// 필터 표시 업데이트 함수
// ===============================================
const updateFiltersDisplay = (newOptions: TimeFilter) => {
  
  // 마스터즈 여부에 따라 필터 구성 변경
  if (!newOptions.isMasters) {
    filters.value = filtersORG.value.filter(el => el.field !== 'type'); 
  } else {
    filters.value = JSON.parse(JSON.stringify(filtersORG.value));
  }
  
  // console.log("filter_times.isMasters=", newOptions.isMasters, "filters.length:", filters.value.length);

  // 각 필터의 선택값 업데이트
  if (filters.value.length > 0) {
    filters.value[0].selected = newOptions.isMasters ? "비등록" : "등록";  
  }
  if (filters.value.length > 1) {
    filters.value[1].selected = newOptions.isAdult ? "성인" : "학생";
  }
  if (filters.value.length > 2) {
    filters.value[2].selected = newOptions.gender ? getGenderByEng(newOptions.gender) : "여자";
  }
  if (filters.value.length > 3) {
    filters.value[3].selected = newOptions.style ? getStyleKorByEng(newOptions.style) : "평영";
  }
  if (filters.value.length > 4) {
    filters.value[4].selected = newOptions.distance || "50M";
  }
  if (filters.value.length > 5) {
    filters.value[5].selected = newOptions.course || "LCM";
  }
  if (filters.value.length > 6) {
    filters.value[6].selected = newOptions.type === "event" ? "대회기록" : "훈련기록";
  }
};

// ===============================================
// Props 변경 감지 (Parent → Child)
// ===============================================
watch(() => props.options, (newOptions) => {
  // 🔥 중요: 내부 업데이트 중이면 무시 (무한루프 방지)
  if (isInternalUpdate.value) {
    // console.log("내부 업데이트 중이므로 props 변경 무시");
    return;
  }
  
  // console.log("filter_times.props.options 변경됨:", newOptions);
  
  // 로컬 상태 업데이트
  options.value = { ...newOptions };
  
  // 필터 표시 업데이트
  updateFiltersDisplay(newOptions);
  
}, { deep: true, immediate: true });

// ===============================================
// 🚨 중요: 기존의 options.value watch는 제거!
// ===============================================
// ❌ 이 부분이 무한루프의 원인이었음
// watch(() => options.value, (newOptions) => {
//   // 이 watch를 제거함으로써 무한루프 해결
// }, { deep: true, immediate: true });

// ===============================================
// 사용자 상호작용으로 인한 필터 변경 처리
// ===============================================
const onFilterChange = async (field: string, value: string) => {
  try {
    // console.log("filter_times.onFilterChange 시작:", field, "=", value);
    
    // 🔥 중요: 내부 업데이트 시작 (무한루프 방지)
    isInternalUpdate.value = true;
    
    // 이전 값 저장 (디버깅용)
    const prevValue = (options.value as any)[field];
    
    // 필드별 값 변환 및 업데이트
    switch (field) {
      case 'style':
        options.value.style = getStyleEngByKor(value) as SwimStyle;
        break;
      case 'gender':
        options.value.gender = getGenderByKor(value) as Gender;
        break;
      case 'type':
        options.value.type = value === "대회기록" ? "event" : "time";
        break;
      case 'masters':
        options.value.isMasters = value === "등록";
        break;
      case 'adult':
        options.value.isAdult = value === "성인";
        break;
      case 'course':
        options.value.course = value as SwimCourse;
        break;
      case 'distance':
        options.value.distance = value;
        break;
      default:
        (options.value as any)[field] = value;
        break;
    }
    
    // console.log(`${field} 변경: ${prevValue} → ${(options.value as any)[field]}`);
    
    // 🔥 중요: Parent에게 변경사항 전달
    emit('change-discipline', options.value, field);
    
    // console.log("filter_times.onFilterChange 완료:", options.value);
    
  } catch (error) {
    console.error("필터 적용 중 오류:", error);
  } finally {
    // 🔥 중요: 다음 틱에서 내부 업데이트 플래그 해제
    nextTick(() => {
      isInternalUpdate.value = false;
      // console.log("내부 업데이트 플래그 해제");
    });
  }
};

// ===============================================
// 컴포넌트 마운트 시 초기화
// ===============================================
onMounted(() => {
  // console.log("filter_times.vue 마운트됨");
  // console.log("초기 props.options:", props.options);
  // console.log("초기 options.value:", options.value);
});

// ===============================================
// 디버깅용 computed
// ===============================================
const debugInfo = computed(() => ({
  propsOptions: props.options,
  localOptions: options.value,
  isInternalUpdate: isInternalUpdate.value,
  filtersLength: filters.value.length
}));

// 디버깅 정보 출력 (개발 환경에서만)
// if (process.dev) {
//   watch(debugInfo, (info) => {
//     console.log("🔍 filter_times 디버그 정보:", info);
//   }, { deep: true });
// }
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 */
.filter-container {
  /* 필터 컨테이너 스타일 */
}

/* 디버깅용 스타일 (개발 환경에서만) */
.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
}
</style>