// store/athletes.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import type { ImageParams, PaginationOptions } from '~/types/common';


import imageApi from '~/api/imageApi';

export const useImageStore = defineStore('image', () => {
  // State
  const isImageUploading = ref(false);
  const imageUploadError = ref<string | null>(null);

  // Getters
  // 액션: 선수 이미지 파일 업로드
  async function uploadImage(db: string, id: number, imageFile: File, userID: number): Promise<string | null> {
    try {
      isImageUploading.value = true;
      imageUploadError.value = null;

      const imageParams: ImageParams = {
        db: db,
        id: id,
        userID: userID,
        fileType: 'featured'
      };

      const response = await imageApi.uploadImageFile(imageParams, imageFile);

      if (response.data && response.data.imageUrl) {

        return response.data.imageUrl;
      } else {
        imageUploadError.value = response.message || '이미지 업로드에 실패했습니다.';
        return null;
      }
    } catch (err: any) {
      imageUploadError.value = err.message || '이미지 업로드 중 오류가 발생했습니다.';
      return null;
    } finally {
      isImageUploading.value = false;
    }
  }

  // 액션: 선수 이미지 URL 업로드
  async function uploadImageUrl(db: string, id: number, imageURL: string, userID: number, fileType: string): Promise<string | null> {
    try {
      isImageUploading.value = true;
      imageUploadError.value = null;

      const imageParams: ImageParams = {
        db: db,
        id: id,
        userID: userID,
        fileType: fileType,
      };

      const response = await imageApi.uploadImageURL(imageParams, imageURL);

      if (response.data && response.data.imageUrl) {

        return response.data.imageUrl;
      } else {
        imageUploadError.value = response.message || '이미지 URL 업로드에 실패했습니다.';
        return null;
      }
    } catch (err: any) {
      imageUploadError.value = err.message || '이미지 URL 업로드 중 오류가 발생했습니다.';
      return null;
    } finally {
      isImageUploading.value = false;
    }
  }

  // Base64 데이터 URL을 File 객체로 변환하는 함수
  async function updateImagesMeta(meta: any): Promise<void> {
      const response = await imageApi.updateImagesMeta(meta);
      console.log("response=", response);

      return;
  }

  // Base64 데이터 URL을 File 객체로 변환하는 함수
  function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  // 선수 이미지 업로드 (Base64 데이터 URL 사용)
  async function uploadImageImageFromDataURL(athleteID: number, dataURL: string, userID: number): Promise<string | null> {
    try {
      const fileName = `athlete_${athleteID}_featured.jpg`;
      const file = dataURLtoFile(dataURL, fileName);
      return await uploadImageImage(athleteID, file, userID);
    } catch (err: any) {
      imageUploadError.value = err.message || '이미지 변환 중 오류가 발생했습니다.';
      return null;
    }
  }

  return {
    // 상태
    isImageUploading,
    imageUploadError,

    uploadImage,
    uploadImageUrl,
    uploadImageImageFromDataURL,
    updateImagesMeta,
    dataURLtoFile
  };
});
