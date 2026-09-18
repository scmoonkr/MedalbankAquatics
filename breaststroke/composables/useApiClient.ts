// composables/useApiClient.ts
import axios, { type AxiosInstance } from 'axios';

export const useApiClient = () => {
  const config = useRuntimeConfig();
  
  const createClient = (): AxiosInstance => {
    const apiBase = typeof config.public.apiBase === 'string'
      ? config.public.apiBase
      : 'http://localhost:6700';

    const client = axios.create({
      baseURL: apiBase,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    // 요청 인터셉터: 토큰 추가
    client.interceptors.request.use(
      (config) => {
        if (process.client) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터: 토큰 갱신 처리
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 401 오류 및 토큰 갱신
        if (error.response?.status === 401 && !originalRequest._retry && process.client) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              clearAuth();
              return Promise.reject(error);
            }

            // 토큰 갱신
            const response = await client.post('/auth/refreshToken', { refreshToken });
            const newToken = response.data.token;

            if (newToken) {
              localStorage.setItem('token', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return client(originalRequest);
            }
          } catch (refreshError) {
            clearAuth();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return client;
  };

  // 인증 정보 초기화
  const clearAuth = () => {
    if (process.client) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // 로그인 페이지로 리다이렉트
      const router = useRouter();
      router.push('/auth/signin');
    }
  };

  return {
    createClient,
    clearAuth
  };
};