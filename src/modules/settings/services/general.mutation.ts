import generalSettingApi from './general.api';
import generalSettingKeys from './general.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useGeneralSettingUpdate = createUseMutationPlm({
  mutationFn: generalSettingApi.update,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: generalSettingKeys.details() });
  },
});
