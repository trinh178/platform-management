import type { ServicePreview } from './service';
import type { AuditFields } from '@/shared/types/audit';

export type DomainStatus = 'Active' | 'Inactive' | 'Deprecated';

export type Domain = AuditFields & {
  id: string;

  serviceId: string;
  domainCode: string;
  name: string;
  description?: string;
  status: DomainStatus;
  note?: string;

  // Response-only nested preview — xem shared/entities.yaml#ServicePreview.
  service?: ServicePreview;
};

// Shape rút gọn dùng cho nested response (Resource.domain) hoặc danh sách lựa
// chọn nhanh (list_domain_options) — xem shared/entities.yaml#DomainPreview.
export type DomainPreview = Pick<
  Domain,
  'id' | 'domainCode' | 'name' | 'serviceId'
>;
