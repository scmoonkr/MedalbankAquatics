<!-- pages/backend/records/record_drawer.vue
     신기록 직접입력 / 수정 drawer. 탭: 항목별 입력(form) · JSON 입력. update 버튼 -> 형식 검사 -> 이상 없으면 바로 반영.
     - record 가 없으면 직접입력(추가), 있으면 표의 행 수정(그 기록을 입력한 내용으로 교체) -->
<template>
  <Transition name="drawer">
    <div v-if="show" class="drawer-overlay" @click.self="close">
      <aside class="drawer" role="dialog" aria-modal="true">
        <header class="drawer-header">
          <div>
            <h3 class="drawer-title">{{ isEdit ? '신기록 수정' : '신기록 직접입력' }}</h3>
            <p v-if="isEdit" class="drawer-sub">{{ originalKeyText }}</p>
          </div>
          <button type="button" class="close-button" :disabled="isSaving" title="닫기" @click="close">✕</button>
        </header>

        <!-- 마스터즈 등 수정을 지원하지 않는 기록 -->
        <p v-if="readonlyReason" class="notice">{{ readonlyReason }}</p>

        <nav class="tabs">
          <button type="button" class="tab" :class="{ active: tab === 'form' }" @click="switchTab('form')">항목별 입력</button>
          <button type="button" class="tab" :class="{ active: tab === 'json' }" @click="switchTab('json')">JSON 입력</button>
        </nav>

        <div class="drawer-body">
          <!-- 항목별 입력 -->
          <form v-show="tab === 'form'" class="form-grid" @submit.prevent="submit">
            <label class="field">
              <span>종류 <b>*</b></span>
              <select v-model="form.type" :disabled="locked" :class="{ invalid: fieldError('type') }">
                <option value="">선택</option>
                <option v-for="o in typeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <em v-if="fieldError('type')">{{ fieldError('type') }}</em>
            </label>
            <label class="field">
              <span>성별 <b>*</b></span>
              <select v-model="form.gender" :disabled="locked" :class="{ invalid: fieldError('gender') }">
                <option value="">선택</option>
                <option value="men">men</option>
                <option value="women">women</option>
                <option value="mixed">mixed</option>
              </select>
              <em v-if="fieldError('gender')">{{ fieldError('gender') }}</em>
            </label>
            <label class="field">
              <span>종목 <b>*</b></span>
              <select v-model="form.discipline" :disabled="locked" :class="{ invalid: fieldError('discipline') }">
                <option value="">선택</option>
                <option v-for="o in disciplineOptions" :key="o.value" :value="o.value">{{ o.label }} ({{ o.value }})</option>
              </select>
              <em v-if="fieldError('discipline')">{{ fieldError('discipline') }}</em>
            </label>
            <label class="field">
              <span>코스 <b>*</b></span>
              <select v-model="form.course" :disabled="locked" :class="{ invalid: fieldError('course') }">
                <option value="">선택</option>
                <option value="LCM">LCM (50m)</option>
                <option value="SCM">SCM (25m)</option>
              </select>
              <em v-if="fieldError('course')">{{ fieldError('course') }}</em>
            </label>
            <label class="field">
              <span>거리 <b>*</b></span>
              <select v-model="form.distance" :disabled="locked" :class="{ invalid: fieldError('distance') }">
                <option value="">선택</option>
                <option v-for="o in distanceOptions" :key="o" :value="o">{{ o }}</option>
              </select>
              <em v-if="fieldError('distance')">{{ fieldError('distance') }}</em>
              <small>계영은 4×거리의 합 (4×100m = 400M)</small>
            </label>
            <label class="field">
              <span>기록 <b>*</b></span>
              <input v-model="form.time" :disabled="locked" placeholder="02:22.69" :class="{ invalid: fieldError('time') }" />
              <em v-if="fieldError('time')">{{ fieldError('time') }}</em>
              <small>"02:22.69" · "2:22.69" · "59.28"</small>
            </label>
            <label class="field wide">
              <span>이름 <b>*</b></span>
              <input v-model="form.name" :disabled="locked" placeholder="계영은 국가코드 또는 선수 이름을 이어 붙임" :class="{ invalid: fieldError('name') }" />
              <em v-if="fieldError('name')">{{ fieldError('name') }}</em>
            </label>
            <label class="field">
              <span>팀/국가</span>
              <input v-model="form.team" :disabled="locked" placeholder="강원특별자치도청 / KOR" />
            </label>
            <label class="field">
              <span>일자</span>
              <input v-model="form.datetime" :disabled="locked" type="date" :class="{ invalid: fieldError('datetime') }" />
              <em v-if="fieldError('datetime')">{{ fieldError('datetime') }}</em>
            </label>
            <label class="field wide">
              <span>장소/대회</span>
              <input v-model="form.location" :disabled="locked" placeholder="제107회 전국체육대회" />
            </label>
          </form>

          <!-- JSON 입력 -->
          <div v-show="tab === 'json'">
            <textarea v-model="jsonText" class="json-input" spellcheck="false" :disabled="locked" :placeholder="jsonExample"></textarea>
            <p class="hint">
              <template v-if="isEdit">수정은 기록 1건만 입력할 수 있습니다.</template>
              <template v-else>배열 <code>[ {...}, {...} ]</code> 또는 객체 1개, 한 번에 최대 500건. 같은 종류/성별/종목/코스/거리 기록이 있으면 교체, 없으면 추가됩니다.</template>
            </p>
            <details class="format-help">
              <summary>JSON 형식 보기</summary>
              <pre>{{ jsonExample }}</pre>
              <table>
                <thead><tr><th>필드</th><th>필수</th><th>값</th></tr></thead>
                <tbody>
                  <tr><td>type</td><td>O</td><td>WR(세계) · OR(올림픽) · AR(아시아) · KR(한국)</td></tr>
                  <tr><td>gender</td><td>O</td><td>men · women · mixed</td></tr>
                  <tr><td>discipline</td><td>O</td><td>FR BA BR FL IM FRR(계영) MR(혼계영)</td></tr>
                  <tr><td>course</td><td>O</td><td>LCM · SCM</td></tr>
                  <tr><td>distance</td><td>O</td><td>25M 50M 100M 200M 400M 800M 1500M</td></tr>
                  <tr><td>time</td><td>O</td><td>"02:22.69" · "2:22.69" · "59.28"</td></tr>
                  <tr><td>name</td><td>O</td><td>선수 이름 (계영은 국가코드/이어 붙인 이름)</td></tr>
                  <tr><td>team · datetime · location</td><td></td><td>소속 · "YYYY-MM-DD" · 장소/대회</td></tr>
                </tbody>
              </table>
            </details>
          </div>

          <!-- 형식 오류 (서버 검사 결과) -->
          <div v-if="errors.length" class="error-box">
            <p class="error-title">형식 오류 {{ errors.length }}건 — 고친 뒤 다시 update 를 눌러 주세요.</p>
            <ul>
              <li v-for="(e, i) in errors" :key="i">
                <strong v-if="e.index !== null && tab === 'json'">{{ e.index + 1 }}번째 항목</strong>
                <span v-if="e.field"> · {{ e.field }}</span>
                — {{ e.message }}
              </li>
            </ul>
          </div>
        </div>

        <footer class="drawer-footer">
          <button v-if="!isEdit" type="button" class="link-button mr-auto" :disabled="isSaving || locked" @click="fillExample">예시 넣기</button>
          <span v-else class="mr-auto"></span>
          <button type="button" class="button-cancel" :disabled="isSaving" @click="close">닫기</button>
          <button type="button" class="button-update" :disabled="isSaving || locked" @click="submit">
            {{ isSaving ? '반영 중...' : 'update' }}
          </button>
        </footer>
      </aside>
    </div>
  </Transition>

  <!-- 직접입력: 기존 기록과 비교한 갱신 여부를 확인하고, 체크한 것만 update -->
  <UpdateModal
    title="직접입력"
    hint="직접 입력한 기록이라 갱신·신규·정보변경은 기본 선택되고, 더 느려지는 정정은 확인 후 직접 체크하세요."
    :defaultChecked="['new', 'faster', 'info']"
    :show="showPreview"
    :items="previewItems"
    :isSaving="isSaving"
    @cancel="showPreview = false"
    @apply="applyChecked"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import recordApi from '~/api/recordApi';
import UpdateModal from './update_modal.vue';
import type { ManualError, RecordKey } from '~/api/recordApi';

const props = defineProps<{
  show: boolean;
  record?: Record<string, any> | null; // 표의 행. 없으면 직접입력(추가)
}>();
const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'done'): void;
}>();

const typeOptions = [
  { value: 'WR', label: 'WR (세계)' },
  { value: 'OR', label: 'OR (올림픽)' },
  { value: 'AR', label: 'AR (아시아)' },
  { value: 'KR', label: 'KR (한국)' },
];
const disciplineOptions = [
  { value: 'FR', label: '자유형' },
  { value: 'BA', label: '배영' },
  { value: 'BR', label: '평영' },
  { value: 'FL', label: '접영' },
  { value: 'IM', label: '개인혼영' },
  { value: 'FRR', label: '계영' },
  { value: 'MR', label: '혼계영' },
];
const distanceOptions = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'];

const FIELDS = ['type', 'gender', 'discipline', 'course', 'distance', 'time', 'name', 'team', 'datetime', 'location'] as const;
type FormState = Record<(typeof FIELDS)[number], string>;
const emptyForm = (): FormState => ({ type: '', gender: '', discipline: '', course: '', distance: '', time: '', name: '', team: '', datetime: '', location: '' });

const jsonExample = `[
  {
    "type": "KR",
    "gender": "women",
    "discipline": "BR",
    "course": "LCM",
    "distance": "200M",
    "time": "02:22.69",
    "name": "박시은",
    "team": "강원특별자치도청",
    "datetime": "2026-09-24",
    "location": "제107회 전국체육대회"
  }
]`;

const tab = ref<'form' | 'json'>('form');
const form = ref<FormState>(emptyForm());
const jsonText = ref('');
const errors = ref<ManualError[]>([]);
const isSaving = ref(false);
const original = ref<RecordKey | null>(null); // 수정 시 수정 전 key
const showPreview = ref(false);   // 직접입력: 갱신 여부 확인 목록
const previewItems = ref<any[]>([]);
const pendingPayload = ref<unknown>(null); // 확인한 입력 (체크한 것만 반영할 때 다시 보냄)

const isEdit = computed(() => !!props.record);
// 전문체육(WR/OR/AR/KR) 기록만 입력/수정할 수 있다. 마스터즈 기록은 보기만.
const readonlyReason = computed(() =>
  props.record && props.record.isMasters
    ? '마스터즈 기록(KMR/WMR/ER)은 이 화면에서 수정할 수 없습니다. (전문체육 WR/OR/AR/KR 기록만 수정 가능)'
    : '');
const locked = computed(() => !!readonlyReason.value);
const originalKeyText = computed(() =>
  original.value ? `${original.value.type} · ${original.value.gender} · ${original.value.discipline} · ${original.value.course} · ${original.value.distance}` : '');

// 열 때마다 초기화: 행이 있으면 그 값으로 채우고, 없으면 비운다(JSON 입력 내용은 직접입력일 때만 유지)
watch(() => [props.show, props.record], () => {
  if (!props.show) return;
  errors.value = [];
  tab.value = 'form';
  if (props.record) {
    const r = props.record;
    form.value = {
      type: r.type ?? '', gender: r.gender ?? '', discipline: r.discipline ?? '', course: r.course ?? '', distance: r.distance ?? '',
      time: r.time ?? '', name: r.name ?? '', team: r.team ?? '', datetime: r.datetime ?? '', location: r.location ?? '',
    };
    original.value = { type: form.value.type, gender: form.value.gender, discipline: form.value.discipline, course: form.value.course, distance: form.value.distance };
    jsonText.value = toJsonText();
  } else {
    original.value = null;
    form.value = emptyForm();
  }
}, { immediate: true });

// 서버 오류 중 해당 필드의 메시지 (form 탭은 항상 1건이라 index 0)
const fieldError = (field: string) => errors.value.find((e) => e.field === field)?.message ?? '';

// form -> JSON 문자열 (비어 있는 선택 항목은 뺀다)
function toJsonText(): string {
  const record: Record<string, string> = {};
  for (const key of FIELDS) {
    const v = form.value[key].trim();
    if (v) record[key] = v;
  }
  return JSON.stringify([record], null, 2);
}

function switchTab(next: 'form' | 'json') {
  if (next === tab.value) return;
  errors.value = [];
  if (next === 'json') {
    // form 에 입력한 내용이 있으면 JSON 으로 옮긴다 (아무것도 안 썼으면 JSON 입력 내용을 그대로 둔다)
    if (isEdit.value || FIELDS.some((k) => form.value[k].trim())) jsonText.value = toJsonText();
  } else {
    // JSON 이 기록 1건이면 form 으로 옮긴다
    try {
      const parsed = JSON.parse(jsonText.value);
      const item = Array.isArray(parsed) ? (parsed.length === 1 ? parsed[0] : null) : parsed;
      if (item && typeof item === 'object') {
        for (const key of FIELDS) if (item[key] !== undefined && item[key] !== null) form.value[key] = String(item[key]);
      }
    } catch { /* JSON 이 완성되지 않았으면 form 은 그대로 */ }
  }
  tab.value = next;
}

const fillExample = () => {
  jsonText.value = jsonExample;
  errors.value = [];
};

const close = () => { if (!isSaving.value) emit('cancel'); };

async function submit() {
  if (locked.value) return;
  errors.value = [];

  // 1) 입력 -> 기록 배열 (form 탭은 1건, JSON 탭은 JSON 문법을 먼저 확인)
  let payload: unknown;
  if (tab.value === 'form') {
    const record: Record<string, string> = {};
    for (const key of FIELDS) {
      const v = form.value[key].trim();
      if (v) record[key] = v;
    }
    payload = [record];
  } else {
    try {
      payload = JSON.parse(jsonText.value);
    } catch (e: any) {
      errors.value = [{ index: null, field: null, message: `JSON 문법 오류: ${e.message}` }];
      return;
    }
  }

  // 2-a) 직접입력(추가): 형식 검사 + 기존 기록과 비교해 갱신 여부를 보여주고, 체크한 것만 update
  if (!isEdit.value) {
    isSaving.value = true;
    try {
      const response = await recordApi.checkManual(payload);
      if (response.errors && response.errors.length > 0) {
        errors.value = response.errors;
        return;
      }
      if (response.message) {
        errors.value = [{ index: null, field: null, message: response.message }];
        return;
      }
      if (!response.data || response.data.length === 0) {
        alert(`변경할 기록이 없습니다. 입력한 ${response.unchanged ?? 0}건이 모두 기존 기록과 같습니다.`);
        return;
      }
      pendingPayload.value = payload;
      previewItems.value = response.data;
      showPreview.value = true;
    } finally {
      isSaving.value = false;
    }
    return;
  }

  // 2-b) 표의 행 수정: 서버가 형식을 검사 -> 이상 없으면 바로 반영
  isSaving.value = true;
  try {
    const response = await recordApi.applyManual(payload, original.value ?? undefined);
    if (response.errors && response.errors.length > 0) {
      errors.value = response.errors;
      return;
    }
    if (response.message) {
      errors.value = [{ index: null, field: null, message: response.message }];
      return;
    }
    alert(response.updated ? '수정했습니다.' : '변경된 내용이 없습니다.');
    emit('done');
  } finally {
    isSaving.value = false;
  }
}

// 미리보기 목록에서 체크한 기록만 반영
async function applyChecked(keys: string[]) {
  isSaving.value = true;
  try {
    const response = await recordApi.applyManual(pendingPayload.value, undefined, keys);
    if (response.errors && response.errors.length > 0) {
      showPreview.value = false;
      errors.value = response.errors;
      return;
    }
    if (response.message) {
      alert(response.message);
      return;
    }
    alert(`${(response.inserted ?? 0) + (response.updated ?? 0)}건 업데이트했습니다. (추가 ${response.inserted ?? 0} · 교체 ${response.updated ?? 0})`);
    showPreview.value = false;
    form.value = emptyForm();
    jsonText.value = '';
    emit('done');
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}
.drawer {
  width: min(520px, 100vw);
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
}
.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px 8px;
}
.drawer-title { font-size: 18px; font-weight: 700; }
.drawer-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
.close-button { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; padding: 0 4px; }
.close-button:disabled { opacity: 0.4; cursor: not-allowed; }

.notice {
  margin: 0 20px 8px;
  padding: 8px 10px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  font-size: 12px;
  color: #92400e;
}

.tabs { display: flex; gap: 4px; padding: 0 20px; border-bottom: 1px solid #e5e7eb; }
.tab {
  padding: 8px 14px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}
.tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 700; }

.drawer-body { flex: 1; overflow: auto; padding: 16px 20px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 14px; }
.field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
.field.wide { grid-column: 1 / -1; }
.field span { font-weight: 700; color: #374151; }
.field span b { color: #dc2626; }
.field select, .field input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}
.field select:disabled, .field input:disabled { background: #f3f4f6; color: #6b7280; }
.field .invalid { border-color: #dc2626; background: #fef2f2; }
.field em { color: #dc2626; font-style: normal; font-size: 11px; }
.field small { color: #9ca3af; font-size: 11px; }

.json-input {
  width: 100%;
  height: 320px;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.5;
  resize: vertical;
}
.hint { margin-top: 6px; font-size: 11px; color: #6b7280; }

.format-help { margin-top: 10px; font-size: 12px; }
.format-help summary { cursor: pointer; font-weight: 700; color: #374151; }
.format-help pre {
  margin: 8px 0;
  padding: 10px;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  overflow: auto;
}
.format-help table { width: 100%; border-collapse: collapse; }
.format-help th, .format-help td { border: 1px solid #d1d5db; padding: 4px 8px; text-align: left; vertical-align: top; }
.format-help th { background: #e5e7eb; }

.error-box {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #fca5a5;
  background: #fef2f2;
  border-radius: 4px;
  font-size: 12px;
  color: #991b1b;
}
.error-title { font-weight: 700; margin-bottom: 4px; }
.error-box li { margin: 2px 0; }

.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid #e5e7eb;
}
.drawer-footer button { flex: none; white-space: nowrap; padding: 8px 14px; border-radius: 4px; font-size: 14px; cursor: pointer; border: none; }
.button-cancel { background: #e5e7eb; color: #333; width: 80px; }
.button-update { background: #3498db; color: #fff; width: 110px; }
.drawer-footer button:disabled { opacity: 0.5; cursor: not-allowed; }
.link-button { background: none; color: #2563eb; font-size: 13px; padding: 0; width: auto; }

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 0.2s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
</style>
