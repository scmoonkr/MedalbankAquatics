<template>
  <div class="image-cards-container">
    <TheImageCard_0 :pool="pool" :medals="medals" :date="dateStr" width="normal" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />

    <TheImageCard_1 :pool="pool" :medals="medals" :date="dateStr" width="normal" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />

    <TheImageCard_2 :pool="pool" :medals="medals" :date="dateStr" width="normal" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />

    <TheImageCard_0 :pool="pool" :medals="medals" :date="dateStr" width="narrow" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />

    <TheImageCard_1 :pool="pool" :medals="medals" :date="dateStr" width="narrow" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />

    <TheImageCard_2 :pool="pool" :medals="medals" :date="dateStr" width="narrow" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />

    <TheImageCard_3 :pool="pool" :medals="medals" :date="dateStr" width="normal" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />

    <TheImageCard_0 :pool="pool" :medals="medals" :date="dateStr" width="wide" :card-height="height"
      :background-image="selectedImage" :text-color="selectedTextColor" />
  </div>

  <div v-if="user.role == 'admin'" class="image-picker-container">
    <!-- Image picker input -->
    <div class="input-container">
      <input type="file" accept="image/*" @change="handleImageChange" ref="fileInput" class="file-input" />
      <button @click="triggerFileInput" class="picker-button">
        이미지 선택
      </button>
      <button @click="saveImageToServer" class="save-button" :disabled="!isImageChanged || isUploading">
        {{ isUploading ? '저장 중...' : '이미지 저장' }}
      </button>
    </div>

    <!-- 텍스트 색상 선택 옵션 -->
    <div class="color-selector-container">
      <p>텍스트 색상 선택:</p>
      <div class="color-options">
        <div v-for="(color, index) in textColorOptions" :key="index" class="color-option"
          :class="{ active: color.value === selectedTextColor }" :style="{ backgroundColor: color.value }"
          @click="selectTextColor(color.value)">
          <span>{{ color.label }}</span>
        </div>
      </div>
    </div>

    <!-- 상태 메시지 표시 영역 -->
    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
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

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import TheImageCard_0 from './images/image_card_0.vue';
import TheImageCard_1 from './images/image_card_1.vue';
import TheImageCard_2 from './images/image_card_2.vue';
import TheImageCard_3 from './images/image_card_3.vue';
import { useImageStore } from '~/stores/images';
import type { PoolModel } from '~/models/pools';

const props = defineProps({
  pool: {
    type: Object,
    default: () => ({}),
  },
  user: {
    type: Object,
    default: () => ({}),
  },
});

// 스토어 가져오기
const imageStore = useImageStore();

// 반응형 상태 정의
const dateStr = ref("");
const selectedImage = ref("");
const originalImage = ref(""); // 원본 이미지 URL 저장
const medals = ref({ gold: 0, silver: 0, bronze: 0 });
const fileInput = ref<HTMLInputElement | null>(null);
const defaultImage = ""; //"https://i.ibb.co/BK3ftvbn/pool-23-featured.jpg";
const statusMessage = ref("");
const statusType = ref(""); // 'success' 또는 'error'

const config = useRuntimeConfig();
const apiBase = config.public.apiBase || 'http://localhost:6600';

// 스토어 상태를 기반으로 한 계산된 속성
const isUploading = computed(() => imageStore.isImageUploading);
const isImageChanged = computed(() => selectedImage.value !== originalImage.value);

// 텍스트 색상 옵션
const textColorOptions = [
  { label: "흰색", value: "#FFFFFF" },
  { label: "검은색", value: "#000000" },
  { label: "노란색", value: "#FFFF00" },
  { label: "red", value: "red" },
  { label: "green", value: "green" },
  { label: "밝은 청록색", value: "#00FFFF" }
];

// 선택된 텍스트 색상
const selectedTextColor = ref(textColorOptions[0].value);

// 색상 선택 함수
function selectTextColor(color: string) {
  selectedTextColor.value = color;
}

// pool 객체 변경 감지 및 이미지 업데이트
watch(() => props.pool, (newPool) => {
  dateStr.value = getDateFormat("2025-04-01") + " 기준";

  // medals 전체 합계 계산
  medals.value = newPool.eventStatistics?.reduce((acc: any, event: any) => {
    // 각 이벤트의 gold, silver, bronze 메달 수를 누적
    acc.gold += event.medals?.gold || 0;
    acc.silver += event.medals?.silver || 0;
    acc.bronze += event.medals?.bronze || 0;

    return acc;
  }, { gold: 0, silver: 0, bronze: 0 }) || { gold: 0, silver: 0, bronze: 0 };

  if (newPool) {
    let featured = newPool.featured ?? "";
    featured = featured.includes("http") ? featured : apiBase + featured;
    selectedImage.value = featured;
    originalImage.value = featured; // 원본 이미지 저장

    // if (newPool.featured) {
    //   selectedImage.value = newPool.featured;
    //   originalImage.value = newPool.featured; // 원본 이미지 저장
    // }
  }
}, { immediate: true });

// 스토어 에러 상태 감시
watch(() => imageStore.imageUploadError, (newError) => {
  if (newError) {
    setStatus(newError, 'error');
  }
});

// 컴포넌트 마운트 시 초기 이미지 설정
onMounted(() => {
  let featured = props.pool.featured ?? "";
  featured = featured.includes("http") ? featured : apiBase + featured;
  selectedImage.value = featured;
  originalImage.value = featured;
});

const height = 450;

// 메서드
function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

// 선택한 파일을 저장
const selectedFile = ref<File | null>(null);

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (file && file.type.match('image.*')) {
    // 선택한 파일 저장
    selectedFile.value = file;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.result) {
        selectedImage.value = e.target.result.toString();
      }
    };
    reader.readAsDataURL(file);
  }
}

/**
 * 날짜 포맷 변환 함수
 */
function getDateFormat(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}
/**
 * 이미지를 서버에 저장하는 함수 (스토어 사용)
 */
async function saveImageToServer() {
  if (!props.pool || !props.pool.poolID) {
    setStatus('선수 정보가 없습니다.', 'error');
    return;
  }

  if (!selectedFile.value) {
    setStatus('선택된 이미지가 없습니다.', 'error');
    return;
  }

  setStatus('이미지를 저장 중입니다...', '');

  try {
    // 이미지 데이터 URL을 스토어를 통해 업로드
    // 현재 로그인한 사용자 ID (예시: 1)
    const userID = 1; // 실제 구현에서는 로그인 정보에서 가져와야 함
    const params = {
      db: "pools",
      id: props.pool.poolID,
      userID: userID,
      fileType: 'featured'
    };

    // uploadPoolImage,
    // uploadPoolImageUrl,
    const imageUrl = await imageStore.uploadImage(
      "pools",
      props.pool.poolID,
      selectedFile.value,
      userID
    );
    // poolID: number, imageURL: string, userID: number

    if (imageUrl) {
      // 성공적으로 업로드 되면 원본 이미지 URL 업데이트
      originalImage.value = imageUrl;
      selectedImage.value = imageUrl;
      setStatus('이미지가 성공적으로 저장되었습니다.', 'success');
    } else {
      setStatus('이미지 저장에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('이미지 저장 오류:', error);
    setStatus(`이미지 저장에 실패했습니다: ${error.message}`, 'error');
  }
}
async function saveImageURLToServer() {
  if (!props.pool || !props.pool.poolID) {
    setStatus('선수 정보가 없습니다.', 'error');
    return;
  }

  if (!isImageChanged.value) {
    setStatus('변경된 이미지가 없습니다.', 'error');
    return;
  }

  setStatus('이미지를 저장 중입니다...', '');

  try {
    // 이미지 데이터 URL을 스토어를 통해 업로드
    // 현재 로그인한 사용자 ID (예시: 1)
    const userID = 1; // 실제 구현에서는 로그인 정보에서 가져와야 함
    const params = {
      db: "pools",
      id: props.pool.poolID,
      userID: userID,
      fileType: 'featured'
    };

    // uploadPoolImage,
    // uploadPoolImageUrl,
    const imageUrl = await imageStore.uploadImageUrl(
      "pools",
      props.pool.poolID,
      selectedImage.value,
      userID,
      'featured'
    );
    // poolID: number, imageURL: string, userID: number

    if (imageUrl) {
      // 성공적으로 업로드 되면 원본 이미지 URL 업데이트
      originalImage.value = imageUrl;
      selectedImage.value = imageUrl;
      setStatus('이미지가 성공적으로 저장되었습니다.', 'success');
    } else {
      setStatus('이미지 저장에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('이미지 저장 오류:', error);
    setStatus(`이미지 저장에 실패했습니다: ${error.message}`, 'error');
  }
}

/**
 * 상태 메시지 설정 함수
 */
function setStatus(message: string, type: string) {
  statusMessage.value = message;
  statusType.value = type;

  // 성공 메시지는 3초 후 사라짐
  if (type === 'success') {
    setTimeout(() => {
      statusMessage.value = '';
    }, 3000);
  }
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
.image-cards-container {
  display: flex;
  flex-direction: row;
  gap: 15px;
  flex-wrap: wrap;
}

.image-picker-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.input-container {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.picker-button,
.save-button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.picker-button:hover,
.save-button:hover {
  background-color: #555;
}

.save-button {
  background-color: #2c3e50;
}

.save-button:hover {
  background-color: #34495e;
}

.save-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* 색상 선택기 스타일 */
.color-selector-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.color-selector-container p {
  margin-bottom: 10px;
  font-weight: bold;
}

.color-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-option {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option.active {
  border-color: #333;
  transform: scale(1.05);
}

.color-option span {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  white-space: nowrap;
  color: #333;
}

/* 텍스트 색상에 따른 레이블 스타일 조정 */
.color-option:nth-child(1) span {
  color: #333;
  /* 흰색 버튼의 레이블은 어두운 색상 */
}

.color-option:nth-child(2) span {
  color: #333;
  /* 검은색 버튼의 레이블은 어두운 색상 */
}

/* 상태 메시지 스타일 */
.status-message {
  padding: 10px 15px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 14px;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>