<template>
  <div class="card-wrapper relative">
    <!-- 📸 카드 본체 (캡처 대상) -->
    <div class="card" :class="`card-${props.type}`" :style="cardbackgroundImage">
      <!-- <img class="card-background" :src="image && image.length > 0 ? image : '/images/not_found.jpg'" /> -->
      <div class="card-overlay"></div>
      <div class="card-content">
        <img class="card-logo" src="/images/medalbank_logo_instagram_rotated.png" />
        <div class="card-top">
          <span class="title">{{ athlete.name }}<span class="text-gray-200">#{{ athlete.athleteID }}</span></span><br />
          <span class="subtitle">{{ description }}</span><br />
          <div class="stats">
            <span class="medals"><img src="/icons/medal_filled_gold.png" /> {{ medals.gold }}</span>
            <span class="medals"><img src="/icons/medal_filled_silver.png" /> {{ medals.silver }}</span>
            <span class="medals"><img src="/icons/medal_filled_bronze.png" /> {{ medals.bronze }}</span>
          </div>
          <span class="date">{{ date }}</span>
        </div>
        <!-- <div class="card-bottom">
        <span>33333</span><br />
        <span>33333</span>
      </div> -->
      </div>
    </div>
    <!-- ❌ 캡처 안 되는 버튼 -->
    <button class="change-image-button absolute bottom-2 right-2 z-10 px-2 py-1 text-[10px] text-white bg-black bg-opacity-40 rounded hover:bg-opacity-70 transition" @click="triggerFileInput">
      이미지 변경
    </button>
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
const props = defineProps({
  type: {
    type: String,
    default: 'squares', // 기본값은 squares
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
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<string | null>(null);

// 카드 스타일 계산
const cardStyle = computed(() => {

  const style: Record<string, string> = {};

  if (props.image) {
    style.backgroundImage = `url(${props.image})`;
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
const cardbackgroundImage = computed(() => ({
  backgroundImage: `url(${props.image || '/images/not_found.jpg'})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}));

</script>
