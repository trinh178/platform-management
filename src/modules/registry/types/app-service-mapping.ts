import type { AppPreview } from './app';
import type { ServicePreview } from './service';
import type { AuditFields } from '@/shared/types/audit';

// Primary: service "chính" của App — quyết định App có hiển thị trong
// AppSwitcher (/me/apps) cho user hay không. Dependency: service App gọi tới.
export type AppServiceRole = 'Primary' | 'Dependency';

export type AppServiceMapping = AuditFields & {
  id: string;

  appId: string;
  serviceId: string;
  role: AppServiceRole;

  // Response-only nested previews — xem shared/entities.yaml#AppPreview / #ServicePreview.
  app?: AppPreview;
  service?: ServicePreview;
};
