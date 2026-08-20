export interface ResourceMock {
  id: string;
  domainId: string;
  resourceCode: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
