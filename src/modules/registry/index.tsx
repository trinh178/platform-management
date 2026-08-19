import { AppWindow, Box, Layers, Link2, Server } from 'lucide-react';
import AppServiceMappingPage from './pages/app-service-mapping.page';
import AppsCreatePage from './pages/apps-create.page';
import AppsDetailsPage from './pages/apps-details.page';
import AppsPage from './pages/apps.page';
import DomainsCreatePage from './pages/domains-create.page';
import DomainsDetailsPage from './pages/domains-details.page';
import DomainsPage from './pages/domains.page';
import ResourcesCreatePage from './pages/resources-create.page';
import ResourcesDetailsPage from './pages/resources-details.page';
import ResourcesPage from './pages/resources.page';
import ServicesCreatePage from './pages/services-create.page';
import ServicesDetailsPage from './pages/services-details.page';
import ServicesPage from './pages/services.page';
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
      key: 'registry-services',
      path: routePaths.services,
      title: 'registry.service.title',
      icon: <Server />,
      Component: ServicesPage,
      permission: {
        permissions: ['PLM.REGISTRY.SERVICE.VIEW'],
      },
      navMenu: {
        enable: true,
        groupLabel: ['app_shell.nav_menu.group.system'],
      },
      children: [
        {
          key: 'registry-services-create',
          path: routePaths.serviceCreate,
          title: 'registry.service.page.create',
          permission: {
            permissions: ['PLM.REGISTRY.SERVICE.CREATE'],
          },
          Component: ServicesCreatePage,
        },
        {
          key: 'registry-services-details',
          path: routePaths.serviceDetail,
          title: 'registry.service.page.details',
          Component: ServicesDetailsPage,
        },
      ],
    },
    {
      key: 'registry-domains',
      path: routePaths.domains,
      title: 'registry.domain.title',
      icon: <Layers />,
      Component: DomainsPage,
      permission: {
        permissions: ['PLM.REGISTRY.DOMAIN.VIEW'],
      },
      navMenu: {
        enable: true,
        groupLabel: ['app_shell.nav_menu.group.system'],
      },
      children: [
        {
          key: 'registry-domains-create',
          path: routePaths.domainCreate,
          title: 'registry.domain.page.create',
          permission: {
            permissions: ['PLM.REGISTRY.DOMAIN.CREATE'],
          },
          Component: DomainsCreatePage,
        },
        {
          key: 'registry-domains-details',
          path: routePaths.domainDetail,
          title: 'registry.domain.page.details',
          Component: DomainsDetailsPage,
        },
      ],
    },
    {
      key: 'registry-resources',
      path: routePaths.resources,
      title: 'registry.resource.title',
      icon: <Box />,
      Component: ResourcesPage,
      permission: {
        permissions: ['PLM.REGISTRY.RESOURCE.VIEW'],
      },
      navMenu: {
        enable: true,
        groupLabel: ['app_shell.nav_menu.group.system'],
      },
      children: [
        {
          key: 'registry-resources-create',
          path: routePaths.resourceCreate,
          title: 'registry.resource.page.create',
          permission: {
            permissions: ['PLM.REGISTRY.RESOURCE.CREATE'],
          },
          Component: ResourcesCreatePage,
        },
        {
          key: 'registry-resources-details',
          path: routePaths.resourceDetail,
          title: 'registry.resource.page.details',
          Component: ResourcesDetailsPage,
        },
      ],
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
