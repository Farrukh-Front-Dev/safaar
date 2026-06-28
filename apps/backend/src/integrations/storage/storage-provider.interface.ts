export interface PresignedUploadInput {
  ownerType: string;
  ownerId: string;
  filename: string;
  mimeType: string;
  visibility: 'public' | 'private';
}

export interface PresignedUploadResult {
  fileId: string;
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers?: Record<string, string>;
  expiresInSeconds: number;
}

export interface StorageProvider {
  createPresignedUpload(
    input: PresignedUploadInput,
  ): Promise<PresignedUploadResult>;
  createSignedDownload(
    fileId: string,
  ): Promise<{ downloadUrl: string; expiresInSeconds: number }>;
  deleteObject(fileId: string): Promise<void>;
}
