import SignInPage from './pages/sign-in.page';
import routePaths from './route-paths';
import { routerConfig } from '@/core/router/config';
import { PageRouteConfigProps } from '@/core/router/router.types';
import { AppModuleProps } from '@/types/core.types';

export const signInRoute: PageRouteConfigProps = {
  key: routerConfig.signInRoute.key,
  path: routePaths.signIn,
  title: 'identity.auth.sign_in',
  Component: SignInPage,
  permission: {
    onlyGuest: true,
  },
};

const identityModule: AppModuleProps = {
  route: signInRoute,
  importI18n: locale => async () =>
    (await import(`@/modules/foundation/identity/i18n/${locale}.json`)).default,
};

export default identityModule;
