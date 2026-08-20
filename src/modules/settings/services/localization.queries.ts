import localizationSettingApi from './localization.api';
import localizationSettingKeys from './localization.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';

export const useLocalizationSetting = createUseQueryPlm<undefined>()(() => ({
  queryKey: localizationSettingKeys.details(),
  queryFn: () => localizationSettingApi.details(),
}));
