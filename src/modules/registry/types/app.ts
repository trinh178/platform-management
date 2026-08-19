import type { AuditFields } from '@/shared/types/audit';

export type AppStatus = 'Active' | 'Inactive' | 'Deprecated';

export type App = AuditFields & {
  id: string;

  appCode: string;
  name: string;
  description?: string;
  version?: string;
  status: AppStatus;
  metadata?: string;
  note?: string;
};
