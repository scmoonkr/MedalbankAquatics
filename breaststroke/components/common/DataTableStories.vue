<template>
  <div v-if="filteredData.length > 0">
    <!-- 테이블 영역 -->
    <div class="overflow-x-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] w-[1080px] h-[1920px]">
      <div class="bg-white/5 w-[1080px] h-[40px]"></div>
      <table class="text-[#e2e8f0] leading-none border-separate border-spacing-0 w-[1080px] text-[40px] leading-[48px]">

        <!-- 상단 타이틀 (100px) -->
        <thead v-if="title">
          <tr>
            <th :colspan="tableColumns.length" class="bg-[#0f172a] h-[160px]">
              <div class="flex flex-col justify-center text-left h-[160px] !px-[40px] gap-[4px]">
                <div class="font-semibold text-white truncate text-[28px] leading-[40px]">
                  {{ title }}
                </div>
                <div class="text-white/80 truncate text-[24px] leading-[32px]">
                  {{ subtitle }} <span  v-if="date">{{ date }}</span>
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- 본문 (10줄 x 76px = 760px) -->
        <tbody>
          <tr v-for="(item, rowIndex) in filteredData.slice(0, 10)" :key="rowIndex" :class="rowIndex % 2 === 1 ? 'row-stripe-dark' : ''" class="h-[152px]">
            <td v-for="(column, colIndex) in tableColumns" :key="column.key" :style="{
              textAlign: 'center',
              fontSize: column.fontSize || 'inherit'
            }" :class="[
              colIndex === 0 ? 'w-[152px] h-[152px]' : '',
              colIndex % 2 === 1 ? 'cell-stripe-dark' : '',
              column.className
            ]" class=" whitespace-nowrap border-none shadow-none p-0 m-0 border-0">
              <!-- 슬롯 -->
              <template v-if="$slots[`column-${column.key}`]">
                <slot :name="`column-${column.key}`" :value="item[column.key]" :row="item" />
              </template>

              <!-- 랭킹 컬럼 1 -->
              <template v-else-if="column.key === 'rank'">
                <div class="flex items-center justify-center font-bold w-[152px] h-[152px] !ml-[40px] text-[40px] leading-[48px]" :class="[
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
        <thead>
          <tr>
            <th :colspan="tableColumns.length" class="bg-[#0f172a] h-[160px]">
              <div class="flex items-center justify-between text-left !px-[40px]">
                <div class="text-white text-[28px] leading-[40px]">
                  {{ today }} 기준
                </div>
                <div class="text-white/10 text-[28px] leading-[40px]">
                  @medalbankaquatics
                </div>
              </div>
            </th>
          </tr>
        </thead>


      </table>
      <div class="bg-white/5 w-[1080px] h-[40px]"></div>
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
