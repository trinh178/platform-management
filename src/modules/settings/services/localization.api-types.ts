import type { LocalizationSetting } from '../types/localization';

// GET /settings/localization
export type GetLocalizationSettingResponse = LocalizationSetting;

// PUT /settings/localization — partial merge, không cần id (singleton).
export type UpdateLocalizationSettingRequest = Partial<
  Omit<
    LocalizationSetting,
    'id' | 'createdBy' | 'createdOnUtc' | 'modifiedBy' | 'modifiedOnUtc'
  >
>;
export type UpdateLocalizationSettingResponse = LocalizationSetting;
