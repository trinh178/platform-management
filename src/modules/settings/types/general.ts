import type { AuditFields } from '@/shared/types/audit';

// Singleton — không có id trong URL, chỉ có đúng 1 bản ghi được seed sẵn.
// Cố tình không có defaultLanguage/dateFormat — xem LocalizationSetting (single source).
export type GeneralSetting = AuditFields & {
  id: string;

  defaultTimezone: string;
  defaultCurrency: string;
  note?: string;
};
