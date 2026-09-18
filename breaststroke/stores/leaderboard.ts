// stores/leaderboards.ts
import { defineStore } from 'pinia';
// import { TimeModel } from '~/models/times';
import leaderboardApi from '~/api/leaderboardApi';
import type { PaginationOptions } from '~/types/common';
import type { TimeModel } from '~/models/times';
import UI_CONFIG from '~/config/ui';
import type { LeaderboardFilter, TimeRecord, LeaderboardData } from '~/types/leaderboard';
import { setCompression, decompression, getTeam, getPool, getCompetition } from '~/utils/compression';
import type { Time } from '~/types/times';
const config = useRuntimeConfig()

export const useLeaderboardStore = defineStore('leaderboard', () => {

    // State
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const filter = ref<LeaderboardFilter>({
        masters: '',
        typeTime: '',
        gender: '',
        style: '',
        course: '',
        distance: '',
        sido: '',

        page: 1,
        limit: UI_CONFIG.rowsPerPage,
        sortField: 'rank',
        sortDirection: 'asc',
    });
    const pagination = ref<PaginationOptions>({
        currentPage: 1,
        rowsPerPage: UI_CONFIG.rowsPerPage,
        totalItems: 0,
        totalPages: 0
    });

    // 데이터가 Leaderboard 구조를 가지는지 확인하는 타입 가드 함수 정의
    function isLeaderboardData(data: any): data is LeaderboardData {
        data.compression = data.compression ?? {};
        return (
            data !== null &&
            typeof data === 'object' &&
            'times' in data &&
            Array.isArray(data.times) &&
            'compression' in data &&
            typeof data.compression === 'object'
        );
    }
    // 대회 목록 가져오기 함수
    const leaderboardList = ref<TimeRecord[]>([]);
    async function fetchLeaderboardList(db: string, page = 1, limit = 20): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            filter.value.db = db;
            filter.value.page = page;
            filter.value.limit = limit;

            const filterCopy = JSON.parse(JSON.stringify(filter.value));

            // 복사본을 API에 전달
            const response = await leaderboardApi.getLeaderboardList(filterCopy);
            // API 호출
            // const response = await leaderboardApi.getLeaderboardList(filter.value);
            if (isLeaderboardData(response.data)) {
                const leaderboardData = response.data;
                leaderboardData.times.forEach((time: TimeModel) => {
                    if (time.thumbnail || time.featured) {
                        time.thumbnail = getImageURL(time.thumbnail ?? time.featured, config);
                    }
                    time.time = customTimes(time.time);
                })
                leaderboardData.compression = leaderboardData.compression ?? {};
                setCompression(leaderboardData.compression);
                if (leaderboardData.compression.competitions.length > 0) {
                    leaderboardList.value = decompression(leaderboardData.times);
                } else {
                    leaderboardList.value = leaderboardData.times;
                }

                // 페이지네이션 정보 업데이트
                const totalPages = Math.max(1, Math.ceil((response.count || 0) / limit));

                const newPagination = {
                    currentPage: page,
                    rowsPerPage: limit,
                    totalItems: response.count || 0,
                    totalPages
                } as PaginationOptions;

                pagination.value = newPagination;
            } else {
                error.value = response.message || '대회 목록을 불러오는데 실패했습니다.';
                console.error("API 오류 또는 빈 응답:", response);
            }
        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
            console.error("fetchLeaderboardList.API 예외 발생:", err);
        } finally {
            isLoading.value = false;
        }
    }
    // image capture용 data 가져오기
    async function fetchCaptureList(page = 1, limit = 20): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            filter.value.page = page;
            filter.value.limit = limit;

            const filterCopy = JSON.parse(JSON.stringify(filter.value));

            // 복사본을 API에 전달
            const response = await leaderboardApi.getCaptureList(filterCopy);
            // API 호출
            // const response = await leaderboardApi.getLeaderboardList(filter.value);
            leaderboardList.value = [];
            if (response.data.times.length == 0) return;

            if (isLeaderboardData(response.data)) {
                const leaderboardData = response.data;
                leaderboardData.times.forEach((time: TimeModel) => {
                    time.time = customTimes(time.time);
                })
                leaderboardData.compression = leaderboardData.compression ?? {};
                setCompression(leaderboardData.compression);
                if (leaderboardData.compression.competitions.length > 0) {
                    leaderboardList.value = decompression(leaderboardData.times);
                } else {
                    leaderboardList.value = leaderboardData.times;
                }

                // 페이지네이션 정보 업데이트
                const totalPages = Math.max(1, Math.ceil((response.count || 0) / limit));

                const newPagination = {
                    currentPage: page,
                    rowsPerPage: limit,
                    totalItems: response.count || 0,
                    totalPages
                } as PaginationOptions;

                pagination.value = newPagination;
            } else {
                error.value = response.message || '대회 목록을 불러오는데 실패했습니다.';
                console.error("API 오류 또는 빈 응답:", response);
            }
        } catch (err: any) {
            error.value = err.message || '대회 목록을 불러오는데 실패했습니다.';
            console.error("fetchCaptureList.API 예외 발생:", err);
        } finally {
            isLoading.value = false;
        }
    }

    // Helper function to create a lookup map from an array of objects
    function createLookupMap<T>(items: T[], idKey: keyof T): Record<string | number, T> {
        const map: Record<string | number, T> = {};

        if (!items || !Array.isArray(items)) {
            return map;
        }

        items.forEach(item => {
            const id = item[idKey];
            if (id !== undefined) {
                map[id as unknown as string | number] = item;
            }
        });

        return map;
    }

    // 반환 객체에 모든 상태와 함수를 포함해야 합니다!
    return {
        isLoading,
        pagination,
        filter,
        error,

        // 함수들 명시적으로 반환
        leaderboardList,
        fetchLeaderboardList,
        fetchCaptureList,
    };

});