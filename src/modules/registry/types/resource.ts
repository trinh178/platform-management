import type { DomainPreview } from './domain';
import type { AuditFields } from '@/shared/types/audit';

export type ResourceStatus = 'Active' | 'Inactive' | 'Deprecated';

export type Resource = AuditFields & {
  id: string;

  domainId: string;
  resourceCode: string;
  name: string;
  description?: string;
  status: ResourceStatus;
  note?: string;

  // Response-only nested preview — xem shared/entities.yaml#DomainPreview.
  domain?: DomainPreview;
};
