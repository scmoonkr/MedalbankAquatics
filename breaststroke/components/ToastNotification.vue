<!-- components/ToastNotification.vue -->
<template>
  <div class="toast-wrapper">
    <!-- 토스트 알림 컨테이너 -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'transform transition-all duration-300 ease-in-out',
            'px-4 py-3 rounded-lg shadow-lg border-l-4 cursor-pointer',
            getToastClasses(toast.type),
            toast.show ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
          ]"
          @click="handleToastClick(toast)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start">
              <!-- 아이콘 -->
              <div class="flex-shrink-0 mr-3 mt-0.5">
                <svg
                  class="w-5 h-5"
                  :class="getIconClass(toast.type)"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    v-if="toast.type === 'error'"
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else-if="toast.type === 'success'"
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else-if="toast.type === 'warning'"
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              
              <!-- 메시지 내용 -->
              <div class="flex-1 min-w-0">
                <div
                  v-if="toast.title"
                  class="font-semibold text-sm mb-1"
                  :class="getTitleClass(toast.type)"
                >
                  {{ toast.title }}
                </div>
                <div
                  class="text-sm break-words"
                  :class="getMessageClass(toast.type)"
                >
                  {{ toast.message }}
                </div>
              </div>
            </div>
            
            <!-- 닫기 버튼 -->
            <button
              @click.stop="removeToast(toast.id)"
              class="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
              :class="getCloseButtonClass(toast.type)"
              title="닫기"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          
          <!-- 진행 바 -->
          <div
            v-if="toast.showProgress"
            class="mt-2 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden"
          >
            <div
              class="h-full transition-all duration-100 ease-linear rounded-full"
              :class="getProgressBarClass(toast.type)"
              :style="{ width: `${toast.progress}%` }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast.js'

// Toast composable 사용
const { toasts, removeToast } = useToast()

// 토스트 클릭 핸들러
const handleToastClick = (toast) => {
  // 클릭시 추가 액션이 필요하면 여기에 구현
  // console.log('Toast clicked:', toast.message)
}

// 스타일 관련 함수들
const getToastClasses = (type) => {
  const classes = {
    error: 'bg-red-50 border-red-500',
    success: 'bg-green-50 border-green-500', 
    warning: 'bg-yellow-50 border-yellow-500',
    info: 'bg-blue-50 border-blue-500'
  }
  return classes[type] || classes.info
}

const getIconClass = (type) => {
  const classes = {
    error: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return classes[type] || classes.info
}

const getTitleClass = (type) => {
  const classes = {
    error: 'text-red-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }
  return classes[type] || classes.info
}

const getMessageClass = (type) => {
  const classes = {
    error: 'text-red-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }
  return classes[type] || classes.info
}

const getCloseButtonClass = (type) => {
  const classes = {
    error: 'text-red-500 hover:text-red-700',
    success: 'text-green-500 hover:text-green-700',
    warning: 'text-yellow-500 hover:text-yellow-700',
    info: 'text-blue-500 hover:text-blue-700'
  }
  return classes[type] || classes.info
}

const getProgressBarClass = (type) => {
  const classes = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500', 
    info: 'bg-blue-500'
  }
  return classes[type] || classes.info
}
</script>

<style scoped>
/* 토스트 애니메이션 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* 반응형 디자인 */
@media (max-width: 640px) {
  .toast-wrapper .fixed {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

/* 태블릿에서 중앙 정렬 */
@media (min-width: 641px) and (max-width: 1024px) {
  .toast-wrapper .fixed {
    left: 50%;
    transform: translateX(-50%);
    right: auto;
    max-width: 28rem;
  }
}

/* 큰 화면에서 약간 더 큰 크기 */
@media (min-width: 1025px) {
  .toast-wrapper .fixed {
    max-width: 32rem;
  }
}

/* 호버 효과 */
.toast-wrapper div[class*="bg-"] {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast-wrapper div[class*="bg-"]:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* 스크롤바가 있을 때 위치 조정 */
@media (min-width: 641px) {
  .toast-wrapper .fixed {
    right: max(1rem, calc(1rem + env(scrollbar-width, 0px)));
  }
}

/* 다크 모드 지원 (선택사항) */
@media (prefers-color-scheme: dark) {
  .toast-wrapper div[class*="bg-red-50"] {
    background-color: rgba(239, 68, 68, 0.1);
  }
  
  .toast-wrapper div[class*="bg-green-50"] {
    background-color: rgba(16, 185, 129, 0.1);
  }
  
  .toast-wrapper div[class*="bg-yellow-50"] {
    background-color: rgba(245, 158, 11, 0.1);
  }
  
  .toast-wrapper div[class*="bg-blue-50"] {
    background-color: rgba(59, 130, 246, 0.1);
  }
}

/* 접근성 개선 */
.toast-wrapper [role="button"],
.toast-wrapper button {
  outline: none;
}

.toast-wrapper [role="button"]:focus,
.toast-wrapper button:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* 애니메이션 성능 최적화 */
.toast-wrapper * {
  will-change: transform, opacity;
}

/* 긴 텍스트 처리 */
.toast-wrapper .break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .toast-wrapper button {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>