import { AppModuleProps } from '@/types/core.types';

const commonModule: AppModuleProps = {
  route: [],
  importI18n: locale => async () =>
    (await import(`@/modules/foundation/common/i18n/${locale}.json`)).default,
};

export default commonModule;
