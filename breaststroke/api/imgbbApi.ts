// api/imageApi.ts
import axios from 'axios';
import type { ImageParams, ServerResponse, ServerListResponse } from '~/types/common';

const _url = "/images";

// 팩토리 함수로 변경
export const useImageUploadApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:6600';
  const imageBbApiKey = config.public.imageBbApiKey || '';

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
    // ⭐ 이미지 파일 업로드 (FormData 필요한 경우)
    async uploadImageFileOld(name: string, imageFile: File): Promise<ServerResponse<any>> {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', imageFile);

        // multipart/form-data로 전송하기 위해 헤더 설정 변경
        const imgbbUrl = `https://api.imgbb.com/1/upload?key=${imageBbApiKey}`;
        console.log("imgBBurl=", imgbbUrl);
        
        const response = await apiClient.post(imgbbUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return {
          message: response.data.message || '이미지가 성공적으로 업로드되었습니다.',
          data: response.data
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '이미지 업로드에 실패했습니다.',
          data: {}
        };
      }
    },
    async uploadImageFile(name: string, imageFile: File): Promise<ServerResponse<any>> {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', imageFile);

        const imgbbUrl = `https://api.imgbb.com/1/upload?key=${imageBbApiKey}`;
        
        const response = await fetch(imgbbUrl, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        return {
          message: data.message || '이미지가 성공적으로 업로드되었습니다.',
          data: data
        };
      } catch (error: any) {
        return {
          message: '이미지 업로드에 실패했습니다.',
          data: {}
        };
      }
    },

    // ⭐ 이미지 메타 목록 조회 (JSON 전송)
    async listCompetition(): Promise<ServerResponse<any>> {
      try {
        const params = {};
        
        // JSON으로 전송 (multipart/form-data 헤더 제거)
        const response = await apiClient.post(`${_url}/listCompetition`, params);

        return {
          message: response.data.message || '이미지 목록을 성공적으로 조회했습니다.',
          data: response.data
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '이미지 목록 조회에 실패했습니다.',
          data: {}
        };
      }
    },

    // ⭐ 이미지 메타 목록 조회 (JSON 전송)
    async listImageMeta(params: any): Promise<ServerResponse<any>> {
      try {
        
        // JSON으로 전송 (multipart/form-data 헤더 제거)
        const response = await apiClient.post(`${_url}/listAidenImagesMeta`, params);

        return {
          message: response.data.message || '이미지 목록을 성공적으로 조회했습니다.',
          data: response.data
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '이미지 목록 조회에 실패했습니다.',
          data: {}
        };
      }
    },

    // ⭐ 이미지 메타 삽입 (JSON 전송)
    async insertImageMeta(params: any): Promise<ServerResponse<any>> {
      try {
        // 요청 전에 데이터 확인
        
        // ⭐ JSON으로 전송 (기본 헤더 사용: application/json)
        // const response = await apiClient.post(`${_url}/insertAidenImagesMeta`, params);
        const response = await apiClient.post(`${_url}/updateImagesMeta`, params);

        return {
          message: response.data.message || '이미지 메타데이터가 성공적으로 저장되었습니다.',
          data: response.data
        };
      } catch (error: any) {
        console.error('insertImageMeta 에러:', error);
        return {
          message: error.response?.data?.message || '이미지 메타데이터 저장에 실패했습니다.',
          data: {}
        };
      }
    },

    // ⭐ 이미지 메타 업데이트 (JSON 전송)
    async updateImageMeta(params: any): Promise<ServerResponse<any>> {
      try {
        
        // JSON으로 전송 (multipart/form-data 헤더 제거)
        const response = await apiClient.post(`${_url}/updateAidenImagesMeta`, params);

        return {
          message: response.data.message || '이미지 메타데이터가 성공적으로 업데이트되었습니다.',
          data: response.data
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '이미지 메타데이터 업데이트에 실패했습니다.',
          data: {}
        };
      }
    },

    // ⭐ 이미지 메타 삭제 (JSON 전송)
    async deleteImageMeta(params: any): Promise<ServerResponse<any>> {
      try {
        
        // JSON으로 전송 (multipart/form-data 헤더 제거)
        const response = await apiClient.post(`${_url}/deleteAidenImagesMeta`, params);

        return {
          message: response.data.message || '이미지 메타데이터가 성공적으로 삭제되었습니다.',
          data: response.data
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '이미지 메타데이터 삭제에 실패했습니다.',
          data: {}
        };
      }
    },
  };
};

// 컴포저블 함수 추가
export const useImageApi = () => {
  return useImageUploadApi();
};

// Image API 서비스
const imgbbApi = {
  uploadImageFile: async (name: string, file: File): Promise<ServerResponse<any>> => {
    const api = useImageUploadApi();
    return api.uploadImageFile(name, file);
  },
  listCompetition: async (): Promise<ServerResponse<any>> => {
    const api = useImageUploadApi();
    return api.listCompetition();
  },
  listImageMeta: async (params: any): Promise<ServerResponse<any>> => {
    const api = useImageUploadApi();
    return api.listImageMeta(params);
  },
  insertImageMeta: async (params: any): Promise<ServerResponse<any>> => {
    const api = useImageUploadApi();
    return api.insertImageMeta(params);
  },
  updateImageMeta: async (params: any): Promise<ServerResponse<any>> => {
    const api = useImageUploadApi();
    return api.updateImageMeta(params);
  },
  deleteImageMeta: async (params: any): Promise<ServerResponse<any>> => {
    const api = useImageUploadApi();
    return api.deleteImageMeta(params);
  },
};

export default imgbbApi;