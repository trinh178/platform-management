import type { BrandingSettingMock } from './mock-types';
import { CURRENT_USER_ID } from '@/mock/constants';

// Singleton — được seed sẵn khi triển khai platform lần đầu, không có flow tạo/xóa.
export const brandingSettingStore: BrandingSettingMock = {
  id: 'a4a4a004-0000-4a44-9c44-000000000001',
  platformName: 'HVA Nexus',
  createdBy: CURRENT_USER_ID,
  createdOnUtc: '2025-01-01T00:00:00.000Z',
  modifiedBy: null,
  modifiedOnUtc: null,
};
