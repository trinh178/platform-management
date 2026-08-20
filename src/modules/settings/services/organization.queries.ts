import organizationSettingApi from './organization.api';
import organizationSettingKeys from './organization.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';

export const useOrganizationSetting = createUseQueryPlm<undefined>()(() => ({
  queryKey: organizationSettingKeys.details(),
  queryFn: () => organizationSettingApi.details(),
}));
