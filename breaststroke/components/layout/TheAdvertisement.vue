<!-- components/layout/TheAdvertisement.vue -->
<template>
  <div class="w-full py-0 h-48 relative">
    <div class="mx-auto max-w-screen-xl h-full">
      <!-- 이미지 영역 -->
      <!-- <div class="absolute inset-0 opacity-20 overflow-hidden">
        <img src="/images/bible-pen.jpg" alt="999999과 펜" class="w-full h-full object-cover" />
      </div> -->

      <!-- 배너 내용 -->
      <div class="relative z-10 px-4 py-8 text-center">
        <h2 class="text-2xl font-bold mb-2">33333</h2>
        <p>33333</p>
        <div class="mt-8">
          <NuxtLink to="/home/join" class="bg-black hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">
            33333
          </NuxtLink>
        </div>
        <slot></slot> <!-- 추가 배너 콘텐츠를 위한 슬롯 -->
      </div>
    </div>
  </div>
</template>