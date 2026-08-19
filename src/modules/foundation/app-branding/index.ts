import { AppModuleProps } from '@/types/core.types';

const appBrandingModule: AppModuleProps = {
  route: [],
  importI18n: locale => async () =>
    (await import(`@/modules/foundation/app-branding/i18n/${locale}.json`))
      .default,
};

export default appBrandingModule;
