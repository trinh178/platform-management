import { AppModuleProps } from '@/types/core.types';

const sharedComponentsModule: AppModuleProps = {
  route: [],
  importI18n: locale => async () =>
    (await import(`@/modules/foundation/shared-components/i18n/${locale}.json`))
      .default,
};

export default sharedComponentsModule;
