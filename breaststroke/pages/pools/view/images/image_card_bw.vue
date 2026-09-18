<template>
  <div class="card template-1" :style="cardStyle">
    <!-- 로고 부분 -->
    <div class="medalbank-logo">
      <img :src="logoBankSrc" alt="MEDALBANK" class="logo-image" />
    </div>

    <!-- 카드 콘텐츠 -->
    <div class="card-content">
      <div class="header">
        <!-- 텍스트에 클래스와 인라인 스타일 모두 적용 -->
        <div class="title" :class="textColorClass" :style="textStyleObject">문성태#1</div>
        <div class="subtitle" :class="textColorClass" :style="textStyleObject">마스터즈 수영선수</div>
        <div class="stats" :class="textColorClass" :style="textStyleObject">
          <span class="gold"><img :src="goldMedalSrc" alt="Gold" /> 0</span>
          <span class="silver"><img :src="silverMedalSrc" alt="Silver" /> 1</span>
          <span class="bronze"><img :src="bronzeMedalSrc" alt="Bronze" /> 1</span>
        </div>
        <div class="date" :class="textColorClass" :style="textStyleObject">2025년 03월 23일 필승하기로...</div>
      </div>
    </div>

    <!-- 카드 하단 정보 -->
    <div class="card-footer">
      <div class="footer-info">
        <div class="info-row">
          <span class="info-label" :style="textStyleObject">지역1</span>
          <span class="info-value" :style="textStyleObject">서울1</span>
        </div>
        <div class="info-row">
          <span class="info-label" :style="textStyleObject">지역2</span>
          <span class="info-value" :style="textStyleObject">서울2</span>
        </div>
        <div class="info-row">
          <span class="info-label" :style="textStyleObject">코스</span>
          <span class="info-value" :style="textStyleObject">LCM</span>
        </div>
        <div class="info-row">
          <span class="info-label" :style="textStyleObject">수영장</span>
          <span class="info-value" :style="textStyleObject">한국체육대학교수영장</span>
        </div>
      </div>
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
import { ref, computed } from 'vue';

const props = defineProps({
  pool: {
    type: Object,
    default: () => ({}),
  },
  medals: {
    type: Object,
    default: () => ({ gold: 0, silver: 0, bronze: 0 }),
  },
  date: {
    type: String,
    default: '',
  },
  cardWidth: {
    type: [String, Number],
    default: '100%'
  },
  cardHeight: {
    type: [String, Number],
    default: 400
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  isDarkText: {
    type: Boolean,
    default: false
  },
  // textColor prop 추가
  textColor: {
    type: String,
    default: null
  }
});
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<string | null>(null);
const goldMedalSrc = '/icons/medal_filled_gold.png';
const silverMedalSrc = '/icons/medal_filled_silver.png';
const bronzeMedalSrc = '/icons/medal_filled_bronze.png';
const logoBankSrc = '/images/brststrk_logo_meta.png';

const cardStyle = computed(() => {
  const width = typeof props.cardWidth === 'number' ? `${props.cardWidth}px` : props.cardWidth;
  const height = typeof props.cardHeight === 'number' ? `${props.cardHeight}px` : props.cardHeight;

  const style: Record<string, string> = {
    width,
    height
  };

  if (props.backgroundImage) {
    style.backgroundImage = `url(${props.backgroundImage})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  } else if (selectedImage.value) {
    style.backgroundImage = `url(${selectedImage.value})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  } else {
    style.backgroundColor = '#f0f0f0';
  }

  return style;
});

const textColorClass = computed(() => {
  if (props.textColor) {
    return null;
  }
  return props.isDarkText ? 'dark-text' : 'light-text';
});

const textStyleObject = computed(() => {
  if (props.textColor) {
    return { color: props.textColor };
  }
  return {};
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

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
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.card {
  position: relative;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 22px;
  font-weight: bold;
}

.subtitle {
  font-size: 16px;
}

.stats {
  display: flex;
  gap: 15px;
  margin-top: 5px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stats img {
  width: 20px;
  height: 20px;
}

.date {
  margin-top: 10px;
  font-size: 14px;
}

/* MEDALBANK 로고 스타일 수정 */
.medalbank-logo {
  position: absolute;
  top: 90px;
  /* 로고 y위치 조정 */
  right: -50px;
  /* 로고 x위치 조정 */
  width: 150px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  background-color: transparent;
  /* 배경색 제거 */
}

.medalbank-logo img {
  width: 100%;
  /* 이미지 너비를 컨테이너의 100%로 설정 */
  height: 100%;
  /* 이미지 높이를 컨테이너의 100%로 설정 */
  object-fit: cover;
  /* 이미지가 컨테이너를 꽉 채우도록 설정 */
  transform: rotate(270deg);
}

.light-text {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.dark-text {
  color: black;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 카드 하단 정보 스타일 */
.card-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 5;
}

.footer-info {
  flex: 1;
}

.info-row {
  display: flex;
  margin-bottom: 5px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 60px;
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Template-specific customizations */
.template-1 {
  /* Default styles */
}
</style>