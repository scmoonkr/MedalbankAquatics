<!-- view_image.vue -->
<template>
  <!-- DataTable 컴포넌트 -->
  <div class="flex gap-3">
    <div v-if="imageType=='stories'" ref="captureTargetStories">
      <DatatableLeaderboardsStories
        v-if="leaderboard && leaderboard.times && leaderboard.times.length > 0"
        :times="leaderboard.times"
        :title="computedTitle"
        :subtitle="props.subtitle || ''"
        :datetime="props.datetime"
      />
    </div>
    <div v-else ref="captureTargetPosts">
      <DatatableLeaderboardsPosts
        v-if="leaderboard && leaderboard.times && leaderboard.times.length > 0"
        :times="leaderboard.times"
        :title="computedTitle"
        :subtitle="props.subtitle || ''"
        :datetime="props.datetime"
      />
    </div>
  </div>
  <TheSpacer />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import UI_CONFIG from '~/config/ui';
import type { LeaderboardFilter, LeaderboardStruct, TimeRecord } from '~/types/leaderboard';
import { useLeaderboardStore } from '~/stores/leaderboard';
import DatatableLeaderboardsStories from './datatable_leaderboards_stories.vue';
import DatatableLeaderboardsPosts from './datatable_leaderboards_posts.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';
import domtoimage from 'dom-to-image';
import html2canvas from 'html2canvas';

const showTooltip = ref(false);
const router = useRouter();
const leaderboardStore = useLeaderboardStore();
const isLoading = ref(false);
const rowsPerPage = UI_CONFIG.rowsPerPage;

const props = defineProps<{
  leaderboard?: LeaderboardStruct;
  competitionName?: string;
  times?: TimeRecord[];
  subtitle?: string;
  adult?: string;
  typeName?: string;
  datetime?: string;
  imageType: string,
  triggerDownload?: number;
}>();

const computedTitle = computed(() => {
  if (props.leaderboard!.isMasters == undefined) return '';
  
  let title = (props.leaderboard!.isMasters ? "비등록" : "등록");
  if (props.adult && props.adult != "전체") title += ' ' + props.adult;
  title += ' ' + makeTimesTitle(props.leaderboard);
  title += ' ' + (props.typeName || '');

  return title;
});

const emit = defineEmits<{
  downloaded: []
}>();

const captureTargetStories = ref<HTMLElement | null>(null);
const captureTargetPosts = ref<HTMLElement | null>(null);
const isCapturing = ref(false);
const downloadResults = ref<{stories: boolean, posts: boolean}>({
  stories: false,
  posts: false
});

// 다운로드 트리거 감지
watch(() => props.triggerDownload, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal && props.leaderboard && !isCapturing.value) {
    try {
      isCapturing.value = true;
      downloadResults.value = { stories: false, posts: false };
      
      const leaderboardInfo = `${props.leaderboard.style}-${props.leaderboard.course}-${props.leaderboard.distance}`;
      
      // DOM 업데이트 대기
      await nextTick();
      
      // 컴포넌트 완전 로딩 대기
      await waitForComponentsToLoad();
      
      // 병렬 다운로드 시도 (동시에 시작하되 각각 완료 확인)
      const downloadPromises = [];
      
      if (captureTargetStories.value) {
        downloadPromises.push(
          downloadImageWithRetry(captureTargetStories.value, "stories", leaderboardInfo)
            .then(success => {
              downloadResults.value.stories = success;
            })
            .catch(error => {
              console.error('❌ Stories 실패:', leaderboardInfo, error);
              downloadResults.value.stories = false;
            })
        );
      }
      
      if (captureTargetPosts.value) {
        downloadPromises.push(
          downloadImageWithRetry(captureTargetPosts.value, "posts", leaderboardInfo)
            .then(success => {
              downloadResults.value.posts = success;
            })
            .catch(error => {
              console.error('❌ Posts 실패:', leaderboardInfo, error);
              downloadResults.value.posts = false;
            })
        );
      }
      
      // 모든 다운로드 완료까지 대기
      await Promise.allSettled(downloadPromises);
      
      // 결과 확인 및 로깅
      const totalExpected = (captureTargetStories.value ? 1 : 0) + (captureTargetPosts.value ? 1 : 0);
      const totalSuccess = (downloadResults.value.stories ? 1 : 0) + (downloadResults.value.posts ? 1 : 0);
      
      // 실패한 것들 재시도 (선택사항)
      if (totalSuccess < totalExpected) {
        await retryFailedDownloads();
      }
      
      emit('downloaded');
      
    } catch (error) {
      console.error('❌ 전체 다운로드 과정 오류:', error);
    } finally {
      isCapturing.value = false;
    }
  }
}, { immediate: false });

// 재시도 로직이 포함된 다운로드 함수
const downloadImageWithRetry = async (
  captureTarget: HTMLElement, 
  type: string, 
  leaderboardInfo: string,
  maxRetries: number = 2
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      
      if (attempt > 1) {
        // 재시도 전 추가 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        await nextTick();
      }
      
      const success = await downloadImage(captureTarget, type, leaderboardInfo);
      if (success) {
        return true;
      }
      
    } catch (error) {
      console.error(`❌ ${type} 오류 (시도 ${attempt}):`, leaderboardInfo, error);
    }
  }
  
  console.error(`💥 ${type} 최종 실패:`, leaderboardInfo);
  return false;
};

// 실패한 다운로드들 재시도
const retryFailedDownloads = async (): Promise<void> => {
  const retryPromises = [];
  
  if (!downloadResults.value.stories && captureTargetStories.value) {
    retryPromises.push(
      downloadImageWithRetry(captureTargetStories.value, "stories", "retry", 1)
        .then(success => downloadResults.value.stories = success)
    );
  }
  
  if (!downloadResults.value.posts && captureTargetPosts.value) {
    retryPromises.push(
      downloadImageWithRetry(captureTargetPosts.value, "posts", "retry", 1)
        .then(success => downloadResults.value.posts = success)
    );
  }
  
  if (retryPromises.length > 0) {
    await Promise.allSettled(retryPromises);
  }
};

// 컴포넌트들이 완전히 로드될 때까지 대기
const waitForComponentsToLoad = async (): Promise<void> => {
  const maxWaitTime = 8000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    await nextTick();
    
    const storiesElement = captureTargetStories.value;
    const postsElement = captureTargetPosts.value;
    
    let storiesReady = !storiesElement;
    let postsReady = !postsElement;
    
    if (storiesElement) {
      storiesReady = hasVisibleContent(storiesElement);
      if (!storiesReady) {
      }
    }
    
    if (postsElement) {
      postsReady = hasVisibleContent(postsElement);
    }
    
    if (storiesReady && postsReady) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.warn('⚠️ 컴포넌트 로딩 타임아웃 (계속 진행)');
};

// dom-to-image를 사용한 단순화된 다운로드 함수
const downloadImage = async (
  captureTarget: HTMLElement, 
  type: string, 
  leaderboardInfo: string = ''
): Promise<boolean> => {
  if (!captureTarget || !props.leaderboard) {
    console.error(`❌ ${type}: 캡처 대상 또는 데이터 없음`);
    return false;
  }
  
  try {
    
    // 최종 상태 확인
    if (!hasVisibleContent(captureTarget)) {
      console.error(`❌ ${type}: 캡처할 내용 없음`);
      return false;
    }
    
    // 이미지 로딩 대기
    await waitForImages(captureTarget);
    
    // 임시 컨테이너 생성
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = actualSize.width + 'px';
    tempContainer.style.height = actualSize.height + 'px';
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.boxSizing = 'border-box';
    
    // 원본 요소 복제
    const clonedElement = captureTarget.cloneNode(true) as HTMLElement;
    
    // Stories인 경우 1080x1920으로 크기 조정
    if (type === 'stories') {
      clonedElement.style.width = '1080px';
      clonedElement.style.height = '1920px';
      clonedElement.style.overflow = 'hidden';
      clonedElement.style.position = 'relative';
      clonedElement.style.boxSizing = 'border-box';
      
      // 테이블 요소들 크기 조정
      const tableElements = clonedElement.querySelectorAll('.datatable, table');
      tableElements.forEach(table => {
        const tableEl = table as HTMLElement;
        tableEl.style.width = '1080px';
        tableEl.style.height = 'auto';
      });
      
      // 헤더 크기 조정
      const header = clonedElement.querySelector('.datatable-header');
      if (header) {
        const headerEl = header as HTMLElement;
        headerEl.style.width = '1080px';
        headerEl.style.boxSizing = 'border-box';
      }
    } else if (type === 'posts') {
      // Posts인 경우 1080x1350으로 크기 조정
      clonedElement.style.width = '1080px';
      clonedElement.style.height = '1350px';
      clonedElement.style.overflow = 'hidden';
      clonedElement.style.position = 'relative';
      clonedElement.style.boxSizing = 'border-box';
      
      // 테이블 요소들 크기 조정
      const tableElements = clonedElement.querySelectorAll('.datatable, table');
      tableElements.forEach(table => {
        const tableEl = table as HTMLElement;
        tableEl.style.width = '1080px';
        tableEl.style.height = 'auto';
      });
      
      // 헤더 크기 조정
      const header = clonedElement.querySelector('.datatable-header');
      if (header) {
        const headerEl = header as HTMLElement;
        headerEl.style.width = '1080px';
        headerEl.style.boxSizing = 'border-box';
      }
    } else {
      clonedElement.style.width = actualSize.width + 'px';
      clonedElement.style.height = actualSize.height + 'px';
    }
    
    // 복제된 요소에 스타일 적용
    const allClonedElements = clonedElement.querySelectorAll('*');
    allClonedElements.forEach(el => {
      const element = el as HTMLElement;
      
      // 기본 줄바꿈 방지
      element.style.whiteSpace = 'nowrap';
      element.style.wordBreak = 'keep-all';
      element.style.overflowWrap = 'normal';
      
      // 헤더 영역은 줄바꿈 허용
      if (element.closest('.datatable-header') || 
          element.classList.contains('datatable-title') || 
          element.classList.contains('datatable-subtitle')) {
        element.style.whiteSpace = 'normal';
        element.style.wordBreak = 'keep-all';
        element.style.overflowWrap = 'break-word';
      }
      
      // 특정 텍스트 강제 처리
      if (element.textContent && element.textContent.includes('3333년')) {
        element.style.whiteSpace = 'nowrap';
        element.style.overflow = 'visible';
        element.style.textOverflow = 'clip';
        element.style.minWidth = 'max-content';
        element.style.width = 'auto';
      }
    });
    
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);
    
    // 짧은 대기 시간으로 스타일 적용 확인
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 실제 콘텐츠 크기 정확히 계산 (타입별 처리)
    const actualSize = getActualContentSize(captureTarget, type);
    
    // dom-to-image 옵션 설정 (실제 크기 변경 방식)
    const scaleFactor = 3; // 해상도 배수
    
    const options = {
      backgroundColor: '#ffffff',
      quality: 1.0,
      // 실제 캔버스 크기를 스케일 배수로 설정
      width: actualSize.width * scaleFactor,
      height: actualSize.height * scaleFactor,
      style: {
        // DOM 요소는 원본 크기 유지하되, transform으로 확대
        width: actualSize.width + 'px',
        height: actualSize.height + 'px',
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left',
        overflow: 'visible',
        position: 'relative',
        // 텍스트 렌더링 최적화
        textRendering: 'optimizeLegibility',
        fontSmooth: 'always',
        webkitFontSmoothing: 'antialiased',
        mozOsxFontSmoothing: 'grayscale'
      },
      filter: (node: HTMLElement) => {
        // 불필요한 요소만 필터링
        if (node.classList && node.classList.contains('no-capture')) {
          return false;
        }
        // 투명하거나 빈 요소 필터링
        const computed = window.getComputedStyle(node);
        if (computed.opacity === '0' || computed.visibility === 'hidden') {
          return false;
        }
        // 높이가 0인 요소 필터링 (투명 레이어)
        if (node.offsetHeight === 0 && node.textContent?.trim() === '') {
          return false;
        }
        return true;
      },
      cacheBust: true,
      useCORS: true,
      allowTaint: true
    };
    
    // Stories인 경우 이미지 데이터 직접 조작으로 1080x1920 보장
    if (type === 'stories') {
      
      // 먼저 dom-to-image로 기본 이미지 생성
      const tempDataUrl = await domtoimage.toPng(tempContainer, options);
      
      // Blob으로 변환하여 이미지 데이터 직접 조작
      const response = await fetch(tempDataUrl);
      const blob = await response.blob();
      
      // Canvas 방법 1: 고정밀도 컨텍스트
      const canvas = document.createElement('canvas');
      
      // 절대적 크기 설정
      Object.defineProperty(canvas, 'width', {
        value: 1080,
        writable: false,
        configurable: false
      });
      Object.defineProperty(canvas, 'height', {
        value: 1920,
        writable: false,
        configurable: false
      });
      
      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
        colorSpace: 'srgb'
      });
      
      if (ctx) {
        // 고정밀도 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 변환 매트릭스 완전 리셋
        ctx.resetTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // 배경 설정
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1080, 1920);
        
        // 이미지 로드 및 처리
        const bitmap = await createImageBitmap(blob, {
          resizeWidth: 1080,
          resizeHeight: 1920,
          resizeQuality: 'high'
        });
        
        // 비트맵을 정확한 크기로 그리기
        ctx.drawImage(bitmap, 0, 0, 1080, 1920);
        
        // 다양한 방법으로 데이터 추출 시도
        let finalDataUrl: string;
        
        try {
          // 방법 1: toDataURL
          finalDataUrl = canvas.toDataURL('image/png', 1.0);
        } catch (e) {
          console.warn('toDataURL 실패, toBlob 시도');
          // 방법 2: toBlob
          const resultBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
            }, 'image/png', 1.0);
          });
          
          finalDataUrl = URL.createObjectURL(resultBlob);
        }
        
        // 임시 컨테이너 제거
        document.body.removeChild(tempContainer);
        
        // 최종 검증 (더 정확한 방법)
        const finalBlob = await fetch(finalDataUrl).then(r => r.blob());
        const finalBitmap = await createImageBitmap(finalBlob);
        
        if (finalBitmap.width !== 1080 || finalBitmap.height !== 1920) {
          console.error(`❌ 여전히 크기 불일치: ${finalBitmap.width}x${finalBitmap.height}`);
          
          // 1080x1920 PNG 헤더를 강제로 설정하는 방법
          const correctedCanvas = document.createElement('canvas');
          correctedCanvas.width = 1080;
          correctedCanvas.height = 1920;
          const correctedCtx = correctedCanvas.getContext('2d');
          
          if (correctedCtx) {
            correctedCtx.fillStyle = '#ffffff';
            correctedCtx.fillRect(0, 0, 1080, 1920);
            correctedCtx.drawImage(canvas, 0, 0, 1080, 1920);
            
            finalDataUrl = correctedCanvas.toDataURL('image/png', 1.0);
          }
        }
        
        // 다운로드 실행
        const link = document.createElement('a');
        link.download = `${props.leaderboard.style} ${props.leaderboard.course} ${props.leaderboard.distance} ${type}.png`;
        link.href = finalDataUrl;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // URL 정리 (ObjectURL인 경우)
        if (finalDataUrl.startsWith('blob:')) {
          URL.revokeObjectURL(finalDataUrl);
        }
        
        return true;
      }
      
    } else {
      // Posts는 기존 방식 사용
      const dataUrl = await domtoimage.toPng(tempContainer, options);
      
      // 임시 컨테이너 제거
      document.body.removeChild(tempContainer);
      
      // 생성된 이미지 크기 검증
      const img = new Image();
      img.onload = () => {
      };
      img.src = dataUrl;
      
      // 데이터 URL 유효성 검사
      if (!dataUrl || dataUrl.length < 1000) {
        console.error(`❌ ${type}: 유효하지 않은 이미지 데이터`);
        return false;
      }
      
      // 다운로드 실행
      const link = document.createElement('a');
      link.download = `${props.leaderboard.style}-${props.leaderboard.course}-${props.leaderboard.distance}-${type}.png`;
      link.href = dataUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    }
    
  } catch (error) {
    console.error(`❌ ${type} 캡처 오류:`, error);
    
    // 폴백: 기본 크기로 재시도
    try {
      const rect = captureTarget.getBoundingClientRect();
      const fallbackOptions = {
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 2,
        width: rect.width,
        height: rect.height,
        cacheBust: true
      };
      
      const fallbackDataUrl = await domtoimage.toPng(captureTarget, fallbackOptions);
      
      if (fallbackDataUrl && fallbackDataUrl.length > 1000) {
        const link = document.createElement('a');
        // link.download = `${props.leaderboard.style}-${props.leaderboard.course}-${props.leaderboard.distance}-${type}.png`;
        const day = new Date().toISOString().slice(0,10).replace(/-/gi, '');
        link.download = `${day}-${computedTitle.value}`;
        if (props.subtitle) link.download += `-${props.subtitle}(${props.leaderboard.times[0].competitionID})`;
        link.download += `-${type}.png`;
        link.href = fallbackDataUrl;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      }
    } catch (fallbackError) {
      console.error(`❌ ${type} 폴백 캡처도 실패:`, fallbackError);
    }
    
    return false;
  }
};

// 실제 콘텐츠 크기 계산 함수 (Stories 1080x1920 고정)
const getActualContentSize = (element: HTMLElement, type: string) => {
  // Stories 타입인 경우 1080x1920 고정
  if (type === 'stories') {
    return {
      width: 1080,
      height: 1920,
      offsetX: 0,
      offsetY: 0
    };
  }
  
  // Posts 타입인 경우 특별 처리
  if (type === 'posts') {
    const header = element.querySelector('.datatable-header');
    const table = element.querySelector('table, .datatable-body');
    
    if (header && table) {
      const headerRect = header.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      
      // 실제 행 개수 확인
      const rows = table.querySelectorAll('tr');
      const actualRowCount = Array.from(rows).filter(row => {
        const cells = row.querySelectorAll('td, th');
        return Array.from(cells).some(cell => cell.textContent?.trim() !== '');
      }).length;
      
      // 실제 필요한 높이 계산 (헤더 + 실제 데이터 행들만)
      const rowHeight = 60; // 예상 행 높이
      const actualTableHeight = Math.max(actualRowCount * rowHeight, 200);
      const totalHeight = headerRect.height + actualTableHeight + 40; // 패딩
      
      return {
        width: Math.max(headerRect.width, tableRect.width),
        height: totalHeight,
        offsetX: 0,
        offsetY: 0
      };
    }
  }
  
  // 기타 경우
  const contentElements = element.querySelectorAll('table, .datatable, [class*="table"], .datatable-header');
  
  if (contentElements.length === 0) {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, offsetX: 0, offsetY: 0 };
  }
  
  let minTop = Infinity;
  let maxBottom = 0;
  let minLeft = Infinity;
  let maxRight = 0;
  
  const elementRect = element.getBoundingClientRect();
  
  contentElements.forEach(contentEl => {
    const rect = contentEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const relativeTop = rect.top - elementRect.top;
      const relativeBottom = rect.bottom - elementRect.top;
      const relativeLeft = rect.left - elementRect.left;
      const relativeRight = rect.right - elementRect.left;
      
      minTop = Math.min(minTop, relativeTop);
      maxBottom = Math.max(maxBottom, relativeBottom);
      minLeft = Math.min(minLeft, relativeLeft);
      maxRight = Math.max(maxRight, relativeRight);
    }
  });
  
  if (minTop !== Infinity && maxBottom > minTop && minLeft !== Infinity && maxRight > minLeft) {
    const contentWidth = maxRight - minLeft;
    const contentHeight = maxBottom - minTop;
    const padding = 20;
    
    return {
      width: Math.max(contentWidth + padding * 2, 300),
      height: Math.max(contentHeight + padding * 2, 200),
      offsetX: Math.max(minLeft - padding, 0),
      offsetY: Math.max(minTop - padding, 0)
    };
  }
  
  const rect = element.getBoundingClientRect();
  return { 
    width: rect.width, 
    height: rect.height,
    offsetX: 0,
    offsetY: 0
  };
};

const hasVisibleContent = (element: HTMLElement): boolean => {
  if (!element) return false;
  
  const size = getActualContentSize(element, 'default');
  if (size.width === 0 || size.height === 0) return false;
  
  const textContent = element.textContent?.trim();
  if (!textContent || textContent.length === 0) return false;
  
  const tableRows = element.querySelectorAll('tr');
  return tableRows.length >= 2;
};

const waitForImages = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'));
  if (images.length === 0) return;
  
  const imagePromises = images.map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        const onLoad = () => resolve();
        const onError = () => {
          img.style.display = 'none';
          resolve();
        };
        
        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onError, { once: true });
        
        setTimeout(() => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          resolve();
        }, 3000);
      }
    });
  });
  
  await Promise.all(imagePromises);
};
</script>

<style scoped>
/* 캡처 모드 스타일 - 고해상도 최적화 */
.capture-mode {
  overflow: visible !important;
  position: relative !important;
  width: auto !important;
  height: auto !important;
  image-rendering: -webkit-optimize-contrast !important;
  image-rendering: crisp-edges !important;
}

.capture-mode * {
  text-rendering: optimizeLegibility !important;
  font-smooth: always !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  image-rendering: -webkit-optimize-contrast !important;
  image-rendering: crisp-edges !important;
}

/* 랭크 배경색 정확한 설정 */
.capture-mode [class*="rank"]:has-text("1"),
.capture-mode .rank-cell:has-text("1"),
.capture-mode td:first-child:has-text("1") {
  background-color: #facc15 !important; /* 골드 */
  color: #000000 !important;
  font-weight: bold !important;
  text-align: center !important;
}

.capture-mode [class*="rank"]:has-text("2"),
.capture-mode .rank-cell:has-text("2"),
.capture-mode td:first-child:has-text("2") {
  background-color: #d1d5db !important; /* 실버 */
  color: #000000 !important;
  font-weight: bold !important;
  text-align: center !important;
}

.capture-mode [class*="rank"]:has-text("3"),
.capture-mode .rank-cell:has-text("3"),
.capture-mode td:first-child:has-text("3") {
  background-color: #cd853f !important; /* 브론즈 */
  color: #000000 !important;
  font-weight: bold !important;
  text-align: center !important;
}

/* 특정 랭크 배경색 (더 정확한 선택자) */
.capture-mode tr:nth-child(1) td:first-child,
.capture-mode tr:nth-child(1) [class*="rank"] {
  background-color: #facc15 !important; /* 1등 골드 */
  color: #000000 !important;
}

.capture-mode tr:nth-child(2) td:first-child,
.capture-mode tr:nth-child(2) [class*="rank"] {
  background-color: #d1d5db !important; /* 2등 실버 */
  color: #000000 !important;
}

.capture-mode tr:nth-child(3) td:first-child,
.capture-mode tr:nth-child(3) [class*="rank"] {
  background-color: #cd853f !important; /* 3등 브론즈 */
  color: #000000 !important;
}

/* 빈 행 숨기기 */
.capture-mode tr:empty,
.capture-mode .table-row:empty,
.capture-mode tr:has(td:empty),
.capture-mode tr:has(.cell:empty) {
  display: none !important;
}

/* 미등록 선수 행 처리 */
.capture-mode tr:has([class*="text-white/10"]),
.capture-mode tr:has(.unregistered),
.capture-mode .unregistered-row {
  opacity: 0.3 !important;
}

.capture-mode tr:has([class*="text-white/10"]) img,
.capture-mode .unregistered-row img {
  display: none !important;
}

/* 테이블 행 레이아웃 안정화 */
.capture-mode tr,
.capture-mode .table-row,
.capture-mode [class*="row"] {
  display: table-row !important;
  vertical-align: middle !important;
  height: auto !important;
  min-height: auto !important;
  line-height: normal !important;
  border-spacing: 0 !important;
}

/* 플렉스 컨테이너 안정화 */
.capture-mode .flex,
.capture-mode [class*="flex"] {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: nowrap !important;
  min-height: auto !important;
  height: auto !important;
  vertical-align: middle !important;
}

.capture-mode .datatable-header {
  min-height: 140px !important;
  padding: 24px 20px !important;
  overflow: visible !important;
  word-break: keep-all !important;
  overflow-wrap: break-word !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.capture-mode .datatable-title {
  font-size: 18px !important;
  line-height: 1.4 !important;
  white-space: normal !important;
  word-break: keep-all !important;
  overflow-wrap: break-word !important;
  max-width: 100% !important;
  width: 100% !important;
  display: block !important;
  margin-bottom: 8px !important;
  font-weight: bold !important;
}

.capture-mode .datatable-subtitle {
  font-size: 14px !important;
  line-height: 1.3 !important;
  white-space: normal !important;
  word-break: keep-all !important;
  overflow-wrap: break-word !important;
  margin-top: 4px !important;
  width: 100% !important;
  display: block !important;
}

.capture-mode [class*="title"] {
  font-size: 18px !important;
  line-height: 1.4 !important;
  white-space: normal !important;
  word-break: keep-all !important;
  overflow-wrap: break-word !important;
  max-width: 100% !important;
  width: 100% !important;
  display: block !important;
  margin-bottom: 8px !important;
  font-weight: bold !important;
}

.capture-mode table,
.capture-mode .datatable,
.capture-mode [class*="table"] {
  width: 100% !important;
  table-layout: fixed !important;
  border-collapse: collapse !important;
  border-spacing: 0 !important;
}

.capture-mode td,
.capture-mode th,
.capture-mode .cell,
.capture-mode [class*="cell"] {
  overflow: visible !important;
  text-overflow: unset !important;
  white-space: normal !important;
  vertical-align: middle !important;
  display: table-cell !important;
  padding: 8px !important;
  border: none !important;
  border-spacing: 0 !important;
}

/* 이미지 고해상도 처리 */
.capture-mode img {
  image-rendering: -webkit-optimize-contrast !important;
  image-rendering: crisp-edges !important;
  max-width: none !important;
  height: auto !important;
  vertical-align: middle !important;
  display: inline-block !important;
}

/* 캡처에서 제외할 요소들 */
.no-capture {
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>