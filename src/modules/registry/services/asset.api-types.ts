// POST /registry/assets/upload
// PLM backend forward request lên Asset Service (xem docs.business/external-services.yaml) —
// frontend chỉ gọi endpoint của PLM, không gọi trực tiếp Asset Service.
export type UploadAssetRequest = {
  file: File;
  category?: string;
};

export type UploadAssetResponse = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  status: string;
};
