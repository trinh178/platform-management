export interface AppMock {
  id: string;
  appCode: string;
  name: string;
  description?: string;
  version?: string;
  status: 'Active' | 'Inactive' | 'Deprecated';
  url?: string;
  iconUrl?: string;
  tags?: string[];
  metadata?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
