<template>
  <div class="card template-1" :style="cardStyle" :class="widthClass">
    <!-- 로고 부분 -->
    <div class="medalbank-logo">
      <img :src="logoBankSrc" alt="MEDALBANK" class="logo-image" />
    </div>

    <!-- 카드 콘텐츠 -->
    <div class="card-content">
      <div class="header">
        <!-- 텍스트에 클래스와 인라인 스타일 모두 적용 -->
        <div class="title" :class="textColorClass" :style="textStyleObject">{{ props.time.name }}#{{ props.time.timeID
          }}
        </div>
        <div class="subtitle" :class="textColorClass" :style="textStyleObject">{{ props.time.pool }}</div>
        <div class="date" :class="textColorClass" :style="textStyleObject">{{ props.time.datetime }}</div>
      </div>
    </div>

    <!-- 카드 하단 정보 -->
    <div class="card-footer">
      <div class="footer-info">
        <div class="info-row">
          <span class="info-label" :style="textStyleObject">주종목</span>
        </div>
        <div class="info-row">
          <span class="info-value" :style="textStyleObject">11111111111</span>
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

// 너비 타입 정의
type WidthOption = 'narrow' | 'normal' | 'wide';

// 너비에 따른 픽셀값 매핑
const WIDTH_MAP = {
  narrow: 250,
  normal: 400,
  wide: 750
};

const props = defineProps({
  time: {
    type: Object,
    default: () => ({}),
  },
  date: {
    type: String,
    default: '',
  },
  width: {
    type: String as () => WidthOption,
    default: 'normal',
    validator: (value: string) => ['narrow', 'normal', 'wide'].includes(value)
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
  textColor: {
    type: String,
    default: null
  }
});

const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<string | null>(null);
const logoBankSrc = '/images/brststrk_logo_meta.png';


// 너비 클래스를 계산
const widthClass = computed(() => `width-${props.width}`);

// 카드 스타일 계산
const cardStyle = computed(() => {
  const width = `${WIDTH_MAP[props.width]}px`;
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

/* 기본 타이틀 크기 (normal 사이즈 기준) */
.title {
  font-size: 22px;
  font-weight: bold;
}

.subtitle {
  font-size: 16px;
}

.medals {
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

/* MEDALBANK 로고 기본 스타일 (normal 사이즈 기준) */
.medalbank-logo {
  position: absolute;
  top: 90px;
  right: -50px;
  width: 150px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  background-color: transparent;
}

.medalbank-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: rotate(270deg);
}

/* narrow 너비 스타일 */
.width-narrow .title {
  font-size: 18px;
}

.width-narrow .subtitle {
  font-size: 14px;
}

.width-narrow .medals {
  font-size: 14px;
}

.width-narrow .stats {
  gap: 10px;
}

.width-narrow .stats img {
  width: 16px;
  height: 16px;
}

.width-narrow .date {
  font-size: 12px;
}

.width-narrow .medalbank-logo {
  width: 120px;
  height: 30px;
  top: 80px;
  right: -45px;
}

/* wide 너비 스타일 */
.width-wide .title {
  font-size: 34px;
}

.width-wide .subtitle {
  font-size: 24px;
}

.width-wide .medals {
  font-size: 20px;
}

.width-wide .stats {
  gap: 20px;
}

.width-wide .stats img {
  width: 24px;
  height: 24px;
}

.width-wide .date {
  font-size: 18px;
}

.width-wide .medalbank-logo {
  width: 180px;
  height: 72px;
  top: 100px;
  right: -60px;
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

.width-narrow .info-label {
  width: 60px;
  font-size: 12px;
  color: #666;
}

.width-narrow .info-value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.width-wide .info-label {
  width: 60px;
  font-size: 16px;
  color: #666;
}

.width-wide .info-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* Template-specific customizations */
.template-1 {
  /* Default styles */
}
</style>