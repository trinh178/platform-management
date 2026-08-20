export interface ServiceMock {
  id: string;
  serviceCode: string;
  name: string;
  description?: string;
  version?: string;
  status: 'Active' | 'Inactive' | 'Deprecated';
  metadata?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
