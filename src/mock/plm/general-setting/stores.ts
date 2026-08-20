import type { GeneralSettingMock } from './mock-types';
import { CURRENT_USER_ID } from '@/mock/constants';

// Singleton — được seed sẵn khi triển khai platform lần đầu, không có flow tạo/xóa.
export const generalSettingStore: GeneralSettingMock = {
  id: 'a2a2a002-0000-4a22-9c22-000000000001',
  defaultTimezone: 'Asia/Ho_Chi_Minh',
  defaultCurrency: 'VND',
  createdBy: CURRENT_USER_ID,
  createdOnUtc: '2025-01-01T00:00:00.000Z',
  modifiedBy: null,
  modifiedOnUtc: null,
};
