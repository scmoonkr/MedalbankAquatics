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

		<div class="flex space-x-3 pb-3">      
			<div class="w-[80px]">
				<label class="form-label">cid</label>
				<input
					type="text"
					v-model="thisForm.competitionID"
					required
					placeholder="cid"
					class="form-input"
					readonly
				/>
			</div>   
			<div class="flex-1">
				<label class="form-label">대회명</label>
				<input
					type="text"
					v-model="thisForm.fullname"
					required
					placeholder="대회명"
					class="form-input"
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

		<div class="flex space-x-3 pb-3">      
			<div class="w-1/2">
				<label class="form-label">dateStart</label>
				<input
					type="text"
					v-model="thisForm.dateStart"
					required
					placeholder="dateStart"
					class="form-input"
				/>
			</div>    
			<div class="w-1/2">
				<label class="form-label">dateEnd</label>
				<input
					type="text"
					v-model="thisForm.dateEnd"
					required
					placeholder="dateEnd"
					class="form-input"
				/>
			</div>
		</div>

		<div class="flex space-x-3 pb-3">      
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
				<label class="form-label">pool</label>
				<input
					type="text"
					v-model="thisForm.pool"
					required
					placeholder="pool"
					class="form-input pr-10"
					@keyup.enter="searchPool"
				/>
				<button
						type="button"
						@click="searchPool"
						class="absolute inset-y-0 pt-6 right-1 flex items-center pr-2 text-gray-400 hover:text-gray-600"
				>
						<i class="fas fa-search"></i>
				</button>
			</div>
		</div>
		<div v-if="isSearchPool">
			<SearchPool
				:poolName="poolName"
				@select-pool="selectPool"
			/>
		</div>

		<div class="flex space-x-3 pb-3">      
			<div class="w-[80px]">
				<label class="form-label">stemID</label>
				<input
					type="text"
					v-model="thisForm.stemID"
					required
					placeholder="stemID"
					class="form-input"
					readonly
				/>
			</div>    
			<div class="relative w-full">
				<label class="form-label">stem</label>
				<input
						type="text"
						v-model="thisForm.stem"
						required
						placeholder="stem"
						class="form-input pr-10"
        		@keyup.enter="searchStem"
				/>
				<button
						type="button"
						@click="searchStem"
						class="absolute inset-y-0 right-0 pt-6 flex items-center pr-2 text-gray-400 hover:text-gray-600"
				>
						<i class="fas fa-search"></i>
				</button>
			</div>
		</div>
		<div v-if="isSearchStem">
			<SearchStem
				:stemName="stemName"
				@select-stem="selectStem"
			/>
		</div>

	</div>
  <TheTooltipConfirm :show="showTooltip" :message="showMessage" @update:show="confirmDelete" />
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
const { success, error, warning, info } = useToast()
import  { CompetitionModel } from '~/models/competitions';
import TheTooltipConfirm from '~/components/common/TheTooltipRun.vue';
import SearchPool from './SearchPool.vue';
import SearchStem from './SearchStem.vue';

const stemName = ref("");
const isSearchStem = ref(false);
const poolName = ref("");
const isSearchPool = ref(false);
const showTooltip = ref(false);
const showMessage = ref('');
const sidos = ['전국', '서울', '부산', '인천', '경기', '대구', '광주', '울산', '대전', '세종', '제주', '강원', '충남', '충북', '경남', '경북', '전남', '전북', '해외'];
// 상태 관리
const thisForm = ref<CompetitionModel>(CompetitionModel.initialize());


const props = defineProps({
	form: {
    type: Object as PropType<CompetitionModel>,
    required: false,
    default: () => CompetitionModel.initialize(),
  },
});

const emit = defineEmits([
  'save-form',
  'delete-form',
]);

watch(() => props.form, (newForm: CompetitionModel | undefined) => {
  if (newForm) {
    thisForm.value = JSON.parse(JSON.stringify(newForm));
  }
}, { immediate: true });
//======================================================================
// Button
//======================================================================

const clickSave = () => {
	
	let errors = [];
	if (!thisForm.value.fullname) errors.push("fullname");
	if (!thisForm.value.dateStart) errors.push("dateStart");
	if (!thisForm.value.pool) errors.push("pool");
	if (!thisForm.value.poolID) errors.push("poolID");
	if (errors.length > 0) {
		error('field 입력을 확인하세요.', errors.join(", "), { duration: 1000, showProgress: true  })
		return;
	}

	emit('save-form', thisForm.value);
};
const clickClear = () => {
	thisForm.value = CompetitionModel.initialize();
};
const confirmDelete = (value: boolean) => {
    showTooltip.value = false;
    if (value) {
			emit('delete-form', thisForm.value.competitionID);
			clickClear();
    }
}
const clickDelete= () => {
	if (thisForm.value.competitionID == 0) {
		error('대회 삭제', '삭제할 대회를 선택하세요 확인하세요.', { duration: 1000, showProgress: true  })
		return;
	}
	showTooltip.value = true;
	showMessage.value = `'${thisForm.value.fullname}' 삭제 하시겠습니까?`;
};
const searchPool= () => {
	if (thisForm.value.pool.length == 0) return;
	poolName.value = thisForm.value.pool;
	isSearchPool.value = true;
	// emit('delete-form', thisForm.value.competitionID);
};
const selectPool = (pool: any) => {
	thisForm.value.pool = pool.name;
	thisForm.value.poolID = pool.poolID;
	if (pool.sido) thisForm.value.sido = pool.sido;
	if (pool.course) thisForm.value.course = pool.course;

	isSearchPool.value = false;	
	poolName.value = '';
};

const searchStem= () => {
	if (thisForm.value.stem.length == 0) return;
	stemName.value = thisForm.value.stem;
	isSearchStem.value = true;
	// emit('delete-form', thisForm.value.competitionID);
};
const selectStem = (stem: any) => {
	thisForm.value.stem = stem.stem;
	thisForm.value.stemID = stem.stemID;

	isSearchStem.value = false;	
	stemName.value = '';
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