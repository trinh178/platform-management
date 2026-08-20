export interface GeneralSettingMock {
  id: string;
  defaultTimezone: string;
  defaultCurrency: string;
  note?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
