// api/authApi.ts
import axios from 'axios';
import type { LoginRequest, AuthResponse, RegisterRequest, PasswordChangeRequest, PasswordResetRequest } from '~/types/users';

// 팩토리 함수로 변경
export const createAuthApi = () => {
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
    // 로그인
    async login(credentials: LoginRequest): Promise<AuthResponse> {
      try {
        const response = await apiClient.post('/auth/signin', credentials);
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
      }
    },

    // 로그아웃
    async logout(): Promise<boolean> {
      try {
        // 서버에 로그아웃 요청 (토큰 무효화)
        await apiClient.post('/auth/signout');
        return true;
      } catch (error) {
        console.error('로그아웃 중 오류:', error);
        return false;
      }
    },

    // 회원가입
    async signup(userData: RegisterRequest): Promise<AuthResponse> {
      try {
        const response = await apiClient.post('/auth/signup', userData);
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.');
      }
    },

    // 비밀번호 변경
    async changePassword(data: PasswordChangeRequest): Promise<boolean> {
      try {
        await apiClient.post('/auth/changePassword', data);
        return true;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
      }
    },

    // 비밀번호 재설정
    async setPasswordByRegistrationNo(data: PasswordResetRequest): Promise<boolean> {
      try {
        await apiClient.post('/auth/setPasswordByRegistrationNo', data);
        return true;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
      }
    },

    // 토큰 갱신
    async refreshToken(refreshToken: string): Promise<{ token: string, expiresIn: number }> {
      try {
        const response = await apiClient.post('/auth/refreshToken', { refreshToken });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '토큰 갱신에 실패했습니다.');
      }
    },

    // 현재 사용자 정보 조회
    async getCurrentUser(): Promise<any> {
      try {
        const response = await apiClient.get('/auth/me');
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '사용자 정보 조회에 실패했습니다.');
      }
    }
  };
};

// 컴포저블 함수 추가
export const useAuthApi = () => {
  return createAuthApi();
};

// 기존 코드와의 호환성을 위한 기본 내보내기 추가
const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const api = createAuthApi();
    return api.login(credentials);
  },
  logout: async (): Promise<boolean> => {
    const api = createAuthApi();
    return api.logout();
  },
  signup: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const api = createAuthApi();
    return api.signup(userData);
  },
  changePassword: async (data: PasswordChangeRequest): Promise<boolean> => {
    const api = createAuthApi();
    return api.changePassword(data);
  },
  setPasswordByRegistrationNo: async (data: PasswordResetRequest): Promise<boolean> => {
    const api = createAuthApi();
    return api.setPasswordByRegistrationNo(data);
  },
  refreshToken: async (refreshToken: string): Promise<{ token: string, expiresIn: number }> => {
    const api = createAuthApi();
    return api.refreshToken(refreshToken);
  },
  getCurrentUser: async (): Promise<any> => {
    const api = createAuthApi();
    return api.getCurrentUser();
  }
};

export default authApi;