export interface OrganizationSettingMock {
  id: string;
  name: string;
  legalName?: string;
  logoAssetId?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  note?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
