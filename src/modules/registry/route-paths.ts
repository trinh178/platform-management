const routePaths = {
  apps: '/registry/apps',
  appCreate: '/create',
  appDetail: '/details',
  appsDetails: '/registry/apps/details',

  services: '/registry/services',
  serviceCreate: '/create',
  serviceDetail: '/details',
  servicesDetails: '/registry/services/details',

  domains: '/registry/domains',
  domainCreate: '/create',
  domainDetail: '/details',
  domainsDetails: '/registry/domains/details',

  resources: '/registry/resources',
  resourceCreate: '/create',
  resourceDetail: '/details',
  resourcesDetails: '/registry/resources/details',

  appServiceMapping: '/registry/app-service-mapping',
} as const;

export default routePaths;
