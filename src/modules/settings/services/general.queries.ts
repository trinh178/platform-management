import generalSettingApi from './general.api';
import generalSettingKeys from './general.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';

export const useGeneralSetting = createUseQueryPlm<undefined>()(() => ({
  queryKey: generalSettingKeys.details(),
  queryFn: () => generalSettingApi.details(),
}));
