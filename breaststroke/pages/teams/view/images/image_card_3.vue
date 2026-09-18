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
        <div class="title" :class="textColorClass" :style="textStyleObject">{{ athlete.name }}#{{ athlete.athleteID }}
        </div>
        <div class="subtitle" :class="textColorClass" :style="textStyleObject">마스터즈 수영선수</div>
        <div class="stats" :class="textColorClass" :style="textStyleObject">
          <span class="medals"><img :src="goldMedalSrc" alt="Gold" /> {{ medals.gold }}</span>
          <span class="medals"><img :src="silverMedalSrc" alt="Silver" /> {{ medals.silver }}</span>
          <span class="medals"><img :src="bronzeMedalSrc" alt="Bronze" /> {{ medals.bronze }}</span>
        </div>
        <div class="date" :class="textColorClass" :style="textStyleObject">{{ date }}</div>
      </div>
    </div>

    <!-- 카드 하단 정보 -->
    <div class="card-footer">
      <div class="footer-info">
        <div class="info-row">
          <span class="info-label" :style="textStyleObject">
            <span>FR 50 LCM</span>
            <br>
            <span>{{ bestTimes.FR_50_LCM }}</span>
          </span>
          <span class="info-label" :style="textStyleObject">
            <span>FR 100 LCM</span>
            <br>
            <span>{{ bestTimes.FR_100_LCM }}</span>
          </span>
        </div>

        <div class="info-row">
          <span class="info-label" :style="textStyleObject">
            <span>BA 50 LCM</span>
            <br>
            <span>{{ bestTimes.BA_50_LCM }}</span>
          </span>
          <span class="info-label" :style="textStyleObject">
            <span>BA 100 LCM</span>
            <br>
            <span>{{ bestTimes.BA_100_LCM }}</span>
          </span>
        </div>

        <div class="info-row">
          <span class="info-label" :style="textStyleObject">
            <span>BR 50 LCM</span>
            <br>
            <span>{{ bestTimes.BR_50_LCM }}</span>
          </span>
          <span class="info-label" :style="textStyleObject">
            <span>BR 100 LCM</span>
            <br>
            <span>{{ bestTimes.BR_100_LCM }}</span>
          </span>
        </div>

        <div class="info-row">
          <span class="info-label" :style="textStyleObject">
            <span>FL 50 LCM</span>
            <br>
            <span>{{ bestTimes.FL_50_LCM }}</span>
          </span>
          <span class="info-label" :style="textStyleObject">
            <span>FL 100 LCM</span>
            <br>
            <span>3{{ bestTimes.FL_100_LCM }}</span>
          </span>
        </div>

        <div class="info-row">
          <span class="info-label" :style="textStyleObject">
            <span>IM 200 LCM</span>
            <br>
            <span>{{ bestTimes.IM_200_LCM }}</span>
          </span>
          <span class="info-label" :style="textStyleObject">
            <span>IM 400 LCM</span>
            <br>
            <span>{{ bestTimes.IM_400_LCM }}</span>
          </span>
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
  athlete: {
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
const goldMedalSrc = '/icons/medal_filled_gold.png';
const silverMedalSrc = '/icons/medal_filled_silver.png';
const bronzeMedalSrc = '/icons/medal_filled_bronze.png';
const logoBankSrc = '/images/brststrk_logo_meta.png';

const bestTimes = ref({
  FR_50_LCM: "00:00.00", FR_100_LCM: "00:00.00",
  BA_50_LCM: "00:00.00", BA_100_LCM: "00:00.00",
  BR_50_LCM: "00:00.00", BR_100_LCM: "00:00.00",
  FL_50_LCM: "00:00.00", FL_100_LCM: "00:00.00",
  IM_200_LCM: "00:00.00", IM_400_LCM: "00:00.00",
});

// athlete 객체 변경 감지 및 이미지 업데이트
watch(() => props.athlete, (newAthlete) => {
  // best times
  bestTimes.value = {
    FR_50_LCM: "00:00.00", FR_100_LCM: "00:00.00",
    BA_50_LCM: "00:00.00", BA_100_LCM: "00:00.00",
    BR_50_LCM: "00:00.00", BR_100_LCM: "00:00.00",
    FL_50_LCM: "00:00.00", FL_100_LCM: "00:00.00",
    IM_200_LCM: "00:00.00", IM_400_LCM: "00:00.00",
  };
  // for (const best of newAthlete.leaderboards) {
  //   if (best.style == 'freestyle' && best.distance == '50M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.FR_50_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'freestyle' && best.distance == '100M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.FR_100_LCM = best.times[0].times || "00:00.00";
  //   }
  //   if (best.style == 'backstroke' && best.distance == '50M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.BA_50_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'backstroke' && best.distance == '100M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.BA_100_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'breaststroke' && best.distance == '50M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.BR_50_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'breaststroke' && best.distance == '100M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.BR_100_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'butterfly' && best.distance == '50M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.FL_50_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'butterfly' && best.distance == '100M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.FL_100_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'individualMedley' && best.distance == '200M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.IM_200_LCM = best.times[0].time || "00:00.00";
  //   }
  //   if (best.style == 'individualMedley' && best.distance == '400M' && best.course == 'LCM' && best.times.length > 0) {
  //     bestTimes.value.IM_400_LCM = best.times[0].time || "00:00.00";
  //   }
  // }
}, { immediate: true });
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
  height: 48px;
  top: 80px;
  right: -40px;
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
  margin-bottom: 10px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 150px;
  font-size: 14px;
  color: #333;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.info-label .label {
  font-size: 12px;
  color: #eee;
}

.info-value .value {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.width-narrow .info-label {
  width: 60px;
  font-size: 12px;
  color: #666;
}

.width-narrow .info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.width-wide .info-label {
  width: 60px;
  font-size: 16px;
  color: #666;
}

.width-wide .info-value {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

/* Template-specific customizations */
.template-1 {
  /* Default styles */
}
</style>