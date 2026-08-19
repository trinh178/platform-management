import type { AppServiceMappingMock } from './mock-types';
import { CURRENT_USER_ID } from '@/mock/constants';

// appId/serviceId tham chiếu tới src/mock/plm/app/stores.ts và src/mock/plm/service/stores.ts
const APP_ID = {
  PLM: 'b3f1a001-0000-4a11-9c11-000000000001',
  FTM: 'b3f1a001-0000-4a11-9c11-000000000002',
  WATS: 'b3f1a001-0000-4a11-9c11-000000000003',
  SANDBOX_APP: 'b3f1a001-0000-4a11-9c11-000000000004',
};

const SERVICE_ID = {
  PLM: 'c4f2b002-0000-4b22-9d22-000000000001',
  IAM: 'c4f2b002-0000-4b22-9d22-000000000002',
  LEGACY_AUTH: 'c4f2b002-0000-4b22-9d22-000000000006',
  FTM: 'c4f2b002-0000-4b22-9d22-000000000007',
};

export const appServiceMappingStore: AppServiceMappingMock[] = [
  {
    id: 'f7c5e005-0000-4e55-8f55-000000000001',
    appId: APP_ID.PLM,
    serviceId: SERVICE_ID.PLM,
    note: 'Tự đăng ký — PLM là App/Service của chính nền tảng.',
    createdBy: CURRENT_USER_ID,
    createdOnUtc: '2025-01-10T00:00:00.000Z',
    modifiedBy: CURRENT_USER_ID,
    modifiedOnUtc: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'f7c5e005-0000-4e55-8f55-000000000002',
    appId: APP_ID.PLM,
    serviceId: SERVICE_ID.IAM,
    note: 'Xác thực người dùng qua IAM.',
    createdBy: CURRENT_USER_ID,
    createdOnUtc: '2025-01-11T00:00:00.000Z',
    modifiedBy: null,
    modifiedOnUtc: null,
  },
  {
    id: 'f7c5e005-0000-4e55-8f55-000000000003',
    appId: APP_ID.FTM,
    serviceId: SERVICE_ID.FTM,
    createdBy: CURRENT_USER_ID,
    createdOnUtc: '2025-02-15T00:00:00.000Z',
    modifiedBy: null,
    modifiedOnUtc: null,
  },
  {
    id: 'f7c5e005-0000-4e55-8f55-000000000004',
    appId: APP_ID.FTM,
    serviceId: SERVICE_ID.IAM,
    note: 'Xác thực người dùng qua IAM.',
    createdBy: CURRENT_USER_ID,
    createdOnUtc: '2025-02-15T00:00:00.000Z',
    modifiedBy: null,
    modifiedOnUtc: null,
  },
  {
    id: 'f7c5e005-0000-4e55-8f55-000000000005',
    appId: APP_ID.WATS,
    serviceId: SERVICE_ID.IAM,
    createdBy: CURRENT_USER_ID,
    createdOnUtc: '2025-03-01T00:00:00.000Z',
    modifiedBy: null,
    modifiedOnUtc: null,
  },
  {
    id: 'f7c5e005-0000-4e55-8f55-000000000006',
    appId: APP_ID.SANDBOX_APP,
    serviceId: SERVICE_ID.LEGACY_AUTH,
    note: 'Liên kết thử nghiệm, service đã Deprecated.',
    createdBy: CURRENT_USER_ID,
    createdOnUtc: '2025-04-05T00:00:00.000Z',
    modifiedBy: null,
    modifiedOnUtc: null,
  },
];
