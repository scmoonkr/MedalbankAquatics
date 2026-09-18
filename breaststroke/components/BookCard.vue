<template>
  <div class="relative overflow-hidden rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-300">
    <!-- 책 이미지 -->
    <img :src="imageSrc" :alt="title" class="w-full h-auto object-cover">
    
    <!-- 책 정보 오버레이 - 투명도 조정 및 텍스트 가독성 향상 -->
    <div class="absolute bottom-0 left-0 right-0 bg-black/85 p-4 text-left text-white">
      <h3 class="text-2xl font-bold mb-2 text-white drop-shadow-lg">{{ title }}</h3>
      <div class="space-y-1">
        <p class="text-base text-white">{{ author }}</p>
        <p class="text-sm text-gray-200">{{ publishDate }} | {{ formatPrice(price) }}원</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookCardTailwind',
  props: {
    // 책 이미지 경로
    imageSrc: {
      type: String,
      required: true
    },
    // 책 제목
    title: {
      type: String,
      required: true
    },
    // 저자
    author: {
      type: String,
      required: true
    },
    // 출간일 (YYYY-MM-DD 형식)
    publishDate: {
      type: String,
      required: true
    },
    // 가격 (숫자 형식)
    price: {
      type: Number,
      required: true
    }
  },
  methods: {
    // 가격을 형식화하는 함수
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
};
</script>