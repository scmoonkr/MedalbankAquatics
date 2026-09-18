// stores/poolsStore.ts
import { defineStore } from 'pinia';
import { PoolModel } from '~/models/pools';
import poolApi from '~/api/poolApi';
import { PoolSortField, } from '~/types/pools';
import type { PoolFilter, PoolNameSearchResults } from '~/types/pools';
import { SortDirection, } from '~/types/common';
import UI_CONFIG from '~/config/ui';
import type { PaginationOptions } from '~/types/common';

interface PoolsState {
	pools: PoolModel[];
	selectedPool: PoolModel | null;
	isLoading: boolean;
	error: string | null;
	filters: PoolFilter;
}

export const usePoolStore = defineStore('pool', () => {

	// State
	const currentPool = ref<PoolModel | null>(null);
	const poolList = ref<PoolModel[]>([]);
	const searchNames = ref<PoolNameSearchResults>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const rowsPerPage = ref<number | null>(5);
	const filter = ref<PoolFilter>({
		name: '',
		course: '',
		sido: '',
		poolID: 0,
		sortField: 'dateStart',
		sortDirection: 'desc',
	});
	const sortField = ref<PoolSortField>(PoolSortField.NAME);
	const sortDirection = ref<SortDirection>(SortDirection.ASC);
	const pagination = ref<PaginationOptions>({
		currentPage: 1,
		rowsPerPage: UI_CONFIG.rowsPerPage,
		totalItems: 0,
		totalPages: 0
	});

	// Getters
	const filteredPoolList = computed(() => {
		let filtered = [...poolList.value];

		// 이름 필터
		if (filter.value.name) {
			const searchName = filter.value.name.toLowerCase();
			filtered = filtered.filter(time =>
				time.name.includes(searchName)
			);
		}

		// 시도 필터
		if (filter.value.sido) {
			filtered = filtered.filter(time => time.sido === filter.value.sido);
		}

		// 수영장 ID 필터
		if (filter.value.poolID !== undefined) {
			filtered = filtered.filter(time => time.poolID === filter.value.poolID);
		}

		return filtered;
	});

	const paginatedPoolList = computed(() => {
		const start = (pagination.value.currentPage - 1) * pagination.value.rowsPerPage;
		const end = start + pagination.value.rowsPerPage;
		return filteredPoolList.value.slice(start, end);
	});

	// Actions
	async function fetchPoolById(id: number): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await poolApi.getPool(id);

			if (response.data && typeof response.data === 'object') {
				currentPool.value = PoolModel.fromJson(response.data);
			} else {
				error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}

	async function fetchPoolNames(name: string): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await poolApi.getPoolNames(name);

			if (response.data && Array.isArray(response.data)) {
				searchNames.value = response.data;
			} else {
				error.value = response.message || '선수 목록을 불러오는데 실패했습니다.';
			}

		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}

	async function fetchPoolList(page = 1, limit = 20): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await poolApi.getPoolList({
				page,
				limit: limit,
				...filter.value,
				sortField: sortField.value,
				sortDirection: sortDirection.value
			});

			if (response.data && Array.isArray(response.data)) {
				poolList.value = response.data.map((item: any) => PoolModel.fromJson(item));
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
	}

	async function updatePool(pool: PoolModel): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await poolApi.updatePool(pool);

		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}

	async function deletePool(poolID: number): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await poolApi.deletePool(poolID);

		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}
	// 반환 객체에 모든 상태와 함수를 포함해야 합니다!
	return {
		currentPool,
		poolList,
		searchNames,
		isLoading,
		pagination,
		filter,
		error,
		// ... 다른 상태들 ...
		filteredPoolList,
		paginatedPoolList,

		// 함수들 명시적으로 반환
		fetchPoolNames,
		fetchPoolList,
		fetchPoolById,
		updatePool,
		deletePool
	};

});