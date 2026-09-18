<!-- components/common/TheFilters.vue -->
<template>

  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- 필터 버튼 영역 -->
  <div class="button-group-filters">
    <template v-for="(filter, index) in props.filters" :key="index">
      <!-- 선택지가 2개면 클릭 시 자동 토글 -->
      <button v-if="filter.options.length === 2" @click="toggleTwoOption(index)" class="font-medium"
        :class="filter.selected ? 'button-group-filters-selected' : 'button-group-filters-unselected'">
        {{ filter.selected }}
      </button>

      <!-- 선택지가 1개면 자동 선택 -->
      <template v-else-if="filter.options.length === 1">
        <button v-if="filter.options[0]" class="button-group-filters-selected" @click="selectOption(index, filter.options[0])">
          {{ filter.options[0] }}
        </button>
      </template>

      <!-- 선택지가 2개 이상인 경우: 기본 선택 버튼 -->
      <button v-else-if="openIndex !== index" @click="toggleDropdown(index)" class="font-medium"
        :class="filter.selected ? 'button-group-filters-selected' : 'button-group-filters-unselected'">
        {{ filter.selected }}
      </button>

      <!-- 옵션 버튼 (선택 중 상태) -->
      <template v-else>
        <button v-for="option in filter.options" :key="option" :disabled="isOptionDisabled(index, option)"
          @click="selectOption(index, option)" class="border text-sm px-4 py-2 rounded-full" :class="isOptionDisabled(index, option)
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'button-group-filters-unselected'">
          {{ option }}
        </button>
      </template>
    </template>
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
import { ref, computed, onMounted, watch } from 'vue';
import type { FilterItem } from '~/types/common';
import { TimeModel } from '~/models/times';

// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

const props = defineProps({
  course: {
    type: String,
    default: ''
  },
  times: {
    type: Array as () => TimeModel[],
    default: () => [] as TimeModel[],
  },
  filters: {
    type: Array as PropType<FilterItem[]>,
    default: () => [] as FilterItem[],
  },
});

const openIndex = ref<number | null>(null)

// filter가 변경될 때 parent로 filter 데이터를 업데이트하는 함수
const emit = defineEmits(['change-field']);

// display
function toggleDropdown(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

// watch(() => props.times, async (newTimes) => {
// }, { deep: true, immediate: true }); // deep과 immediate 옵션 추가

function toggleTwoOption(index: number) {
  const filter = props.filters[index]
  const [first, second] = filter.options
  filter.selected = filter.selected === first ? second : first
  applyFilterRules();
  emit('change-field', filter.field, filter.selected);
}

function selectOption(index: number, option: string) {
  console.log("1selectOption=", index, option);
  props.filters[index].selected = option
  console.log("2selectOption=", index, option);
  applyFilterRules()
  openIndex.value = null

  const filter = props.filters[index]
  emit('change-field', filter.field, filter.selected);
}

function applyFilterRules() {
  const disciplineNo = props.filters.findIndex(el => el.field === 'discipline')
  const discipline = disciplineNo < 0 ? '' : props.filters[disciplineNo].selected

  const distanceNo = props.filters.findIndex(el => el.field === 'distance')
  const distance = distanceNo < 0 ? '' : props.filters[distanceNo].selected

  const courseNo = props.filters.findIndex(el => el.field === 'course')
  const course = props.course ? props.course : (courseNo < 0 ? 'LCM' : props.filters[courseNo].selected)

  // console.log("applyFilterRules", disciplineNo, distanceNo, courseNo, discipline, course, distance);
  // if (discipline == "올림피아드") {
  //   props.filters[disciplineNo].selected = '올림피아드'
  //   return;
  // }

  // 거리 25M이면 SCM 고정
  if (courseNo >= 0 && distance === '25M') {
    props.filters[courseNo].selected = 'SCM'
  }

  // LCM에서 25M 금지 → 다른 거리로 바꿈
  if (distanceNo >= 0 && course === 'LCM' && distance === '25M') {
    props.filters[distanceNo].selected = '50M'
  }

  // 개인혼영이면 25M/50M 불가 → 100M로 보정
  if (distanceNo >= 0 && discipline === '개인혼영' && ['25M', '50M'].includes(distance)) {
    props.filters[distanceNo].selected = '100M'
  }

  // SCM이면 개인혼영 금지 → 자유형으로
  if (disciplineNo >= 0 && course === 'SCM' && discipline === '개인혼영') {
    props.filters[disciplineNo].selected = '자유형'
  }
  // 800M/1500M는 자유형만 허용
  if (disciplineNo >= 0 && ['800M', '1500M'].includes(distance) && discipline !== '자유형') {
    props.filters[disciplineNo].selected = '자유형'
  }
  console.log("+++++++++++++++++++++++++++++ok");
}

function isOptionDisabled(index: number, option: string): boolean {
  const disciplineNo = props.filters.findIndex(el => el.field === 'discipline')
  const discipline = disciplineNo < 0 ? '' : props.filters[disciplineNo].selected

  const distanceNo = props.filters.findIndex(el => el.field === 'distance')
  const distance = distanceNo < 0 ? '' : props.filters[distanceNo].selected
  if (distanceNo >= 0 && props.filters[distanceNo].options.length <= 1) return true;

  const courseNo = props.filters.findIndex(el => el.field === 'course')
  const course = props.course ? props.course : (courseNo < 0 ? 'LCM' : props.filters[courseNo].selected)

  const ageGroupNo = props.filters.findIndex(el => el.field === 'ageGroup')
  
  if (index === disciplineNo) { // discipline
    if (['800M', '1500M'].includes(distance) && option !== '자유형') return true
    if (['800M', '1500M'].includes(distance) && option === '개인혼영') return true

    // ❌ 이 조건은 삭제해야 함 (SCM에서 개인혼영도 필요함)
    // if (course && course === 'SCM' && option === '개인혼영') return true
  } else if (index === distanceNo) { // distance
    const allowed: Record<string, string[]> = course === 'LCM' 
                                                    ? {
                                                      자유형: [ '50M', '100M', '200M', '400M', '800M', '1500M'],
                                                      배영: ['50M', '100M', '200M'],
                                                      평영: ['50M', '100M', '200M'],
                                                      접영: ['50M', '100M', '200M'],
                                                      개인혼영: ['100M', '200M', '400M'],
                                                    }
                                                    : {
                                                      자유형: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'],
                                                      배영: ['25M', '50M', '100M', '200M'],
                                                      평영: ['25M', '50M', '100M', '200M'],
                                                      접영: ['25M', '50M', '100M', '200M'],
                                                      개인혼영: ['100M', '200M', '400M'],
                                                    }
    if (discipline!="전체" && !allowed[discipline].includes(option)) return true
    if (course === 'LCM') {
      // LCM에서 개인혼영 25/50/100 불허
      if (discipline === '개인혼영' && ['25M', '50M', '100M'].includes(option)) return true
      // 모든 종목에서 25M 자체 금지
      if (option === '25M') return true
    }
  }

  if (index === courseNo) { // course
    // 거리 25M일 때 LCM 선택 금지
    if (distance === '25M' && option === 'LCM') return true

    // ❌ SCM + 개인혼영 허용을 위해 이 줄 제거
    // if (discipline === '개인혼영' && option === 'SCM') return true
  }

  return false
}

onMounted(() => {
  applyFilterRules()
})
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
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

</style>