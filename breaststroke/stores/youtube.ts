// /stores/youtube.ts
import { defineStore } from 'pinia'
import { type IYoutubeData, type IYoutubeFilter, IYoutubeSortField } from '@/types/youtube'
import { SortDirection, type PaginationOptions, } from '~/types/common';
import { YoutubeModel } from '~/models/youtube';
// 직접 함수들을 import
import {
	getYoutubeListApi,
	getYoutubeApi,
	deleteYoutubeApi,
	updateYoutubeApi,
	uploadImageFileApi,
} from '~/api/youtubeApi';

export const useYoutubeStore = defineStore('youtube', () => {

	// State
	const currentYoutube = ref<YoutubeModel | null>(null);
	const youtubeList = ref<YoutubeModel[]>([]);
	const months = ref<string[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const filter = ref<IYoutubeFilter>({
		title: '',
		name: '',
		gender: '',
		isRegistered: '',
		discipline: '',
		course: '',
		distance: '',
		classCode: '',
		time: '',
		datetime: '',

		keyword: '',
		sortField: 'dateStart',
		sortDirection: 'desc',
	});
	const sortField = ref<IYoutubeSortField>(IYoutubeSortField.NAME);
	const sortDirection = ref<SortDirection>(SortDirection.DESC);
	const pagination = ref<PaginationOptions>({
		currentPage: 1,
		rowsPerPage: 20, // UI_CONFIG.rowsPerPage,
		totalItems: 0,
		totalPages: 0
	});

	//===================================================
	//===== Actions =====================================
	//===================================================

	const fetchYoutubeById = async (youtubeID: number): Promise<void> => {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await getYoutubeApi(youtubeID);
			if (response.data && typeof response.data === 'object') {
				currentYoutube.value = YoutubeModel.fromJson(response.data);
			} else {
				error.value = response.message || 'Youtube를 불러오는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || 'Youtube를 불러오는데 실패했습니다.';
			console.error('fetchYoutubeById error:', err);
		} finally {
			isLoading.value = false;
		}
	};

	const fetchYoutubeList = async (page = 1, limit = 12): Promise<void> => {
		try {
			isLoading.value = true;
			error.value = null;
			const params = {
				page,
				limit,

				...filter.value,
				// sortField: filter.value.sortField,
				// sortDirection: filter.value.sortDirection
			};
			// if (filter.value.category) params.category = filter.value.category;
			// if (filter.value.tag) params.tag = filter.value.tag;

			const response = await getYoutubeListApi(params);
			// console.log("fetchYoutubeList=", response.data);

			if (response.data && Array.isArray(response.data)) {
				youtubeList.value = response.data.map((item: any) => YoutubeModel.fromJson(item));
				// 페이지네이션 정보 업데이트
				pagination.value = {
					currentPage: page,
					rowsPerPage: limit,
					totalItems: response.count || 0,
					totalPages: Math.ceil((response.count || 0) / limit)
				};
				months.value = response.months || [];
			} else {
				error.value = response.message || 'Youtube 목록을 불러오는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || 'Youtube 목록을 불러오는데 실패했습니다.';
			console.error('fetchYoutubeList error:', err);
		} finally {
			isLoading.value = false;
		}
	};

	const updateYoutubeWithImage = async (pray: YoutubeModel, featured: File | null | undefined): Promise<number> => {
		try {
			isLoading.value = true;
			error.value = null;

			// if (!featured) {
			//   //  throw new Error('이미지 파일이 필요합니다.');
			//   featured = null;
			// }
			const response = await uploadImageFileApi(pray, featured);
			if (response.data && typeof response.data === 'object') {
				return response.data.contentID;
			} else {
				error.value = response.message || 'Youtube를 updateYoutube하는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || 'Youtube를 updateYoutube하는데 실패했습니다.';
			console.error('updateYoutubeWithImage error:', err);
			// currentYoutube.value!.contentID = 0;
		}
		isLoading.value = false;
		return 0;
	};

	const updateYoutube = async (youtube: YoutubeModel): Promise<number> => {
		try {
			isLoading.value = true;
			error.value = null;

			//------------------------------------------------
			const response = await updateYoutubeApi(youtube);
			//------------------------------------------------

			if (response.data && typeof response.data === 'object') {
				return response.data.contentID;
			} else {
				error.value = response.message || 'Youtube를 수정하는데 실패했습니다.';
				return 0;
			}
		} catch (err: any) {
			error.value = err.message || 'Youtube를 수정하는데 실패했습니다.';
			console.error('updateYoutube error:', err);
			return 0;
		} finally {
			isLoading.value = false;
		}
	};

	const deleteYoutubeById = async (youtubeID: number): Promise<void> => {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await deleteYoutubeApi(youtubeID);

			if (response.data && typeof response.data === 'object') {
				currentYoutube.value = YoutubeModel.fromJson(response.data);
			} else {
				error.value = response.message || 'Youtube를 삭제하는데 실패했습니다.';
			}
		} catch (err: any) {
			error.value = err.message || 'Youtube를 삭제하는데 실패했습니다.';
			console.error('deleteYoutubeById error:', err);
		} finally {
			isLoading.value = false;
		}
	};

	// 필터 및 상태 관리 헬퍼 함수들
	const resetFilter = () => {
		filter.value = {
			title: '',
			name: '',
			gender: '',
			discipline: '',
			course: '',
			distance: '',
			isRegistered: '',
			classCode: '',
			time: '',
			datetime: '',

			keyword: '',
			sortField: 'dateStart',
			sortDirection: 'desc',
		};
	};
	return {
		// State
		currentYoutube,
		youtubeList,
		months,
		isLoading,
		pagination,
		filter,
		error,
		sortField,
		sortDirection,

		// Actions - 함수들을 명시적으로 반환
		fetchYoutubeList,
		fetchYoutubeById,
		deleteYoutubeById,
		updateYoutube,
		updateYoutubeWithImage,

		// Helper functions
		resetFilter,
	};
});