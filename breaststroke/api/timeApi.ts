// composables/useTimeApi.ts
import axios from 'axios';
// import { TimeSortField } from '../types/times';
import { SortDirection } from '~/types/common';
// import type { TimeFilter } from '~/types/times';
import type { TimeModel } from '~/models/times';

// const _URL = "/timesNew";
const _URL = "/BR/times";
const _URL_IMPORT_TIMES = "/BR/importTimes";

// 서버 응답 타입 정의
interface ServerResponse<T> {
  message: string;
  data: T;
  [key: string]: any;
}

interface ServerListResponse<T> {
  message: string;
  count: number;
  data: T[];
  [key: string]: any;
}

// 클라이언트 응답 타입 정의
interface ApiResponse<T> {
  message: string;
  data: T;
}

interface ListResponse<T> {
  message: string;
  count: number;
  data: T[];
}

// 팩토리 함수로 변경
export const createTimeApi = () => {
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

  // Time API 서비스
  return {
    // Time 목록 조회
    async getTimeList(params: {
      page?: number;
      limit?: number;
      sortField?: any;
      sortDirection?: SortDirection;
    } & Partial<any>): Promise<ListResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}`, params);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('getTimeList 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // Time name 검색
    async searchNames(name: string): Promise<ListResponse<any>> {
      try {
        const params = { name: name };
        const response = await apiClient.post(`${_URL}/searchNames`, params);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('searchNames 오류:', error);
        return {
          message: error.response?.data?.message || '이름 검색에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // Time name 검색
    async searchNamesNewAPI(name: string): Promise<ListResponse<any>> {
      try {
        const params = { name: name };
        const response = await apiClient.post(`${_URL}/searchNames`, params);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('searchNames 오류:', error);
        return {
          message: error.response?.data?.message || '이름 검색에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 단일 Time 조회
    async getTime(timeId: number): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.get(`${_URL}/view/${timeId}/0`);

        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('getTime 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // Time 결과 저장
    async saveTimeResult(timeData: Record<string, any>): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}/saveTimeResult`, timeData);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '시간 기록이 저장되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('saveTimeResult 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록 저장에 실패했습니다.',
          data: {}
        };
      }
    },

    // Time 생성
    async createTime(timeData: Record<string, any>): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}`, timeData);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '시간 기록이 생성되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('createTime 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록 생성에 실패했습니다.',
          data: {}
        };
      }
    },

    // Time 업데이트 (PUT)
    async updateTime(timeId: number, timeData: Record<string, any>): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.put(`${_URL}/${timeId}`, timeData);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '시간 기록이 업데이트되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('updateTime 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록 업데이트에 실패했습니다.',
          data: {}
        };
      }
    },

    // Time 부분 업데이트 (PATCH)
    async patchTime(timeId: number, timeData: Record<string, any>): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.patch(`${_URL}/${timeId}`, timeData);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '시간 기록이 부분 업데이트되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('patchTime 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록 부분 업데이트에 실패했습니다.',
          data: {}
        };
      }
    },

    // Time 삭제 ✅ 수정된 부분
    async deleteTime(timeId: number): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.delete(`${_URL}/${timeId}`);
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '시간 기록이 삭제되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('deleteTime 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록 삭제에 실패했습니다.',
          data: {}
        };
      }
    },

    // 내 기록이 아니에요
    async notMyTime(timeId: number): Promise<ApiResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}/notMyTime`, { timeID: timeId });
        
        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '내 기록이 아니에요 처리가 완료되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('notMyTime 오류:', error);
        return {
          message: error.response?.data?.message || '내 기록이 아니에요 처리에 실패했습니다.',
          data: {}
        };
      }
    },

    // 업로드된 파일 읽기
    async readUploadedFile(category: string, type: string, id: number): Promise<ListResponse<any>> {
      try {
        const params = {
          category: category,
          type: type,
          id: id.toString(),
        };
        const response = await apiClient.post(`${_URL_IMPORT_TIMES}/read`, params);
console.log("readUploadedFile response:", response.data);        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('readUploadedFile 오류:', error);
        return {
          message: error.response?.data?.message || '업로드된 파일을 읽는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 업로드된 파일 시뮬레이션
    async simulationUploadedFile(category: string, type: string, id: number): Promise<ListResponse<any>> {
      try {
        const params = {
          category: category,
          type: type,
          id: id.toString(),
        };
        const response = await apiClient.post(`${_URL_IMPORT_TIMES}/simulation`, params);
        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('simulationUploadedFile 오류:', error);
        return {
          message: error.response?.data?.message || '시뮬레이션에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 업로드된 파일 확인
    async checkUploadedFile(competitionID: number): Promise<ListResponse<any>> {
      try {
        const params = {
          competitionID: competitionID.toString(),
        };
        const response = await apiClient.post(`${_URL_IMPORT_TIMES}/check`, params);
        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('checkUploadedFile 오류:', error);
        return {
          message: error.response?.data?.message || '파일 확인에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 시간 기록 가져오기
    async importTimes(competitionID: number): Promise<ListResponse<any>> {
      try {
        const params = {
          competitionID: competitionID.toString(),
        };
        const response = await apiClient.post(`${_URL_IMPORT_TIMES}/importTimes`, params);
        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('importTimes 오류:', error);
        return {
          message: error.response?.data?.message || '시간 기록 가져오기에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 업로드된 파일 로드
    async loadUploadedFile(category: string, type: string, id: number): Promise<ListResponse<any>> {
      try {
        const params = {
          category: category,
          type: type,
          id: id.toString(),
        };
        const response = await apiClient.post(`${_URL_IMPORT_TIMES}/read`, params);
        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('loadUploadedFile 오류:', error);
        return {
          message: error.response?.data?.message || '파일 로드에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 업로드된 파일 삭제
    async deleteUploadedFile(category: string, type: string, id: number): Promise<ListResponse<any>> {
      try {
        const params = {
          category: category,
          type: type,
          id: id.toString(),
        };
        const response = await apiClient.delete(`${_URL_IMPORT_TIMES}/delete`, { data: params });
        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('deleteUploadedFile 오류:', error);
        return {
          message: error.response?.data?.message || '파일 삭제에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 업로드된 시간 저장
    async saveUploadedTime(competitionID: number, time: {}): Promise<ListResponse<any>> {
      try {
        const params = {
          competitionID: competitionID.toString(),
          ...time,
        };
        const response = await apiClient.post(`${_URL_IMPORT_TIMES}/save`, params);
        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('saveUploadedTime 오류:', error);
        return {
          message: error.response?.data?.message || '업로드된 시간 저장에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 업로드된 시간 삭제
    async deleteUploadedTime(competitionID: number, timeID: number): Promise<ListResponse<any>> {
      try {
        const params = {
          competitionID: competitionID.toString(),
          timeID: timeID.toString(),
        };
        const response = await apiClient.delete(`${_URL_IMPORT_TIMES}/time`, { data: params });
        
        const responseData = response.data as ServerListResponse<any>;
        return {
          message: responseData.message || '',
          count: responseData.count || 0,
          data: responseData.data || []
        };
      } catch (error: any) {
        console.error('deleteUploadedTime 오류:', error);
        return {
          message: error.response?.data?.message || '업로드된 시간 삭제에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    }
  };
};

// 컴포저블 함수 추가
export const useTimeApi = () => {
  return createTimeApi();
};

// Time API 서비스 (기존 방식 호환) - export 추가
export const timeApi = {
  getTimeList: async (params: {
    page?: number;
    limit?: number;
    sortField?: any;
    sortDirection?: SortDirection;
  } & Partial<any>): Promise<ListResponse<any>> => {
    const api = createTimeApi();
    return api.getTimeList(params);
  },
  
  searchNames: async (name: string): Promise<ListResponse<any>> => {
    const api = createTimeApi();
    return api.searchNames(name);
  },
  
  searchNamesNewAPI: async (name: string): Promise<ListResponse<any>> => {
    const api = createTimeApi();
    return api.searchNamesNewAPI(name);
  },
  
  getTime: async (timeId: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.getTime(timeId);
  },
  
  saveTimeResult: async (timeData: Record<string, any>): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.saveTimeResult(timeData);
  },
  
  createTime: async (timeData: Record<string, any>): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.createTime(timeData);
  },
  
  updateTime: async (timeId: number, timeData: Record<string, any>): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.updateTime(timeId, timeData);
  },
  
  patchTime: async (timeId: number, timeData: Record<string, any>): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.patchTime(timeId, timeData);
  },
  
  deleteTime: async (timeId: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.deleteTime(timeId);
  },
    
  readUploadedFile: async (category: string, type: string, id: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.readUploadedFile(category, type, id);
  },
  simulationUploadedFile: async (category: string, type: string, id: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.simulationUploadedFile(category, type, id);
  },
  loadUploadedFile: async (category: string, type: string, id: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.loadUploadedFile(category, type, id);
  },
  deleteUploadedFile: async (category: string, type: string, id: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.deleteUploadedFile(category, type, id);
  },
  saveUploadedTime: async (competitionID: number, time: {}): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.saveUploadedTime(competitionID, time);
  },
  deleteUploadedTime: async (competitionID: number, timeID: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.deleteUploadedTime(competitionID, timeID);
  },
  
  importTimes: async (competitionID: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.importTimes(competitionID);
  },
  checkUploadedFile: async (competitionID: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.checkUploadedFile(competitionID);
  },
  notMyTime: async (timeId: number): Promise<ApiResponse<any>> => {
    const api = createTimeApi();
    return api.notMyTime(timeId);
  },
};

// 기본 export도 유지
export default timeApi;