<!-- components/common/TheBookGrid.vue -->
<template>
  <div class="datatable-desktop">
    <!-- 갤러리 그리드 -->
    <div class="content-card bg-white shadow overflow-hidden flex flex-col cursor-pointer relative"
      @click="clickURL(youtube?.href)">
    </div>
    <!-- 이미지 컨테이너 - 상대적 위치 지정 -->
    <div class="relative">
      <TheYoutube
        :url="youtube?.href"
        :mute="false"
        :autoplay="false" />

      <!-- 카테고리 - 이미지 상단 좌측 -->
      <div v-if="youtube.classCode.length > 0" class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-sm shadow-md">
        {{ youtube.classCode ?? '' }}
      </div>

      <!-- 추천수 - 이미지 상단 우측 -->
      <div v-if="youtube.round.length > 0"
        class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-sm shadow-md flex items-center">
        <span class="font-bold mr-1">♥</span> {{ youtube.round??'' }}
      </div>

      
      <div v-if="youtube.duration.length > 0"
        class="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-sm shadow-md flex items-center">
        {{ youtube.duration??'' }}
      </div>
    </div>

    <!-- 내용 컨테이너 - 고정 높이 설정 -->
    <div class="p-3 pt-2 flex-1 bg-gray-100 flex flex-col content-info-container">
      <!-- 메타 정보 -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-700">{{ youtube.name }}</span>

          <!-- 날짜와 NEW 배지를 같은 줄에 배치 -->
          <div class="flex items-center gap-1">
            <span>{{ youtube.datetime ?? '' }}</span>
          </div>
        </div>

        <!-- <div class="flex items-center gap-3">
          <span>조회 {{ content.views }}</span>
          <span>♥ {{ content.likes }}</span>
          <span v-if="content.commentCount">댓글 {{ content.commentCount }}</span>
        </div> -->
      </div>

      <!-- 제목 영역 - 고정 높이 설정 -->
      <div class="title-container min-h-[3.5rem] flex items-center my-2">
        <h3 v-if="youtube.discipline" class="text-lg font-semibold text-gray-900 line-clamp-2">
          {{ youtube.name }} {{ getGenderByEng(youtube.gender) }} {{ getDisciplineKorByEng(youtube.discipline) }} {{ youtube.distance }} {{ youtube.course }} {{ youtube.time }}
        </h3>
        <h3 v-else class="text-lg font-semibold text-gray-900 line-clamp-2">
          {{ youtube.title }}
        </h3>
      </div>

      <!-- 내용 요약 영역 - 고정 높이 설정 -->
      <!-- <div class="content-container min-h-[4.5rem]">
        <p class="text-sm text-gray-600 line-clamp-3">
          {{ truncateContent() }}
        </p>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { YoutubeModel } from '~/models/youtube';
import { useRouter } from 'vue-router';  // ✅
import TheYoutube from '@/components/common/TheYoutube.vue';

const config = useRuntimeConfig();

// props 정의 - TypeScript 제네릭 형식 사용
defineProps({
  youtube: {
    type:  YoutubeModel,
    default: () => YoutubeModel.createEmpty()
  }
});

// 상태 관리
const excerpt = ref('');

const clickURL = (url:string) => {
  // router.push(url);
  window.open(url, '_blank');
}

</script>

<style scoped>
.gallery-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.gallery-header {
  margin-bottom: 2rem;
  text-align: center;
}

.eyebrow {
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.gallery-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.gallery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-start;
}

.gallery-item {
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
  flex-grow: 0;
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.gallery-item:hover {
  transform: translateY(-5px);
}

.gallery-image-container {
  position: relative;
  height: 240px;
  /* Fixed height */
  overflow: hidden;
}

.gallery-image {
  height: 100%;
  width: auto;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.image-number {
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
}

.image-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-image-container:hover .image-hover-overlay {
  opacity: 1;
}

.image-alt-text {
  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  max-width: 100%;
}

@media (max-width: 768px) {
  .gallery-image-container {
    height: 200px;
    /* Smaller fixed height on mobile */
  }
}
</style>