// types/imgbb.ts
export interface FileWithPreview {
  file: File;
  preview: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
}

export interface UploadResult {
  filename: string;
  success: boolean;
  url?: string;
  thumb?: string;
  deleteUrl?: string;
  error?: string;
}
