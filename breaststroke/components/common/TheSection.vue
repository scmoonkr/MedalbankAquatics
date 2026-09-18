<template>
    <div class="section">
      <div :style="backgroundStyle">
        <div :class="['section-child', textColorClass, { 'section-narrow': narrow }]">
          <!-- 제목 + tooltip + 버튼 -->
          <div v-if="title" class="flex items-center gap-2">
            <h1 class="text-title m-0 flex items-center gap-1">
              {{ title }}
              <sup
                v-if="tooltip"
                class="button-tooltip"
                @click="showTooltip = true"
              >
                ⓘ
              </sup>
            </h1>
            <button
              v-if="button"
              class="button-default button-square"
              :class="buttonIcon ? '!text-sm':''"
              type="button"
              @click="button"
              title="추가"
            >
              <i :class="buttonIcon || 'fa-solid fa-plus'"></i>
            </button>
          </div>
  
          <!-- 부제목 -->
          <p v-if="subtitle" class="text-subtitle">{{ subtitle }}</p>
  
          <!-- spacer -->
          <div v-if="title || subtitle" :class="spacerClass" />
  
          <!-- 콘텐츠 -->
          <slot />
        </div>
      </div>
      <TheTooltipDialog
        :show="showTooltip"
        :message="tooltip || ''"
        @update:show="showTooltip = $event"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';
  import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
  
  const showTooltip = ref(false);
  
  const props = defineProps<{
    title?: string;
    subtitle?: string;
    spacer?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    background?: string;
    buttonIcon?: string;
    button?: () => void;
    tooltip?: string;
    narrow?: boolean; // ✅ 추가
  }>();

  const spacerClass = computed(() => {
    if (props.spacer === 'xs') return 'spacer-xs';
    if (props.spacer === 'sm') return 'spacer-sm';
    if (props.spacer === 'md') return 'spacer';
    if (props.spacer === 'lg') return 'spacer-lg';
    if (props.spacer === 'xl') return 'spacer-xl';
    return 'spacer';
  });
  
  const backgroundStyle = computed(() =>
    props.background
      ? `background: linear-gradient(45deg, ${props.background});`
      : undefined
  );
  
  function getTextColorClass(hex: string): 'text-white' | 'text-black' {
    if (!hex) return 'text-black';
    const firstColor = hex.split(',')[0].trim().replace('#', '');
    const r = parseInt(firstColor.substring(0, 2), 16);
    const g = parseInt(firstColor.substring(2, 4), 16);
    const b = parseInt(firstColor.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 186 ? 'text-black' : 'text-white';
  }
  
  const textColorClass = computed(() =>
    props.background ? getTextColorClass(props.background) : ''
  );
  </script>
  
  <style scoped>
 
  .button-default {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .button-square {
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 18px;
    background-color: #f3f4f6;
    color: #111827;
  }
  
  .button-square:hover {
    background-color: #e5e7eb;
  }
  
  .button-tooltip {
    top: -0.6em;
    font-family: 'Apple';
    font-size: 0.5em;
    color: inherit;
    cursor: pointer;
    opacity: 0.2;
    user-select: none;
  }
  .button-tooltip:hover {
    opacity: 1;
  }
  </style>
  