import brandingSettingApi from './branding.api';
import brandingSettingKeys from './branding.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useBrandingSettingUpdate = createUseMutationPlm({
  mutationFn: brandingSettingApi.update,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: brandingSettingKeys.details() });
  },
});
