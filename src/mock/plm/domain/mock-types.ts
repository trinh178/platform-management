export interface DomainMock {
  id: string;
  serviceId: string;
  domainCode: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive' | 'Deprecated';
  note?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
