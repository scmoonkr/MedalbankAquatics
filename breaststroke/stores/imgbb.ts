// stores/imgbb.ts
import { defineStore } from 'pinia';
import type { FileWithPreview, UploadResult } from '~/types/imgbb';
import imgbbApi from '~/api/imgbbApi';
import type { makeMetaImgBB } from '~/utils/utilLibrary';

interface ImageBBState {
  selectedFiles: FileWithPreview[];
  uploadResults: UploadResult[];
  isUploading: boolean;
  isDragOver: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  batchSize: number;
  totalUploaded: number;
  totalFailed: number;
  isInitialized: boolean;
}

export const useImageBBStore = defineStore('imagebb', {
  state: (): ImageBBState => ({
    selectedFiles: [],
    uploadResults: [],
    isUploading: false,
    isDragOver: false,
    maxFileSize: 32,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    batchSize: 3,
    totalUploaded: 0,
    totalFailed: 0,
    isInitialized: false
  }),

  getters: {
    uploadProgress(): number {
      if (this.selectedFiles.length === 0) return 0;
      const completed = this.selectedFiles.filter(file => 
        file.uploadStatus === 'success' || file.uploadStatus === 'error'
      ).length;
      return (completed / this.selectedFiles.length) * 100;
    },

    uploadedCount(): number {
      return this.selectedFiles.filter(file => file.uploadStatus === 'success').length;
    },

    failedCount(): number {
      return this.selectedFiles.filter(file => file.uploadStatus === 'error').length;
    },

    totalFileSize(): number {
      return this.selectedFiles.reduce((total, file) => total + file.file.size, 0);
    },

    successfulUploads(): UploadResult[] {
      return this.uploadResults.filter(result => result.success);
    },

    failedUploads(): UploadResult[] {
      return this.uploadResults.filter(result => !result.success);
    },

    formattedTotalSize(): string {
      if (this.totalFileSize === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(this.totalFileSize) / Math.log(k));
      return parseFloat((this.totalFileSize / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    canUpload(): boolean {
      return this.selectedFiles.length > 0 && !this.isUploading && this.isInitialized;
    },

    canDrop(): boolean {
      return !this.isUploading && this.isInitialized;
    }
  },

  actions: {
    // 초기화 메서드 (클라이언트 사이드에서만 호출)
    initialize(): void {
      if (process.client) {
        this.isInitialized = true;
      }
    },

    generateFileKey(file: File): string {
      return `${file.name}-${file.size}-${file.lastModified}`;
    },

    formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    addFiles(files: File[]): string[] {
      if (!this.isInitialized) {
        console.warn('ImageBB Store가 초기화되지 않았습니다.');
        return ['스토어가 초기화되지 않았습니다.'];
      }

      const errors: string[] = [];

      files.forEach(file => {
        // 파일 타입 검사
        if (!this.allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
          return;
        }
        
        // 파일 크기 검사
        const maxSizeBytes = this.maxFileSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          errors.push(`${file.name}: 파일 크기가 ${this.maxFileSize}MB를 초과합니다.`);
          return;
        }
        
        // 중복 파일 검사
        const isDuplicate = this.selectedFiles.some(existing => 
          this.generateFileKey(existing.file) === this.generateFileKey(file)
        );
        
        if (isDuplicate) {
          errors.push(`${file.name}: 이미 선택된 파일입니다.`);
          return;
        }
        
        // 미리보기 생성 (클라이언트에서만)
        if (process.client && typeof URL !== 'undefined') {
          const preview = URL.createObjectURL(file);
          this.selectedFiles.push({
            file,
            preview
          });
        }
      });

      return errors;
    },

    removeFile(index: number): void {
      if (!this.isInitialized) return;

      if (index >= 0 && index < this.selectedFiles.length) {
        const file = this.selectedFiles[index];
        
        // URL 해제 (클라이언트에서만)
        if (process.client && typeof URL !== 'undefined') {
          URL.revokeObjectURL(file.preview);
        }
        
        this.selectedFiles.splice(index, 1);
      }
    },

    clearAllFiles(): void {
      if (!this.isInitialized) return;

      // URL 해제 (클라이언트에서만)
      if (process.client && typeof URL !== 'undefined') {
        this.selectedFiles.forEach(file => {
          URL.revokeObjectURL(file.preview);
        });
      }
      
      this.selectedFiles = [];
      this.uploadResults = [];
    },

    async fetchCompetitionList(): Promise<any[]> {
			
			try {
				const result = await imgbbApi.listCompetition();
				
				// Return the data array or empty array as fallback
				return result?.data || [];
				
			} catch (error) {
				console.error('이미지 목록 가져오기 중 오류:', error);
				
				// Return empty array on error instead of undefined
				return [];
				
			} finally {
				// Only set isUploading to false if it was set to true earlier
				// This seems like it might be in the wrong function
				if (this.isUploading) {
					this.isUploading = false;
				}
			}
		},

    async fetchImageList(competition: any, options: any): Promise<any[]> {
			
			try {
				// Build params object using the passed parameters
				const params = {
					competitionID: competition.competitionID,
					// Add relevant parameters based on competition and options
					// Example:
					// competitionId: competition?.id,
					// ...options
				};
				if (options.type) params.type = options.type;
				
				const result = await imgbbApi.listImageMeta(params);
				
				// Return the data array or empty array as fallback
				return result?.data || [];
				
			} catch (error) {
				console.error('이미지 목록 가져오기 중 오류:', error);
				
				// Return empty array on error instead of undefined
				return [];
				
			} finally {
				// Only set isUploading to false if it was set to true earlier
				// This seems like it might be in the wrong function
				if (this.isUploading) {
					this.isUploading = false;
				}
			}
		},

    async uploadAllImages(item: any): Promise<void> {
      if (!this.isInitialized || this.selectedFiles.length === 0) return;
      
      this.isUploading = true;
      this.uploadResults = [];
      try {
        this.selectedFiles.forEach(file => {
          file.uploadStatus = undefined;
        });
				
        this.totalUploaded = 0;
        this.totalFailed = 0;
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const batch = this.selectedFiles[i];
					const name = `item-${item.type}-${item.category}-${item.brand}-${item.itemID}-${batch.file.name}`;
          try {
  					const result = await imgbbApi.uploadImageFile(name, batch.file);
            const meta = makeMetaImgBB("items", item.itemID, result.data);
            //----------------------------------------------
            meta.filename = batch.file.name;
            console.log("makeMetaImgBB.metq=", meta);
					  const result1 = await imgbbApi.insertImageMeta(meta);
            //----------------------------------------------

            this.totalUploaded++;
          } catch (e) {
            console.error('업로드 중 오류:', e);
            this.totalFailed++;
          }
        }
        
      } catch (error) {
        console.error('업로드 중 오류:', error);
      } finally {
        this.isUploading = false;
      }
    },

		// makeMeta(result: any): any {
		// 	result = result.data;
		// 	const urlParts  = result.delete_url.split('/');
		// 	const url = result.display_url || result.url;
		// 	const res = {
		// 		imageID			: result.id,
		// 		hash				: urlParts[urlParts.length - 1],

		// 		// title				: result.title,
		// 		url					: result.url || result.display_url,	
		// 		medium			: result.medium?.url || url,	
		// 		thumb				: result.thumb?.url || url,  // 180 * 180

		// 		width				: result.width,
		// 		height			: result.height,
		// 		size				: result.size,
		// 		// timeStamp		: result.time,
		// 	};
		// 	return res;
		// },

    clearResults(): void {
      this.uploadResults = [];
    },

    async copyToClipboard(text: string): Promise<boolean> {
      if (!this.isInitialized || !process.client) return false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          // 폴백 방법
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
          } catch (err) {
            document.body.removeChild(textArea);
            return false;
          }
        }
      } catch (error) {
        console.error('클립보드 복사 실패:', error);
        return false;
      }
    },

    async exportUrls(format: 'plain' | 'markdown' = 'plain'): Promise<boolean> {
      if (!this.isInitialized) return false;

      const successResults = this.successfulUploads;
      
      if (successResults.length === 0) {
        return false;
      }
      
      let output = '';
      
      switch (format) {
        case 'markdown':
          output = successResults
            .map(result => `![${result.filename}](${result.url})`)
            .join('\n');
          break;
        case 'plain':
        default:
          output = successResults
            .map(result => result.url)
            .join('\n');
          break;
      }
      
      return await this.copyToClipboard(output);
    },

    setDragOver(isDragOver: boolean): void {
      if (!this.isInitialized) return;
      this.isDragOver = isDragOver;
    },

    cleanup(): void {
      if (!this.isInitialized || !process.client) return;

      if (typeof URL !== 'undefined') {
        this.selectedFiles.forEach(file => {
          URL.revokeObjectURL(file.preview);
        });
      }
      
      // 상태 초기화
      this.selectedFiles = [];
      this.uploadResults = [];
      this.isDragOver = false;
      this.isUploading = false;
    },

    // 디버깅용 메서드
    getState() {
      return {
        isInitialized: this.isInitialized,
        selectedFilesCount: this.selectedFiles.length,
        uploadResultsCount: this.uploadResults.length,
        isUploading: this.isUploading,
        isDragOver: this.isDragOver,
        totalUploaded: this.totalUploaded,
        totalFailed: this.totalFailed
      };
    }
  }
});