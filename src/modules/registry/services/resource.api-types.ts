import type { DeepPartial } from 'react-hook-form';
import type { ResourceDeleteImpact } from '../types/delete-impact';
import type { Resource, ResourcePreview } from '../types/resource';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /registry/resources
export type ListResourcesRequest = ListRequest;
export type ListResourcesResponse = ListResponse<Resource>;

// GET /registry/resources/options
export type ListResourceOptionsRequest = {
  domainId?: string;
  keyword?: string;
};
export type ListResourceOptionsResponse = ResourcePreview[];

// POST /registry/resources
export type CreateResourceRequest = Omit<Resource, 'id' | 'domain'>;
export type CreateResourceResponse = Resource;

// GET /registry/resources/:id
export type ResourceDetailsRequest = Resource['id'];
export type ResourceDetailsResponse = Resource;

// PUT /registry/resources/:id — `actions` (nếu có) thay toàn bộ danh sách.
export type UpdateResourceRequest = Pick<Resource, 'id'> &
  DeepPartial<Resource>;

// DELETE /registry/resources/:id — xoá kèm toàn bộ action của resource.
export type RemoveResourceRequest = Resource['id'];

// GET /registry/resources/:id/delete-impact
export type ResourceDeleteImpactRequest = Resource['id'];
export type ResourceDeleteImpactResponse = ResourceDeleteImpact;
