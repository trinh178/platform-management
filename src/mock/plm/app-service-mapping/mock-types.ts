export interface AppServiceMappingMock {
  id: string;
  appId: string;
  serviceId: string;
  note?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
