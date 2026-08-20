import type { AuditFields } from '@/shared/types/audit';

export type AppStatus = 'Active' | 'Inactive' | 'Deprecated';

export type App = AuditFields & {
  id: string;

  appCode: string;
  name: string;
  description?: string;
  version?: string;
  status: AppStatus;
  url?: string;
  iconUrl?: string;
  tags?: string[];
  metadata?: string;
};

// Shape rút gọn dùng cho nested response (AppServiceMapping.app) hoặc danh
// sách lựa chọn nhanh (list_app_options) — xem shared/entities.yaml#AppPreview.
export type AppPreview = Pick<App, 'id' | 'appCode' | 'name' | 'status'>;
