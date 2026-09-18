<template>
	<div class="space-y-5">
		<div class="flex space-x-3 justify-end">
			<button
				type="button"
				@click="clickSave"
				class="form-button w-[80px]"
				title="저장"
			>
				<strong>저장</strong>
			</button>

			<button
				type="button"
				@click="clickClear"
				class="form-button w-[80px]"
				title="지우기"
			>
				<strong>지우기</strong>
			</button>

			<button
				type="button"
				@click="clickDelete"
				class="form-button w-[80px]"
				title="삭제"
			>
				<strong>삭제</strong>
			</button>
		</div>

		<!-- <div>
			<label class="form-label">수영장명</label>
			<input
				type="text"
				v-model="thisForm.name"
				required
				placeholder="수영장명"
				class="form-input w-[300px]"
			/>
		</div> -->
		<div class="flex space-x-3">      
			<div class="w-[80px]">
				<label class="form-label">pid</label>
				<input
					type="text"
					v-model="thisForm.poolID"
					required
					placeholder="cid"
					class="form-input"
					readonly
				/>
			</div>    
			<div class="relative w-full">
				<label class="form-label">수영장명</label>
				<input
					type="text"
					v-model="thisForm.name"
					required
					placeholder="수영장명"
					class="form-input pr-10"
				/>
			</div>
		</div>


		<div>
			<label class="form-label mt-3">Course</label>
			<select v-model="thisForm.course"
				class="form-input"
			>
				<option value="">전체</option>
				<option value="LCM">LCM</option>
				<option value="SCM">SCM</option>
			</select>        
		</div>

		<div>
			<label class="form-label mt-3">시도</label>
			<select v-model="thisForm.sido"
				class="form-input"
			>
				<option v-for="sido in sidos" :key="sido" :value="sido">
					{{ sido }}
				</option>
			</select>
		</div>

		<div>
			<label class="form-label">Names</label>
			<textarea
				id="three-line-textarea"
				v-model="thisForm.names"
				rows="5"
				placeholder="names"
				class="form-textarea w-full"
			>
			</textarea>
		</div>
	</div>
  <TheTooltipConfirm :show="showTooltip" :message="showMessage" @update:show="confirmDelete" />
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
const { success, error, warning, info } = useToast()
import  { PoolModel } from '~/models/pools';
import { usePoolStore } from '~/stores/pools';
import { useAuthStore } from '~/stores/useAuthStore';
import TheTooltipConfirm from '~/components/common/TheTooltipRun.vue';

const router = useRouter();

const authStore = useAuthStore();
const poolStore = usePoolStore();

const sidos = ['전국', '서울', '부산', '인천', '경기', '대구', '광주', '울산', '대전', '세종', '제주', '강원', '충남', '충북', '경남', '경북', '전남', '전북', '해외'];
// 상태 관리
const thisForm = ref<PoolModel>(new PoolModel(0, '', [], '전국', 'LCM'));


const props = defineProps({
	form: {
    type: Object as PropType<PoolModel>,
    required: false,
    default: () => new PoolModel(0, '', [], '전국', 'LCM')
  },
});

const emit = defineEmits([
  'save-form',
  'delete-form',
]);
const showTooltip = ref(false);
const showMessage = ref('');

watch(() => props.form, (newForm: PoolModel | undefined) => {
  if (newForm) {
    thisForm.value = JSON.parse(JSON.stringify(newForm));
  }
}, { immediate: true });
//======================================================================
// Button
//======================================================================

const clickSave = () => {
	let errors = [];
	if (!thisForm.value.name) errors.push("name");
	if (errors.length > 0) {
		error('field 입력을 확인하세요.', errors.join(", "), { duration: 1000, showProgress: true  })
		return;
	}
	emit('save-form', thisForm.value);
};
const clickClear = () => {
	thisForm.value = new PoolModel(0, '', [], '전국', 'LCM');
};
const confirmDelete = (value: boolean) => {
    showTooltip.value = false;
    if (value) {
			emit('delete-form', thisForm.value.poolID);
			clickClear();
    }
}
const clickDelete= () => {
	if (thisForm.value.poolID == 0) {
		error('수영장 삭제', '삭제할 수영장을 선택하세요 확인하세요.', { duration: 1000, showProgress: true  })
		return;
	}
	showTooltip.value = true;
	showMessage.value = `'${thisForm.value.fullname}' 삭제 하시겠습니까?`;
};

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
/* 필요한 스타일을 추가하세요 */
.times-list-page {
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 3px;
  font-size: 12px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background-color: #c7f784;
  color: #333;
}

.form-button:hover {
  background-color: #d0d0d0;
}

</style>