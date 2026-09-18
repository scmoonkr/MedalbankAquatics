// api/leaderboardApi.ts
import axios from 'axios';
import type { SortDirection, } from '~/types/common';
// import { LeaderboardSortField } from '~/types/leaderboards';
import type { LeaderboardFilter, LeaderboardData } from '~/types/leaderboard';
import type { TimeModel } from '~/models/times';

const _URL = "/leaderboardNew";
export const createLeaderboardApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:6600';

  // Axios 인스턴스 생성
  const apiClient = axios.create({
    baseURL: apiBase,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000
  });

  // 요청 인터셉터: 토큰이 있으면 헤더에 추가
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 설정
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // 401 오류이고 토큰 갱신 시도가 아직 없었다면
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 토큰 갱신 시도
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            // 로그아웃 처리
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            return Promise.reject(error);
          }

          // 갱신 요청 보냄
          const response = await apiClient.post('/auth/refreshToken', { refreshToken });
          const newToken = response.data.token;

          if (newToken) {
            // 새 토큰 저장
            localStorage.setItem('token', newToken);

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Auth API 서비스
  return {
    // Leaderboard 목록 조회
    async getLeaderboardList(params: LeaderboardFilter): Promise<ListResponse<any>> {
      try {
        // const queryParams = buildQueryParams(params);
        const response = await apiClient.post(`${_URL}`, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as ListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Leaderboard 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },
    async getCaptureList(params: LeaderboardFilter): Promise<ListResponse<any>> {
      try {
        // const queryParams = buildQueryParams(params);
        const response = await apiClient.post(`${_URL}/capture`, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as ListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Leaderboard 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },
  };
};

// 컴포저블 함수 추가
export const useLeaderboardApi = () => {
  return createLeaderboardApi();
};

// Leaderboard API 서비스
const leaderboardApi = {
  getLeaderboardList: async (credentials: LeaderboardFilter): Promise<ListResponse<any>> => {
    const api = createLeaderboardApi();
    return api.getLeaderboardList(credentials);
  },
  getCaptureList: async (credentials: LeaderboardFilter): Promise<ListResponse<any>> => {
    const api = createLeaderboardApi();
    return api.getCaptureList(credentials);
  },
};

export default leaderboardApi;