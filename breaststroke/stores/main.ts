// store/useMain.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PaginationOptions } from '~/types/common';
import UI_CONFIG from '~/config/ui';
import type {
  CompressionInfo,
  SwimStyle,
  SwimCourse,
  Gender,
  Sido,
  // ApiResponse,
  ServerResponse
} from '~/types/common';
import mainApi from '@/api/mainApi';
import type { Main, RealtimeData } from '~/types/main'; // main 타입 import

// 통계 스토어 정의
export const useMainStore = defineStore('main', () => {
  // 상태 (state)
  const main = ref<Main | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<PaginationOptions>({
    currentPage: 1,
    rowsPerPage: UI_CONFIG.rowsPerPage,
    totalItems: 0,
    totalPages: 0
  });

  // 계산된 속성 (getters)
  const hasMain = computed(() => !!main.value);

  const totalTimes = computed(() => main.value?.times || 0);
  const totalAthletes = computed(() => main.value?.athletes || 0);
  const totalTeams = computed(() => main.value?.teams || 0);
  const totalCompetitions = computed(() => main.value?.competitions || 0);
  const totalPools = computed(() => main.value?.pools || 0);

  const top1Records = computed(() => {
    if (!main.value?.top1 || !main.value?.compression) return [];

    return main.value.top1.map(record => {
      // 타입 문제를 해결하기 위해 타입 어설션 사용
      const enhanced = { ...record } as typeof record & {
        pool?: string;
        team?: string;
        competitionName?: string;
      };

      // 압축 정보에서 데이터 추가
      if (record.poolID) {
        const pool = main.value?.compression.pools.find(p => p.poolID === record.poolID);
        enhanced.pool = pool?.name || '알 수 없음';
      }

      if (record.teamID) {
        const team = main.value?.compression.teams.find(t => t.teamID === record.teamID);
        enhanced.team = team?.name || '알 수 없음';
      }

      if (record.competitionID) {
        const competition = main.value?.compression.competitions.find(
          c => c.competitionID === record.competitionID
        );
        enhanced.competitionName = competition?.name || '알 수 없음';
      }
      enhanced.time = customTimes(enhanced.time)

      return enhanced;
    });
  });

  const top3Records = computed(() => {
    if (!main.value?.top3 || !main.value?.compression) return [];

    return main.value.top3.map(category => {
      const enhancedTimes = category.times.map(record => {
        // 타입 문제를 해결하기 위해 타입 어설션 사용
        const enhanced = { ...record } as typeof record & { pool?: string };

        // 압축 정보에서 데이터 추가
        if (record.poolID) {
          const pool = main.value?.compression.pools.find(p => p.poolID === record.poolID);
          enhanced.pool = pool?.name || '알 수 없음';
        }

        return enhanced;
      });

      return {
        ...category,
        times: enhancedTimes
      };
    });
  });

  const realtime = computed(() => main.value?.realtime || {});
  const upcomingCompetitions = computed(() => main.value?.upcomings || []);

  const leaderboardsToday = computed(() => main.value?.leaderboardsToday || []);

  const leaderboardsMonth = computed(() => main.value?.leaderboardsMonth || []);

  const thisWeekMVP = computed(() => main.value?.thisWeekMVP || []);

  const thisMonthMVP = computed(() => main.value?.thisMonthMVP || []);

  const seasonMVP = computed(() => main.value?.seasonMVP || []);

  const newRecords = computed(() => {
    return main.value?.newRecords || [];
  });

  const bestRecords = computed(() => {
    if (!main.value?.bestRecord || !main.value?.compression) return [];

    return main.value.bestRecord.map(record => {
      // 타입 문제를 해결하기 위해 타입 어설션 사용
      const enhanced = { ...record } as typeof record & { pool?: string };

      // 압축 정보에서 데이터 추가
      if (record.poolID) {
        const pool = main.value?.compression.pools.find(p => p.poolID === record.poolID);
        enhanced.pool = pool?.name || '알 수 없음';
      }

      return enhanced;
    });
  });

  // 액션 (actions)
  async function fetchMain(page = 1, limit = 20) {
    loading.value = true;
    error.value = null;

    try {
      //mainApi
      const response = await mainApi.getMain();
      if (response.data && typeof response.data === 'object') {
        // main.value = response.data;
        // 응답 데이터를 Main 인터페이스에 맞게 변환
        const stats: Main = {
          times: response.data.times || 0,
          athletes: response.data.athletes || 0,
          reports: response.data.reports || 0,
          teams: response.data.teams || 0,
          competitions: response.data.competitions || 0,
          stems: response.data.stems || 0,
          pools: response.data.pools || 0,
          rankings: response.data.rankings || 0,
          users: response.data.users || 0,
          years: Array.isArray(response.data.years) ? response.data.years : [],
          realtime: response.data.realtime || {} as RealtimeData,
          upcomings: Array.isArray(response.data.upcomings) ? response.data.upcomings : [],
          athleteID: response.data.athleteID || 0,
          top1: Array.isArray(response.data.top1) ? response.data.top1 : [],
          top3: Array.isArray(response.data.top3) ? response.data.top3 : [],
          leaderboardsToday: Array.isArray(response.data.leaderboardsToday) ? response.data.leaderboardsToday : [],
          leaderboardsMonth: Array.isArray(response.data.leaderboardsMonth) ? response.data.leaderboardsMonth : [],
          newMeasure: Array.isArray(response.data.newMeasure) ? response.data.newMeasure : [],
          thisWeekMVP: Array.isArray(response.data.thisWeekMVP) ? response.data.thisWeekMVP : [],
          thisMonthMVP: Array.isArray(response.data.thisMonthMVP) ? response.data.thisMonthMVP : [],
          seasonMVP: Array.isArray(response.data.seasonMVP) ? response.data.seasonMVP : [],
          newRecords: Array.isArray(response.data.newRecord) ? response.data.newRecord : [],
          bestRecord: Array.isArray(response.data.bestRecord) ? response.data.bestRecord : [],
          compression: response.data.compression || {} as CompressionInfo
        };

        // 변환된 데이터 저장
        main.value = stats;
      } else {
        error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
      }
    } catch (err: any) {
      error.value = err.message || '통계 정보를 불러오는 중 오류가 발생했습니다.';
      console.error('통계 정보 로드 오류:', err);
    } finally {
      loading.value = false;
    }
  }

  // 액션 (actions)
  async function fetchStatistics(record: string) {
    loading.value = true;
    error.value = null;

    try {
      //mainApi
      const response = await mainApi.getStatistics(record);
      if (response.data && typeof response.data === 'object') {
        // 변환된 데이터 저장
        return response.data;
      } else {
        error.value = response.message || '시간 기록을 불러오는데 실패했습니다.';
        return {};
      }
    } catch (err: any) {
      error.value = err.message || '통계 정보를 불러오는 중 오류가 발생했습니다.';
      console.error('통계 정보 로드 오류:', err);
      return {};
    } finally {
      loading.value = false;
    }
  }

  // 특정 스타일, 코스, 성별, 거리에 따른 기록 필터링
  function filterRecordsByStyle(
    style: SwimStyle,
    course: SwimCourse,
    gender: Gender,
    distance: string
  ) {
    if (!main.value?.top1) return [];

    return top1Records.value.filter(record =>
      record.style === style &&
      record.course === course &&
      record.gender === gender &&
      record.distance === distance
    );
  }

  // 특정 시도(지역)에 따른 기록 필터링
  function filterRecordsBySido(sido: Sido) {
    if (!main.value?.top1) return [];

    return top1Records.value.filter(record => record.sido === sido);
  }

  // 압축 정보를 이용한 유틸리티 함수
  function getPoolName(poolID: number): string {
    if (!main.value?.compression) return '알 수 없음';

    const pool = main.value.compression.pools.find(p => p.poolID === poolID);
    return pool?.name || '알 수 없음';
  }

  function getTeamName(teamID: number): string {
    if (!main.value?.compression) return '알 수 없음';

    const team = main.value.compression.teams.find(t => t.teamID === teamID);
    return team?.name || '알 수 없음';
  }

  function getCompetitionName(competitionID: number): string {
    if (!main.value?.compression) return '알 수 없음';

    const competition = main.value.compression.competitions.find(
      c => c.competitionID === competitionID
    );
    return competition?.name || '알 수 없음';
  }

  // 특정 타임 레코드에 압축 정보 추가하는 유틸리티 함수
  function enhanceTimeRecord<T extends { poolID?: number; teamID?: number; competitionID?: number }>(
    record: T
  ): T & { pool?: string; team?: string; competitionName?: string } {
    // 타입 문제를 해결하기 위해 타입 어설션 사용
    const enhanced = { ...record } as T & { pool?: string; team?: string; competitionName?: string };

    if (!main.value?.compression) return enhanced;

    if ('poolID' in record && record.poolID) {
      enhanced.pool = getPoolName(record.poolID);
    }

    if ('teamID' in record && record.teamID) {
      enhanced.team = getTeamName(record.teamID);
    }

    if ('competitionID' in record && record.competitionID) {
      enhanced.competitionName = getCompetitionName(record.competitionID);
    }

    return enhanced;
  }

  return {
    // 상태
    main,
    loading,
    pagination,
    error,

    // 계산된 속성(getters)
    hasMain,
    totalTimes,
    totalAthletes,
    totalTeams,
    totalCompetitions,
    totalPools,
    top1Records,
    top3Records,
    realtime,
    upcomingCompetitions,
    leaderboardsToday,
    leaderboardsMonth,
    thisWeekMVP,
    thisMonthMVP,
    seasonMVP,
    newRecords,
    bestRecords,

    // 액션
    fetchMain,
    filterRecordsByStyle,
    filterRecordsBySido,
    fetchStatistics,

    // 유틸리티 함수
    getPoolName,
    getTeamName,
    getCompetitionName,
    enhanceTimeRecord
  };
});