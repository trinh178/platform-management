import type { LocalizationSettingMock } from './mock-types';
import { CURRENT_USER_ID } from '@/mock/constants';

// Singleton — được seed sẵn khi triển khai platform lần đầu, không có flow tạo/xóa.
export const localizationSettingStore: LocalizationSettingMock = {
  id: 'a3a3a003-0000-4a33-9c33-000000000001',
  supportedLanguages: ['vi', 'en'],
  defaultLanguage: 'vi',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  numberFormat: '#,##0.##',
  currencyFormat: '#,##0 ₫',
  createdBy: CURRENT_USER_ID,
  createdOnUtc: '2025-01-01T00:00:00.000Z',
  modifiedBy: null,
  modifiedOnUtc: null,
};
