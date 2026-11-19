import type { PermissionCatalogRequest } from './permission-catalog.api-types';

const permissionCatalogKeys = {
  all: ['permission-catalog'],
  catalog: (params?: PermissionCatalogRequest) =>
    ['permission-catalog', 'catalog', params] as const,
};

export default permissionCatalogKeys;
