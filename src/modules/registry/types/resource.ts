import type { DomainPreview } from './domain';
import type { AuditFields } from '@/shared/types/audit';

export type Resource = AuditFields & {
  id: string;

  domainId: string;
  resourceCode: string;
  name: string;
  description?: string;

  // Danh sách action (UPPER_SNAKE_CASE), sắp xếp tăng dần. Mỗi action sinh ra
  // một mã quyền `<ServiceCode>.<DomainCode>.<ResourceCode>.<Action>`.
  actions: string[];

  // Response-only nested preview — xem shared/entities.yaml#DomainPreview.
  domain?: DomainPreview;
};

// Shape rút gọn dùng cho danh sách lựa chọn nhanh (list_resource_options).
export type ResourcePreview = Pick<
  Resource,
  'id' | 'resourceCode' | 'name' | 'domainId'
>;
