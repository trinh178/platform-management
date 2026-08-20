// Metadata file đã upload qua Asset Service — dùng cho logo/favicon trong Settings,
// icon trong Registry, v.v. Xem docs.business/shared/entities.yaml#AssetRef.
export type AssetRef = {
  assetId: string;
  fileName: string;
  mimeType?: string;
  url?: string;
};
