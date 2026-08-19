import type { AppServiceMapping } from '../types/app-service-mapping';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /registry/app-service-mappings
export type ListAppServiceMappingsRequest = ListRequest;
export type ListAppServiceMappingsResponse = ListResponse<AppServiceMapping>;

// POST /registry/app-service-mappings
export type AssignServiceToAppRequest = Pick<
  AppServiceMapping,
  'appId' | 'serviceId' | 'note'
>;
export type AssignServiceToAppResponse = AppServiceMapping;

// DELETE /registry/app-service-mappings/:id
export type UnassignServiceFromAppRequest = AppServiceMapping['id'];
