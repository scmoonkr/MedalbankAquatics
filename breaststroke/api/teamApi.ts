// api/teamApi.ts
import axios from 'axios';
import type { SortDirection, ServerListResponse, ServerResponse } from '~/types/common';
import { TeamSortField } from '~/types/teams';
import type { TeamList, TeamNameSearchResults, TeamFilter } from '~/types/teams';
import type { TeamModel } from '~/models/teams';

const _URL = "/teamsNew";
// 팩토리 함수로 변경
export const createTeamApi = () => {
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
    // Team 목록 조회
    async getTeamList(params: TeamFilter): Promise<ServerListResponse<any>> {
      try {
        // const queryParams = buildQueryParams(params);
        const response = await apiClient.post(`${_URL}`, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Team 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // Team 목록 조회
    async getTeamListBackend(params: TeamFilter): Promise<ServerListResponse<any>> {
      try {
        // const queryParams = buildQueryParams(params);
        const response = await apiClient.post(`${_URL}/list`, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Team 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // Team name 조회
    async getTeamNames(name: string): Promise<ServerListResponse<any>> {
      try {
        const params = { name: name };
        const response = await apiClient.post(`${_URL}/names`, params);
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Team 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 단일 Team 조회
    async getTeam(teamID: number): Promise<ServerResponse<any>> {
      try {
        const params = {
          teamID: teamID,
        };
        const response = await apiClient.post(`${_URL}/view`, params);

        // 서버 응답 데이터 추출
        const responseData = response.data as ApiResponse<any>;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Team을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 단일 Team 조회
    async updateTeam(team: TeamModel): Promise<ServerResponse<any>> {
      try {
        const response = await apiClient.patch(`${_URL}`, team);

        return {
          message: response.message || '',
          data: response.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Team을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 단일 Team 조회
    async deleteTeam(teamID: number): Promise<ServerResponse<any>> {
      try {
        const response = await apiClient.delete(`${_URL}/${teamID}`, );

        return {
          message: response.message || '',
          data: response.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Team을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 단일 Team 조회
    async mergeTeam(teamID: number, teamIDs: number[]): Promise<ServerResponse<any>> {
      try {
        const params = {
          teamID: teamID,
          teamIDs: teamIDs,
        };
        const response = await apiClient.post(`${_URL}/mergs`, params);

        return {
          message: response.message || '',
          data: response.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Team을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },
  };
};

// 컴포저블 함수 추가
export const useTeamApi = () => {
  return createTeamApi();
};

// Team API 서비스
const teamApi = {
  getTeamList: async (credentials: TeamFilter): Promise<ServerListResponse<any>> => {
    const api = createTeamApi();
    return api.getTeamList(credentials);
  },
  getTeamListBackend: async (credentials: TeamFilter): Promise<ServerListResponse<any>> => {
    const api = createTeamApi();
    return api.getTeamListBackend(credentials);
  },
  getTeamNames: async (name: string): Promise<ServerListResponse<any>> => {
    const api = createTeamApi();
    return api.getTeamNames(name);
  },
  getTeam: async (teamID: number): Promise<ServerResponse<any>> => {
    const api = createTeamApi();
    return api.getTeam(teamID);
  },
  updateTeam: async (team: TeamModel): Promise<ServerResponse<any>> => {
    const api = createTeamApi();
    return api.updateTeam(team);
  },
  deleteTeam: async (teamID: number): Promise<ServerResponse<any>> => {
    const api = createTeamApi();
    return api.deleteTeam(teamID);
  },
  mergeTeam: async (teamID: number, teamIDs: number[]): Promise<ServerResponse<any>> => {
    const api = createTeamApi();
    return api.mergeTeam(teamID, teamIDs);
  },
};

export default teamApi;