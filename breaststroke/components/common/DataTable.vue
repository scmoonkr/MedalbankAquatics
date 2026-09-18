<template>
  <div class="datatable-wrapper">
    <!-- 검색 영역 -->
    <div v-if="search" class="datatable-controls">
      <input type="text" v-model="searchTerm" class="datatable-search" placeholder="검색어를 입력하세요..." />
      <div class="action-buttons">
        <slot name="action-buttons"></slot>
      </div>
    </div>

    <!-- 테이블 영역 -->
    <div class="overflow-x-auto">
      <table class="datatable" :class="[props.isDark ? 'dark-theme' : '']">
        <thead>
          <tr>
            <th v-for="(column, colIndex) in tableColumns" :key="column.key" :style="{
              textAlign: column.align || 'left',
              fontSize: column.fontSize || '12px',
              width: column.width || 'auto'
            }" @click="column.sortable ? handleClickSortField(column.key) : null" :class="{
              sortable: column.sortable,
              asc: sortKey === column.key && sortDir === 'asc',
              desc: sortKey === column.key && sortDir === 'desc',
              'checkbox-column': column.key === 'checkbox',
              'actions-column': column.key === 'actions',
              'alternate-column': props.alternateColumnColors === true && colIndex % 2 === 1
            }">
              <div class="cell-padding">
                <template v-if="column.key === 'checkbox'">
                  <input type="checkbox" :checked="allChecked" @click.stop @change="handleClickAllToggle($event)" />
                </template>
                <template v-else-if="column.key === 'actions'">
                  <!--<span>기능</span>&nbsp;&nbsp;-->
                  <button @click.stop="insertItemModal(row)" class="edit-btn" title="insert Form">
                    <i class="fas fa-edit"></i>
                  </button>
                </template>
                <template v-else>
                  {{ column.label }}
                  <span v-if="column.sortable" class="sort-indicator">
                    <i v-if="sortKey === column.key && sortDir === 'asc'" class="fas fa-sort-up"></i>
                    <i v-else-if="sortKey === column.key && sortDir === 'desc'" class="fas fa-sort-down"></i>
                    <i v-else class="fas fa-sort"></i>
                  </span>
                </template>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="isLoading">
            <td :colspan="tableColumns.length" class="no-data">
              <div class="cell-padding">
                <div class="flex justify-center py-8">
                  <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            </td>
          </tr>

          <tr v-else-if="!isLoading && filteredData.length === 0" class="cursor-not-allowed">
            <td :colspan="tableColumns.length" class="no-data">
              <div class="cell-padding">
                검색 결과가 없거나 현재 로딩중입니다.
              </div>
            </td>
          </tr>


          <tr v-for="(item, rowIndex) in paginatedData" :key="`item-${rowIndex}`" :class="[
            props.rowClickable ? 'row-clickable' : 'row-not-clickable',
            props.alternateRowColors && rowIndex % 2 === 1 ? 'alternate-row' : '',
          ]">
            <td v-for="(column, colIndex) in tableColumns" :key="column.key" @click="handleClickCell(item, column.key, $event)" :style="{
              textAlign: column.align || 'left',
              fontSize: column.fontSize || '12px',
              width: column.width || 'auto'
            }" :class="[
              props.cellClickable ? 'cell-clickable' : 'cell-not-clickable',
              props.alternateColumnColors === true && colIndex % 2 === 1 ? 'alternate-column' : '',
              column.className
            ]">
              <template v-if="column.key === 'checkbox'">
                <div class="cell-padding">
                  <input type="checkbox" :checked="item.checked" @click.stop @change="handleClickCheckbox(item, $event)" />
                </div>

              </template>

              <template v-else-if="$slots[`column-${column.key}`]">
                <slot :name="`column-${column.key}`" :value="item[column.key]" :row="item" />
              </template>

              <template v-else-if="column.render">
                <div class="cell-padding">
                  <div v-html="column.render(getNestedValue(item, column.key), item)" />
                </div>
              </template>

              <template v-else-if="typeof getNestedValue(item, column.key) === 'boolean'">
                <div class="cell-padding">
                  <input type="checkbox" :checked="getNestedValue(item, column.key)" disabled />
                </div>
              </template>

              <!-- actions 컬럼에 대한 커스텀 템플릿 -->
              <template v-else-if="column.key === 'actions'">
                <div class="cell-padding">
                  <div class="flex space-x-2">
                    <button @click.stop="editItemModal(item)" class="edit-btn" title="기록 수정">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click.stop="deleteItemModal(item)" class="delete-btn" title="기록 삭제">
                      <i class="fas fa-trash"></i>
                    </button>
                    <button @click.stop="viewItemModal(item)" class="view-btn" title="기록 보기">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </div>

              </template>

              <template v-else>
                <div class="cell-padding font-mono"
                :class="{
                  'bg-[#FFD700]/40': getNestedValue(item, column.key) === 1,
                  'bg-[#C0C0C0]/40': getNestedValue(item, column.key) === 2,
                  'bg-[#CD7F32]/40': getNestedValue(item, column.key) === 3
                }">
                  <div class="flex flex-col w-full"
                    :style="{ alignItems: alignItems(column.align), textAlign: column.align || 'left' }">
                    {{ getNestedValue(item, column.key) }}
                  </div>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="pagination && totalPages > 1" class="datatable-pagination">
      <TheSpacer />
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">
        이전
      </button>
      <template v-if="totalPages <= 7">
        <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="['pagination-btn', { active: currentPage === page }]">
          {{ page }}
        </button>
      </template>
      <template v-else>
        <button v-for="page in displayedPages" :key="page" @click="changePage(page)" :class="['pagination-btn', { active: currentPage === page }]">
          {{ page === '...' ? '...' : page }}
        </button>
      </template>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="pagination-btn">
        다음
      </button>
    </div>
  </div>
</template>


<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<script setup>
import { ref, computed, watch } from 'vue';

import TheSection from '~/components/common/TheSection.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';

const props = defineProps({
  columns: Array,
  data: Array,
  pagination: {
    type: Boolean,
    default: true
  },
  totalPage: {
    type: Number,
    default: 1
  },
  currentPage: {
    type: Number,
    default: 1
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  search: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isDark: {
    type: Boolean,
    default: false
  },
  keyField: { type: String, default: 'id' },
  serverSide: Boolean,
  alternateRowColors: [Boolean, String],
  alternateColumnColors: [Boolean, String],
  tableWidth: [String, Number],
  rowClickable: {
    type: Boolean,
    default: true
  },
  cellClickable: {
    type: Boolean,
    default: true
  },
});

const emit = defineEmits([
  'toggle-all',
  'toggle-item',
  'click-cell',
  'page-change',
  'sort-column',

  // Modal
  'insert',
  'edit',
  'delete',
  'view',
]);

const searchTerm = ref('');
const sortKey = ref('');
const sortDir = ref('asc');
const currentPage = ref(props.currentPage);

watch(() => props.currentPage, (val) => currentPage.value = val, { immediate: true });
watch(searchTerm, () => currentPage.value = 1);

const getItemKey = (item) => item[props.keyField] || item.id || item.poolID || JSON.stringify(item);

const getNestedValue = (obj, path) =>
  path.split('.').reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : null, obj);

// column.align → flex 정렬값 (left 기본 / center / right)
const alignItems = (align) =>
  align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

const tableColumns = computed(() => props.columns.filter(col => col.visible !== false));

const allChecked = computed(() => props.data.length > 0 && props.data.every(i => i.checked));

const filteredData = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return term
    ? props.data.filter(item =>
      props.columns.some(col => {
        if (col.key === 'checkbox' || col.key === 'actions') return false;
        const val = getNestedValue(item, col.key);
        return val !== null && String(val).toLowerCase().includes(term);
      })
    )
    : [...props.data];
});

const paginatedData = computed(() => {
  if (!props.pagination || props.serverSide) return filteredData.value;
  const start = (currentPage.value - 1) * props.itemsPerPage;
  return filteredData.value.slice(start, start + props.itemsPerPage);
});

const totalPages = computed(() => props.totalPage);

const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  let pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  if (!pages.includes(total)) pages.push(total);
  return pages;
});

const handleClickSortField = (col) => {
  sortKey.value === col ? sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc' : (sortKey.value = col, sortDir.value = 'asc');
  emit('sort-column', col, sortDir.value);
};

const insertItemModal = (item) => {
  emit('insert', item);
}
const editItemModal = (item) => {
  emit('edit', item);
}
const deleteItemModal = (item) => {
  emit('delete', item);
}
const viewItemModal = (item) => {
  emit('view', item);
}

const handleClickAllToggle = (e) => emit('toggle-all', e.target.checked);
const handleClickCheckbox = (item, e) => emit('toggle-item', getItemKey(item), e.target.checked);
const handleClickCell = (item, col, e) => { if (e.target.type !== 'checkbox') emit('click-cell', item, col); };
const changePage = (page) => { if (page !== '...') { currentPage.value = page; emit('page-change', page); } };
</script>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<style scoped>
/* ─────────────────────────────────────────────
   마크다운 테이블(search 등)과 동일한 기본 테이블 스타일
   backend·서비스 페이지의 모든 DataTable에 공통 적용
   (bg-gray-200 헤더 / border-gray-300 / px-4 py-2 / 짝수행·hover 음영)
   ───────────────────────────────────────────── */
.datatable {
  width: 100%;
  border-collapse: collapse;
}

/* DataTable 전용 글꼴: 나눔고딕 (전역 Apple !important 규칙을 덮어씀) */
.datatable th,
.datatable td {
  font-family: 'Nanum Gothic', sans-serif !important;
}

/* 값 셀은 고정폭 유지 (숫자·기록 정렬) */
.datatable td .font-mono {
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace !important;
}

.datatable thead {
  background-color: #e5e7eb; /* gray-200 */
}

.datatable th {
  border: 1px solid #d1d5db; /* gray-300 */
  text-align: left;
  font-weight: 200;
  font-size: 12px; /* 기본 크기(컬럼에 fontSize 지정 시 인라인 스타일이 우선) */
}

.datatable td {
  border: 1px solid #d1d5db; /* gray-300 */
  vertical-align: middle;
  font-size: 12px; /* 기본 크기(컬럼에 fontSize 지정 시 인라인 스타일이 우선) */
}

.datatable tbody tr:nth-child(even) {
  background-color: #f9fafb; /* gray-50 */
}

.datatable tbody tr:hover {
  background-color: #f3f4f6; /* gray-100 */
}

.datatable th .cell-padding,
.datatable td .cell-padding {
  padding: 0.5rem 0.5rem;
}

/* 정렬 가능한 컬럼 헤더 */
.datatable th.sortable {
  cursor: pointer;
  user-select: none;
}

.datatable th.sortable:hover {
  background-color: #d1d5db; /* gray-300 */
}

.sort-indicator {
  margin-left: 0.35rem;
  font-size: 0.5em;
  color: #9ca3af; /* gray-400: 기본(미정렬) 표시 */
}

/* 현재 정렬 중인 컬럼은 진하게 */
.datatable th.asc .sort-indicator,
.datatable th.desc .sort-indicator {
  color: #374151; /* gray-700 */
}

/* 페이지네이션 (ThePagination.vue와 동일 스타일) */
.datatable-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

/* 버튼 스타일 */
.edit-btn,
.delete-btn,
.view-btn {
  @apply text-center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 10px;
  border: none;
  cursor: pointer;
  color: white;
}

.edit-btn {
  background-color: #3498db;
}

.delete-btn {
  background-color: #e74c3c;
}

.view-btn {
  background-color: #2ecc71;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.view-btn:hover {
  background-color: #27ae60;
}

.cell-not-clickable,
.row-not-clickable {
  pointer-events: none !important;
  /* 클릭 불가능 */
  cursor: default !important;
  /* 마우스 커서 기본으로 */
  user-select: none !important;
  /* 텍스트 선택 방지 */
  transition: none !important;
  /* hover 효과 제거 */
}

/* hover 상태일 때도 아무 반응 없게 */
.cell-not-clickable:hover,
.row-not-clickable:hover {
  background-color: inherit !important;
  color: inherit !important;
  box-shadow: none !important;
  filter: none !important;
}
</style>
