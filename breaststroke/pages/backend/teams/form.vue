<template>
	<div class="space-y-5">
		<div class="flex space-x-3 justify-end">
			<!-- <div>
				<input
					type="text"
					v-model="thisForm.teamID"
					placeholder="tid"
					class="form-input"
					readonly 
				/>
			</div> -->
			<button
				type="button"
				@click="clickSave"
				class="form-button w-1/5"
				title="저장"
			>
				<strong>저장</strong>
			</button>

			<button
				type="button"
				@click="clickClear"
				class="form-button w-1/5"
				title="지우기"
			>
				<strong>지우기</strong>
			</button>

			<button
				type="button"
				@click="clickDelete"
				class="form-button w-1/5"
				title="삭제"
			>
				<strong>삭제</strong>
			</button>

			<button
				type="button"
				@click="clickMergee"
				class="form-button w-1/5"
				title="Merge"
			>
				<strong>Merge</strong>
			</button>
		</div>

		

		<!------------------------------------------>
		<!-------------------team------------------->
		<!------------------------------------------>
		<div class="flex space-x-3">      
			<div class="w-[80px]">
				<label class="form-label">teamID</label>
				<input
					type="text"
					v-model="thisForm.teamID"
					required
					placeholder="teamID"
					class="form-input"
					readonly
				/>
			</div>    
			<div class="relative w-full">
				<label class="form-label">팀명</label>
				<input
					type="text"
					v-model="thisForm.name"
					required
					placeholder="팀명"
					class="form-input pr-10"
				/>
			</div>
		</div>

		<div>
			<label class="form-label">팀code</label>
			<input
				type="text"
				v-model="thisForm.teamCode"
				required
				placeholder="팀code"
				class="form-input w-[300px]"
			/>
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
import  { TeamModel } from '~/models/teams';
import { usePoolStore } from '~/stores/pools';
import { useAuthStore } from '~/stores/useAuthStore';
import TheTooltipConfirm from '~/components/common/TheTooltipRun.vue';
// 상태 관리
const thisForm = ref<TeamModel>(new TeamModel(0, '', [], '')); // teamID, name, names, teamCode


const props = defineProps({
	form: {
    type: Object as PropType<TeamModel>,
    required: false,
    default: () => new TeamModel(0, '', [], '') // teamID, name, names, teamCode
  },
});

const emit = defineEmits([
  'save-form',
  'delete-form',
  'merge-form',
]);
const showTooltip = ref(false);
const showMessage = ref('');

watch(() => props.form, (newForm: TeamModel | undefined) => {
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
	let errors = [];
	if (!thisForm.value.name) errors.push("name");
	if (errors.length > 0) {
		error('field 입력을 확인하세요.', errors.join(", "), { duration: 1000, showProgress: true  })
		return;
	}
	thisForm.value = new TeamModel(0, '', [], '') // teamID, name, names, teamCode
};
const confirmDelete = (value: boolean) => {
	showTooltip.value = false;
	if (value) {
		emit('delete-form', thisForm.value.teamID);
		clickClear();
	}
}
const clickDelete= () => {
	if (thisForm.value.teamID == 0) {
		error('팀 삭제', '삭제할 팀을 선택하세요 확인하세요.', { duration: 1000, showProgress: true  })
		return;
	}
	showTooltip.value = true;
	showMessage.value = `'${thisForm.value.name}' 삭제 하시겠습니까?`;
};
const clickMergee= () => {
	emit('merge-form', thisForm.value.teamID);
	clickClear();
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
  padding: 5px;
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
  padding: 5px 10px;
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