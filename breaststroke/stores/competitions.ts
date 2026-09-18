// stores/competitions.ts
import { defineStore } from 'pinia';
import { CompetitionModel } from '~/models/competitions';
import competitionApi from '~/api/competitionApi';
import type { PaginationOptions } from '~/types/common';
import UI_CONFIG from '~/config/ui';
import type { CompetitionFilter, CompetitionNameSearchResults } from '~/types/competitions';

export const useCompetitionStore = defineStore('competition', () => {

    // State
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const isImageUploading = ref(false);
    const imageUploadError = ref<string | null>(null);

    const filter = ref<CompetitionFilter>({
        fullname: '',
        name: '',
        course: '',
        sido: '',
        competitionID: 0,
        sortField: 'dateStart',
        sortDirection: 'desc',
    });
    const pagination = ref<PaginationOptions>({
        currentPage: 1,
        rowsPerPage: UI_CONFIG.rowsPerPage,
        totalItems: 0,
        totalPages: 0
    });


    // Actions
    const currentCompetition = ref<CompetitionModel | null>(null);
    async function fetchCompetitionById(id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await competitionApi.getCompetition(id);
            if (response.data && typeof response.data === 'object') {
                currentCompetition.value = CompetitionModel.fromJson(response.data);
            } else {
                error.value = response.message || '대회 목록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    const searchNames = ref<CompetitionNameSearchResults>([]);
    async function fetchCompetitionNames(name: string): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await competitionApi.getCompetitionNames(name);

            if (response.data && Array.isArray(response.data)) {
                searchNames.value = response.data;
            } else {
                error.value = response.message || '대회 목록을 불러오는데 실패했습니다.';
            }

        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    // 대회 목록 가져오기 함수
    const competitionList = ref<CompetitionModel[]>([]);
    async function fetchCompetitionList(page = 1, limit = 20): Promise<void> {

        try {
            isLoading.value = true;
            error.value = null;

            // 직접 전달된 페이지 파라미터 사용 확인

            // 요청 파라미터 구성
            const requestParams = {
                page: page,
                limit: limit,
                ...filter.value,
                sortField: filter.value.sortField,
                sortDirection: filter.value.sortDirection
            };

            // API 호출
            const response = await competitionApi.getCompetitionList(requestParams);

            if (response.data && Array.isArray(response.data)) {
                // 데이터 설정
                competitionList.value = response.data.map((item: any) => CompetitionModel.fromJson(item));

                // 페이지네이션 정보 업데이트 - 전달받은 페이지 값 사용
                const totalPages = Math.max(1, Math.ceil((response.count || 0) / limit));

                const newPagination = {
                    currentPage: page,  // API 호출 시 사용한 페이지 그대로 사용
                    rowsPerPage: totalPages,
                    totalItems: response.count || 0,
                    totalPages
                } as PaginationOptions;

                // 새 페이지네이션 적용
                pagination.value = newPagination;
            } else {
                error.value = response.message || '대회 목록을 불러오는데 실패했습니다.';
                console.error("fetchCompetitionList.API 오류 또는 빈 응답:", response);
            }
        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
            console.error("API 예외 발생:", err);
        } finally {
            isLoading.value = false;
        }
    }
    
    async function updateCompetition(competition: CompetitionModel): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await competitionApi.updateCompetition(competition);

            if (response.data && typeof response.data === 'object') {
                currentCompetition.value = CompetitionModel.fromJson(response.data);
            } else {
                error.value = response.message || '대회 목록을 불러오는데 실패했습니다.';
            }

        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }
    async function deleteCompetition(id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await competitionApi.deleteCompetition(id);
        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    // 반환 객체에 모든 상태와 함수를 포함해야 합니다!
    return {
        isLoading,
        pagination,
        filter,
        error,
        isImageUploading,
        imageUploadError,

        // 함수들 명시적으로 반환
        searchNames,
        fetchCompetitionNames,

        competitionList,
        fetchCompetitionList,

        currentCompetition,
        fetchCompetitionById,
        updateCompetition,
        deleteCompetition,
    };

});