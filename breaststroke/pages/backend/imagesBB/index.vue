<template>
  <!-- 검색 섹션 -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <SearchCompetition 
      :competitionName="rawInputCompetition" 
      @update-competition="searchCompetition" 
    />

    <FiltersButtons 
      :filters="filters" 
      @change-field="onFilterChange" 
    />
  </TheSection>

  <!-- 이미지 업로더 섹션 -->
  <TheSection 
    title="이미지 업로더" 
    subtitle="여러 이미지를 선택하여 ImageBB에 업로드하세요" 
    background="#ffffff,#ffffff" 
    :narrow="false"
  >
    <div class="flex gap-3 mb-5">
      <button
        @click="uploadAllImages()"
        :disabled="!canUpload"
        class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <svg v-if="isUploading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="isUploading">업로드 중...</span>
        <span v-else>모든 이미지 업로드 ({{ selectedFiles.length }}개)</span>
      </button>
      
      <button
        @click="clearAllFiles()"
        :disabled="!canUpload"
        class="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        모두 지우기
      </button>
    </div>

    <!-- 파일 선택 영역 -->
    <div class="mb-3">
      <!-- 디버깅용 버튼들 -->
      <!-- <div v-if="process.dev" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 class="font-semibold mb-2">디버깅 정보</h4>
        <div class="text-sm space-y-1">
          <p>스토어 준비 상태: {{ isStoreReady }}</p>
          <p>스토어 존재: {{ !!imageBBStore }}</p>
          <p>스토어 초기화됨: {{ imageBBStore?.isInitialized }}</p>
          <p>computed selectedFiles 길이: {{ selectedFiles.length }}</p>
          <p>스토어 selectedFiles 길이: {{ imageBBStore?.selectedFiles?.length || 0 }}</p>
        </div>
        <div class="mt-2 space-x-2">
          <button 
            @click="testAddFile" 
            class="px-3 py-1 bg-blue-500 text-white text-sm rounded"
          >
            테스트 파일 추가
          </button>
          <button 
            @click="logStoreState" 
            class="px-3 py-1 bg-green-500 text-white text-sm rounded"
          >
            스토어 상태 출력
          </button>
        </div>
      </div> -->

      <div 
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @dragenter.prevent
        :class="[
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          !isStoreReady ? 'pointer-events-none opacity-50' : ''
        ]"
        @click="triggerFileInput"
      >
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p class="text-lg text-gray-600 mb-2">
            {{ isStoreReady ? '클릭하거나 파일을 드래그하여 업로드' : '로딩 중...' }}
          </p>
          <p class="text-sm text-gray-500">
            PNG, JPG, GIF, WEBP 파일 지원 (최대 {{ maxFileSize }}MB per 파일)
          </p>
        </div>
        
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        />
      </div>
    </div>

    <!-- 업로드 버튼 및 진행 상황 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <!-- <div class="flex gap-3">
          <button
            @click="uploadAllImages()"
            :disabled="!canUpload"
            class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg v-if="isUploading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isUploading">업로드 중...</span>
            <span v-else>모든 이미지 업로드 ({{ selectedFiles.length }}개)</span>
          </button>
          
          <button
            @click="clearAllFiles()"
            :disabled="!canUpload"
            class="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            모두 지우기
          </button>
        </div> -->
        
        <!-- 진행률 -->
        <div v-if="isUploading || uploadResults.length > 0" class="text-sm text-gray-600">
          <div class="flex items-center gap-2">
            <span>{{ uploadedCount }}/{{ selectedFiles.length }} 완료</span>
            <span v-if="failedCount > 0" class="text-red-600">({{ failedCount }}개 실패)</span>
          </div>
        </div>
      </div>

      <!-- 전체 진행률 바 -->
      <div v-if="isUploading" class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- 선택된 파일 미리보기 -->
    <div v-if="selectedFiles.length > 0" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">선택된 이미지 ({{ selectedFiles.length }}개)</h3>
        <div class="text-sm text-gray-500">
          총 크기: {{ formattedTotalSize }}
        </div>
      </div>
      
      <div class="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-4">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="generateFileKey(file.file)"
          class="relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- 이미지 미리보기 -->
          <div class="aspect-square bg-gray-100 flex items-center justify-center">
            <img 
              :src="file.preview" 
              :alt="file.file.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          <!-- 파일 정보 -->
          <div class="p-3">
            <p class="text-sm font-medium text-gray-900 truncate" :title="file.file.name">
              {{ file.file.name }}
            </p>
            <p class="text-xs text-gray-500 mb-1">
              {{ formatFileSize(file.file.size) }}
            </p>
            
            <!-- 업로드 상태 -->
            <div v-if="file.uploadStatus" class="mt-2">
              <div v-if="file.uploadStatus === 'uploading'" class="flex items-center">
                <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span class="text-xs text-blue-600">업로드 중...</span>
              </div>
              
              <div v-else-if="file.uploadStatus === 'success'" class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-xs text-green-600">업로드 완료</span>
              </div>
              
              <div v-else-if="file.uploadStatus === 'error'" class="flex items-center">
                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-xs text-red-600">업로드 실패</span>
              </div>
            </div>
          </div>
          
          <!-- 삭제 버튼 -->
          <button
            @click="removeFile(index)"
            :disabled="isUploading"
            class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :title="`${file.file.name} 제거`"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 업로드 결과 -->
    <div v-if="uploadResults.length > 0" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">업로드 결과</h3>
        <div class="flex gap-2">
          <button
            @click="handleExportUrls('plain')"
            class="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            URL 목록 복사
          </button>
          <button
            @click="handleExportUrls('markdown')"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            마크다운 복사
          </button>
          <button
            @click="clearResults()"
            class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            결과 지우기
          </button>
        </div>
      </div>
      
      <div class="bg-white border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        <div 
          v-for="(result, index) in uploadResults" 
          :key="index"
          class="border-b last:border-b-0 p-4 hover:bg-gray-50"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="font-medium text-gray-900 truncate">{{ result.filename }}</h4>
                <span v-if="result.success" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">성공</span>
                <span v-else class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">실패</span>
              </div>
              
              <div v-if="result.success" class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 w-16 flex-shrink-0">원본:</span>
                  <input 
                    :value="result.url" 
                    readonly 
                    class="flex-1 px-2 py-1 text-sm border rounded bg-gray-50 font-mono text-xs"
                  />
                  <button 
                    @click="handleCopyToClipboard(result.url || '')"
                    class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
                  >
                    복사
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 w-16 flex-shrink-0">썸네일:</span>
                  <input 
                    :value="result.thumb" 
                    readonly 
                    class="flex-1 px-2 py-1 text-sm border rounded bg-gray-50 font-mono text-xs"
                  />
                  <button 
                    @click="handleCopyToClipboard(result.thumb || '')"
                    class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
                  >
                    복사
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 w-16 flex-shrink-0">삭제:</span>
                  <input 
                    :value="result.deleteUrl" 
                    readonly 
                    class="flex-1 px-2 py-1 text-sm border rounded bg-gray-50 font-mono text-xs"
                  />
                  <button 
                    @click="handleCopyToClipboard(result.deleteUrl || '')"
                    class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex-shrink-0"
                  >
                    복사
                  </button>
                </div>
              </div>
              
              <div v-else class="mt-2">
                <span class="text-sm text-red-600">{{ result.error }}</span>
              </div>
            </div>
            
            <div class="ml-4 flex-shrink-0">
              <img 
                v-if="result.success" 
                :src="result.thumb" 
                :alt="result.filename"
                class="w-16 h-16 object-cover rounded border"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 통계 정보 -->
    <div v-if="totalUploaded > 0 || totalFailed > 0" class="mb-8">
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">전체 통계</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">총 업로드 성공:</span>
            <span class="font-medium text-green-600">{{ totalUploaded }}개</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">총 업로드 실패:</span>
            <span class="font-medium text-red-600">{{ totalFailed }}개</span>
          </div>
        </div>
      </div>
    </div>

  </TheSection>

  <!-- 툴팁 -->
  <!-- <TheTooltipRun 
    :show="showTooltip" 
    message="대회를 변경하려면 확인을 누르세요." 
    @update:show="confirmDialog" 
  /> -->
  <TheTooltipDialog
    :show="showTooltip"
    message="대회를 선택하세요"
    @update:show="showTooltip = $event"
  />
</template>

<script setup lang="ts">

definePageMeta({
  layout: 'backend',
});
import type { JsonOptions, FilterItem } from '~/types/common';
import { useImageBBStore } from '~/stores/imgbb';
import TheSection from '~/components/common/TheSection.vue';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
import SearchCompetition from './SearchCompetition.vue';
import { type CompetitionNames } from './SearchCompetition.vue';
import FiltersButtons from '~/components/common/TheFilters.vue';

// ============================
// 스토어 및 상태 관리 (반응성 수정)
// ============================
// const imageBBStore = ref<ReturnType<typeof useImageBBStore> | null>(null);
// const competitionStore = ref<ReturnType<typeof useCompetitionStore> | null>(null);
const imageBBStore = useImageBBStore();
// const competitionStore = useCompetitionStore();

// 클라이언트에서만 스토어 초기화
const isStoreReady = ref(false);

// 필터 관련 상태
const showTooltip = ref(false);
const setFocus = ref(0);
const isLoading = ref(false);

// DOM 참조
const fileInput = ref<HTMLInputElement>();

// 대회 관련 상태
const selectedCompetition = ref<Partial<CompetitionNames>>({});
const rawInputCompetition = ref('');

// 필터 설정
const filters = ref<FilterItem[]>([
  { field: 'competition', selected: '', options: [''] },
  // { field: 'gender', selected: '여자', options: ['남자', '여자'] },
  { field: 'style', selected: '평영', options: ['자유형', '배영', '평영', '접영', '하이라이트', '기타'] },
  // { field: 'distance', selected: '50M', options: ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'] },
]);

const options = ref<JsonOptions>({
  // gender: 'women',
  style: 'breaststroke',
  // distance: '50M',
});

onMounted(() => {
  
  // Nuxt 3에서는 onMounted가 클라이언트에서만 실행되므로 process.client 체크 불필요
  
  try {
    // imageBBStore = useImageBBStore();
    // competitionStore = useCompetitionStore();
    
    
    // ImageBB 스토어 초기화
    if (imageBBStore) {
      imageBBStore.initialize();
      isStoreReady.value = true;
    }
  } catch (error) {
    console.error('스토어 초기화 실패:', error);
  }
});

// ============================
// 계산된 값들 (반응성 수정)
// ============================
const selectedFiles = computed(() => imageBBStore?.selectedFiles || []);
const uploadResults = computed(() => imageBBStore?.uploadResults || []);
const isUploading = computed(() => imageBBStore?.isUploading || false);
const isDragOver = computed(() => imageBBStore?.isDragOver || false);
const uploadProgress = computed(() => imageBBStore?.uploadProgress || 0);
const uploadedCount = computed(() => imageBBStore?.uploadedCount || 0);
const failedCount = computed(() => imageBBStore?.failedCount || 0);
const totalFileSize = computed(() => imageBBStore?.totalFileSize || 0);
const formattedTotalSize = computed(() => imageBBStore?.formattedTotalSize || '0 Bytes');
const canUpload = computed(() => imageBBStore?.canUpload || false);
const canDrop = computed(() => imageBBStore?.canDrop || false);
const totalUploaded = computed(() => imageBBStore?.totalUploaded || 0);
const totalFailed = computed(() => imageBBStore?.totalFailed || 0);
const maxFileSize = computed(() => imageBBStore?.maxFileSize || 32);

// ============================
// 파일 처리 함수 (ref 사용으로 수정)
// ============================
const triggerFileInput = () => {
  
  if (!isStoreReady.value || !imageBBStore) {
    return;
  }
  
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  
  if (!imageBBStore) {
    return;
  }
  
  const target = event.target as HTMLInputElement;
  if (target.files) {
    
    const errors = imageBBStore.addFiles(Array.from(target.files));
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
    
    target.value = '';
  }
};

const handleDragOver = (event: DragEvent) => {
  
  if (!isStoreReady.value || !imageBBStore) {
    return;
  }
  
  event.preventDefault();
  imageBBStore.setDragOver(true);
};

const handleDragLeave = (event: DragEvent) => {
  
  if (!imageBBStore) {
    return;
  }
  
  event.preventDefault();
  imageBBStore.setDragOver(false);
};

const handleDrop = (event: DragEvent) => {
  
  if (!imageBBStore) {
    return;
  }
  
  event.preventDefault();
  imageBBStore.setDragOver(false);
  
  if (!isStoreReady.value) {
    return;
  }
  
  const files = Array.from(event.dataTransfer?.files || []);
  
  const errors = imageBBStore.addFiles(files);
  
  if (errors.length > 0) {
    alert(errors.join('\n'));
  }
};

// ============================
// 유틸리티 함수들
// ============================
const handleCopyToClipboard = async (text: string) => {
  if (!imageBBStore) return;
  
  const success = await imageBBStore.copyToClipboard(text);
  
  if (success) {
    alert('클립보드에 복사되었습니다!');
  } else {
    alert('클립보드 복사에 실패했습니다.');
  }
};

const handleExportUrls = async (format: 'plain' | 'markdown') => {
  if (!imageBBStore) return;
  
  const success = await imageBBStore.exportUrls(format);
  
  if (success) {
    const formatName = format === 'markdown' ? '마크다운' : 'URL 목록';
    alert(`${formatName}이 클립보드에 복사되었습니다!`);
  } else {
    alert('내보낼 URL이 없습니다.');
  }
};

// 스토어 메서드들을 안전하게 호출하는 래퍼 함수들
const uploadAllImages = async () => {
  if (!options.value.competition) {
    showTooltip.value = true;
    return;
  }
  if (imageBBStore) {
    await imageBBStore.uploadAllImages(selectedCompetition.value, options.value);
  }
};

const clearAllFiles = () => {
  if (imageBBStore) {
    imageBBStore.clearAllFiles();
  }
};

const removeFile = (index: number) => {
  if (imageBBStore) {
    imageBBStore.removeFile(index);
  }
};

const clearResults = () => {
  if (imageBBStore) {
    imageBBStore.clearResults();
  }
};

const generateFileKey = (file: File): string => {
  if (imageBBStore) {
    return imageBBStore.generateFileKey(file);
  }
  return `${file.name}-${file.size}-${file.lastModified}`;
};

const formatFileSize = (bytes: number): string => {
  if (imageBBStore) {
    return imageBBStore.formatFileSize(bytes);
  }
  
  // 폴백 함수
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================
// 필터 관련 함수
// ============================
const onFilterChange = async (field: string, value: string) => {
  try {
    switch (field) {
      case 'style':
        options.value.style = getStyleEngByKor(value);
        break;
      case 'competition':
        showTooltip.value = true;
        options.value.competition = value;
        return;
      default:
        options.value[field] = value;
        break;
    }
  } catch (error) {
    console.error("필터 적용 중 오류:", error);
  }
};

const confirmDialog = (value: boolean) => {
  showTooltip.value = false;
};

const searchCompetition = (competition: any) => {
  selectedCompetition.value = competition;
  rawInputCompetition.value = competition.fullname;
  options.value.competition = competition.fullname;
  filters.value[0].selected = competition.fullname;
  filters.value[0].options = [competition.fullname];
};

// ============================
// 라이프사이클 훅
// ============================
onUnmounted(() => {
  if (imageBBStore) {
    imageBBStore.cleanup();
  }
});

// 페이지 메타데이터
useSeoMeta({
  title: '이미지 업로더 - ImageBB',
  description: '여러 이미지를 ImageBB에 업로드하는 도구'
});

// ============================
// 유틸리티 함수들
// ============================
// const getStyleEngByKor = (korStyle: string): string => {
//   const styleMap: Record<string, string> = {
//     '자유형': 'freestyle',
//     '배영': 'backstroke',
//     '평영': 'breaststroke',
//     '접영': 'butterfly',
//     '개인혼영': 'individual-medley'
//   };
//   return styleMap[korStyle] || korStyle;
// };

// const getGenderByKor = (korGender: string): string => {
//   const genderMap: Record<string, string> = {
//     '남자': 'men',
//     '여자': 'women'
//   };
//   return genderMap[korGender] || korGender;
// };

// ============================
// 디버깅 함수들
// ============================
const testAddFile = () => {
  if (!imageBBStore) {
    return;
  }

  // 가짜 파일 객체 생성 (테스트용)
  const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  
  const errors = imageBBStore.addFiles([mockFile]);
};

const logStoreState = () => {
  if (!imageBBStore) {
    return;
  }

};

// ============================
// 개발용 디버깅
// ============================
// 개발 환경에서만 실행
onMounted(() => {
  if (process.dev && imageBBStore) {
    (window as any).imageBBStore = imageBBStore;
    
    watch(uploadProgress, (newProgress) => {
    });
    
    watch(() => selectedFiles.value.length, (newCount, oldCount) => {
    });

    // 추가 디버깅 watch들
    watch(() => imageBBStore?.selectedFiles.length, (newCount, oldCount) => {
    });

    watch(() => imageBBStore?.selectedFiles, (newFiles, oldFiles) => {
    }, { deep: true });
  }
});
</script>

<style scoped>
/* 커스텀 스타일 */
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 스크롤바 스타일링 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 드래그 오버 애니메이션 개선 */
.border-dashed {
  transition: all 0.3s ease;
}

.border-blue-500.bg-blue-50 {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 업로드 진행률 바 애니메이션 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* 버튼 비활성화 상태 스타일 개선 */
.disabled\:bg-gray-300:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

/* 로딩 스피너 개선 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 성공/실패 상태 배지 스타일 */
.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-800 {
  color: #166534;
}

.text-green-600 {
  color: #16a34a;
}

.bg-red-100 {
  background-color: #fee2e2;
}

.text-red-800 {
  color: #991b1b;
}

.text-red-600 {
  color: #dc2626;
}

/* 입력 필드 포커스 스타일 */
input:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  ring-opacity: 0.5;
}

/* 통계 카드 스타일 */
.bg-gray-50 {
  background-color: #f9fafb;
}

/* 호버 효과 개선 */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 반응형 그리드 개선 */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-3 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .text-lg {
    font-size: 1rem;
    line-height: 1.5rem;
  }
  
  .p-8 {
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* 파일 미리보기 이미지 스타일 */
.aspect-square {
  aspect-ratio: 1 / 1;
}

.object-cover {
  object-fit: cover;
}

/* 텍스트 말줄임 스타일 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 진행률 표시 개선 */
.rounded-full {
  border-radius: 9999px;
}

/* 업로드 비활성화 상태 스타일 */
.pointer-events-none {
  pointer-events: none;
}

/* 다크 모드 지원 (선택사항) */
@media (prefers-color-scheme: dark) {
  .bg-white {
    background-color: #1f2937;
  }
  
  .text-gray-900 {
    color: #f9fafb;
  }
  
  .text-gray-600 {
    color: #d1d5db;
  }
  
  .text-gray-500 {
    color: #9ca3af;
  }
  
  .border-gray-300 {
    border-color: #4b5563;
  }
  
  .bg-gray-50 {
    background-color: #374151;
  }
  
  .bg-gray-100 {
    background-color: #4b5563;
  }
}
</style>
