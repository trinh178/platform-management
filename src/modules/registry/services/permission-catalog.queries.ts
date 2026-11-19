import permissionCatalogApi from './permission-catalog.api';
import type { PermissionCatalogRequest } from './permission-catalog.api-types';
import permissionCatalogKeys from './permission-catalog.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';

export const usePermissionCatalog =
  createUseQueryPlm<PermissionCatalogRequest>()(params => ({
    queryKey: permissionCatalogKeys.catalog(params),
    queryFn: () => permissionCatalogApi.catalog(params),
    staleTime: 0,
  }));
