import localizationSettingApi from './localization.api';
import localizationSettingKeys from './localization.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useLocalizationSettingUpdate = createUseMutationPlm({
  mutationFn: localizationSettingApi.update,
  onSuccess() {
    queryClient.invalidateQueries({
      queryKey: localizationSettingKeys.details(),
    });
  },
});
