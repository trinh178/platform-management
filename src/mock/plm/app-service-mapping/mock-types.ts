export type AppServiceRoleMock = 'Primary' | 'Dependency';

export interface AppServiceMappingMock {
  id: string;
  appId: string;
  serviceId: string;
  role: AppServiceRoleMock;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
