export interface AssetMock {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  status: string;
  category?: string;
  createdBy?: string;
  createdOnUtc?: string;
}
