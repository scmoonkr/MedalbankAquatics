// api/athleteApi.ts
import axios from 'axios';
import type { SortDirection } from '~/types/common';
import { AthleteSortField } from '~/types/athletes';
import type { AthleteListRequest } from '~/types/athletes';
import type { AthleteModel } from '~/models/athletes';

// 팩토리 함수로 변경
export const createAthleteApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:6600';

  const _url = "/athletesNew";
  const _url_BR = "/BR/athletes";

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

    // 단일 Athlete 조회
    async getAthleteBR(athleteID: number, discipline: string): Promise<any> {
      try {
        const params = { athleteID: athleteID };
        const response = await apiClient.get(`${_url_BR}/${athleteID}/${discipline??'BR'}`);

        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },


    // 로그인
    // Athlete 목록 조회
    async getAthleteListBR(params: AthleteListRequest): Promise<any> {
      try {
        // const queryParams = buildQueryParams(params);
        const response = await apiClient.post(_url_BR, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },


    // 로그인
    // Athlete 목록 조회
    async getAthleteList(params: AthleteListRequest): Promise<any> {
      try {
        // const queryParams = buildQueryParams(params);
        const response = await apiClient.post(_url, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },
    async getAthleteListBackend(params: AthleteListRequest): Promise<any> {
      try {
        // const queryParams = buildQueryParams(params);
        const response = await apiClient.post(`${_url}/listBackend`, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 단일 Athlete 조회
    async getAthlete(athleteID: number): Promise<any> {
      try {
        const params = { athleteID: athleteID };
        const response = await apiClient.post(`${_url}/viewTimes`, params);

        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 단일 Athlete 조회
    async searchAthleteName(name: string): Promise<any> {
      try {
        const params = { name: name };
        const response = await apiClient.post(`${_url}/names`, params);

        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 단일 Athlete 조회
    async updateAthlete(athlete: AthleteModel): Promise<any> {
      try {
        const response = await apiClient.patch(`${_url}`, athlete);

        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 단일 Athlete 조회
    async deleteAthlete(athleteID: number): Promise<any> {
      try {
        const params = { athleteID: athleteID };
        const response = await apiClient.delete(`${_url}/${athleteID}`);

        // 서버 응답 데이터 추출
        const responseData = response.data as any;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Athlete을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },
  };
};

// 컴포저블 함수 추가
export const useAthleteApi = () => {
  return createAthleteApi();
};

// Athlete API 서비스
const athleteApi = {
  getAthleteBR: async (athleteID: number, discipline: string): Promise<any> => {
    const api = createAthleteApi();
    return api.getAthleteBR(athleteID, discipline);
  },
  getAthleteListBR: async (credentials: AthleteListRequest): Promise<any> => {
    const api = createAthleteApi();
    return api.getAthleteListBR(credentials);
  },




  getAthleteList: async (credentials: AthleteListRequest): Promise<any> => {
    const api = createAthleteApi();
    return api.getAthleteList(credentials);
  },
  getAthleteListBackend: async (credentials: AthleteListRequest): Promise<any> => {
    const api = createAthleteApi();
    return api.getAthleteListBackend(credentials);
  },
  getAthlete: async (athleteID: number): Promise<any> => {
    const api = createAthleteApi();
    return api.getAthlete(athleteID);
  },
  searchAthleteName: async (name: string): Promise<any> => {
    const api = createAthleteApi();
    return api.searchAthleteName(name);
  },
  updateAthlete: async (athlete: AthleteModel): Promise<any> => {
    const api = createAthleteApi();
    return api.updateAthlete(athlete);
  },
  deleteAthlete: async (athleteID: number): Promise<any> => {
    const api = createAthleteApi();
    return api.deleteAthlete(athleteID);
  },
};

export default athleteApi;