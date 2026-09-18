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

		<div class="flex space-x-3">      
			<div class="w-[80px]">
				<label class="form-label">aid</label>
				<input
					type="text"
					v-model="thisForm.athleteID"
					required
					placeholder="aid"
					class="form-input"
					readonly
				/>
			</div>    
			<div class="relative w-full">
				<label class="form-label">선수명</label>
				<input
					type="text"
					v-model="thisForm.name"
					required
					placeholder="선수명"
					class="form-input pr-10"
				/>
			</div>
		</div>

		<div class="flex space-x-3">
			<div class="relative w-1/4">
				<label class="form-label">성별</label>
				<select v-model="thisForm.gender"
					class="form-input"
				>
					<option v-for="gender in gendersTable" :key="gender.value" :value="gender.value">
						{{ gender.label }}
					</option>
				</select>
			</div>  
			<div class="relative w-1/4">
				<label class="form-label">dob</label>
				<input
					type="text"
					v-model="thisForm.dob"
					required
					placeholder="dob"
					class="form-input pr-10"
				/>
			</div>
			<div class="relative w-2/4">
				<label class="form-label">ageGroup</label>
				<input
					type="text"
					v-model="thisForm.ageGroup"
					required
					placeholder="ageGroup"
					class="form-input pr-10"
				/>
			</div>
		</div>
		 
		<div class="flex space-x-3">
			<div class="relative w-1/2">
				<label class="form-label">phone</label>
				<input
					type="text"
					v-model="thisForm.phone"
					required
					placeholder="phone"
					class="form-input pr-10"
				/>
			</div>
			<div class="relative w-1/2">
				<label class="form-label">joined</label>
				<input
					type="text"
					v-model="thisForm.joined"
					required
					placeholder="joined"
					class="form-input pr-10"
				/>
			</div>
		</div>
			
		<div class="relative w-full">
			<label class="form-label">featured</label>
			<input
				type="text"
				v-model="thisForm.featured"
				required
				placeholder="featured"
				class="form-input pr-10"
			/>
		</div>
			
		<div class="relative w-full">
			<label class="form-label">featuredBB</label>
			<input
				type="text"
				v-model="thisForm.featuredBB"
				required
				placeholder="featuredBB"
				class="form-input pr-10"
			/>
		</div>
			
		<div class="relative w-full">
			<label class="form-label">squares</label>
			<input
				type="text"
				v-model="thisForm.squares"
				required
				placeholder="squares"
				class="form-input pr-10"
			/>
		</div>

		<div class="flex">
			<img
				:src="getImageURL(thisForm.featured)"
				:alt="thisForm.name"
				class="w-40"
			/>
		</div>
	</div>
  <TheTooltipConfirm :show="showTooltip" :message="showMessage" @update:show="confirmDelete" />
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
const { success, error, warning, info } = useToast()
import  { AthleteModel } from '~/models/athletes';
import { useAthleteStore } from '~/stores/athletes';
import { useAuthStore } from '~/stores/useAuthStore';
import TheTooltipConfirm from '~/components/common/TheTooltipRun.vue';

const router = useRouter();

const authStore = useAuthStore();
const athleteStore = useAthleteStore();

const genders = ['남자', '여자'];
// 상태 관리
const thisForm = ref<AthleteModel>(new AthleteModel());


const props = defineProps({
	form: {
    type: Object as PropType<AthleteModel>,
    required: false,
    default: () => new AthleteModel()
  },
});

const emit = defineEmits([
  'save-form',
  'delete-form',
]);
const showTooltip = ref(false);
const showMessage = ref('');

watch(() => props.form, (newForm: AthleteModel | undefined) => {
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
	thisForm.value = new AthleteModel();
};
const confirmDelete = (value: boolean) => {
    showTooltip.value = false;
    if (value) {
			emit('delete-form', thisForm.value.athleteID);
			clickClear();
    }
}
const clickDelete= () => {
	if (thisForm.value.athleteID == 0) {
		error('선수 삭제', '삭제할 선수명을 선택하세요 확인하세요.', { duration: 1000, showProgress: true  })
		return;
	}
	showTooltip.value = true;
	showMessage.value = `'${thisForm.value.name}' 삭제 하시겠습니까?`;
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