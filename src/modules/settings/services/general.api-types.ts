import type { GeneralSetting } from '../types/general';

// GET /settings/general
export type GetGeneralSettingResponse = GeneralSetting;

// PUT /settings/general — partial merge, không cần id (singleton).
export type UpdateGeneralSettingRequest = Partial<
  Omit<
    GeneralSetting,
    'id' | 'createdBy' | 'createdOnUtc' | 'modifiedBy' | 'modifiedOnUtc'
  >
>;
export type UpdateGeneralSettingResponse = GeneralSetting;
