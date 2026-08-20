import type { OrganizationSettingMock } from './mock-types';
import { CURRENT_USER_ID } from '@/mock/constants';

// Singleton — được seed sẵn khi triển khai platform lần đầu, không có flow tạo/xóa.
export const organizationSettingStore: OrganizationSettingMock = {
  id: 'a1a1a001-0000-4a11-9c11-000000000001',
  name: 'HVA Nexus',
  legalName: 'Công ty TNHH HVA Nexus',
  website: 'https://hva-nexus.example',
  contactEmail: 'contact@hva-nexus.example',
  contactPhone: '+84 28 1234 5678',
  address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  createdBy: CURRENT_USER_ID,
  createdOnUtc: '2025-01-01T00:00:00.000Z',
  modifiedBy: null,
  modifiedOnUtc: null,
};
