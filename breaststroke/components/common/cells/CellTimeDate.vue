<template>
  <div class="cell-padding">
    <div class="flex flex-col items-end text-right"> <!-- 오른쪽 정렬 적용 -->
      <div class="cell-time-date-time text-[16px] font-bold font-mono" style="font-variant-numeric: tabular-nums;" aria-placeholder="00:00.00">
        {{ time }}
      </div>
      <div class="cell-time-date-date font-mono" style="font-variant-numeric: tabular-nums;" aria-placeholder="0000-00-00">
        {{ date }}
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  time: [String, Number],
  date: [String, Number],
})
</script>
