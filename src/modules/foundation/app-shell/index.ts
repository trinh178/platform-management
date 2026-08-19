import PublicPage from './pages/public.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const appShellModule: AppModuleProps = {
  route: {
    key: 'public',
    title: 'app_shell.common.public',
    path: routePaths.public,
    Component: PublicPage,
    permission: {
      allowAnyone: true,
    },
  },
  importI18n: locale => async () =>
    (await import(`@/modules/foundation/app-shell/i18n/${locale}.json`))
      .default,
};

export default appShellModule;
