<template>
  <div class="section">
      <div class="section-child">
        <div class="flex items-center gap-2">
          <h1 class="text-title m-0 flex items-center gap-1">
            결과 불러오는 중
          </h1>
        </div>
        <p class="text-subtitle">
          보다 정확한 결과를 제공하기 위해 데이터를 준비 중입니다. 잠시만 기다려 주세요.
        </p>

        <div class="dot-loader" />

        <TheSpacer />
        <slot />
        <TheSpacer size="huge" />
      </div>
  </div>
</template>

<script setup lang="ts">
import TheSpacer from '~/components/common/TheSpacer.vue';
</script>

<style scoped>

.dot-loader {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin-top: 1rem;
}

.dot-loader::before,
.dot-loader::after,
.dot-loader {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: dotPulse 1.4s infinite ease-in-out both;
}

.dot-loader::before {
  animation-delay: -0.32s;
}
.dot-loader::after {
  animation-delay: 0.32s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
