// /api/youtubeApi.ts
import axios from 'axios';
import type { SortDirection, ServerListResponse, ServerResponse } from '@/types/common';
import type { IYoutubeData, IYoutubeFilter } from '~/types/youtube';
import type { YoutubeModel } from '~/models/youtube';
import { buildFormData } from '~/utils/utilLibrary';

const _URL = "/BR/youtube";

const { createClient } = useApiClient();
const client = createClient();

// Youtube 목록 조회
export async function getYoutubeListApi(params: IYoutubeFilter): Promise<ServerListResponse<any>> {
  try {
    const response = await client.post(`${_URL}`, params);
    return response.data as ServerListResponse<any>;
  } catch (error: any) {
    console.error('getYoutubeList error:', error);
    return {
      message: error.response?.data?.message || 'Youtube 목록을 불러오는데 실패했습니다.',
      count: 0,
      data: []
    };
  }
}

// 단일 Youtube 조회
export async function getYoutubeApi(youtubeID: number): Promise<ServerResponse<any>> {
  try {
    const response = await client.get(`${_URL}/${youtubeID}`);
    return response.data as ServerResponse<any>;
  } catch (error: any) {
    console.error('getYoutube error:', error);
    return {
      message: error.response?.data?.message || 'Youtube를 불러오는데 실패했습니다.',
      data: {}
    };
  }
}

// 이미지와 함께 Youtube 업데이트
export async function uploadImageFileApi(youtube: YoutubeModel, featuredImage: File | null | undefined): Promise<ServerResponse<any>> {
  try {
    console.log("uploadImageFile.Youtube=", youtube, featuredImage);
    
    const formData = buildFormData(youtube, [
      'comments',
      'updated'
    ]);

    if (featuredImage) formData.append('image', featuredImage);

    const response = await client.post(`${_URL}/updateWithImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      message: response.data.message || '이미지가 성공적으로 업로드되었습니다.',
      data: response.data
    };
  } catch (error: any) {
    console.error('uploadImageFile error:', error);
    return {
      message: error.response?.data?.message || '이미지 업로드에 실패했습니다.',
      data: {}
    };
  }
}

// Youtube 수정
export async function updateYoutubeApi(youtube: YoutubeModel): Promise<ServerResponse<any>> {
  try {
    const response = await client.patch(`${_URL}`, youtube);
    return response.data
  } catch (error: any) {
    console.error('updateYoutube error:', error);
    return {
      message: error.response?.data?.message || 'Youtube를 수정하는데 실패했습니다.',
      data: {}
    };
  }
}

// Youtube 삭제
export async function deleteYoutubeApi(youtubeID: number): Promise<ServerResponse<any>> {
  try {
    const response = await client.delete(`${_URL}/${youtubeID}`);
    return response.data as ServerResponse<any>;
  } catch (error: any) {
    console.error('deleteYoutube error:', error);
    return {
      message: error.response?.data?.message || 'Youtube를 삭제하는데 실패했습니다.',
      data: {}
    };
  }
}

// 컴포저블 함수로 API 사용
export const useYoutubeApi = () => {
  return {
    getYoutubeListApi,
    getYoutubeApi,
    uploadImageFileApi,
    updateYoutubeApi,
    deleteYoutubeApi,
  };
};

// 기존 호환성을 위한 default export (선택사항)
const YoutubeApi = {
  getYoutubeListApi,
  getYoutubeApi,
  uploadImageFileApi,
  updateYoutubeApi,
  deleteYoutubeApi,
};

export default YoutubeApi;