// store/timeStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TimeModel, } from '~/models/times';
import { CompetitionModel} from '~/models/competitions';
import type { Gender, SwimCourse, SwimStyle, PaginationOptions } from '~/types/common';
import { SortDirection } from '~/types/common';
import { useSimulationApi } from '@/api/useSimulationApi';

export const useSimulationStore = defineStore('time', () => {
    // State
    const currentSimulation = ref<TimeModel[]>([]);
    const competitionList = ref<CompetitionModel[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const isImageUploading = ref(false);
    const imageUploadError = ref<string | null>(null);
    const rowsPerPage = ref<number | null>(5);
    const sortDirection = ref<SortDirection>(SortDirection.ASC);
    const pagination = ref<PaginationOptions>({
        currentPage: 1,
        rowsPerPage: 20,
        totalItems: 0,
        totalPages: 0
    });

    // Actions
    async function fetchSimulationById(competitionID: number): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            const response = await useSimulationApi().getSimulation(competitionID);
            if (response.data && typeof response.data === 'object') {
                currentSimulation.value = response.data.map((item: any) => TimeModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchSimulationCompetitions(): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;
            const response = await useSimulationApi().getSimulationCompetitions();
            if (response.data && Array.isArray(response.data)) {
                competitionList.value = response.data.map(item => CompetitionModel.fromJson(item));
            } else {
                error.value = response.message || '시간 기록 목록을 불러오는데 실패했습니다.';
            }
        } catch (err: any) {
            error.value = err.message || '시간 기록 목록을 불러오는데 실패했습니다.';
        } finally {
            isLoading.value = false;
        }
    }
    
    return {
        // State
        currentSimulation,
        competitionList,
        isLoading,
        error,
        isImageUploading,
        imageUploadError,

        // Actions
        fetchSimulationById,
        fetchSimulationCompetitions,
    };
});