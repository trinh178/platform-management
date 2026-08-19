import { AppModuleProps } from '@/types/core.types';

const validationModule: AppModuleProps = {
  route: [],
  importI18n: locale => async () =>
    (await import(`@/modules/foundation/validation/i18n/${locale}.json`))
      .default,
};

export default validationModule;
