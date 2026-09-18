// store/athletes.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { SortDirection } from '~/types/common';
import type { ImageParams, PaginationOptions } from '~/types/common';
import { AthleteSortField } from '~/types/athletes';
import type { AthleteListRequest } from '~/types/athletes';
import type {
    AthleteFilter,
    // PaginationOptions,
    AthleteStats
} from '~/types/athletes';

import { AthleteModel, AthleteListModel } from '~/models/athletes';

import athleteApi from '~/api/athleteAPI';
import imageApi from '~/api/imageApi';

export const useAthleteStore = defineStore('athlete', () => {
    // State
    const currentAthlete = ref<AthleteModel | null>(null);
    const athleteList = ref<AthleteModel[]>([]);
    const isLoading = ref(false);
    const isImageUploading = ref(false);
    const error = ref<string | null>(null);
    const imageUploadError = ref<string | null>(null);
    const filter = ref<AthleteFilter>({});
    const sortField = ref<AthleteSortField>(AthleteSortField.NAME);
    const sortDirection = ref<SortDirection>(SortDirection.ASC);
    const pagination = ref<PaginationOptions>({
        currentPage: 1,
        rowsPerPage: 20,
        totalItems: 0,
        totalPages: 0
    });

    // Getters
    const filteredAthleteList = computed(() => {
        let filtered = [...athleteList.value];

        // 이름 필터
        if (filter.value.name) {
            const searchName = filter.value.name.toLowerCase();
            filtered = filtered.filter(athlete =>
                athlete.name.toLowerCase().includes(searchName)
            );
        }

        // 성별 필터
        if (filter.value.gender) {
            filtered = filtered.filter(athlete => athlete.gender === filter.value.gender);
        }

        // 연령대 필터
        if (filter.value.ageGroup) {
            filtered = filtered.filter(athlete => athlete.ageGroup === filter.value.ageGroup);
        }

        // 나이 범위 필터
        // if (filter.value.minAge !== undefined || filter.value.maxAge !== undefined) {
        //     filtered = filtered.filter(athlete => {
        //         const age = athlete.getAge();
        //         if (filter.value.minAge !== undefined && age < filter.value.minAge) {
        //             return false;
        //         }
        //         if (filter.value.maxAge !== undefined && age > filter.value.maxAge) {
        //             return false;
        //         }
        //         return true;
        //     });
        // }

        // 주요 영법 필터
        if (filter.value.style) {
            filtered = filtered.filter(athlete => {
                if (!athlete.extraInfo?.bestEvent) return false;
                return athlete.extraInfo.bestEvent.some(event => event.style === filter.value.style);
            });
        }

        // 검색어 필터
        if (filter.value.searchQuery) {
            const query = filter.value.searchQuery.toLowerCase();
            filtered = filtered.filter(athlete =>
                athlete.name.toLowerCase().includes(query)
            );
        }

        // 정렬 적용
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField.value) {
                case AthleteSortField.NAME:
                    comparison = a.name.localeCompare(b.name);
                    break;
                // case AthleteSortField.AGE:
                //     comparison = a.getAge() - b.getAge();
                //     break;
                case AthleteSortField.TIMES:
                    comparison = a.timesCount - b.timesCount;
                    break;
                case AthleteSortField.BEST_TIME:
                    // 각 선수의 최고 기록 추출
                    let bestTimeA = Infinity;
                    let bestTimeB = Infinity;

                    if (a.extraInfo?.bestEvent && a.extraInfo.bestEvent.length > 0) {
                        bestTimeA = Math.min(...a.extraInfo.bestEvent.map(e => parseFloat(e.time) || Infinity));
                    }

                    if (b.extraInfo?.bestEvent && b.extraInfo.bestEvent.length > 0) {
                        bestTimeB = Math.min(...b.extraInfo.bestEvent.map(e => parseFloat(e.time) || Infinity));
                    }

                    comparison = bestTimeA - bestTimeB;
                    break;
                case AthleteSortField.JOINED:
                    comparison = a.joined.getTime() - b.joined.getTime();
                    break;
                default:
                    comparison = 0;
                    break;
            }

            return sortDirection.value === SortDirection.ASC ? comparison : -comparison;
        });

        return filtered;
    });

    const paginatedAthleteList = computed(() => {
        const start = (pagination.value.currentPage - 1) * pagination.value.rowsPerPage;
        const end = start + pagination.value.rowsPerPage;
        return filteredAthleteList.value.slice(start, end);
    });

    const athleteStats = computed<AthleteStats>(() => {
        const athletes = filteredAthleteList.value;

        // 성별 카운트
        const maleCount = athletes.filter(a => a.gender === 'men').length;
        const femaleCount = athletes.filter(a => a.gender === 'women').length;
        const mixedCount = athletes.filter(a => a.gender === 'mixed').length;

        // 연령대별 카운트
        const byAgeGroup = athletes.reduce((acc, athlete) => {
            const ageGroup = athlete.ageGroup;
            acc[ageGroup] = (acc[ageGroup] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 가장 활동적인 선수 (기록 횟수 기준)
        const mostActiveAthletes = [...athletes]
            .sort((a, b) => b.timesCount - a.timesCount)
            .slice(0, 5)
            .map(athlete => AthleteListModel.fromAthleteModel(athlete));

        // 가장 향상된 선수들 (기능 구현 필요)
        const mostImprovedAthletes: AthleteListModel[] = [];

        return {
            totalAthletes: athletes.length,
            maleCount,
            femaleCount,
            mixedCount,
            byAgeGroup,
            mostActiveAthletes,
            mostImprovedAthletes
        };
    });

    // Actions 
    async function fetchAthleteDetailBR(id: number, discipline: string): Promise<any> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await athleteApi.getAthleteBR(id, discipline);
            if (response.data && typeof response.data === 'object') {
                // currentAthlete.value = AthleteModel.fromJson(response.data);
                return response.data;
            } else {
                error.value = response.message || '선수 정보를 불러오는데 실패했습니다.';
                return {};
            }
        } catch (err: any) {
            error.value = err.message || '선수 정보를 불러오는데 실패했습니다.';
            return {};
        } finally {
            isLoading.value = false;
        }
    }
    async function fetchAthleteById(id: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await athleteApi.getAthlete(id);
            if (response.data && typeof response.data === 'object') {
                currentAthlete.value = AthleteModel.fromJson(response.data);

                // const times = currentAthlete.value.times ?? [];
                // currentAthlete.value.eventTimes = times.filter(t => t.type === 'event' || t.competitionID > 0);

                // currentAthlete.value.timeTimes = times.filter(t => t.type === 'time' || t.competitionID === 0);
                // currentAthlete.value.leaderboards = SwimmingStatsProcessor.makeLeaderboard(times)

                // 이 코드 추가
                // if (Array.isArray(currentAthlete.value.leaderboards)) {
                //     // 깊은 복사를 통해 반응형으로 만들기
                //     currentAthlete.value.leaderboards = JSON.parse(JSON.stringify(currentAthlete.value.leaderboards));
                // }
                // if (Array.isArray(currentAthlete.value.eventTimes)) {
                //     // 깊은 복사를 통해 반응형으로 만들기
                //     currentAthlete.value.eventTimes = JSON.parse(JSON.stringify(currentAthlete.value.eventTimes));
                // }
            } else {
                error.value = response.message || '선수 정보를 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '선수 정보를 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchAthleteList(page = 1, limit = 10): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const requestParams: AthleteListRequest = {
                page,
                limit,
                ...filter.value,
                sortField: sortField.value,
                sortDirection: sortDirection.value
            };
            athleteList.value = [];
            const response = await athleteApi.getAthleteList(requestParams);
            if (response.data && Array.isArray(response.data)) {
                athleteList.value = response.data.map((item: AthleteModel) => AthleteModel.fromJson(item));
                // 페이지네이션 정보 업데이트
                pagination.value = {
                    currentPage: page,
                    rowsPerPage: limit,
                    totalItems: response.count || 0,
                    totalPages: Math.ceil((response.count || 0) / limit)
                };
            } else {
                error.value = response.message || '선수 목록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '선수 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchAthleteListBR(page = 1, limit = 10): Promise<any[]> {
        try {
            isLoading.value = true;
            error.value = null;
            const requestParams: AthleteListRequest = {
                page,
                limit,
                ...filter.value,
                sortField: sortField.value,
                sortDirection: sortDirection.value
            };
            athleteList.value = [];
            const response = await athleteApi.getAthleteListBR(requestParams);
            if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else {
                error.value = response.message || '선수 목록을 불러오는데 실패했습니다.';
                return [];
            }
        } catch (err: any) {
            error.value = err.message || '선수 목록을 불러오는데 실패했습니다.';
            return [];
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchAthleteListBackend(page = 1, limit = 10): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const requestParams: AthleteListRequest = {
                page,
                limit,
                ...filter.value,
                sortField: sortField.value,
                sortDirection: sortDirection.value
            };
            athleteList.value = [];
            const response = await athleteApi.getAthleteListBackend(requestParams);
            if (response.data && Array.isArray(response.data)) {
                athleteList.value = response.data.map((item: AthleteModel) => AthleteModel.fromJson(item));
                // 페이지네이션 정보 업데이트
                pagination.value = {
                    currentPage: page,
                    rowsPerPage: limit,
                    totalItems: response.count || 0,
                    totalPages: Math.ceil((response.count || 0) / limit)
                };
            } else {
                error.value = response.message || '선수 목록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '선수 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    // async function createAthlete(athleteData: Partial<AthleteModel>): Promise<AthleteModel | null> {
    //     try {
    //         isLoading.value = true;
    //         error.value = null;

    //         const newAthlete = new AthleteModel(athleteData);
    //         const response = await athleteApi.createAthlete(newAthlete.toJson());

    //         if (response.data && typeof response.data === 'object') {
    //             const createdAthlete = AthleteModel.fromJson(response.data);
    //             athleteList.value.unshift(createdAthlete);
    //             return createdAthlete;
    //         } else {
    //             error.value = response.message || '선수를 생성하는데 실패했습니다.';
    //             return null;
    //         }
    //     } catch (err: any) {
    //         error.value = err.message || '선수를 생성하는데 실패했습니다.';
    //         return null;
    //     } finally {
    //         isLoading.value = false;
    //     }
    // }

    // async function updateAthlete(id: number, athleteData: Partial<AthleteModel>): Promise<AthleteModel | null> {
    //     try {
    //         isLoading.value = true;
    //         error.value = null;

    //         // 기존 데이터 가져오기
    //         if (!currentAthlete.value || currentAthlete.value.athleteID !== id) {
    //             await fetchAthleteById(id);
    //         }

    //         if (!currentAthlete.value) {
    //             error.value = '업데이트할 선수를 찾을 수 없습니다.';
    //             return null;
    //         }

    //         // 업데이트할 데이터 준비
    //         const updatedAthlete = new AthleteModel({
    //             ...currentAthlete.value,
    //             ...athleteData,
    //             updated: new Date()
    //         });

    //         const response = await athleteApi.updateAthlete(id, updatedAthlete.toJson());

    //         if (response.data && typeof response.data === 'object') {
    //             const updatedAthleteModel = AthleteModel.fromJson(response.data);

    //             // 현재 선택된 선수 업데이트
    //             currentAthlete.value = updatedAthleteModel;

    //             // 목록에서 해당 선수 업데이트
    //             const index = athleteList.value.findIndex(a => a.athleteID === id);
    //             if (index !== -1) {
    //                 athleteList.value[index] = updatedAthleteModel;
    //             }

    //             return updatedAthleteModel;
    //         } else {
    //             error.value = response.message || '선수 정보를 업데이트하는데 실패했습니다.';
    //             return null;
    //         }
    //     } catch (err: any) {
    //         error.value = err.message || '선수 정보를 업데이트하는데 실패했습니다.';
    //         return null;
    //     } finally {
    //         isLoading.value = false;
    //     }
    // }

    // async function deleteAthlete(id: number): Promise<boolean> {
    //     try {
    //         isLoading.value = true;
    //         error.value = null;

    //         const response = await athleteApi.deleteAthlete(id);

    //         if (response.data) {
    //             // 목록에서 해당 선수 제거
    //             athleteList.value = athleteList.value.filter(athlete => athlete.athleteID !== id);

    //             // 현재 선택된 선수인 경우 초기화
    //             if (currentAthlete.value && currentAthlete.value.athleteID === id) {
    //                 currentAthlete.value = null;
    //             }

    //             return true;
    //         } else {
    //             error.value = response.message || '선수를 삭제하는데 실패했습니다.';
    //             return false;
    //         }
    //     } catch (err: any) {
    //         error.value = err.message || '선수를 삭제하는데 실패했습니다.';
    //         return false;
    //     } finally {
    //         isLoading.value = false;
    //     }
    // }

    async function bulkDeleteAthletes(ids: number[]): Promise<boolean> {
        return true;
        // try {
        //     isLoading.value = true;
        //     error.value = null;

        //     const response = await athleteApi.bulkDeleteAthletes(ids);

        //     if (response.data) {
        //         // 목록에서 해당 선수들 제거
        //         athleteList.value = athleteList.value.filter(athlete => !ids.includes(athlete.athleteID));

        //         // 현재 선택된 선수가 삭제된 경우 초기화
        //         if (currentAthlete.value && ids.includes(currentAthlete.value.athleteID)) {
        //             currentAthlete.value = null;
        //         }

        //         return true;
        //     } else {
        //         error.value = response.message || '선수들을 일괄 삭제하는데 실패했습니다.';
        //         return false;
        //     }
        // } catch (err: any) {
        //     error.value = err.message || '선수들을 일괄 삭제하는데 실패했습니다.';
        //     return false;
        // } finally {
        //     isLoading.value = false;
        // }
    }

    // 특정 선수의 기록 불러오기
    async function fetchAthleteRecords(id: number): Promise<void> {
        // try {
        //     isLoading.value = true;
        //     error.value = null;

        //     // 선수 정보가 없으면 먼저 불러오기
        //     if (!currentAthlete.value || currentAthlete.value.athleteID !== id) {
        //         await fetchAthleteById(id);
        //     }

        //     if (!currentAthlete.value) {
        //         error.value = '선수를 찾을 수 없습니다.';
        //         return;
        //     }

        //     const response = await athleteApi.getAthleteRecords(id);

        //     if (response.data && Array.isArray(response.data)) {
        //         // 선수 객체에 기록 정보 추가
        //         currentAthlete.value.times = response.data.map((record: TimeModel) =>
        //             TimeModel.fromJson(record)
        //         );
        //     } else {
        //         error.value = response.message || '선수 기록을 불러오는데 실패했습니다.';
        //     }
        // } catch (err: any) {
        //     error.value = err.message || '선수 기록을 불러오는데 실패했습니다.';
        // } finally {
        //     isLoading.value = false;
        // }
    }

    // 필터 설정
    function setFilter(newFilter: AthleteFilter): void {
        filter.value = { ...newFilter };
        // 필터 변경 시 첫 페이지로 이동
        pagination.value.currentPage = 1;
        fetchAthleteList(1, pagination.value.rowsPerPage);
    }

    // 정렬 설정
    function setSorting(field: AthleteSortField, direction: SortDirection): void {
        sortField.value = field;
        sortDirection.value = direction;
        fetchAthleteList(pagination.value.currentPage, pagination.value.rowsPerPage);
    }

    // 페이지 변경
    function changePage(page: number): void {
        pagination.value.currentPage = page;
        fetchAthleteList(page, pagination.value.rowsPerPage);
    }

    // 페이지당 항목 수 변경
    function changeLimit(limit: number): void {
        pagination.value.rowsPerPage = limit;
        pagination.value.currentPage = 1; // 첫 페이지로 이동
        fetchAthleteList(1, limit);
    }

    // 초기화
    function reset(): void {
        currentAthlete.value = null;
        athleteList.value = [];
        filter.value = {};
        sortField.value = AthleteSortField.NAME;
        sortDirection.value = SortDirection.ASC;
        pagination.value = {
            currentPage: 1,
            rowsPerPage: 20,
            totalItems: 0,
            totalPages: 0
        };
        error.value = null;
    }// 액션: 선수 이미지 파일 업로드
    async function uploadAthleteImage(athleteID: number, imageFile: File, fileType: string, userID: number): Promise<string | null> {
        try {
            isImageUploading.value = true;
            imageUploadError.value = null;

            const imageParams: ImageParams = {
                db: 'athletes',
                id: athleteID,
                userID: userID,
                fileType: fileType
            };

            const response = await imageApi.uploadImageFile(imageParams, imageFile);
            if (response.data && response.data.data && response.data.data.imageUrl) {
                // 현재 선수 이미지 URL 업데이트
                if (currentAthlete.value && currentAthlete.value.athleteID === athleteID) {
                    currentAthlete.value.featured = response.data.imageUrl;
                }

                // 선수 목록에서도 이미지 URL 업데이트
                const athleteIndex = athleteList.value.findIndex(athlete => athlete.athleteID === athleteID);
                if (athleteIndex !== -1) {
                    athleteList.value[athleteIndex].featured = response.data.imageUrl;
                }

                return response.data.data.imageUrl;
            } else {
                imageUploadError.value = response.message || '이미지 업로드에 실패했습니다.';
                return '이미지 업로드 중 오류가 발생했습니다. 다시 저장해 주세요';
            }
        } catch (err: any) {
            imageUploadError.value = err.message || '이미지 업로드 중 오류가 발생했습니다.';
            return null;
        } finally {
            isImageUploading.value = false;
        }
    }

    // 액션: 선수 이미지 URL 업로드
    async function uploadAthleteImageUrl(athleteID: number, imageURL: string, userID: number, fileType: string): Promise<string | null> {
        try {
            isImageUploading.value = true;
            imageUploadError.value = null;

            const imageParams: ImageParams = {
                db: 'athletes',
                id: athleteID,
                userID: userID,
                fileType: fileType,
            };

            const response = await imageApi.uploadImageURL(imageParams, imageURL);

            if (response.data && response.data.imageUrl) {
                // 현재 선수 이미지 URL 업데이트
                if (currentAthlete.value && currentAthlete.value.athleteID === athleteID) {
                    currentAthlete.value.featured = response.data.imageUrl;
                }

                // 선수 목록에서도 이미지 URL 업데이트
                const athleteIndex = athleteList.value.findIndex(athlete => athlete.athleteID === athleteID);
                if (athleteIndex !== -1) {
                    athleteList.value[athleteIndex].featured = response.data.imageUrl;
                }

                return response.data.imageUrl;
            } else {
                imageUploadError.value = response.message || '이미지 URL 업로드에 실패했습니다.';
                return null;
            }
        } catch (err: any) {
            imageUploadError.value = err.message || '이미지 URL 업로드 중 오류가 발생했습니다.';
            return null;
        } finally {
            isImageUploading.value = false;
        }
    }

    // Base64 데이터 URL을 File 객체로 변환하는 함수
    function dataURLtoFile(dataUrl: string, filename: string): File {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }

    // 선수 이미지 업로드 (Base64 데이터 URL 사용)
    async function uploadAthleteImageFromDataURL(athleteID: number, dataURL: string, userID: number): Promise<string | null> {
        try {
            const fileName = `athlete_${athleteID}_featured.jpg`;
            const file = dataURLtoFile(dataURL, fileName);
            return await uploadAthleteImage(athleteID, file, "featured", userID);
        } catch (err: any) {
            imageUploadError.value = err.message || '이미지 변환 중 오류가 발생했습니다.';
            return null;
        }
    }
    async function updateAthlete(athlete: AthleteModel): Promise<string | null> {
        try {

            const response = await athleteApi.updateAthlete(athlete);
            console.log("updateAthlete.store.response=", response);
            if (response.data && response.data.data && response.data.data.imageUrl) {
                // 현재 선수 이미지 URL 업데이트
                currentAthlete.value = response.data;

                return response.data.data.imageUrl;
            } else {
                imageUploadError.value = response.message || '이미지 업로드에 실패했습니다.';
                return '이미지 업로드 중 오류가 발생했습니다. 다시 저장해 주세요';
            }
        } catch (err: any) {
            imageUploadError.value = err.message || '이미지 업로드 중 오류가 발생했습니다.';
            return null;
        } finally {
            isImageUploading.value = false;
        }
    }
    async function deleteAthlete(athleteID: number): Promise<void> {
        try {

            const response = await athleteApi.deleteAthlete(athleteID);
            console.log("deleteAthlete.store.response=", response);
        } catch (err: any) {
            imageUploadError.value = err.message || '이미지 업로드 중 오류가 발생했습니다.';
        } finally {
            isImageUploading.value = false;
        }
    }

    return {
        // 상태
        athleteList,
        currentAthlete,
        isLoading,
        isImageUploading,
        error,
        imageUploadError,
        filter,
        sortField,
        sortDirection,
        pagination,

        filteredAthleteList,
        // 액션
        fetchAthleteList,
        fetchAthleteListBR,
        fetchAthleteListBackend,
        fetchAthleteById,
        fetchAthleteDetailBR,
        updateAthlete,
        deleteAthlete,
        setFilter,
        setSorting,
        // setPage,
        // setRowsPerPage,
        uploadAthleteImage,
        uploadAthleteImageUrl,
        uploadAthleteImageFromDataURL,
        dataURLtoFile
    };
});
