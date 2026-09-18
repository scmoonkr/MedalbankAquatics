// store/timeStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TimeModel } from '~/models/times';
import { AthleteModel } from '~/models/athletes';
import type { Gender, SwimCourse, PaginationOptions } from '~/types/common';
import type { TimeSortField, } from '~/types/times';
import type {
    // TimeFilter,
    //   TimeSortField, 
    //   SortDirection, ,
    // TimeStats
} from '~/types/times';
// import { TimeSortField } from '~/types/times';
// import { SortDirection } from '~/types/common';
import { timeApi } from '~/api/timeApi';
import { useAthleteApi } from '~/api/athleteAPI';
import { useImageApi } from '~/api/imageApi';

export const useTimeStore = defineStore('time', () => {
    // State
    const currentTime = ref<TimeModel | null>(null);
    const timeList = ref<TimeModel[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const isImageUploading = ref(false);
    const imageUploadError = ref<string | null>(null);
    const rowsPerPage = ref<number | null>(5);
    const filter = ref<any>({});
    const sortField = ref<any>({});
    const sortDirection = ref<any>("asc");
    const pagination = ref<PaginationOptions>({
        currentPage: 1,
        rowsPerPage: 20,
        totalItems: 0,
        totalPages: 0
    });

    // Getters
    const filteredTimeList = computed(() => {
        let filtered = [...timeList.value];

        // 이름 필터
        if (filter.value.name) {
            const searchName = filter.value.name.toLowerCase();
            filtered = filtered.filter(time =>
                time.name.includes(searchName)
            );
        }

        // 성별 필터
        if (filter.value.gender) {
            filtered = filtered.filter(time => time.gender === filter.value.gender);
        }

        // 수영 스타일 필터
        if (filter.value.discipline) {
            filtered = filtered.filter(time => time.discipline === filter.value.discipline);
        }

        // 코스 타입 필터
        if (filter.value.course) {
            filtered = filtered.filter(time => time.course === filter.value.course);
        }

        // 거리 필터
        if (filter.value.distance) {
            filtered = filtered.filter(time => time.distance === filter.value.distance);
        }

        // 연령대 필터
        if (filter.value.ageGroup) {
            filtered = filtered.filter(time => time.ageGroup === filter.value.ageGroup);
        }

        // 마스터즈 여부 필터
        if (filter.value.isMasters !== undefined) {
            filtered = filtered.filter(time => time.isMasters === filter.value.isMasters);
        }

        // 성인 여부 필터
        if (filter.value.isAdult !== undefined) {
            filtered = filtered.filter(time => time.isAdult === filter.value.isAdult);
        }

        // 타입 필터
        if (filter.value.type) {
            filtered = filtered.filter(time => time.type === filter.value.type);
        }

        // 시도 필터
        if (filter.value.sido) {
            filtered = filtered.filter(time => time.sido === filter.value.sido);
        }

        // 날짜 범위 필터
        if (filter.value.startDate && filter.value.endDate) {
            const startDate = new Date(filter.value.startDate);
            const endDate = new Date(filter.value.endDate);

            filtered = filtered.filter(time => {
                const timeDate = new Date(time.datetime);
                return timeDate >= startDate && timeDate <= endDate;
            });
        } else if (filter.value.startDate) {
            const startDate = new Date(filter.value.startDate);
            filtered = filtered.filter(time => new Date(time.datetime) >= startDate);
        } else if (filter.value.endDate) {
            const endDate = new Date(filter.value.endDate);
            filtered = filtered.filter(time => new Date(time.datetime) <= endDate);
        }

        // 팀 ID 필터
        if (filter.value.teamID !== undefined) {
            filtered = filtered.filter(time => time.teamID === filter.value.teamID);
        }

        // 수영장 ID 필터
        if (filter.value.poolID !== undefined) {
            filtered = filtered.filter(time => time.poolID === filter.value.poolID);
        }

        // 대회 ID 필터
        if (filter.value.competitionID !== undefined) {
            filtered = filtered.filter(time => time.competitionID === filter.value.competitionID);
        }

        // 검색어 필터
        if (filter.value.searchQuery) {
            const query = filter.value.searchQuery.toLowerCase();
            filtered = filtered.filter(time =>
                time.name.toLowerCase().includes(query) ||
                time.team!.toLowerCase().includes(query) ||
                time.competitionName!.toLowerCase().includes(query) ||
                time.pool!.toLowerCase().includes(query)
            );
        }

        // 정렬 적용
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField.value) {
                case 'timeStamp':
                    // 시간 문자열을 초 단위로 변환하여 비교
                    const timeA = parseFloat(a.time) || 0;
                    const timeB = parseFloat(b.time) || 0;
                    comparison = timeA - timeB;
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'datetime':
                    comparison = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
                    break;
                case 'ageGroup':
                    comparison = a.ageGroup!.localeCompare(b.ageGroup!);
                    break;
                case 'distance':
                    // 거리 문자열에서 숫자만 추출하여 비교
                    const distanceA = parseInt(a.distance.match(/\d+/)?.[0] || '0', 10);
                    const distanceB = parseInt(b.distance.match(/\d+/)?.[0] || '0', 10);
                    comparison = distanceA - distanceB;
                    break;
                case 'rank':
                    comparison = a.rank! - b.rank!;
                    break;
                default:
                    comparison = 0;
                    break;
            }

            return sortDirection.value === 'asc' ? comparison : -comparison;
        });

        return filtered;
    });

    const paginatedTimeList = computed(() => {
        const start = (pagination.value.currentPage - 1) * pagination.value.rowsPerPage;
        const end = start + pagination.value.rowsPerPage;
        return filteredTimeList.value.slice(start, end);
    });

    const timeStats = computed<any>(() => {
        const times = filteredTimeList.value;
        if (times.length === 0) {
            return {
                fastestTime: null,
                averageTime: 0,
                totalRecords: 0,
                recordsBydiscipline: {} as Record<any, number>,
                recordsByCourse: {} as Record<SwimCourse, number>,
                recordsByDistance: {}
            };
        }

        // 가장 빠른 기록 찾기
        const fastestTime = times.reduce((fastest, current) => {
            const fastestSeconds = parseFloat(fastest.time) || Infinity;
            const currentSeconds = parseFloat(current.time) || Infinity;
            return currentSeconds < fastestSeconds ? current : fastest;
        }, times[0]);

        // 평균 시간 계산
        const totalSeconds = times.reduce((sum, time) => {
            return sum + (parseFloat(time.time) || 0);
        }, 0);
        const averageTime = totalSeconds / times.length;

        // 스타일별 기록 카운트
        const recordsBydiscipline = times.reduce((acc, time) => {
            acc[time.discipline] = (acc[time.discipline] || 0) + 1;
            return acc;
        }, {} as Record<any, number>);

        // 코스별 기록 카운트
        const recordsByCourse = times.reduce((acc, time) => {
            acc[time.course] = (acc[time.course] || 0) + 1;
            return acc;
        }, {} as Record<SwimCourse, number>);

        // 거리별 기록 카운트
        const recordsByDistance = times.reduce((acc, time) => {
            acc[time.distance] = (acc[time.distance] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            fastestTime,
            averageTime,
            totalRecords: times.length,
            recordsBydiscipline,
            recordsByCourse,
            recordsByDistance
        };
    });

    // Actions
    async function fetchTimeById(id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await timeApi.getTime(id);

            if (response.data && typeof response.data === 'object') {
                currentTime.value = TimeModel.fromJson(response.data);
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchTimeList(page = 1, limit = 20): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            if (sortField.value == 'timeStamp') {
                sortField.value = 'timeStamp';
                sortDirection.value = 'asc';
            } else {
                sortField.value = 'datetime';
                sortDirection.value = 'desc';
            }
            const response = await timeApi.getTimeList({
                page,
                limit,
                ...filter.value,
                sortField: sortField.value,
                sortDirection: sortDirection.value
            });

            if (response.data && Array.isArray(response.data)) {
                console.log("store=", response.data);
                timeList.value = response.data.map(item => TimeModel.fromJson(item));
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
    

    async function fetchNamesTimeList(name: string): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            if (sortField.value == 'timeStamp') {
                sortField.value = "timeStamp";
                sortDirection.value = "asc";
            } else {
                sortField.value = "datetime";
                sortDirection.value = "desc";
            }
            const response = await timeApi.searchNames(name);
            if (response.data && Array.isArray(response.data)) {
                timeList.value = response.data.map(item => TimeModel.fromJson(item))
                // 페이지네이션 정보 업데이트
                pagination.value = {
                    currentPage: 1,
                    rowsPerPage: 1000,
                    totalItems: response.count || 0,
                    totalPages: Math.ceil((response.count || 0) / 1000)
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
    

    async function fetchNamesTimeListNew(name: string): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            if (sortField.value == 'timeStamp') {
                sortField.value = "timeStamp";
                sortDirection.value = "asc";
            } else {
                sortField.value = "datetime";
                sortDirection.value = "desc";
            }
            const response = await timeApi.searchNamesNewAPI(name);
            if (response.data && Array.isArray(response.data)) {
                timeList.value = response.data.map(item => TimeModel.fromJson(item))
                // 페이지네이션 정보 업데이트
                pagination.value = {
                    currentPage: 1,
                    rowsPerPage: 1000,
                    totalItems: response.count || 0,
                    totalPages: Math.ceil((response.count || 0) / 1000)
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
		

    //-------------------------------
    // backend
    //-------------------------------
    async function uploadFile(category: string, type: string, id: number, file: File): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await useImageApi().uploadFile(category, type, id, file);

            if (response.data && typeof response.data === 'object') {
                currentTime.value = TimeModel.fromJson(response.data);
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }
		

    async function readUploadedFile(category: string, type: string, id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await timeApi.readUploadedFile(category, type, id);
console.log("readUploadedFile=", response.data);
            if (response.data && typeof response.data === 'object') {
                timeList.value = response.data.map(item => TimeModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function checkUploadedFile(competitionID: number): Promise<string> {

    // console.log("checkUploadedFile.competitionID", competitionID);
        try {
            isLoading.value = true;
            error.value = null;
            const response = await timeApi.checkUploadedFile(competitionID);

            if (response.data && typeof response.data === 'object') {
                timeList.value = response.data.map(item => TimeModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
            // console.log("checkUploadedFile.data", response.message);
            return response.message;
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
        return "";
    }

    async function importTimes(competitionID: number): Promise<string> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await timeApi.importTimes(competitionID);

            if (response.data && typeof response.data === 'object') {
                timeList.value = response.data.map(item => TimeModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
            return response.message;
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
        return "";
    }
    async function simulationUploadedFile(category: string, type: string, id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await timeApi.simulationUploadedFile(category, type, id);

            if (response.data && typeof response.data === 'object') {
                timeList.value = response.data.map(item => TimeModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function loadUploadedFile(category: string, type: string, id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await timeApi.loadUploadedFile(category, type, id);

            if (response.data && typeof response.data === 'object') {
                timeList.value = response.data.map(item => TimeModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteUploadedFile(category: string, type: string, id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await timeApi.deleteUploadedFile(category, type, id);

            if (response.data && typeof response.data === 'object') {
                timeList.value = response.data.map(item => TimeModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    return {
        // State
        currentTime,
        timeList,
        isLoading,
        error,
        filter,
        rowsPerPage,
        sortField,
        sortDirection,
        pagination,
        isImageUploading,
        imageUploadError,

        // Getters
        filteredTimeList,
        paginatedTimeList,
        timeStats,

        // Actions
        fetchTimeById,
        fetchTimeList,
        fetchNamesTimeList,
        fetchNamesTimeListNew,
				uploadFile,
				readUploadedFile,
				checkUploadedFile,
				importTimes,
				simulationUploadedFile,
				loadUploadedFile,
				deleteUploadedFile
    };
});