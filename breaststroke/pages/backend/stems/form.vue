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

		<div>
			<label class="form-label">stemID</label>
			<input
				type="text"
				v-model="thisForm.stemID"
				required
				placeholder="stemID"
				class="form-input w-[300px]"
				readonly
			/>
		</div>

		<div>
			<label class="form-label">stem</label>
			<input
				type="text"
				v-model="thisForm.stem"
				required
				placeholder="stem"
				class="form-input w-[300px]"
			/>
		</div>

		<div>
			<label class="form-label">competitions</label>
			<textarea
				id="three-line-textarea"
				v-model="competitions"
				rows="15"
				placeholder="competitions"
				class="form-textarea w-full"
				readonly
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
import  { StemModel } from '~/models/stems';
import { useStemStore } from '~/stores/stems';
import { useAuthStore } from '~/stores/useAuthStore';
import TheTooltipConfirm from '~/components/common/TheTooltipRun.vue';

const router = useRouter();

const authStore = useAuthStore();
const stemStore = useStemStore();

// 상태 관리
const showTooltip = ref(false);
const showMessage = ref('');
const thisForm = ref<StemModel>(new StemModel(0, '', [],));
const competitions = ref('');

const props = defineProps({
	form: {
    type: Object as PropType<StemModel>,
    required: false,
    default: () => new StemModel(0, '', [],)
  },
});

const emit = defineEmits([
  'save-form',
  'delete-form',
]);

watch(() => props.form, (newForm: StemModel | undefined) => {
  if (newForm) {
    thisForm.value = JSON.parse(JSON.stringify(newForm));
		if (thisForm.value.competitions) {
			competitions.value = thisForm.value.competitions.join('\n');
		}
  }
}, { immediate: true });
//======================================================================
// Button
//======================================================================

const clickSave = () => {
	let errors = [];
	if (!thisForm.value.stem) errors.push("stem");
	if (errors.length > 0) {
		error('field 입력을 확인하세요.', errors.join(", "), { duration: 1000, showProgress: true  })
		return;
	}
	emit('save-form', thisForm.value);
};
const clickClear = () => {
	competitions.value = '';
	thisForm.value = new StemModel(0, '', [],);
};
const confirmDelete = (value: boolean) => {
    showTooltip.value = false;
    if (value) {
			emit('delete-form', thisForm.value.stemID);
			clickClear();
    }
}
const clickDelete= () => {
	if (thisForm.value.stemID == 0) {
		error('Stem 삭제', '삭제할 Stem 선택하세요 확인하세요.', { duration: 1000, showProgress: true  })
		return;
	}
	showTooltip.value = true;
	showMessage.value = `'${thisForm.value.stem}' 삭제 하시겠습니까?`;
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