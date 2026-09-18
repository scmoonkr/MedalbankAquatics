// components/times/TimesFilterCard.vue
<template>
  <div>
    <!-- 단체전 -->
    <!-- <ButtonGroup v-if="showIndividual" title="" :items="individualItems" v-model="selectedIndividual" width="small"
      height="medium" @update:modelValue="updateDependencies" /> -->

    <!-- gender 탭 메뉴 -->
    <ButtonGroup v-if="showGender" title="" :items="genderItems" v-model="selectedGender" width="small" height="medium"
      @update:modelValue="updateDependencies" />

    <!-- style 탭 메뉴 -->
    <ButtonGroup title="" :items="styleItems" v-model="selectedStyle" width="small" height="medium"
      @update:modelValue="updateDependencies" />

    <!-- distance 탭 메뉴 -->
    <ButtonGroup title="" :items="distanceItems" v-model="selectedDistance" width="small" height="medium"
      @update:modelValue="updateDependencies" />

    <!-- style 탭 메뉴 -->
    <ButtonGroup v-if="props.showCourse" title="" :items="courseItems" v-model="selectedCourse" width="small"
      @update:modelValue="updateDependencies" />
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
import { ref, computed, watch, onMounted } from 'vue'
import type { Gender, SwimCourse, SwimStyle, Individual } from '~/types/common'
import ButtonGroup from '~/components/common/TheButtonGroup.vue';

//===================================
// 부모 컴포넌트로부터 옵션을 받음
//===================================
const props = defineProps({
  showIndividual: {
    type: Boolean,
    default: true
  },
  showAllOption: {
    type: Boolean,
    default: true
  },
  showGender: {
    type: Boolean,
    default: true
  },
  showCourse: {
    type: Boolean,
    default: true
  },
  showMixedOption: {
    type: Boolean,
    default: true
  },
  defaultIndividual: {
    type: String as () => 'all' | Individual,
    default: 'all'
  },
  defaultGender: {
    type: String as () => 'all' | Gender,
    default: 'all'
  },
  defaultStyle: {
    type: String as () => 'all' | SwimStyle,
    default: 'all'
  },
  defaultDistance: {
    type: String as () => 'all' | string,
    default: 'all'
  },
  defaultCourse: {
    type: String as () => 'all' | SwimCourse,
    default: 'all'
  }
})

//===================================
// 부모로 필터 값들을 전달하기 위한 이벤트 정의
//===================================
const emit = defineEmits(['update:filters'])

// 필터 상태
const selectedIndividual = ref<'all' | Individual>(props.defaultIndividual)
const selectedGender = ref<'all' | Gender>(props.defaultGender)
const selectedStyle = ref<'all' | SwimStyle>(props.defaultStyle)
const selectedDistance = ref<'all' | string>(props.defaultDistance)
const selectedCourse = ref<'all' | SwimCourse>(props.defaultCourse)


// 코스 옵션
const individualItems = [
  { value: 'individual', label: '개인전' },
  { value: 'team', label: '단체전' }
];
// 필터 탭 설정
let styleItems = [
  { value: 'freestyle', label: '자유형' },
  { value: 'backstroke', label: '배영' },
  { value: 'butterfly', label: '접영' },
  { value: 'individualMedley', label: '개인혼영' }
];
// 거리 옵션
let distanceItems = [
  { value: '25M', label: '25M' },
  { value: '50M', label: '50M' },
  { value: '100M', label: '100M' },
  { value: '200M', label: '200M' },
  { value: '400M', label: '400M' },
  { value: '800M', label: '800M' },
  { value: '1500M', label: '1500M' }
];
// 코스 옵션
const courseItems = [
  { value: 'LCM', label: 'LCM' },
  { value: 'SCM', label: 'SCM' }
];

// 영법에 따른 사용 가능한 거리 가져오기
const getStyleDistances = (stroke: SwimStyle | 'all'): string[] => {
  if (stroke === 'all') {
    // 모든 거리를 합쳐서 중복 제거
    const allDistances = new Set<string>();
    stylesTable.forEach(style => {
      if (style.distances) {
        style.distances.forEach(dist => allDistances.add(dist));
      }
    });
    return Array.from(allDistances);
  }

  const style = stylesTable.find(s => s.eng === stroke);
  return style?.distances || [];
};

//----------------------------------------------------------------------
// 의존성 업데이트 (개인/단체, 성별, 영법, 거리,코스 변경 시 호출)
//----------------------------------------------------------------------
const updateDependencies = () => {
  // 전체 옵션이 비활성화된 경우 처리
  if (!props.showAllOption) {
    if (selectedGender.value === 'all') {
      selectedGender.value = 'men';
    }
    if (selectedStyle.value === 'all') {
      if (availableStyles.value.length > 0) {
        selectedStyle.value = availableStyles.value[0].eng as SwimStyle;
      }
    }
    if (selectedCourse.value === 'all') {
      selectedCourse.value = 'LCM';
    }
    if (selectedDistance.value === 'all') {
      selectedDistance.value = '50M';
    }
  }

  // 현재 선택된 영법이 사용 가능한지 확인
  if (selectedStyle.value !== 'all') {
    const validStyle = availableStyles.value.find(s => s.eng === selectedStyle.value);
    if (!validStyle) {
      // 유효하지 않은 영법이 선택된 경우 첫 번째 유효한 영법으로 변경
      if (availableStyles.value.length > 0) {
        selectedStyle.value = availableStyles.value[0].eng as SwimStyle;
      } else {
        selectedStyle.value = 'all';
      }
    }
  }

  // 현재 선택된 거리가 유효한지 확인
  if (selectedDistance.value !== 'all') {
    const distanceItems = availableDistances.value;
    const validDistance = distanceItems.find(d => d === selectedDistance.value);
    if (!validDistance) {
      // 유효하지 않은 거리가 선택된 경우 첫 번째 유효한 거리로 변경
      if (distanceItems.length > 0) {
        selectedDistance.value = distanceItems[0];
      } else {
        selectedDistance.value = 'all';
      }
    }
  }

  // styleItems
  // { value: 'freestyle', label: '자유형' },
  styleItems = [];
  for (let i = 0; i < availableStyles.value.length; i++) {
    const style = availableStyles.value[i];
    styleItems.push({ label: style.kor, value: style.eng });
  }
  // distanceItems
  distanceItems = [];
  for (let i = 0; i < availableDistances.value.length; i++) {
    const distance = availableDistances.value[i];
    distanceItems.push({ label: distance, value: distance });
  }
};
//----------------------------------------------------------------------
//----------------------------------------------------------------------

//===================================
// 컴포넌트 마운트 시 초기화
//===================================
onMounted(() => {
  selectedIndividual.value = 'individual';
  updateDependencies();
});
//===================================
// computed: 상태변화
//===================================
const genderItems = computed(() => {
  const baseItems = [
    { value: 'men', label: '남자' },
    { value: 'women', label: '여자' }
  ];

  if (selectedIndividual.value === 'team') {
    // 팀일 경우 혼성 옵션 추가
    return [...baseItems, { value: 'mixed', label: '혼성' }];
  }

  return baseItems;
});
// 선택된 성별에 따라 필터링된 수영 스타일 목록
const availableStyles = computed(() => {
  if (selectedIndividual.value === 'all') {
    return stylesTable;
  }

  if (selectedIndividual.value === 'team') {
    // 혼성은 계영과 혼계영만 표시
    return stylesTable.filter(style =>
      style.eng === 'freestyleRelay' || style.eng === 'medleyRelay'
    );
  } else {
    // 남자, 여자는 모든 영법 표시
    return stylesTable.filter(style =>
      style.eng !== 'freestyleRelay' && style.eng !== 'medleyRelay'
    );
  }
});
// 선택된 영법과 코스에 따라 필터링된 거리 목록
const availableDistances = computed(() => {
  let distanceItems = getStyleDistances(selectedStyle.value);

  // 코스에 따라 거리 필터링
  if (selectedCourse.value === 'LCM') {
    // SCM에서는 1st 25M, 100M 제외
    distanceItems = distanceItems.slice(1);
    // distanceItems = distanceItems.filter(d => d !== '25M');
  }

  return distanceItems;
});

//===================================
// props 변경 감지
//===================================
watch([
  () => props.showAllOption,
  () => props.showGender,
  () => props.showMixedOption
], () => {
  updateDependencies();
});

//===================================
// 필터 값이 바뀔 때마다 부모 컴포넌트에 전달
//===================================
watch(
  [
    selectedIndividual,
    selectedGender,
    selectedStyle,
    selectedDistance,
    selectedCourse,
  ],
  ([individual, gender, style, distance, course]) => {
    emit('update:filters', {
      individual,
      gender,
      style,
      distance,
      course,
    })
  },
  { deep: true }
)
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
.filter-card {
  /* 카드 스타일 */
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.filter-group {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  margin-right: 8px;
}

button {
  padding: 4px 8px;
  cursor: pointer;
  border: 1px solid #ccc;
  background-color: #fff;
  transition: background-color 0.2s;
}

button.active {
  background-color: #007acc;
  color: #fff;
  border-color: #007acc;
}
</style>