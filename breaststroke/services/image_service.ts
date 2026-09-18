// services/imageUploadService.ts
import { useFetch } from 'nuxt/app';

/**
 * 이미지를 서버에 업로드하는 서비스
 */
export const useImageUploadService = () => {
  /**
   * 이미지 파일을 서버에 업로드
   * @param file 업로드할 이미지 파일
   * @param type 이미지 타입 (예: 'athletes')
   * @param id 관련 ID (예: 선수 ID)
   * @returns 업로드된 이미지 URL
   */
  const uploadImage = async (file: File, type: string, id: number) => {
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      formData.append('id', id.toString());

      // 서버에 업로드 요청
      const { data, error } = await useFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (error.value) {
        throw new Error(`이미지 업로드 오류: ${error.value.message}`);
      }

      // 서버에서 반환된 이미지 URL 반환
      return data.value;
      // return data.value?.imageUrl;
    } catch (err: any) {
      console.error('이미지 업로드 중 오류 발생:', err);
      throw new Error(err.message || '이미지 업로드에 실패했습니다.');
    }
  };

  /**
   * Base64 데이터 URL을 File 객체로 변환
   * @param dataUrl Base64 데이터 URL
   * @param filename 파일 이름
   * @returns File 객체
   */
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  return {
    uploadImage,
    dataURLtoFile,
  };
};