import type { BrandingSetting } from '../types/branding';

// GET /settings/branding
export type GetBrandingSettingResponse = BrandingSetting;

// PUT /settings/branding — partial merge, không cần id (singleton).
export type UpdateBrandingSettingRequest = Partial<
  Omit<
    BrandingSetting,
    | 'id'
    | 'logo'
    | 'favicon'
    | 'createdBy'
    | 'createdOnUtc'
    | 'modifiedBy'
    | 'modifiedOnUtc'
  >
>;
export type UpdateBrandingSettingResponse = BrandingSetting;
