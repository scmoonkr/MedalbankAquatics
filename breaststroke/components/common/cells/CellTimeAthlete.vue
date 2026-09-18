<template>
  <div class="cell-padding">
    <div class="flex items-center space-x-4">
      <!-- ▓▓▓ 이미지 영역 ▓▓▓ -->
      <template v-if="!dense && image && image.length > 0">
        <img :src="image" :alt="name" class="cell-athlete-text-image" />
      </template>
      <template v-else-if="!dense">
        <div class="cell-athlete-text-image" :class="(unregistered || !id || id === 0) ? 'bg-gray-200' : 'bg-black'"></div>
      </template>

      <!-- ▓▓▓ 이름 + ID + 시간 ▓▓▓ -->
      <div class="flex flex-col">
        <span class="cell-time-athlete-name relative inline-block whitespace-nowrap min-w-[112px]" :class="unregistered ? 'opacity-10' : ''">
          {{ name }}
          <span v-if="id && id !== 0" class="cell-time-athlete-id">#{{ id }}</span>
          <span class="invisible select-none absolute">홍길동#33333</span>
        </span>

        <div class="cell-time-athlete-time font-mono" style="font-variant-numeric: tabular-nums;" aria-placeholder="00:00.00">
          {{ time }}
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  image: String,
  time: [String, Number],
  name: [String, Number],
  id: [String, Number],
  unregistered: Boolean,
  dense: Boolean
})
</script>