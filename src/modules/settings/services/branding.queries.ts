import brandingSettingApi from './branding.api';
import brandingSettingKeys from './branding.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';

export const useBrandingSetting = createUseQueryPlm<undefined>()(() => ({
  queryKey: brandingSettingKeys.details(),
  queryFn: () => brandingSettingApi.details(),
}));
