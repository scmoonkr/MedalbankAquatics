// models/imgbb.ts
// ✅ 수정: Composable을 안전하게 사용하도록 리팩토링

import { useImageUploadApi } from '~/api/imgbbApi';
import {
  type FileWithPreview,
  type UploadResult,
  type UploadOptions,
  type ValidationOptions,
  type UploadConfig,
  type UploadError,
  type UploadErrorCode,
  UploadErrorCodes,
  type BatchUploadResult,
  type ExportFormat,
  DEFAULT_UPLOAD_CONFIG,
  DEFAULT_VALIDATION_OPTIONS
} from '~/types/imgbb';

// ============================
// 메인 이미지 업로드 모델
// ============================

export class ImageUploadModel {
  private config: UploadConfig;
  private validationOptions: ValidationOptions;
  // ✅ 수정: API 인스턴스를 지연 로딩
  private _apiInstance: ReturnType<typeof useImageUploadApi> | null = null;

  constructor(config?: Partial<UploadConfig>, validationOptions?: Partial<ValidationOptions>) {
    this.config = { ...DEFAULT_UPLOAD_CONFIG, ...config };
    this.validationOptions = { ...DEFAULT_VALIDATION_OPTIONS, ...validationOptions };
  }

  // ✅ 수정: API 인스턴스 getter
  private get api() {
    if (!this._apiInstance) {
      this._apiInstance = useImageUploadApi();
    }
    return this._apiInstance;
  }

  // ============================
  // 파일 검증 메서드들
  // ============================

  /**
   * 단일 파일 검증
   */
  validateFile(file: File): { valid: boolean; errors: UploadError[] } {
    const errors: UploadError[] = [];

    // 파일 크기 검증
    if (file.size > this.config.maxFileSize) {
      errors.push({
        code: UploadErrorCodes.FILE_TOO_LARGE,
        message: `파일 크기가 ${this.formatFileSize(this.config.maxFileSize)}를 초과합니다.`,
        filename: file.name
      });
    }

    // 파일 타입 검증
    if (!this.config.allowedTypes.includes(file.type)) {
      errors.push({
        code: UploadErrorCodes.INVALID_FILE_TYPE,
        message: `지원하지 않는 파일 형식입니다. (${this.config.allowedTypes.join(', ')})`,
        filename: file.name
      });
    }

    // 파일이 실제로 이미지인지 검증
    if (!file.type.startsWith('image/')) {
      errors.push({
        code: UploadErrorCodes.INVALID_FILE_TYPE,
        message: '이미지 파일만 업로드 가능합니다.',
        filename: file.name
      });
    }

    // 파일명 검증
    if (!this.validateFilename(file.name)) {
      errors.push({
        code: UploadErrorCodes.INVALID_FILE_TYPE,
        message: '파일명에 허용되지 않는 문자가 포함되어 있습니다.',
        filename: file.name
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 여러 파일 검증
   */
  validateFiles(files: File[]): { 
    valid: File[]; 
    invalid: { file: File; errors: UploadError[] }[];
    totalErrors: UploadError[];
  } {
    const valid: File[] = [];
    const invalid: { file: File; errors: UploadError[] }[] = [];
    const totalErrors: UploadError[] = [];

    // 파일 개수 검증
    if (files.length > this.config.maxFiles) {
      totalErrors.push({
        code: UploadErrorCodes.QUOTA_EXCEEDED,
        message: `최대 ${this.config.maxFiles}개의 파일까지 업로드 가능합니다.`
      });
    }

    // 각 파일 개별 검증
    files.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.valid) {
        valid.push(file);
      } else {
        invalid.push({ file, errors: validation.errors });
        totalErrors.push(...validation.errors);
      }
    });

    return { valid, invalid, totalErrors };
  }

  /**
   * 중복 파일 검증
   */
  validateDuplicates(newFiles: FileWithPreview[], existingFiles: FileWithPreview[]): FileWithPreview[] {
    return newFiles.filter(newFile => {
      const isDuplicate = existingFiles.some(existing => 
        this.generateFileKey(existing.file) === this.generateFileKey(newFile.file)
      );
      return !isDuplicate;
    });
  }

  /**
   * 이미지 차원 검증 (선택적)
   */
  async validateImageDimensions(file: File): Promise<{ valid: boolean; error?: UploadError }> {
    if (!this.validationOptions.validateDimensions) {
      return { valid: true };
    }

    try {
      const metadata = await this.api.extractImageMetadata(file);
      const { width, height } = metadata.dimensions;

      const { minWidth, minHeight, maxWidth, maxHeight } = this.validationOptions;

      if (minWidth && width < minWidth) {
        return {
          valid: false,
          error: {
            code: UploadErrorCodes.INVALID_DIMENSIONS,
            message: `이미지 너비가 최소 ${minWidth}px 이상이어야 합니다.`,
            filename: file.name
          }
        };
      }

      if (minHeight && height < minHeight) {
        return {
          valid: false,
          error: {
            code: UploadErrorCodes.INVALID_DIMENSIONS,
            message: `이미지 높이가 최소 ${minHeight}px 이상이어야 합니다.`,
            filename: file.name
          }
        };
      }

      if (maxWidth && width > maxWidth) {
        return {
          valid: false,
          error: {
            code: UploadErrorCodes.INVALID_DIMENSIONS,
            message: `이미지 너비가 최대 ${maxWidth}px 이하여야 합니다.`,
            filename: file.name
          }
        };
      }

      if (maxHeight && height > maxHeight) {
        return {
          valid: false,
          error: {
            code: UploadErrorCodes.INVALID_DIMENSIONS,
            message: `이미지 높이가 최대 ${maxHeight}px 이하여야 합니다.`,
            filename: file.name
          }
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: {
          code: UploadErrorCodes.INVALID_FILE_TYPE,
          message: '이미지 메타데이터를 읽을 수 없습니다.',
          filename: file.name
        }
      };
    }
  }

  // ============================
  // 파일 처리 메서드들
  // ============================

  /**
   * 파일을 FileWithPreview로 변환
   */
  async createFileWithPreview(file: File): Promise<FileWithPreview> {
    const preview = await this.api.generatePreview(file);
    const id = this.generateFileKey(file);

    return {
      file,
      preview,
      id,
      uploadStatus: 'pending'
    };
  }

  /**
   * 여러 파일을 FileWithPreview로 변환
   */
  async createFilesWithPreview(files: File[]): Promise<FileWithPreview[]> {
    const promises = files.map(file => this.createFileWithPreview(file));
    return await Promise.all(promises);
  }

  /**
   * 파일 고유 키 생성
   */
  generateFileKey(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  /**
   * 파일명 유효성 검사
   */
  private validateFilename(filename: string): boolean {
    // 위험한 문자 제거 (보안)
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    return !dangerousChars.test(filename) && filename.length > 0;
  }

  // ============================
  // 업로드 관련 메서드들
  // ============================

  /**
   * 단일 파일 업로드
   */
  async uploadFile(
    fileWithPreview: FileWithPreview, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // 업로드 전 검증
    const validation = this.validateFile(fileWithPreview.file);
    if (!validation.valid) {
      throw new Error(validation.errors[0].message);
    }

    // 차원 검증 (필요한 경우)
    if (this.validationOptions.validateDimensions) {
      const dimensionValidation = await this.validateImageDimensions(fileWithPreview.file);
      if (!dimensionValidation.valid) {
        throw new Error(dimensionValidation.error!.message);
      }
    }

    try {
      return await this.api.uploadSingle(fileWithPreview.file, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 여러 파일 배치 업로드
   */
  async uploadFiles(
    filesWithPreview: FileWithPreview[],
    options: UploadOptions = {},
    onProgress?: (progress: { completed: number; total: number; current?: string }) => void
  ): Promise<BatchUploadResult> {
    // 모든 파일 검증
    const files = filesWithPreview.map(f => f.file);
    const validation = this.validateFiles(files);
    
    if (validation.totalErrors.length > 0) {
      console.warn('일부 파일 검증 실패:', validation.totalErrors);
    }

    // 유효한 파일만 업로드
    const validFiles = validation.valid;
    
    if (validFiles.length === 0) {
      throw new Error('업로드할 유효한 파일이 없습니다.');
    }

    return await this.api.uploadBatch(
      validFiles,
      options,
      this.config.batchSize,
      onProgress
    );
  }

  // ============================
  // 파일 관리 메서드들
  // ============================

  /**
   * 파일 제거 (메모리 정리 포함)
   */
  removeFile(fileWithPreview: FileWithPreview): void {
    if (fileWithPreview.preview && fileWithPreview.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileWithPreview.preview);
    }
  }

  /**
   * 여러 파일 제거
   */
  removeFiles(filesWithPreview: FileWithPreview[]): void {
    filesWithPreview.forEach(file => this.removeFile(file));
  }

  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes: number): string {
    return this.api.formatFileSize(bytes);
  }

  /**
   * 총 파일 크기 계산
   */
  calculateTotalSize(files: FileWithPreview[]): number {
    return files.reduce((total, file) => total + file.file.size, 0);
  }

  // ============================
  // 통계 및 분석 메서드들
  // ============================

  /**
   * 업로드 결과 통계 생성
   */
  generateStatistics(results: UploadResult[]): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    totalSize: number;
    averageSize: number;
    fileTypes: Record<string, number>;
  } {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalSize = successful.reduce((sum, r) => sum + (r.size || 0), 0);
    
    // 파일 타입별 통계
    const fileTypes: Record<string, number> = {};
    results.forEach(result => {
      const extension = this.api.getFileExtension(result.filename);
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;
    });

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: results.length > 0 ? (successful.length / results.length) * 100 : 0,
      totalSize,
      averageSize: successful.length > 0 ? totalSize / successful.length : 0,
      fileTypes
    };
  }

  // ============================
  // 내보내기 관련 메서드들
  // ============================

  /**
   * 업로드 결과를 다양한 형식으로 내보내기
   */
  exportResults(
    results: UploadResult[], 
    format: ExportFormat,
    options: { includeMetadata?: boolean } = {}
  ): string {
    const successResults = results.filter(r => r.success && r.url);

    if (successResults.length === 0) {
      return '';
    }

    let content = '';

    switch (format) {
      case 'plain':
        content = successResults.map(r => r.url).join('\n');
        break;

      case 'markdown':
        content = successResults
          .map(r => `![${r.filename}](${r.url})`)
          .join('\n');
        break;

      case 'html':
        content = successResults
          .map(r => `<img src="${r.url}" alt="${r.filename}" />`)
          .join('\n');
        break;

      case 'json':
        content = JSON.stringify(successResults, null, 2);
        break;

      case 'csv':
        const headers = ['filename', 'url', 'thumbnailUrl', 'size', 'uploadedAt'];
        const rows = successResults.map(r => [
          r.filename,
          r.url || '',
          r.thumbnailUrl || '',
          r.size?.toString() || '',
          r.uploadedAt || ''
        ]);
        content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        break;

      default:
        content = successResults.map(r => r.url).join('\n');
    }

    if (options.includeMetadata && format !== 'json') {
      const metadata = this.generateStatistics(results);
      const metadataText = [
        `// 업로드 통계`,
        `// 총 파일: ${metadata.total}개`,
        `// 성공: ${metadata.successful}개`,
        `// 실패: ${metadata.failed}개`,
        `// 성공률: ${metadata.successRate.toFixed(1)}%`,
        `// 총 크기: ${this.formatFileSize(metadata.totalSize)}`,
        `// 생성일: ${new Date().toISOString()}`,
        '',
        content
      ].join('\n');
      return metadataText;
    }

    return content;
  }

  // ============================
  // 설정 관리 메서드들
  // ============================

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<UploadConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 검증 옵션 업데이트
   */
  updateValidationOptions(newOptions: Partial<ValidationOptions>): void {
    this.validationOptions = { ...this.validationOptions, ...newOptions };
  }

  /**
   * 현재 설정 조회
   */
  getConfig(): UploadConfig {
    return { ...this.config };
  }

  /**
   * 현재 검증 옵션 조회
   */
  getValidationOptions(): ValidationOptions {
    return { ...this.validationOptions };
  }

  // ============================
  // 유틸리티 메서드들
  // ============================

  /**
   * 드래그 앤 드롭 이벤트에서 파일 추출
   */
  extractFilesFromDropEvent(event: DragEvent): File[] {
    const files: File[] = [];
    
    if (event.dataTransfer?.items) {
      // DataTransferItemList 사용
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    } else if (event.dataTransfer?.files) {
      // FileList 사용 (fallback)
      files.push(...Array.from(event.dataTransfer.files));
    }

    return files.filter(file => this.api.isImageFile(file));
  }

  /**
   * 파일 input에서 파일 추출
   */
  extractFilesFromInput(input: HTMLInputElement): File[] {
    if (!input.files) return [];
    return Array.from(input.files).filter(file => this.api.isImageFile(file));
  }

  /**
   * 업로드 진행률 계산
   */
  calculateProgress(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * 예상 업로드 시간 계산 (간단한 추정)
   */
  estimateUploadTime(
    totalSize: number, 
    averageSpeed: number = 1024 * 1024 // 1MB/s 기본값
  ): number {
    return Math.ceil(totalSize / averageSpeed);
  }

  /**
   * 업로드 속도 계산
   */
  calculateUploadSpeed(
    uploadedSize: number, 
    elapsedTime: number // 밀리초
  ): number {
    if (elapsedTime === 0) return 0;
    return (uploadedSize / elapsedTime) * 1000; // bytes per second
  }
}

// ============================
// ✅ 수정: 팩토리 함수 방식으로 변경
// ============================

// 싱글톤 인스턴스 지연 생성
let _imageUploadModelInstance: ImageUploadModel | null = null;

export function createImageUploadModel(
  config?: Partial<UploadConfig>, 
  validationOptions?: Partial<ValidationOptions>
): ImageUploadModel {
  return new ImageUploadModel(config, validationOptions);
}

export function getImageUploadModel(): ImageUploadModel {
  if (!_imageUploadModelInstance) {
    _imageUploadModelInstance = new ImageUploadModel();
  }
  return _imageUploadModelInstance;
}

// ✅ 추가: Composable-safe 사용 함수
export const useImageUploadModel = (
  config?: Partial<UploadConfig>, 
  validationOptions?: Partial<ValidationOptions>
) => {
  // 매번 새 인스턴스를 생성하여 composable 문제를 방지
  if (config || validationOptions) {
    return createImageUploadModel(config, validationOptions);
  }
  return getImageUploadModel();
};

// 기본 내보내기 (호환성)
export default createImageUploadModel;

// 호환성을 위한 별칭
export const imageUploadModel = getImageUploadModel();