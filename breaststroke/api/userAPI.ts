// api/userApi.ts
import axios from 'axios';
import { SortDirection } from '~/types/common';
import type { UserFilter, UserSortField } from '~/types/users';

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

// API 기본 URL 설정
const _URL = '/usersNew';

// API 베이스 URL을 가져오는 헬퍼 함수
const getApiBase = () => {
  const config = useRuntimeConfig();
  return config.public.apiBase || 'http://localhost:6600';
};

// Axios 인스턴스를 생성하는 팩토리 함수
const createApiClient = () => {
  return axios.create({
    baseURL: getApiBase(),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000
  });
};

// 쿼리 파라미터 구성 함수
const buildQueryParams = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof Date) {
        queryParams.append(key, value.toISOString());
      } else if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(`${key}[]`, String(item)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  return queryParams.toString();
};

// User API 서비스
const userApi = {
  // User 목록 조회
  async getUserList(params: {
    page?: number;
    limit?: number;
    sortField?: UserSortField;
    sortDirection?: SortDirection;
  } & Partial<UserFilter>): Promise<ListResponse<any>> {
    try {
      const apiClient = createApiClient();
      // const queryParams = buildQueryParams(params);
      const response = await apiClient.post(`/usersNew`, params);
      // 서버 응답 데이터 추출
      const responseData = response.data as ServerListResponse<any>;

      return {
        message: responseData.message || '',
        count: responseData.count || 0,
        data: responseData.data || []
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 목록을 불러오는데 실패했습니다.',
        count: 0,
        data: []
      };
    }
  },

  // 단일 User 조회
  async getUserByRegistrationNo(registrationNo: string): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get(`/usersNew/brief/${registrationNo}`);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || '',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User을 불러오는데 실패했습니다.',
        data: {}
      };
    }
  },

  // 단일 User 조회
  async getUser(userID: number): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get(`/usersNew/${userID}`);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || '',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User을 불러오는데 실패했습니다.',
        data: {}
      };
    }
  },

  // User 생성
  async createUser(timeData: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const params = { ...timeData };
      const response = await apiClient.post('/usersNew', params);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || 'User이 생성되었습니다.',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 생성에 실패했습니다.',
        data: {}
      };
    }
  },

  // User 생성
  async setPassword(params: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.post('/setPassword', params);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || 'User이 생성되었습니다.',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 생성에 실패했습니다.',
        data: {}
      };
    }
  },

  // User 업데이트
  async updateUser(timeId: number, timeData: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const params = { ...timeData };
      const response = await apiClient.put(`/usersNew`, params);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || 'User이 업데이트되었습니다.',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 업데이트에 실패했습니다.',
        data: {}
      };
    }
  },

  // User 부분 업데이트
  async patchUser(timeData: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const params = { ...timeData };
      const response = await apiClient.patch(`/usersNew`, params);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || 'User이 부분 업데이트되었습니다.',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 부분 업데이트에 실패했습니다.',
        data: {}
      };
    }
  },

  // User 삭제
  async deleteUser(timeId: number): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.delete(`/usersNew/${timeId}`);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || 'User이 삭제되었습니다.',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 삭제에 실패했습니다.',
        data: {}
      };
    }
  },

  // User 일괄 삭제
  async deleteMultipleUsers(timeIds: number[]): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const params = { ids: timeIds };
      const response = await apiClient.post('/usersNew/batch-delete', params);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || '선택한 User들이 삭제되었습니다.',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 일괄 삭제에 실패했습니다.',
        data: {}
      };
    }
  },

  // 프로젝트 목록 조회
  async getProjects(): Promise<ListResponse<any>> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/projects');

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerListResponse<any>;

      return {
        message: responseData.message || '',
        count: responseData.count || 0,
        data: responseData.data || []
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || '프로젝트 목록을 불러오는데 실패했습니다.',
        count: 0,
        data: []
      };
    }
  },

  // 태스크 목록 조회
  async getTasks(projectId?: number): Promise<ListResponse<any>> {
    try {
      const apiClient = createApiClient();
      let url = '/tasks';
      if (projectId) {
        url += `?projectId=${projectId}`;
      }
      const response = await apiClient.get(url);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerListResponse<any>;

      return {
        message: responseData.message || '',
        count: responseData.count || 0,
        data: responseData.data || []
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || '태스크 목록을 불러오는데 실패했습니다.',
        count: 0,
        data: []
      };
    }
  },

  // 태그 목록 조회
  async getTags(): Promise<ListResponse<any>> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/tags');

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerListResponse<any>;

      return {
        message: responseData.message || '',
        count: responseData.count || 0,
        data: responseData.data || []
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || '태그 목록을 불러오는데 실패했습니다.',
        count: 0,
        data: []
      };
    }
  },

  // User 통계 조회
  async getUserStats(params?: Partial<UserFilter>): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const queryParams = params ? buildQueryParams(params) : '';
      const url = queryParams ? `/users/stats?${queryParams}` : '/users/stats';
      const response = await apiClient.get(url);

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || '',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || 'User 통계를 불러오는데 실패했습니다.',
        data: {}
      };
    }
  },

  // 현재 진행 중인 User 조회
  async getActiveUser(): Promise<ApiResponse<any>> {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/users/active');

      // 서버 응답 데이터 추출
      const responseData = response.data as ServerResponse<any>;

      return {
        message: responseData.message || '',
        data: responseData.data || {}
      };
    } catch (error: any) {
      return {
        message: error.response?.data?.message || '진행 중인 User을 불러오는데 실패했습니다.',
        data: {}
      };
    }
  },
};

export default userApi;