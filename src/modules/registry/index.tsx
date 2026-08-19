import { AppWindow } from 'lucide-react';
import AppsCreatePage from './pages/apps-create.page';
import AppsDetailsPage from './pages/apps-details.page';
import AppsPage from './pages/apps.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const registryModule: AppModuleProps = {
  route: {
    key: 'registry-apps',
    path: routePaths.apps,
    title: 'registry.app.title',
    icon: <AppWindow />,
    Component: AppsPage,
    permission: {
      permissions: ['PLM.REGISTRY.APP.VIEW'],
    },
    navMenu: {
      enable: true,
      groupLabel: ['app_shell.nav_menu.group.system'],
    },
    children: [
      {
        key: 'registry-apps-create',
        path: routePaths.create,
        title: 'registry.app.page.create',
        permission: {
          permissions: ['PLM.REGISTRY.APP.CREATE'],
        },
        Component: AppsCreatePage,
      },
      {
        key: 'registry-apps-details',
        path: routePaths.details,
        title: 'registry.app.page.details',
        Component: AppsDetailsPage,
      },
    ],
  },
  importI18n: locale => async () =>
    (await import(`@/modules/registry/i18n/${locale}.json`)).default,
};

export default registryModule;
