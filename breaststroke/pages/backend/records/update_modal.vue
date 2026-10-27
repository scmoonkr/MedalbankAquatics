<!-- pages/backend/records/update_modal.vue : 수영연맹 신기록 갱신 목록 (체크한 것만 업데이트) -->
<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }} 신기록 {{ items.length }}건</h3>
          <p class="modal-sub">체크한 기록만 DB(records)에 반영됩니다. {{ hint ?? '갱신(더 빠른 기록)만 기본 선택되며, 신규/정정은 확인 후 직접 체크하세요.' }}</p>
        </div>

        <div class="modal-body">
          <table class="update-table">
            <thead>
              <tr>
                <th class="w-[36px]">
                  <input type="checkbox" :checked="allChecked" @change="toggleAll(($event.target as HTMLInputElement).checked)" />
                </th>
                <th>구분</th>
                <th>종류</th>
                <th>성별</th>
                <th>종목</th>
                <th>코스</th>
                <th>거리</th>
                <th>새 기록</th>
                <th>이름(팀)</th>
                <th>일자 / 장소</th>
                <th>기존 기록</th>
                <th>기존 이름</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.key" :class="{ unchecked: !checked.has(item.key) }">
                <td><input type="checkbox" :checked="checked.has(item.key)" @change="toggle(item.key)" /></td>
                <td>
                  <span class="badge" :class="`badge-${item.status}`">{{ statusLabel[item.status] || item.status }}</span>
                </td>
                <td>{{ item.record.type }}</td>
                <td>{{ item.record.gender }}</td>
                <td>{{ item.record.discipline }}</td>
                <td>{{ item.record.course }}</td>
                <td>{{ item.record.distance }}</td>
                <td class="font-bold">{{ item.record.time }}</td>
                <td>{{ item.record.name }}<span v-if="item.record.team" class="text-gray-500"> ({{ item.record.team }})</span></td>
                <td>{{ item.record.datetime }}<span v-if="item.record.location"> / {{ item.record.location }}</span></td>
                <td>{{ item.previous?.time ?? '-' }}</td>
                <td>{{ item.previous ? `${item.previous.name} ${item.previous.datetime ?? ''}` : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <span class="selected-count text-sm text-gray-500 mr-auto">{{ checked.size }}건 선택</span>
          <button class="button-default button-cancel w-[80px]" :disabled="isSaving" @click="emit('cancel')">닫기</button>
          <button class="button-default button-confirm w-[120px]" :disabled="isSaving || checked.size === 0" @click="emit('apply', [...checked])">
            {{ isSaving ? '업데이트 중...' : '업데이트' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface UpdateItem {
  key: string;
  status: 'new' | 'faster' | 'changed' | 'info';
  record: Record<string, any>;
  previous: Record<string, any> | null;
}

const props = defineProps<{
  title: string;
  show: boolean;
  defaultChecked?: string[]; // 처음에 체크해 둘 상태 (기본: 갱신만)
  items: UpdateItem[];
  isSaving?: boolean;
  hint?: string;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'apply', keys: string[]): void;
}>();

const statusLabel: Record<string, string> = { new: '신규', faster: '갱신', changed: '정정', info: '정보변경' };

// 갱신(더 빠른 기록)만 기본 체크. 신규(DB 에 없던 기록)와 정정(더 느려지는 기록)은 확인 후 직접 체크
const checked = ref<Set<string>>(new Set());
watch(() => [props.show, props.items], () => {
  checked.value = new Set(props.items.filter(i => (props.defaultChecked ?? ['faster']).includes(i.status)).map(i => i.key));
}, { immediate: true });

const allChecked = computed(() => props.items.length > 0 && checked.value.size === props.items.length);

const toggle = (key: string) => {
  const next = new Set(checked.value);
  if (next.has(key)) next.delete(key); else next.add(key);
  checked.value = next;
};
const toggleAll = (on: boolean) => {
  checked.value = on ? new Set(props.items.map(i => i.key)) : new Set();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #fff;
  border-radius: 8px;
  width: min(1200px, 94vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
.modal-header {
  padding: 16px 20px 8px;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
}
.modal-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.modal-body {
  padding: 8px 20px;
  overflow: auto;
}
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid #e5e7eb;
}
.update-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.update-table th,
.update-table td {
  border: 1px solid #d1d5db;
  padding: 6px 8px;
  text-align: left;
  white-space: nowrap;
}
.update-table thead th {
  position: sticky;
  top: 0;
  background: #e5e7eb;
  z-index: 1;
}
.update-table tr.unchecked td {
  color: #9ca3af;
}
.badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}
.badge-new { background: #dbeafe; color: #1d4ed8; }
.badge-faster { background: #dcfce7; color: #15803d; }
.badge-changed { background: #fef3c7; color: #b45309; }
.badge-info { background: #e5e7eb; color: #374151; }

.button-default {
  padding: 8px 14px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}
.button-cancel { background: #e5e7eb; color: #333; }
.button-confirm { background: #3498db; color: #fff; }
.selected-count { white-space: nowrap; }
/* 전역 CSS(.button-default.button-confirm { width: 100% })가 버튼을 늘리지 않게 폭 고정 */
.modal-footer .button-default { flex: none; white-space: nowrap; }
.modal-footer .button-default.button-cancel { width: 80px; }
.modal-footer .button-default.button-confirm { width: 120px; }
.button-default:disabled { opacity: 0.5; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
