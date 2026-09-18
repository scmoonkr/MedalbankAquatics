<!-- components/TheDataTable.vue -->
<template>
  <div class="markdown-content prose prose-sm max-w-none">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="opt in options as any[]" :key="opt.header">
            {{ opt.header }}
          </th>
        </tr>
      </thead>
      <!-- {{ times }} -->
      <tbody>
        <tr v-for="item in times as any[]" :key="item.timeID || item.id">
          <td v-for="opt in options as any[]" :key="opt.header">
            <component
              :is="getCellComponent(opt)"
              v-bind="getCellProps(item, opt)"
              @click="handleCellClick(item, opt)"
            >
              <span 
								v-html="getCellValue(item, opt as any)"
							></span>
            </component>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  times: {
    type: Array,
    required: true
  },
  options: {
    type: Array,
    required: true
  }
})

	
const parseTemplate = (format: string, item: Record<string, any>): string => {
  if (!format || !item) return ''
  
  let result = format.replace(/\n|\t/gi, '')
  
  // $[key] 형태 처리 ($ 기호는 그대로 유지)
  result = result.replace(/\$\[(\w+)\]/g, (match, key) => {
    return item[key] !== undefined ? `$${item[key]}` : ''; // match
  })
  
  // [key] 형태 처리
  result = result.replace(/\[(\w+)\]/g, (match, key) => {
    return item[key] !== undefined ? String(item[key]) : ''; //match
  })
  
  // {key} 형태 처리 (옵션)
  result = result.replace(/\{(\w+)\}/g, (match, key) => {
    return item[key] !== undefined ? String(item[key]) : ''; //match
  })
  
  return result
}

const getCellValue = (
  item: any, 
  opt: { 
    cell: string | string[]; 
    link?: string | ((item: any, baseUrl: string) => string);
    image?: boolean;
    imageSize?: { width?: number; height?: number };
  },
  baseUrl: string = 'https://breaststroke.club'
): string => {
  const { cell, link, image, imageSize } = opt;
  const cellStr = Array.isArray(cell) ? cell.join('') : cell;

  // 기본 값 추출
  let value = '';
  value = parseTemplate(cellStr, item);

  // 이미지 처리
  if (image) {
    const imageUrl = value || item.featured || '';
    if (imageUrl) {
      const width = imageSize?.width || 80;
      const height = imageSize?.height || 80;
      
      // 여백 없이 꽉 차는 이미지
      return `<img src="${imageUrl}" width="${width}" height="${height}" style="display: block; width: ${width}px; height: ${height}px; object-fit: cover; margin: 0; padding: 0;" />`;
    }
    return '';
  }

  // 링크 처리
  if (link) {
    let url = '';
    if (typeof link === 'function') {
      url = link(item, baseUrl);
    } else {
      url = link.replace(':id', item.athleteID || item.id);
      if (!url.startsWith('http')) {
        url = `${baseUrl}${url}`;
      }
    }
    return `[${value}](${url})`;
  }

  return value;
};

const getCellComponent = (opt: any) => {
  if (opt.clickable && opt.linkTo) {
    return 'NuxtLink'
  }
  if (opt.clickable) {
    return 'a'
  }
  return 'span'
}

const getCellProps = (item: any, opt: any) => {
  if (opt.clickable && opt.linkTo) {
    // linkTo 함수로 동적 경로 생성
    return {
      to: opt.linkTo(item),
      class: 'clickable-cell'
    }
  }
  if (opt.clickable) {
    return {
      href: '#',
      class: 'clickable-cell'
    }
  }
  return {}
}

const handleCellClick = (item: any, opt: any) => {
  if (opt.clickable && opt.onClick) {
    opt.onClick(item)
  }
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.data-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #333;
}

.data-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.data-table tr:hover {
  background-color: #f5f5f5;
}

.clickable-cell {
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.clickable-cell:hover {
  text-decoration: underline;
  color: #2563eb;
}
</style>