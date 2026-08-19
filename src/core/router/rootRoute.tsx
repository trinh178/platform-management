import { routerConfig } from './config';
import RootPage from './root.page';
import { PageRouteConfigProps } from './router.types';
import NoPermission from '@/modules/foundation/app-shell/components/NoPermission';

const rootRoute: Required<PageRouteConfigProps> = {
  path: routerConfig.rootRoute.path,
  key: routerConfig.rootRoute.key,
  title: 'app.name',
  icon: null,
  Component: RootPage,
  disableLayout: false,
  permission: {
    allowAnyone: false,
    onlyGuest: false,
    permissions: [],
    permissionsCondition: 'ALL',
    handleUnGuest: '/',
    handleUnauthenticated: routerConfig.signInRoute.externalPath,
    handleNoPermission: <NoPermission />,
  },
  navMenu: {
    enable: false,
    groupLabel: ['app_shell.nav_menu.group.general'],
  },
  children: [],
  childrenHandleNotFound: routerConfig.signInRoute.externalPath,
};

export default rootRoute;

// TODO: parent of root after granted = {} ??
