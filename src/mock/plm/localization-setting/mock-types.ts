export interface LocalizationSettingMock {
  id: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  note?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
