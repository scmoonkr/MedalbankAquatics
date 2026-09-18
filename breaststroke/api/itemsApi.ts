// api/itemApi.ts
import axios from 'axios';
import type { SortDirection, ServerListResponse, ServerResponse } from '~/types/common';
// import { ItemSortField } from '~/types/ootd';
import type { ItemList, Item, ItemFilter } from '~/types/items';
import type { ItemModel } from '~/models/items';

const _URL = "/BR/items";
// 팩토리 함수로 변경
export const createItemApi = () => {
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

  // Item API 서비스
  return {
    // 1. 단일 Item 조회
    async fetchItemApi(itemID: number): Promise<ServerResponse<any>> {
      try {
        const response = await apiClient.get(`${_URL}/${itemID}`);

        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '상품을 불러오는데 실패했습니다.',
          data: {}
        };
      }
    },

    // 2. Item 목록 조회
    async fetchItemListApi(params: ItemFilter): Promise<ServerListResponse<any>> {
      try {
        // params 객체가 서버에 전송되기 전에 문자열화되므로 타입 호환성 문제는 실행 시 발생하지 않음
        const response = await apiClient.post(`${_URL}`, params);

        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '상품 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 2. Item 목록 조회
    async fetchCollectionApi(slug: string): Promise<ServerListResponse<any>> {
      try {
        // params 객체가 서버에 전송되기 전에 문자열화되므로 타입 호환성 문제는 실행 시 발생하지 않음
        const response = await apiClient.get(`${_URL}/collection/${slug}`);

        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '상품 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 2. Item 목록 조회
    async fetchCollectionListApi(collection: string): Promise<ServerListResponse<any>> {
      try {
        // params 객체가 서버에 전송되기 전에 문자열화되므로 타입 호환성 문제는 실행 시 발생하지 않음
        const response = await apiClient.post(`${_URL}/collections`, { collection: collection || ''});

        // 서버 응답 데이터 추출
        const responseData = response.data as ServerListResponse<any>;

        return responseData;
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '상품 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 5. 상품 수정
    async saveWithImageApi(item: Item, imageFile: File): Promise<ServerResponse<any>> {
  console.log("saveWithImage.item", item);
      try {
        const formData = new FormData();
        
        // toRaw()로 Proxy 제거하고 더 안전한 조건문 사용
        const rawItem = toRaw(item);
        
        if (rawItem.itemID !== undefined && rawItem.itemID !== null) {
          formData.append('itemID', rawItem.itemID.toString());
        }
        if (rawItem.title) formData.append('title', rawItem.title);
        if (rawItem.titleEng) formData.append('titleEng', rawItem.titleEng);
        if (rawItem.subtitle) formData.append('subtitle', rawItem.subtitle);
        if (rawItem.type) formData.append('type', rawItem.type);
        if (rawItem.category) formData.append('category', rawItem.category);
        if (rawItem.brand) formData.append('brand', rawItem.brand);
        if (rawItem.url) formData.append('url', rawItem.url);
        if (rawItem.description) formData.append('description', rawItem.description);
        
        if (imageFile) formData.append('image', imageFile);

        // FormData 내용 확인 (디버깅용)
        console.log("FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        const response = await apiClient.post(`${_URL}/saveWithImage`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const responseData = response.data as ServerResponse<any>;
        return {
          message: responseData.message || '상품이 성공적으로 수정되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        return {
          message: error.response?.data?.message || '상품 수정에 실패했습니다.',
          data: {}
        };
      }
    },

    // 6. 상품 삭제
    async deleteItemApi(itemID: number): Promise<ServerResponse<any>> {
      try {
        const response = await apiClient.delete(`${_URL}/${itemID}`);

        // 서버 응답 데이터 추출
        const responseData = response.data as ServerResponse<any>;

        return {
          message: responseData.message || '상품이 성공적으로 삭제되었습니다.',
          data: responseData.data || {}
        };
      } catch (error: any) {
        return {
          message: error.response?.data?.message || '상품 삭제에 실패했습니다.',
          data: {}
        };
      }
    },
  };
};

// 컴포저블 함수 추가
export const useItemApi = () => {
  return createItemApi();
};

// Item API 서비스
const itemApi = {
  // 단일 아이템 조회
  fetchItemApi: async (itemID: number): Promise<ServerResponse<any>> => {
    const api = createItemApi();
    return api.fetchItemApi(itemID);
  },

  // 아이템 목록 조회
  fetchItemListApi: async (params: ItemFilter): Promise<ServerListResponse<any>> => {
    const api = createItemApi();
    return api.fetchItemListApi(params);
  },

  // 아이템 목록 조회
  fetchCollectionApi: async (slug: string): Promise<ServerListResponse<any>> => {
    const api = createItemApi();
    return api.fetchCollectionApi(slug);
  },

  // 아이템 목록 조회
  fetchCollectionListApi: async (collection: string): Promise<ServerListResponse<any>> => {
    const api = createItemApi();
    return api.fetchCollectionListApi(collection);
  },

  // 아이템 수정
  saveWithImageApi: async (item: Item, imageFile: File): Promise<ServerResponse<any>> => {
    const api = createItemApi();
    return api.saveWithImageApi(item, imageFile);
  },

  // 아이템 삭제
  deleteItemApi: async (itemID: number): Promise<ServerResponse<any>> => {
    const api = createItemApi();
    return api.deleteItemApi(itemID);
  },
};

export default itemApi;