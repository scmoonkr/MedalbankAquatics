<template>
  <div class="cell-padding">
    <div class="flex flex-col items-end text-right"> <!-- 오른쪽 정렬 적용 -->
      <div class="cell-time-date-time text-[24px] font-mono" style="font-variant-numeric: tabular-nums;" aria-placeholder="00:00.00">
        {{ date }}
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  date: [String, Number],
})
</script>
