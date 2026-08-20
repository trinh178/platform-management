import organizationSettingApi from './organization.api';
import organizationSettingKeys from './organization.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useOrganizationSettingUpdate = createUseMutationPlm({
  mutationFn: organizationSettingApi.update,
  onSuccess() {
    queryClient.invalidateQueries({
      queryKey: organizationSettingKeys.details(),
    });
  },
});
