import type { AuditFields } from '@/shared/types/audit';

export type ServiceStatus = 'Active' | 'Inactive' | 'Deprecated';

export type Service = AuditFields & {
  id: string;

  serviceCode: string;
  name: string;
  description?: string;
  version?: string;
  status: ServiceStatus;
  metadata?: string;
  note?: string;
};

// Shape rút gọn dùng cho nested response (Domain.service) hoặc danh sách lựa
// chọn nhanh (list_service_options) — xem shared/entities.yaml#ServicePreview.
export type ServicePreview = Pick<
  Service,
  'id' | 'serviceCode' | 'name' | 'status'
>;
