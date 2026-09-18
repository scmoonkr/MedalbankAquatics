<template>
  <div v-if="filteredData.length > 0">
    <!-- 테이블 영역 -->
    <div class="overflow-x-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] w-[1080px] h-[1350px]">
      <div class="w-[1080px] h-[242px]"></div>
      <table class="text-[#e2e8f0] leading-none border-separate border-spacing-0 w-[1080px] text-[32px]">


        <!-- 상단 타이틀 (80px) -->
        <thead v-if="title" class="h-[72px]">
          <tr>
            <th :colspan="tableColumns.length" class="bg-[#0f172a] h-[72px]">
              <div class="flex flex-col justify-center text-left h-[72px] px-[134px]">
                <div class="font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis truncate text-[28px] leading-[40px]">
                  {{ title }}
                </div>
                <div class="text-[16px] leading-[24px] text-white/80 truncate">
                  {{ subtitle }} <span v-if="date" >{{ date }}</span>
                </div>
              </div>

            </th>
          </tr>
        </thead>

        <!-- 본문 (10줄 x 36px = 360px) -->
        <tbody>
          <tr v-for="(item, rowIndex) in filteredData.slice(0, 10)" :key="rowIndex" :class="rowIndex % 2 === 1 ? 'row-stripe-dark' : ''" class="h-[72px]">
            <td v-for="(column, colIndex) in tableColumns" :key="column.key" :style="{
              textAlign: 'center',
              fontSize: column.fontSize || 'inherit'
            }" :class="[
              colIndex === 0 ? 'w-[72px] h-[72px] pl-[134px]' : '',
              colIndex % 2 === 1 ? 'cell-stripe-dark' : '',
              column.className
            ]" class=" whitespace-nowrap border-none shadow-none p-0 m-0 border-0">
              <!-- 슬롯 -->
              <template v-if="$slots[`column-${column.key}`]">
                <slot :name="`column-${column.key}`" :value="item[column.key]" :row="item" />
              </template>

              <!-- 랭킹 컬럼 1 -->
              <template v-else-if="column.key === 'rank'">
                <div class="w-[72px] h-[72px] text-[24px] flex items-center justify-center font-bold" :class="[
                  rowIndex === 0 ? 'bg-[#FFD700] text-black' : '',
                  rowIndex === 1 ? 'bg-[#C0C0C0] text-black' : '',
                  rowIndex === 2 ? 'bg-[#CD7F32] text-black' : '',
                  rowIndex > 2 ? 'bg-white/5 text-white' : ''
                ]">
                  {{ item[column.key] }}
                </div>
              </template>

              <!-- 커스텀 렌더 -->
              <template v-else-if="column.render">
                <div v-html="column.render(getNestedValue(item, column.key), item)" />
              </template>

              <!-- 일반 텍스트 -->
              <template v-else>
                {{ getNestedValue(item, column.key) }}
              </template>
            </td>
          </tr>
        </tbody>

        <!-- 하단 날짜 + 출처 -->
        <thead class="h-[72px] pb-[85px]">
          <tr>
            <th :colspan="tableColumns.length" class="bg-[#0f172a] h-[72px]">
              <div class="flex items-center justify-between text-left px-[134px]">
                <div class="text-[16px] leading-[24px] text-white">
                  {{ today }} 기준
                </div>
                <div class="text-[16px] leading-[24px] text-white/10">
                  @medalbankaquatics
                </div>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: Array,
  data: Array,
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  date: { type: String, default: '' },
  today: { type: String, default: '' },
})
const today = ref('');
today.value = getDateFormat(new Date());

const getNestedValue = (obj, path) =>
  path.split('.').reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : null, obj)

const tableColumns = computed(() => props.columns.filter(col => col.visible !== false))
const filteredData = computed(() => [...props.data])
</script>

<style scoped>
.row-stripe-dark {
  background-color: rgba(255, 255, 255, 0.02);
}

.cell-stripe-dark {
  background-color: rgba(255, 255, 255, 0.02);
}

</style>
