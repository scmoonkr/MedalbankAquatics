// composables/useToast.js
import { ref } from 'vue'

// 전역 토스트 상태 (모든 컴포넌트에서 공유)
const toasts = ref([])
let toastIdCounter = 0

export const useToast = () => {
  
  /**
   * 토스트 추가 함수
   * @param {Object} options - 토스트 설정 옵션
   * @param {string} options.type - 토스트 타입 ('error', 'success', 'warning', 'info')
   * @param {string} options.title - 토스트 제목 (선택사항)
   * @param {string} options.message - 토스트 메시지
   * @param {number} options.duration - 표시 시간 (밀리초, 기본값: 3000)
   * @param {boolean} options.showProgress - 진행바 표시 여부 (기본값: false)
   * @returns {number} 토스트 ID
   */
  const addToast = (options) => {
    const id = ++toastIdCounter
    const toast = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 2000,
      showProgress: options.showProgress || false,
      show: false,
      progress: 100,
      createdAt: new Date(),
      ...options // 추가 옵션들
    }

    // 토스트 배열에 추가
    toasts.value.push(toast)

    // 애니메이션을 위해 약간의 지연 후 show 상태로 변경
    setTimeout(() => {
      const currentToast = toasts.value.find(t => t.id === id)
      if (currentToast) {
        currentToast.show = true
      }
    }, 10)

    // 진행바 애니메이션 (옵션이 활성화된 경우)
    if (toast.showProgress && toast.duration > 0) {
      const startTime = Date.now()
      
      const updateProgress = () => {
        const currentToast = toasts.value.find(t => t.id === id)
        if (!currentToast) return
        
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, toast.duration - elapsed)
        currentToast.progress = (remaining / toast.duration) * 100
        
        if (remaining > 0) {
          requestAnimationFrame(updateProgress)
        }
      }
      
      requestAnimationFrame(updateProgress)
    }

    // 자동 제거 (duration이 0보다 큰 경우에만)
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }

  /**
   * 특정 토스트 제거
   * @param {number} id - 제거할 토스트 ID
   */
  const removeToast = (id) => {
    const toastIndex = toasts.value.findIndex(toast => toast.id === id)
    if (toastIndex > -1) {
      const toast = toasts.value[toastIndex]
      
      // 애니메이션을 위해 show 상태를 false로 변경
      toast.show = false
      
      // 애니메이션 완료 후 배열에서 제거
      setTimeout(() => {
        const currentIndex = toasts.value.findIndex(t => t.id === id)
        if (currentIndex > -1) {
          toasts.value.splice(currentIndex, 1)
        }
      }, 300) // 애니메이션 시간과 일치
    }
  }

  /**
   * 모든 토스트 제거
   */
  const removeAllToasts = () => {
    // 모든 토스트의 show 상태를 false로 변경
    toasts.value.forEach(toast => {
      toast.show = false
    })
    
    // 애니메이션 완료 후 배열 초기화
    setTimeout(() => {
      toasts.value.splice(0)
    }, 300)
  }

  /**
   * 특정 타입의 토스트들만 제거
   * @param {string} type - 제거할 토스트 타입
   */
  const removeToastsByType = (type) => {
    const toastsToRemove = toasts.value.filter(toast => toast.type === type)
    toastsToRemove.forEach(toast => removeToast(toast.id))
  }

  /**
   * 가장 오래된 토스트 제거 (최대 개수 제한용)
   */
  const removeOldestToast = () => {
    if (toasts.value.length > 0) {
      const oldestToast = toasts.value.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
      )
      removeToast(oldestToast.id)
    }
  }

  /**
   * 토스트 개수 제한 체크
   * @param {number} maxToasts - 최대 토스트 개수 (기본값: 5)
   */
  const enforceMaxToasts = (maxToasts = 5) => {
    while (toasts.value.length > maxToasts) {
      removeOldestToast()
    }
  }

  // ================================
  // 편의 함수들 (자주 사용되는 타입별)
  // ================================

  /**
   * 에러 토스트 표시
   * @param {string} message - 에러 메시지
   * @param {string} title - 제목 (기본값: '오류')
   * @param {Object} options - 추가 옵션
   * @returns {number} 토스트 ID
   */
  const error = (message, title = '오류', options = {}) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 2000, // 에러는 조금 더 오래 표시
      showProgress: true,
      ...options
    })
  }

  /**
   * 성공 토스트 표시
   * @param {string} message - 성공 메시지
   * @param {string} title - 제목 (기본값: '성공')
   * @param {Object} options - 추가 옵션
   * @returns {number} 토스트 ID
   */
  const success = (message, title = '성공', options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      duration: 2000,
      showProgress: true,
      ...options
    })
  }

  /**
   * 경고 토스트 표시
   * @param {string} message - 경고 메시지
   * @param {string} title - 제목 (기본값: '경고')
   * @param {Object} options - 추가 옵션
   * @returns {number} 토스트 ID
   */
  const warning = (message, title = '경고', options = {}) => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 2000,
      showProgress: false, // 경고는 진행바 없이
      ...options
    })
  }

  /**
   * 정보 토스트 표시
   * @param {string} message - 정보 메시지
   * @param {string} title - 제목 (기본값: '알림')
   * @param {Object} options - 추가 옵션
   * @returns {number} 토스트 ID
   */
  const info = (message, title = '알림', options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      duration: 2000,
      showProgress: false,
      ...options
    })
  }

  // ================================
  // 특수 목적 함수들
  // ================================

  /**
   * 로딩 토스트 (수동으로 제거해야 함)
   * @param {string} message - 로딩 메시지
   * @param {string} title - 제목 (기본값: '처리중')
   * @returns {number} 토스트 ID (수동 제거용)
   */
  const loading = (message = '처리 중입니다...', title = '처리중') => {
    return addToast({
      type: 'info',
      title,
      message,
      duration: 0, // 자동 제거하지 않음
      showProgress: false
    })
  }

  /**
   * 확인/액션이 필요한 토스트
   * @param {string} message - 메시지
   * @param {string} title - 제목
   * @param {Function} onAction - 액션 콜백
   * @returns {number} 토스트 ID
   */
  const actionRequired = (message, title = '확인 필요', onAction = null) => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 0, // 수동으로 제거
      showProgress: false,
      actionRequired: true,
      onAction
    })
  }

  /**
   * API 호출 결과에 따른 자동 토스트
   * @param {Promise} apiCall - API 호출 Promise
   * @param {Object} messages - 성공/실패 메시지
   * @returns {Promise} 원본 Promise
   */
  const withApiToast = async (apiCall, messages = {}) => {
    const {
      loading: loadingMsg = '처리 중...',
      success: successMsg = '완료되었습니다.',
      error: errorMsg = '오류가 발생했습니다.'
    } = messages

    let loadingToastId
    
    try {
      // 로딩 토스트 표시
      if (loadingMsg) {
        loadingToastId = loading(loadingMsg)
      }

      // API 호출 실행
      const result = await apiCall

      // 로딩 토스트 제거
      if (loadingToastId) {
        removeToast(loadingToastId)
      }

      // 성공 토스트 표시
      if (successMsg) {
        success(successMsg)
      }

      return result

    } catch (err) {
      // 로딩 토스트 제거
      if (loadingToastId) {
        removeToast(loadingToastId)
      }

      // 에러 토스트 표시
      const errorMessage = err.message || errorMsg
      error(errorMessage)

      throw err
    }
  }

  // ================================
  // 유틸리티 함수들
  // ================================

  /**
   * 현재 표시된 토스트 개수
   */
  const getToastCount = () => toasts.value.length

  /**
   * 특정 타입의 토스트 개수
   * @param {string} type - 토스트 타입
   */
  const getToastCountByType = (type) => 
    toasts.value.filter(toast => toast.type === type).length

  /**
   * 토스트 존재 여부 확인
   * @param {number} id - 토스트 ID
   */
  const hasToast = (id) => toasts.value.some(toast => toast.id === id)

  /**
   * 특정 메시지의 토스트가 이미 있는지 확인 (중복 방지)
   * @param {string} message - 메시지
   * @param {string} type - 타입 (선택사항)
   */
  const hasDuplicateMessage = (message, type = null) => {
    return toasts.value.some(toast => 
      toast.message === message && (type ? toast.type === type : true)
    )
  }

  /**
   * 중복 방지 토스트 추가
   * @param {Object} options - 토스트 옵션
   */
  const addUniqueToast = (options) => {
    if (!hasDuplicateMessage(options.message, options.type)) {
      return addToast(options)
    }
    return null
  }

  // ================================
  // 반환 객체
  // ================================
  return {
    // 상태
    toasts,

    // 기본 함수들
    addToast,
    removeToast,
    removeAllToasts,
    removeToastsByType,

    // 편의 함수들
    error,
    success,
    warning,
    info,

    // 특수 함수들
    loading,
    actionRequired,
    withApiToast,

    // 유틸리티들
    getToastCount,
    getToastCountByType,
    hasToast,
    hasDuplicateMessage,
    addUniqueToast,
    enforceMaxToasts
  }
}

// ================================
// 기본 내보내기 (선택사항)
// ================================
export default useToast

// ================================
// 타입 정의 (TypeScript 사용시)
// ================================
/*
interface ToastOptions {
  type?: 'error' | 'success' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  showProgress?: boolean
  [key: string]: any
}

interface Toast extends ToastOptions {
  id: number
  show: boolean
  progress: number
  createdAt: Date
}
*/