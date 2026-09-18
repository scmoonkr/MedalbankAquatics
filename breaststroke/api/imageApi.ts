// api/imageApi.ts
import axios from 'axios';
import type { ImageParams, ServerResponse, ServerListResponse } from '~/types/common';
// import { ImageSortField } from '~/types/athletes';
// import type { ImageListRequest } from '~/types/athletes';
// import type { ImageModel } from '~/models/athletes';

const _URL = "/BR/images";
const _url = "/images";
// 팩토리 함수로 변경
export const createImageApi = () => {
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
    // 이미지file 업로드
    async uploadImageFile(credentials: ImageParams, imageFile: File): Promise<ServerResponse<any>> {
      try {
        const formData = new FormData();
        formData.append('db', credentials.db);
        formData.append('id', credentials.id.toString());
        formData.append('fileType', credentials.fileType);
        formData.append('userID', credentials.userID.toString());
        formData.append('image', imageFile);

        // multipart/form-data로 전송하기 위해 헤더 설정 변경
        const response = await apiClient.post(`${_url}/saveImage`, formData, {
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


    // 이미지file 업로드
    async uploadImageURL(credentials: ImageParams, imageURL: string): Promise<ServerResponse<any>> {
      try {
        const params = {
          ...credentials,
          imageURL: imageURL,
        };

        // multipart/form-data로 전송하기 위해 헤더 설정 변경
        const response = await apiClient.post(`${_url}/saveImageURL`, params, {
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

    // category: 'times', type: 'times', id: competitionID, file: file
    async updateImagesMeta(meta: any): Promise<ServerResponse<any>> {
      try {
        const response = await apiClient.post(`${_url}/updateImgbbMeta`, meta, {
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

    getThumbnail(db: string, id: number) {
      return `${apiBase}/cms/images/${db}/${id}/t`
    },

    // category: 'times', type: 'times', id: competitionID, file: file
    async uploadFile(category: string, type: string, id: number, file: File): Promise<ServerResponse<any>> {
      try {
        const formData = new FormData();
        formData.append('category', category);
        formData.append('type', type);
        formData.append('id', id.toString());
        formData.append('files', file);

        // multipart/form-data로 전송하기 위해 헤더 설정 변경
        const response = await apiClient.post(`${_URL}/upload`, formData, {
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

    // category: 'times', type: 'times', id: competitionID, file: file
    async uploadSimulationFile(category: string, type: string, id: number, file: File): Promise<ServerResponse<any>> {
      try {
        const formData = new FormData();
        formData.append('category', category);
        formData.append('type', type);
        formData.append('id', id.toString());
        formData.append('files', file);

        // multipart/form-data로 전송하기 위해 헤더 설정 변경
        const response = await apiClient.post(`/cms/uploadSimulation`, formData, {
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
  };
};

// 컴포저블 함수 추가
export const useImageApi = () => {
  return createImageApi();
};

// Image API 서비스
const athleteApi = {
  uploadImageFile: async (credentials: ImageParams, file: File): Promise<ServerResponse<any>> => {
    const api = createImageApi();
    return api.uploadImageFile(credentials, file);
  },
  uploadImageURL: async (credentials: ImageParams, imageURL: string): Promise<ServerResponse<any>> => {
    const api = createImageApi();
    return api.uploadImageURL(credentials, imageURL);
  },

  getThumbnail: (db: string, id: number) => {
    const api = createImageApi();
    return api.getThumbnail(db, id);
  },

  uploadFile: (category: string, type: string, id: number, file: File) => {
    const api = createImageApi();
    return api.uploadFile(category, type, id, file);
  },

  uploadSimulationFile: (category: string, type: string, id: number, file: File) => {
    const api = createImageApi();
    return api.uploadSimulationFile(category, type, id, file);
  },

  updateImagesMeta: (meta: any) => {
    const api = createImageApi();
    return api.updateImagesMeta(meta);
  },
};

export default athleteApi;