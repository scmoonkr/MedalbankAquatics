<template>
  <div class="youtube-container" :class="{ 'full-width': fullWidth, 'shorts-container': isShorts }">
    <!-- 썸네일 모드 -->
    <div v-if="!isPlayerLoaded && showThumbnail" class="youtube-thumbnail" @click="loadPlayer">
      <div class="thumbnail-wrapper" :style="{ aspectRatio: shouldUseAspectRatio ? optimalAspectRatio : 'auto' }">
        <img
          :src="currentThumbnailUrl"
          :alt="videoTitle || 'YouTube 비디오'"
          class="thumbnail-image"
          @error="onThumbnailError" />
        <div class="play-overlay">
          <div class="play-button">
            <!-- Shorts용 더 큰 플레이 버튼 -->
            <svg :width="isShorts ? '80' : '68'" :height="isShorts ? '56' : '48'" viewBox="0 0 68 48">
              <path
                d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                fill="#f00"></path>
              <path d="M 45,24 27,14 27,34" fill="#fff"></path>
            </svg>
          </div>
          <div v-if="isShorts" class="shorts-label">Shorts</div>
        </div>
        <div class="video-duration" v-if="duration">
          {{ duration }}
        </div>
      </div>
    </div>

    <!-- YouTube 플레이어 -->
    <div v-show="isPlayerLoaded" class="youtube-player" :style="playerStyle">
      <iframe
        :src="embedUrl"
        :title="videoTitle || 'YouTube video player'"
        frameborder="0"
        :allow="allowString"
        allowfullscreen
        class="youtube-iframe"
        @load="onPlayerLoad" />
    </div>

    <!-- 에러 상태 -->
    <div v-if="hasError" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h3>비디오를 불러올 수 없습니다</h3>
        <p>{{ errorMessage }}</p>
        <button @click="retry" class="retry-button">다시 시도</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


interface VideoInfo {
  title?: string
  description?: string
  channelName?: string
  duration?: string
  publishedDate?: string
}

const props = defineProps({
  videoId: {
    type: String
  },
  url: {
    type: String
  },
  width: {
    type: String
  },
  height: {
    type: String
  },
  aspectRatio: {
    type: String,
    default: '16/9'
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  mute: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  showThumbnail: {
    type: Boolean,
    default: false
  },
  showInfo: {
    type: Boolean,
    default: true
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  quality: {
    type: String as PropType<'default' | 'medium' | 'high' | 'standard' | 'maxres'>,
    default: 'high',
    validator: (value: string) => {
      return ['default', 'medium', 'high', 'standard', 'maxres'].includes(value)
    }
  },
  startTime: {
    type: Number
  },
  endTime: {
    type: Number
  },
  fillContainer: {
    type: Boolean,
    default: false
  },
  shortsMaxHeight: {
    type: String,
    default: '720px'
  },
  forceWatchUrl: {
    type: Boolean,
    default: false
  },
  alwaysShowControls: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  ready: []
  error: [message: string]
  play: []
  pause: []
}>()

// 반응형 데이터
const isPlayerLoaded = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const videoInfo = ref<VideoInfo>({})

// 계산된 속성들
const containerWidth = computed(() => props.width || '100%')
const containerHeight = computed(() => props.height || 'auto')
const shouldUseAspectRatio = computed(() => !props.height)

const extractedVideoId = computed(() => {
  if (props.videoId) return props.videoId
  if (props.url) return extractVideoId(props.url)
  return null
})

const isShorts = computed(() => props.url ? isYouTubeShorts(props.url) : false)

// Shorts에서는 기본적으로 컨트롤러 항상 표시
const shouldAlwaysShowControls = computed(() => {
  return props.alwaysShowControls || isShorts.value
})

// 플레이어 스타일 계산
const playerStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.height && props.height !== 'auto') {
    // 명시적 높이가 설정된 경우
    style.height = props.height
  } else {
    // aspectRatio 사용
    if (shouldUseAspectRatio.value) {
      style.aspectRatio = optimalAspectRatio.value
    }
  }

  return style
})

const thumbnailUrl = computed(() => {
  if (!extractedVideoId.value) return ''

  if (isShorts.value) {
    const shortsQualities = ['hqdefault', 'mqdefault', 'default']
    return `https://img.youtube.com/vi/${extractedVideoId.value}/${shortsQualities[0]}.jpg`
  }

  const qualityMap = {
    'maxres': 'maxresdefault',
    'high': 'hqdefault',
    'standard': 'sddefault',
    'medium': 'mqdefault',
    'default': 'default'
  }
  return `https://img.youtube.com/vi/${extractedVideoId.value}/${qualityMap[props.quality]}.jpg`
})

const allowString = computed(() => {
  return 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
})

const embedUrl = computed(() => {
  if (!extractedVideoId.value) return ''

  const params = new URLSearchParams()

  // props 값 그대로 사용
  if (props.autoplay) {
    params.set('autoplay', '1')
  }

  if (props.mute) {
    params.set('mute', '1')
  }

  if (props.loop) params.set('loop', '1')
  if (props.startTime) params.set('start', props.startTime.toString())
  if (props.endTime) params.set('end', props.endTime.toString())

  // 컨트롤러 설정 - Shorts는 기본적으로 항상 표시
  if (shouldAlwaysShowControls.value) {
    params.set('controls', '2') // 컨트롤러 항상 표시
  } else {
    params.set('controls', '1') // 기본 컨트롤러 (hover시 표시)
  }

  params.set('rel', '0') // 관련 비디오 최소화

  // Shorts UI 개선을 위한 설정
  if (isShorts.value && !props.forceWatchUrl) {
    // Shorts 전용 설정
    params.set('showinfo', '1') // 비디오 정보 표시
    params.set('fs', '1') // 전체화면 버튼
    params.set('cc_load_policy', '0') // 자막 기본 비활성화
    params.set('iv_load_policy', '1') // 주석 허용

    // Shorts에서 컨트롤러 항상 표시
    if (shouldAlwaysShowControls.value) {
      params.set('autohide', '0') // 컨트롤러 자동 숨김 비활성화
    } else {
      params.set('autohide', '2') // 더 오래 표시 후 숨김
    }
  } else {
    // 일반 비디오
    params.set('modestbranding', '1')
    if (shouldAlwaysShowControls.value) {
      params.set('autohide', '0')
    }
  }

  const paramString = params.toString()

  return `https://www.youtube.com/embed/${extractedVideoId.value}${paramString ? '?' + paramString : ''}`
})

const videoTitle = computed(() => videoInfo.value.title)
const videoDescription = computed(() => videoInfo.value.description)
const channelName = computed(() => videoInfo.value.channelName)
const publishedDate = computed(() => videoInfo.value.publishedDate)
const duration = computed(() => videoInfo.value.duration)

// YouTube URL에서 비디오 ID 추출
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Shorts 여부 확인
function isYouTubeShorts(url: string): boolean {
  return url.includes('/shorts/')
}

// 플레이어 로드
const loadPlayer = () => {
  if (!extractedVideoId.value) {
    showError('유효하지 않은 YouTube URL입니다.')
    return
  }

  hasError.value = false
  isPlayerLoaded.value = true
  isLoading.value = false // 바로 로딩 해제
}

// 썸네일 에러 처리
const thumbnailError = ref(false)
const thumbnailAttempts = ref(0)

const getThumbnailUrl = (attempt: number = 0): string => {
  if (!extractedVideoId.value) return ''

  const fallbackQualities = ['hqdefault', 'mqdefault', 'default', 'sddefault']
  const quality = fallbackQualities[attempt] || 'default'

  return `https://img.youtube.com/vi/${extractedVideoId.value}/${quality}.jpg`
}

const currentThumbnailUrl = computed(() => getThumbnailUrl(thumbnailAttempts.value))

// 썸네일 에러 처리
const onThumbnailError = () => {
  thumbnailAttempts.value++
  if (thumbnailAttempts.value < 4) {
    console.warn(`썸네일 로드 실패, 다른 품질로 재시도: ${thumbnailAttempts.value}`)
  } else {
    thumbnailError.value = true
    console.warn('모든 썸네일 로드 실패')
  }
}

// 플레이어 로드 완료 - 실제로는 사용하지 않음 (브라우저 호환성 문제)
const onPlayerLoad = () => {
  // iframe onload는 신뢰성이 떨어져서 사용하지 않음
  emit('ready')
}

// 에러 표시
const showError = (message: string) => {
  hasError.value = true
  errorMessage.value = message
  isLoading.value = false
  emit('error', message)
}

// 재시도
const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  thumbnailAttempts.value = 0
  if (props.showThumbnail) {
    isPlayerLoaded.value = false
  } else {
    loadPlayer()
  }
}

// 날짜 포맷팅
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  } catch {
    return dateString
  }
}

// 비디오 정보 가져오기
const fetchVideoInfo = async () => {
  if (!extractedVideoId.value) return

  videoInfo.value = {
    title: '',
    description: '',
    channelName: '',
    duration: '',
    publishedDate: '',
  }
}

// 스마트 aspect ratio 감지
const getOptimalAspectRatio = () => {
  if (props.aspectRatio !== '16/9') return props.aspectRatio

  if (isShorts.value) return '9/16'

  return '16/9'
}

const optimalAspectRatio = computed(() => getOptimalAspectRatio())

// 라이프사이클
onMounted(() => {
  if (!extractedVideoId.value && !props.url && !props.videoId) {
    showError('YouTube URL 또는 비디오 ID가 필요합니다.')
    return
  }

  if (props.showInfo) {
    fetchVideoInfo()
  }

  if (!props.showThumbnail) {
    loadPlayer()
  }
})

// 메서드 노출
defineExpose({
  loadPlayer,
  retry,
  videoId: extractedVideoId
})
</script>

<style scoped>
.youtube-container {
  position: relative;
  width: v-bind(containerWidth);
  height: v-bind(containerHeight);
  margin: 0 auto;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.youtube-container.full-width {
  max-width: 100%;
  width: 100%;
}

/* Shorts 컨테이너 - height가 auto인 경우에만 제한 적용 */
.youtube-container.shorts-container {
  max-width: 400px;
  margin: 0 auto;
  border-radius: 16px;
}

/* height가 명시적으로 설정되지 않은 Shorts만 높이 제한 */
.youtube-container.shorts-container:not([style*="height:"]):not([style*="height "]) {
  max-height: v-bind('props.shortsMaxHeight');
}

.youtube-thumbnail {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.youtube-thumbnail:hover {
  transform: scale(1.02);
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  background: #000;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
}

.youtube-thumbnail:hover .play-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.play-button {
  transition: transform 0.2s ease;
}

.youtube-thumbnail:hover .play-button {
  transform: scale(1.1);
}

.shorts-label {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.youtube-player {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
  /* Shorts 잘림 방지 */
}

.youtube-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  /* 여백 제거 */
}

/* Shorts의 경우 전체 비디오가 보이도록 조정 */
.shorts-container .youtube-iframe {
  object-fit: contain;
  object-position: center;
}

/* 명시적 높이가 설정된 경우 */
.youtube-player[style*="height:"] {
  display: flex;
  align-items: center;
  justify-content: center;
}

.youtube-player[style*="height:"] .youtube-iframe {
  max-width: 100%;
  max-height: 100%;
}

/* 마우스가 플레이어 위에 있을 때 컨트롤러 유지 효과 */
.youtube-player:hover {
  /* 호버 효과로 사용자에게 상호작용 가능함을 알림 */
}

/* 커스텀 오버레이로 더 나은 UX 제공 (선택적) */
.youtube-player::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.youtube-player:hover::after {
  opacity: 0.02;
  /* 매우 약한 오버레이로 hover 상태 표시 */
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.error-content {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.error-content svg {
  margin: 0 auto 1rem;
  color: #ef4444;
}

.error-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.error-content p {
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #2563eb;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .youtube-container.shorts-container:not([style*="height:"]):not([style*="height "]) {
    max-height: 70vh;
  }

  .youtube-container {
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .youtube-container.shorts-container:not([style*="height:"]):not([style*="height "]) {
    max-height: 60vh;
    margin: 0;
    border-radius: 0;
  }
}
</style>