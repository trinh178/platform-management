import type { AuditFields } from '@/shared/types/audit';

// Singleton — không có id trong URL, chỉ có đúng 1 bản ghi được seed sẵn.
export type LocalizationSetting = AuditFields & {
  id: string;

  supportedLanguages: string[];
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  note?: string;
};
