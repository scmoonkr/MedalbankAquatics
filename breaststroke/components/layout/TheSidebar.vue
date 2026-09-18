<!-- components/layout/TheSidebar.vue -->
<template>
  <!-- 브라우저 화면 전체 높이(min-h-screen) -->
  <aside class="hidden md:block bg-rose-50 p-6 flex items-center justify-center min-h-screen">
    <div>
      <h2 class="text-lg font-medium mb-4">Sidebar</h2>
      <slot></slot> <!-- 추가 사이드바 콘텐츠를 위한 슬롯 -->
    </div>
  </aside>
</template>