import type { OrganizationSetting } from '../types/organization';

// GET /settings/organization
export type GetOrganizationSettingResponse = OrganizationSetting;

// PUT /settings/organization — partial merge, không cần id (singleton).
export type UpdateOrganizationSettingRequest = Partial<
  Omit<
    OrganizationSetting,
    | 'id'
    | 'logo'
    | 'createdBy'
    | 'createdOnUtc'
    | 'modifiedBy'
    | 'modifiedOnUtc'
  >
>;
export type UpdateOrganizationSettingResponse = OrganizationSetting;
