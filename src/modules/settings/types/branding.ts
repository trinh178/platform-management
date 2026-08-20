import type { AssetRef } from '@/shared/types/asset';
import type { AuditFields } from '@/shared/types/audit';

// Singleton — không có id trong URL, chỉ có đúng 1 bản ghi được seed sẵn.
export type BrandingSetting = AuditFields & {
  id: string;

  platformName: string;
  logoAssetId?: string;
  faviconAssetId?: string;
  brandConfig?: string;
  note?: string;

  // Response-only nested previews — xem shared/entities.yaml#AssetRef.
  logo?: AssetRef;
  favicon?: AssetRef;
};
