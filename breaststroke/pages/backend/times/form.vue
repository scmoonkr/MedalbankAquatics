<template>
	<div class="space-y-3">
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

		<div class="items-start">
			<FilterTimes
				:options="filter"
				@change-discipline="onFilterChange"
			/>
		</div>
		<!------------------------------------------>
		<!----------------timeID, athleteID, name----------------->
		<!------------------------------------------>
		<div class="flex space-x-3">      
			<div class="w-[250px]">
				<label class="form-label">timeID</label>
				<input
					type="text"
					v-model="thisForm.timeID"
					required
					placeholder="timeID"
					class="form-input text-xl font-bold"
				/>
			</div>       
			<div class="w-[250px]">
				<label class="form-label">athleteID</label>
				<input
					type="text"
					v-model="thisForm.athleteID"
					required
					placeholder="athleteID"
					class="form-input text-xl font-bold"
					readonly
				/>
			</div>  
			<div class="w-[400px]">
				<label class="form-label">{{thisForm.timeORG || 'time'}}</label>
				<input
					type="text"
					v-model="thisForm.time"
					required
					placeholder="time"
					class="form-input text-2xl font-bold"
				/>
			</div>
			<div class="relative w-full">
				<label class="form-label">name</label>
				<input
					type="text"
					v-model="thisForm.name"
					required
					placeholder="name"
					class="form-input pr-10 text-2xl font-bold"
        	@keyup.enter="searchAthlete"
				/>
				<button
						type="button"
						@click="searchAthlete"
						class="absolute inset-y-0 pt-6 right-1 flex items-center pr-2 text-gray-400 hover:text-gray-600"
				>
						<i class="fas fa-search"></i>
				</button>
			</div>
		</div>
		<div v-if="isSearchAthlete" class="button-group-filters mt-1">
			<button v-for="athlete in athleteNames" :key="athlete.athleteID" class="button-group-filters mt-1" @click="selectAthlete(athlete)">
      {{ athlete.name }}#{{ athlete.athleteID }}
    </button>
		</div>

		<!------------------------------------------>
		<!------------course, sido------------------>
		<!------------------------------------------>
		<div class="flex space-x-3"> 
			<div class="w-6/12">
				<label class="form-label">ageGroup</label>
				<input
					type="text"
					v-model="thisForm.ageGroup"
					required
					placeholder="ageGroup"
					class="form-input text-2xl font-bold"
				/>
			</div> 
			<!-- <div class="w-3/12">
				<label class="form-label">time</label>
				<input
					type="text"
					v-model="thisForm.time"
					required
					placeholder="time"
					class="form-input text-2xl font-bold"
				/>
			</div> -->
			<div class="w-2/12">
				<label class="form-label">rank</label>
				<input
					type="text"
					v-model="thisForm.rank"
					required
					placeholder="rank"
					class="form-input text-2xl font-bold"
				/>
			</div>    
			<div class="w-4/12">
				<label class="form-label">datetime</label>
				<input
					type="text"
					v-model="thisForm.datetime"
					required
					placeholder="datetime"
					class="form-input text-2xl font-bold"
				/>
			</div>   
		</div>

		<!------------------------------------------>
		<!-------------------pool------------------->
		<!------------------------------------------>
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
				:name="poolName"
				@select-pool="selectPool"
			/>
		</div>


		<!------------------------------------------>
		<!------------competition------------------->
		<!------------------------------------------>
		<div class="flex space-x-3">      
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
			<div class="relative w-full">
				<label class="form-label">대회명</label>
				<input
					type="text"
					v-model="thisForm.competitionName"
					required
					placeholder="대회명"
					class="form-input pr-10"
        	@keyup.enter="searchCompetition"
				/>
				<button
						type="button"
						@click="searchCompetition"
						class="absolute inset-y-0 pt-6 right-1 flex items-center pr-2 text-gray-400 hover:text-gray-600"
				>
						<i class="fas fa-search"></i>
				</button>
			</div>
		</div>
		<div v-if="isSearchCompetition">
			<div v-if="competitionStore.searchNames.length > 0" class="button-group-filters mt-1">
				<button v-for="item in competitionStore.searchNames" :key="item.competitionID" class="button-group-filters mt-1" @click="selectCompetition(item)">
					{{ item.fullname }}
				</button>		
			</div>
		</div>
		<div v-if="thisForm.stemID" class="flex space-x-3">  
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
			<div class="w-full">
				<label class="form-label">stem</label>
				<input
					type="text"
					v-model="thisForm.stem"
					required
					placeholder="stem"
					class="form-input"
				/>
			</div>
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
				<label class="form-label">team</label>
				<input
					type="text"
					v-model="thisForm.team"
					required
					placeholder="team"
					class="form-input pr-10"
        	@keyup.enter="searchTeam"
				/>
				<button
						type="button"
						@click="searchTeam"
						class="absolute inset-y-0 pt-6 right-1 flex items-center pr-2 text-gray-400 hover:text-gray-600"
				>
						<i class="fas fa-search"></i>
				</button>
			</div>
		</div>
		<div v-if="isSearchTeam">
			<div v-if="teamStore.searchNames.length > 0" class="button-group-filters mt-1">
				<button v-for="item in teamStore.searchNames" :key="item.teamID" class="button-group-filters mt-1" @click="selectTeam(item)">
					{{ item.name }}
				</button>		
			</div>
		</div>

		<!------------------------------------------>
		<!------------course, sido------------------>
		<!------------------------------------------>
		<div class="flex space-x-3">  
			<div class="w-1/4">
				<label class="form-label">status</label>
				<input
					type="text"
					v-model="thisForm.status"
					required
					placeholder="status"
					class="form-input"
				/>
			</div>
			<div class="w-1/4">
				<label class="form-label">시도</label>
				<select v-model="thisForm.sido"
					class="form-input"
				>
					<option v-for="sido in sidoTable" :key="sido.value" :value="sido.value">
						{{ sido.label }}
					</option>
				</select>
			</div>     
			<div class="w-1/4">
				<label class="form-label">{{ thisForm.source || 'source' }}</label>
				<select v-model="thisForm.source"
					class="form-input"
				>
					<option value="">전체</option>
					<option value="KSF">KSF</option>
					<option value="WA">WA</option>
					<option value="MR">MR</option>
					<option value="MR">MyRanking</option>
					<option value="MB">Medalbank</option>
				</select>
			</div> 
 
			<div class="w-1/4">
				<label class="form-label">round</label>
				<select v-model="thisForm.round"
					class="form-input"
				>
					<option v-for="round in roundsEngKor" :key="round.eng" :value="round.eng">
						{{ round.kor }}
					</option>
				</select>
			</div>   
		</div>
	</div>
	
  <TheTooltipConfirm :show="showTooltip" :message="showMessage" @update:show="confirmDelete" />
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { TimeType, SwimStyle, Gender, SwimCourse, Distance } from '~/types/common';
import  { type TimeFilter } from '~/types/times';
import { useTimeStore } from '~/stores/times';
import { useCompetitionStore } from '~/stores/competitions';
const { success, error, warning, info } = useToast()
import { useTeamStore } from '~/stores/teams';
import  { TimeModel } from '~/models/times';
import  { TeamModel } from '~/models/teams';
import  { CompetitionModel } from '~/models/competitions';
import SearchPool from './SearchPool.vue';
// import SearchAthlete from './SearchAthlete.vue';
import FilterTimes from './filter_times.vue';
// import SearchStem from './SearchStem.vue';
import TheTooltipConfirm from '~/components/common/TheTooltipRun.vue';
//-----> components

const competitionStore = useCompetitionStore();
const timeStore = useTimeStore();
const teamStore = useTeamStore();

const isSearchAthlete = ref(false);
const athleteNames = ref<TimeModel[]>([]);

const showTooltip = ref(false);
const showMessage = ref('');

const isSearchCompetition = ref(false);
const competitionName = ref("");

const isSearchTeam = ref(false);
const teamName = ref("");

const poolName = ref("");
const isSearchPool = ref(false);

const filter = ref<TimeFilter>({
  isMasters: true,
  isAdult: true,
  gender: 'women',
  style: 'breaststroke',
  distance: '50M',
  course: 'LCM',
  type: 'event',
});
// 상태 관리
const thisForm = ref<TimeModel>(TimeModel.initialize());


const props = defineProps({
	form: {
    type: Object as PropType<TimeModel>,
    required: false,
    default: () => TimeModel.initialize(),
  },
});

const emit = defineEmits([
  'save-form',
  'delete-form',
]);

watch(() => props.form, (newForm: TimeModel) => {
  if (newForm.name) {
    thisForm.value = newForm; // JSON.parse(JSON.stringify(newForm));
		if (newForm.style) filter.value.style = newForm.style;
		if (newForm.gender) filter.value.gender = newForm.gender;
		if (newForm.course) filter.value.course = newForm.course;
		if (newForm.distance) filter.value.distance = newForm.distance;
		if (newForm.isMasters) filter.value.isMasters = newForm.isMasters;
		if (newForm.isAdult) filter.value.isAdult = newForm.isAdult;
		if (newForm.type) filter.value.type = newForm.type;
  }
		console.log("form.watch.filters=", filter.value, newForm);
}, { immediate: true });
//======================================================================
// Button
//======================================================================
const onFilterChange = (options: any, field: string) => {
	// console.log("form.onFilterChange=", options[field], field);
	if (JSON.stringify(filter.value) !== JSON.stringify(options)) {
    filter.value = options;
    (thisForm as any).value[field] = options[field];
  }

	(thisForm as any).value[field] = options[field];
}
const clickSave = () => {
	// console.log("save=", thisForm.value);
  // validate form

	if (!thisForm.value.style) thisForm.value.style = filter.value.style as SwimStyle;
	if (!thisForm.value.gender) thisForm.value.gender = filter.value.gender as Gender;
	if (!thisForm.value.course) thisForm.value.course = filter.value.course as SwimCourse;
	if (!thisForm.value.distance) thisForm.value.distance = filter.value.distance as Distance;
	if (!thisForm.value.isMasters) thisForm.value.isMasters = filter.value.isMasters;
	if (!thisForm.value.isAdult) thisForm.value.isAdult = filter.value.isAdult;
	if (!thisForm.value.type) thisForm.value.type = filter.value.type!;

	let errors = [];
	if (!thisForm.value.name) errors.push("name");
	if (!thisForm.value.time) errors.push("time");
	if (!thisForm.value.poolID) errors.push("poolID");
	if (!thisForm.value.datetime) errors.push("datetime");
	if (thisForm.value.type=='event' && !thisForm.value.competitionID) errors.push("competitionID");
	if (errors.length > 0) {
		// showTooltip.value = true;
		// showMessage.value = errors.join(", ");
		error('field 입력을 확인하세요.', errors.join(", "), { duration: 1000, showProgress: true  })
		return;
	}

	emit('save-form', thisForm.value);
};
const clickClear = () => {
	// console.log("click clear");
	thisForm.value = TimeModel.initialize();
};
const confirmDelete = (value: boolean) => {
    showTooltip.value = false;
    if (value) {
			emit('delete-form', thisForm.value.timeID);
			clickClear();
    }
}
const clickDelete= () => {
	if (thisForm.value.competitionID == 0) {
		error('Time 삭제', '삭제할 Time을 선택하세요 확인하세요.', { duration: 1000, showProgress: true  })
		return;
	}
	showTooltip.value = true;
	showMessage.value = `'${thisForm.value.name}' 삭제 하시겠습니까?`;
};
const searchPool= () => {
	poolName.value = thisForm.value.pool!;
	isSearchPool.value = true;
	// console.log("searchPool");
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
const searchAthlete= async () => {
	// athleteName.value = thisForm.value.name;
	isSearchAthlete.value = true;
	// console.log("searchAthlete");
	// emit('delete-form', thisForm.value.competitionID);
	athleteNames.value = await timeStore.searchAthleteName(thisForm.value.name);
	// console.log(">>>names=", athleteNames.value);
};
const selectAthlete = (athlete: any) => {
	thisForm.value.name = athlete.name;
	thisForm.value.athleteID = athlete.athleteID;

	isSearchAthlete.value = false;	
	poolName.value = '';
};
const searchCompetition = async () => {
	// athleteName.value = thisForm.value.name;
	isSearchCompetition.value = true;
	// console.log("searchAthlete", thisForm.value.competitionName);
	// emit('delete-form', thisForm.value.competitionID);
	await competitionStore.fetchCompetitionNames(thisForm.value.competitionName!);
	// console.log(">>>names=", competitionStore.searchNames);
};
const selectCompetition = (competition: any) => {
	thisForm.value.competitionName = competition.fullname;
	thisForm.value.competitionID = competition.competitionID;
	if (competition.pool) thisForm.value.pool = competition.pool;
	if (competition.poolID) thisForm.value.poolID = competition.poolID;
	if (competition.stem) thisForm.value.stem = competition.stem;
	if (competition.stemID) thisForm.value.stemID = competition.stemID;
	if (competition.sido) thisForm.value.sido = competition.sido;
	if (competition.dateStart) thisForm.value.datetime = competition.dateStart;

	isSearchCompetition.value = false;	
	poolName.value = '';
};
const searchTeam = async () => {
	// athleteName.value = thisForm.value.name;
	isSearchTeam.value = true;
	// console.log("searchAthlete");
	// emit('delete-form', thisForm.value.competitionID);
	const names = await teamStore.fetchTeamNames(thisForm.value.team!);
	// console.log(">>>names=", teamStore.searchNames);
};
const selectTeam = (team: any) => {
	thisForm.value.team = team.name;
	thisForm.value.teamID = team.teamID;

	isSearchTeam.value = false;	
	poolName.value = '';
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

.text-xl {
    font-size: 1.2rem;      /* 24px, 특이도: 010 */
}

.text-2xl {
    font-size: 1.5rem;      /* 24px, 특이도: 010 */
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