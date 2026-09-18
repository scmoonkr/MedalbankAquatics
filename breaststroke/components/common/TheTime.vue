<template>
  <div>
    <input id="timeInput" type="text" :value="displayValue" placeholder="00:00.00" @input="onInput" @blur="onBlur"
      class="border border-gray-300 rounded p-2 w-full" :style="inputStyle" />
    <p v-if="error" class="mt-1 text-sm text-red-500" style='font-size: 1.5rem'>{{ error }}</p>
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
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  fontSize: {
    type: String,
    default: '1rem',
  },
  labelFontSize: {
    type: String,
    default: '',
  },
  errorFontSize: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue']);

// 숫자만 포함한 원시 입력값
const rawInput = ref(props.modelValue.replace(/\D/g, ''));
const error = ref('');
const lastInput = ref(''); // 마지막 입력 값 추적

// 스타일 계산
const inputStyle = computed(() => ({
  fontSize: props.fontSize
}));

const labelStyle = computed(() => ({
  fontSize: props.labelFontSize || props.fontSize
}));

const errorStyle = computed(() => ({
  fontSize: props.errorFontSize || `calc(${props.fontSize} * 0.85)`
}));

// 화면에 보여줄 값 - 항상 포맷팅 적용
const displayValue = computed(() => {
  return formattedTime.value || rawInput.value;
});

// 입력값 유효성 검사
const validateTime = (digits: string, lastInputChar: string): { isValid: boolean; errorMessage: string } => {
  const len = digits.length;

  // 마지막 입력이 숫자인지 확인
  if (lastInputChar && isNaN(Number(lastInputChar))) {
    return { isValid: false, errorMessage: '숫자만 입력 가능합니다.' };
  }

  // 길이 확인
  if (len > 6) {
    return { isValid: false, errorMessage: '최대 6자리까지만 입력 가능합니다.' };
  }

  // 분, 초 유효성 검사 (00~59)
  if (len >= 5) {
    // 5자리 또는 6자리
    const minutes = len === 5 ? parseInt(digits.slice(0, 1)) : parseInt(digits.slice(0, 2));
    const seconds = len === 5 ? parseInt(digits.slice(1, 3)) : parseInt(digits.slice(2, 4));

    if (minutes > 59) {
      return { isValid: false, errorMessage: '분은 00~59 사이로 입력하세요.' };
    }

    if (seconds > 59) {
      return { isValid: false, errorMessage: '초는 00~59 사이로 입력하세요.' };
    }
  } else if (len === 4) {
    // 4자리: 앞 두 자리가 초
    const seconds = parseInt(digits.slice(0, 2));
    if (seconds > 59) {
      return { isValid: false, errorMessage: '초는 00~59 사이로 입력하세요.' };
    }
  }

  return { isValid: true, errorMessage: '' };
};

// 자동 포맷팅된 시간 (mm:ss.tt 형식)
const formattedTime = computed(() => {
  // 숫자만 남기기
  const digits = rawInput.value.replace(/\D/g, '');
  const len = digits.length;

  // 유효성 검사
  const { isValid, errorMessage } = validateTime(digits, lastInput.value);
  error.value = errorMessage;

  if (!isValid) {
    return digits; // 유효하지 않을 경우 그대로 반환
  }

  if (len === 0) {
    return '';
  }
  if (len <= 2) {
    // 1~2자리: 그대로 표시 (예: "1", "12")
    return digits;
  } else if (len === 3 || len === 4) {
    // 3~4자리: 마지막 두 자리를 소수점 뒤로 이동 (예: "123" -> "1.23", "1234" -> "12.34")
    const left = digits.slice(0, len - 2);
    const right = digits.slice(-2);
    return `${left}.${right}`;
  } else if (len === 5) {
    // 5자리: "1:23.45" 형식 (첫 자리 분, 다음 두 자리 초, 마지막 두 자리 소수)
    const minute = digits.slice(0, 1);
    const seconds = digits.slice(1, 3);
    const hundredths = digits.slice(3);
    return `${minute}:${seconds}.${hundredths}`;
  } else if (len === 6) {
    // 6자리: "12:34.56" 형식 (앞의 두 자리 분, 다음 두 자리 초, 마지막 두 자리 소수)
    const minute = digits.slice(0, 2);
    const seconds = digits.slice(2, 4);
    const hundredths = digits.slice(4);
    return `${minute}:${seconds}.${hundredths}`;
  }
  return digits;
});

// 사용자가 입력할 때
function onInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // 숫자만 추출
  const newValue = value.replace(/\D/g, '');

  // 원래 값과 필터링된 값이 다르면 (숫자가 아닌 문자가 입력됨)
  if (newValue !== value.replace(/[:.]/g, '')) {
    // 숫자가 아닌 입력이 있을 때
    lastInput.value = value.slice(-1);

    // 이전 rawInput 값을 유지하면서 포맷팅만 다시 적용
    rawInput.value = newValue;

    // 즉시 입력 필드 값을 업데이트하여 비숫자 문자를 제거
    nextTick(() => {
      input.value = formattedTime.value || newValue;
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  } else {
    // 정상적인 숫자 입력인 경우
    lastInput.value = '';
    rawInput.value = newValue;

    // 포맷팅 및 커서 위치 조정
    nextTick(() => {
      if (formattedTime.value) {
        const length = formattedTime.value.length;
        input.setSelectionRange(length, length);
      }
    });
  }

  // 포맷팅된 값을 부모 컴포넌트에 전달 (에러가 없을 때만)
  if (formattedTime.value && !error.value) {
    emit('update:modelValue', formattedTime.value);
  }
}

// 포커스를 잃을 때
function onBlur() {
  const digits = rawInput.value.replace(/\D/g, '');
  const len = digits.length;

  // 추가 유효성 검사
  const { isValid, errorMessage } = validateTime(digits, '');
  error.value = errorMessage;

  if (len > 0 && len < 3) {
    error.value = '최소 3자리 이상의 숫자를 입력해 주세요.';
  } else if (isValid) {
    // 유효한 경우에만 부모에 전달
    if (formattedTime.value) {
      emit('update:modelValue', formattedTime.value);
    }
  }
}

// 부모에서 modelValue가 바뀌면 rawInput도 동기화
watch(() => props.modelValue, (newVal) => {
  rawInput.value = newVal.replace(/\D/g, '');
}, { immediate: true });
</script>