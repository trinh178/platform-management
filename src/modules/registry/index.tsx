import { AppWindow, FolderTree, Link2 } from 'lucide-react';
import AppServiceMappingPage from './pages/app-service-mapping.page';
import AppsCreatePage from './pages/apps-create.page';
import AppsDetailsPage from './pages/apps-details.page';
import AppsPage from './pages/apps.page';
import ServiceStructurePage from './pages/service-structure.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const registryModule: AppModuleProps = {
  route: [
    {
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
          path: routePaths.appCreate,
          title: 'registry.app.page.create',
          permission: {
            permissions: ['PLM.REGISTRY.APP.CREATE'],
          },
          Component: AppsCreatePage,
        },
        {
          key: 'registry-apps-details',
          path: routePaths.appDetail,
          title: 'registry.app.page.details',
          Component: AppsDetailsPage,
        },
      ],
    },
    {
      key: 'registry-service-structure',
      path: routePaths.serviceStructure,
      title: 'registry.structure.title',
      icon: <FolderTree />,
      Component: ServiceStructurePage,
      permission: {
        permissions: [
          'PLM.REGISTRY.SERVICE.VIEW',
          'PLM.REGISTRY.DOMAIN.VIEW',
          'PLM.REGISTRY.RESOURCE.VIEW',
        ],
      },
      navMenu: {
        enable: true,
        groupLabel: ['app_shell.nav_menu.group.system'],
      },
    },
    {
      key: 'registry-app-service-mapping',
      path: routePaths.appServiceMapping,
      title: 'registry.appServiceMapping.title',
      icon: <Link2 />,
      Component: AppServiceMappingPage,
      permission: {
        permissions: ['PLM.REGISTRY.APP_SERVICE_MAPPING.VIEW'],
      },
      navMenu: {
        enable: true,
        groupLabel: ['app_shell.nav_menu.group.system'],
      },
    },
  ],
  importI18n: locale => async () =>
    (await import(`@/modules/registry/i18n/${locale}.json`)).default,
};

export default registryModule;
