import type { AssetRef } from '@/shared/types/asset';
import type { AuditFields } from '@/shared/types/audit';

// Singleton — không có id trong URL, chỉ có đúng 1 bản ghi được seed sẵn.
export type OrganizationSetting = AuditFields & {
  id: string;

  name: string;
  legalName?: string;
  logoAssetId?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  note?: string;

  // Response-only nested preview — xem shared/entities.yaml#AssetRef.
  logo?: AssetRef;
};
