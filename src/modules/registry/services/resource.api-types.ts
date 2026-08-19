import type { DeepPartial } from 'react-hook-form';
import type { Resource } from '../types/resource';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /registry/resources
export type ListResourcesRequest = ListRequest;
export type ListResourcesResponse = ListResponse<Resource>;

// POST /registry/resources
export type CreateResourceRequest = Omit<Resource, 'id' | 'domain'>;
export type CreateResourceResponse = Resource;

// GET /registry/resources/:id
export type ResourceDetailsRequest = Resource['id'];
export type ResourceDetailsResponse = Resource;

// PUT /registry/resources/:id
export type UpdateResourceRequest = Pick<Resource, 'id'> &
  DeepPartial<Resource>;

// DELETE /registry/resources/:id
export type RemoveResourceRequest = Resource['id'];
