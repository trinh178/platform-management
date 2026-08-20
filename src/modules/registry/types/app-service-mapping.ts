import type { AppPreview } from './app';
import type { ServicePreview } from './service';
import type { AuditFields } from '@/shared/types/audit';

export type AppServiceMapping = AuditFields & {
  id: string;

  appId: string;
  serviceId: string;

  // Response-only nested previews — xem shared/entities.yaml#AppPreview / #ServicePreview.
  app?: AppPreview;
  service?: ServicePreview;
};
