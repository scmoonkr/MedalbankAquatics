// stores/teams.ts
import { defineStore } from 'pinia';
import UI_CONFIG from '~/config/ui';
import { TeamModel } from '~/models/teams';
import teamApi from '~/api/teamApi';
import { TeamSortField, } from '~/types/teams';
import type { TeamFilter, TeamNameSearchResults } from '~/types/teams';
import { SortDirection, } from '~/types/common';
import type { PaginationOptions } from '~/types/common';

interface TeamsState {
    teams: TeamModel[];
    selectedTeam: TeamModel | null;
    isLoading: boolean;
    error: string | null;
    filters: TeamFilter;
}

export const useTeamStore = defineStore('team', () => {

    // State
    const currentTeam = ref<TeamModel | null>(null);
    const teamList = ref<TeamModel[]>([]);
    const searchNames = ref<TeamNameSearchResults>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const rowsPerPage = ref<number | null>(5);
    const filter = ref<TeamFilter>({});
    const sortField = ref<TeamSortField>(TeamSortField.NAME);
    const sortDirection = ref<SortDirection>(SortDirection.ASC);
    const pagination = ref<PaginationOptions>({
        currentPage: 1,
        rowsPerPage: UI_CONFIG.rowsPerPage,
        totalItems: 0,
        totalPages: 0
    });

    // Actions
    async function fetchTeamById(id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await teamApi.getTeam(id);

            if (response.data && typeof response.data === 'object') {
                currentTeam.value = TeamModel.fromJson(response.data);
            } else {
                error.value = response.message || '대회 목록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchTeamNames(name: string): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await teamApi.getTeamNames(name);

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

    async function fetchTeamList(page = 1, limit = 20): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await teamApi.getTeamList({
                page,
                limit,
                ...filter.value,
                sortField: filter.value.sortField,
                sortDirection: filter.value.sortDirection
            });

            if (response.data && Array.isArray(response.data)) {
                teamList.value = response.data.map((item: any) => item); // TeamModel.fromJson(item));
                // 페이지네이션 정보 업데이트
                const totalPages = Math.max(1, Math.ceil((response.count || 0) / limit));
                pagination.value = {
                    currentPage: page,  // API 호출 시 사용한 페이지 그대로 사용
                    rowsPerPage: limit,
                    totalItems: response.count || 0,
                    totalPages
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

    async function fetchTeamListBackend(page = 1, limit = 20): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await teamApi.getTeamListBackend({
                page,
                limit,
                ...filter.value,
                sortField: filter.value.sortField,
                sortDirection: filter.value.sortDirection
            });

            if (response.data && Array.isArray(response.data)) {
                teamList.value = response.data.map((item: any) => item); // TeamModel.fromJson(item));
                // 페이지네이션 정보 업데이트
                const totalPages = Math.max(1, Math.ceil((response.count || 0) / limit));
                pagination.value = {
                    currentPage: page,  // API 호출 시 사용한 페이지 그대로 사용
                    rowsPerPage: limit,
                    totalItems: response.count || 0,
                    totalPages
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

	async function updateTeam(team: TeamModel): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await teamApi.updateTeam(team);

		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}

	async function deleteTeam(teamID: number): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await teamApi.deleteTeam(teamID);

		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}

	async function mergeTeam(teamID: number, teamIDs: number[]): Promise<void> {
		try {
			isLoading.value = true;
			error.value = null;

			const response = await teamApi.mergeTeam(teamID, teamIDs);

		} catch (err: any) {
			error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
		} finally {
			isLoading.value = false;
		}
	}
    // 반환 객체에 모든 상태와 함수를 포함해야 합니다!
    return {
        currentTeam,
        teamList,
        searchNames,
        isLoading,
        pagination,
        filter,
        error,

        // 함수들 명시적으로 반환
        fetchTeamNames,
        fetchTeamList,
        fetchTeamListBackend,
        fetchTeamById,
        updateTeam,
        deleteTeam,
        mergeTeam,
    };

});