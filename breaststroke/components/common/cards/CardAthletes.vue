/ 1. CardAthletes.vue 수정된 버전
<template>
  <div class="card-wrapper relative">
    <!-- 📸 카드 본체 (캡처 대상) -->
    <div class="card" ref="captureSection" :class="`card-${props.type}`" :style="cardStyle">
      <div class="card-overlay"></div>
      <div class="card-content">
        <img class="card-logo" src="/images/medalbank_logo_instagram_rotated.png" />
        <div class="card-top">
          <span class="title">{{ athlete.name }}<span class="font-normal opacity-20">#{{ athlete.athleteID }}</span></span><br />
          <span class="subtitle">{{ description }}</span><br />
          <div class="stats">
            <span class="medals"><img src="/icons/medal_filled_gold.png" /> {{ medals.gold }}</span>
            <span class="medals"><img src="/icons/medal_filled_silver.png" /> {{ medals.silver }}</span>
            <span class="medals"><img src="/icons/medal_filled_bronze.png" /> {{ medals.bronze }}</span>
          </div>
          <span class="date">{{ date }}</span>
        </div>
        <div class="card-bottom">
          <div v-for="(time, index) in bestTimes" :key="index.toString()" class="times">            
            <span class="discipline">{{ time.discipline }}</span>
            <span class="time">{{ time.time }}</span>
          </div>
          <!-- <div class="times leading-tight">
            <span class="discipline">평영 50M LCM</span>
            <span class="time">00:00.00</span>
          </div>
          <div class="times">
            <span class="discipline">평영 100M LCM</span>
            <span class="time">00:00.00</span>
          </div>
          <div class="times">
            <span class="discipline">평영 50M SCM</span>
            <span class="time">00:00.00</span>
          </div>
          <div class="times">
            <span class="discipline">평영 25M SCM</span>
            <span class="time">00:00.00</span>
          </div> -->
          
        </div>
      </div>
    </div>
    
    <!-- 이미지 변경 버튼 -->
    <div class="button-group-filters">
      <input 
        type="file" 
        accept="image/*" 
        @change="handleImageChange" 
        ref="fileInput" 
        class="hidden file-input" 
      />
      <button
        class="change-image-button absolute bottom-8 right-8 z-10 button-group-filters-selected"
        @click="triggerFileInput"
      >
        이미지 변경
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import html2canvas from 'html2canvas'

const props = defineProps({
  type: {
    type: String,
    default: 'squares',
    validator: (value: string) => ['squares', 'posts', 'stories'].includes(value)
  },
  image: {
    type: String,
    default: ''
  },
  athlete: {
    type: Object,
    default: () => ({}),
  },
  description: {
    type: String,
    default: '',
  },
  medals: {
    type: Object,
    default: () => ({ gold: 0, silver: 0, bronze: 0 }),
  },
  date: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['captured-file', 'captured-url']);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<string>('');
const captureSection = ref<HTMLElement | null>(null);
// const medals = ref({ gold: 0, silver: 0, bronze: 0 });
const bestTimes = ref<{ discipline: string; time: string }[]>([]);

// props.image 초기화
watch(() => props.image, (newImage) => {
  if (props.athlete.eventStatistics) {
    bestTimes.value = [];
    for (const leaderboard of props.athlete.eventStatistics) {
      // medals.value.gold += leaderboard.medals?.gold || 0;
      // medals.value.silver += leaderboard.medals?.silver || 0;
      // medals.value.bronze += leaderboard.medals?.bronze || 0;
      const discipline = makeTimesTitle({ style: leaderboard.style, distance: leaderboard.distance, course: leaderboard.course });
      bestTimes.value.push({ discipline: discipline, time: leaderboard.bestTime.time });
    }
    if (bestTimes.value.length > 4) bestTimes.value = bestTimes.value.slice(0, 4)
  }
  if (newImage) {
    selectedImage.value = newImage;
  }
}, { immediate: true });

// 카드 스타일 계산
const cardStyle = computed(() => {
  const imageUrl = selectedImage.value || props.image || '/images/not_found.jpg';
  
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
});

// scale 계산
function calcScale() {
  switch (props.type) {
    case "squares": return 2;
    case "stories": return 3.5565;
    case "posts": return 2.5;
    default: return 2;
  }
}

// 파일 입력 트리거
function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

// 이미지 변경 처리
const handleImageChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      selectedImage.value = e.target?.result as string;
      
      // DOM 업데이트를 기다린 후 캡처
      await nextTick();
      
      // 이미지가 완전히 로드될 때까지 대기
      await waitForImageLoad();
      
      // 캡처 실행
      await triggerCapturedFile();
    };
    
    reader.readAsDataURL(file);
  }
};

// 이미지 로드 대기
const waitForImageLoad = () => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // 에러 시에도 진행
    img.src = selectedImage.value;
  });
};

// Canvas를 Blob으로 변환
const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
};

// Blob을 File로 변환
const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now()
  });
};

// 섹션 캡처 및 File 생성
const triggerCapturedFile = async () => {
  if (!captureSection.value) {
    console.error('캡처할 섹션을 찾을 수 없습니다');
    return;
  }

  try {
    
    // html2canvas로 캡처
    const canvas = await html2canvas(captureSection.value, {
      scale: calcScale(),
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    // Canvas -> DataURL (디버깅용)
    const capturedImageUrl = canvas.toDataURL('image/png');
    
    // Canvas -> Blob -> File
    const blob = await canvasToBlob(canvas);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const filename = `capture-${timestamp}.png`;
    const file = blobToFile(blob, filename);
    
    // emit
    emit('captured-file', file, capturedImageUrl);
    
  } catch (error) {
    console.error('캡처 실패:', error);
  }
};
</script>
