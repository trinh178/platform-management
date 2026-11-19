import type { AppServiceMapping } from '../types/app-service-mapping';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /registry/app-service-mappings
export type ListAppServiceMappingsRequest = ListRequest;
export type ListAppServiceMappingsResponse = ListResponse<AppServiceMapping>;

// POST /registry/app-service-mappings — `role` mặc định Dependency.
export type AssignServiceToAppRequest = Pick<
  AppServiceMapping,
  'appId' | 'serviceId'
> &
  Partial<Pick<AppServiceMapping, 'role'>>;
export type AssignServiceToAppResponse = AppServiceMapping;

// PUT /registry/app-service-mappings/:id — đổi role.
export type UpdateAppServiceMappingRoleRequest = Pick<
  AppServiceMapping,
  'id' | 'role'
>;
export type UpdateAppServiceMappingRoleResponse = AppServiceMapping;

// DELETE /registry/app-service-mappings/:id
export type UnassignServiceFromAppRequest = AppServiceMapping['id'];
