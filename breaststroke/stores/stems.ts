// stores/stemsStore.ts
import { defineStore } from 'pinia';
import { StemModel } from '~/models/stems';
import stemApi from '~/api/stemApi';
import { StemSortField, } from '~/types/stems';
import type { StemFilter, StemNameSearchResults } from '~/types/stems';
import { SortDirection, } from '~/types/common';
import UI_CONFIG from '~/config/ui';
import type { PaginationOptions } from '~/types/common';

interface StemsState {
	stems: StemModel[];
	selectedStem: StemModel | null;
	isLoading: boolean;
	error: string | null;
	filters: StemFilter;
}

export const useStemStore = defineStore('stem', () => {

	// State
	const currentStem = ref<StemModel | null>(null);
	const stemList = ref<StemModel[]>([]);
	const searchNames = ref<StemNameSearchResults>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const rowsPerPage = ref<number | null>(5);
	const filter = ref<StemFilter>({
		stem: '',
		stemID: 0,
		sortField: 'dateStart',
		sortDirection: 'desc',
	});
	const sortField = ref<StemSortField>(StemSortField.STEM);
	const sortDirection = ref<SortDirection>(SortDirection.ASC);
	const pagination = ref<PaginationOptions>({
		currentPage: 1,
		rowsPerPage: UI_CONFIG.rowsPerPage,
		totalItems: 0,
		totalPages: 0
	});

	// Getters
	const filteredStemList = computed(() => {
		let filtered = [...stemList.value];

		// 이름 필터
		if (filter.value.stem) {
			const searchName = filter.value.stem;
			filtered = filtered.filter(time =>
				time.stem.includes(searchName)
			);
		}

		// stemID 필터
		if (filter.value.stemID !== undefined) {
			filtered = filtered.filter(time => time.stemID === filter.value.stemID);
		}

		return filtered;
	});

	const paginatedStemList = computed(() => {
		const start = (pagination.value.currentPage - 1) * pagination.value.rowsPerPage;
		const end = start + pagination.value.rowsPerPage;
		return filteredStemList.value.slice(start, end);
	});

	// Actions
	async function fetchStemById(id: number): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await stemApi.getStem(id);

			if (response.data && typeof response.data === 'object') {
				currentStem.value = StemModel.fromJson(response.data);
			} else {
				error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}

	async function fetchStemList(page = 1, limit = 20): Promise<StemModel[]> {
		try {
			isLoading.value = true;
			error.value = null;
			stemList.value = []

			const response = await stemApi.getStemList({
				page,
				limit: limit,
				...filter.value,
				sortField: sortField.value,
				sortDirection: sortDirection.value
			});

			if (response.data && Array.isArray(response.data)) {
				stemList.value = response.data.map((item: any) => StemModel.fromJson(item));
				// 페이지네이션 정보 업데이트
				pagination.value = {
					currentPage: page,
					rowsPerPage: limit,
					totalItems: response.count || 0,
					totalPages: Math.ceil((response.count || 0) / limit)
				};
			} else {
				error.value = response.message || '시간 기록 목록을 불러오는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
		return stemList.value;
	}

	async function updateStem(stem: StemModel): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await stemApi.updateStem(stem);
			if (response.data && typeof response.data === 'object') {
				currentStem.value = StemModel.fromJson(response.data);
			} else {
				error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}

	async function deleteStem(stemID: number): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await stemApi.deleteStem(stemID);

		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}
	// 반환 객체에 모든 상태와 함수를 포함해야 합니다!
	return {
		currentStem,
		stemList,
		searchNames,
		isLoading,
		pagination,
		filter,
		error,
		// ... 다른 상태들 ...
		filteredStemList,
		paginatedStemList,

		// 함수들 명시적으로 반환
		fetchStemList,
		fetchStemById,
		updateStem,
		deleteStem
	};

});