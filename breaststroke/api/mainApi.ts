// api/athleteApi.ts
import axios from 'axios';
import type { SortDirection, ListResponse, ApiResponse } from '~/types/common';
// import { MainSortField } from '~/types/main';
// import type { MainFilter } from '~/types/main';
// import type { MainModel } from '~/models/main';

const _URL = "/statistics";
const _URL_BR = "/BR/statistics";
// 팩토리 함수로 변경
export const createMainApi = () => {
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

    // 단일 Main 조회
    async getMain(): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}/mainNew`, {});

        // 서버 응답 데이터 추출
        const responseData = response.data as ApiResponse<any>;

        return {
          message: responseData.message || '',
          data: responseData || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Main을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 단일 Main 조회
    async getStatistics(record: string): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL_BR}`, { record: record });

        // 서버 응답 데이터 추출
        const responseData = response.data as ApiResponse<any>;

        return {
          message: responseData.message || '',
          data: responseData || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Main을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },
  };
};

// 컴포저블 함수 추가
export const useMainApi = () => {
  return createMainApi();
};

// Main API 서비스
const statisticApi = {
  getMain: async (): Promise<ApiResponse<any>> => {
    const api = createMainApi();
    return api.getMain();
  },
  getStatistics: async (record: string): Promise<ApiResponse<any>> => {
    const api = createMainApi();
    return api.getStatistics(record);
  },
};

export default statisticApi;