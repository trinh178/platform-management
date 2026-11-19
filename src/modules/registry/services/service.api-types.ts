import type { DeepPartial } from 'react-hook-form';
import type { ServiceDeleteImpact } from '../types/delete-impact';
import type { Service, ServicePreview } from '../types/service';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /registry/services
export type ListServicesRequest = ListRequest;
export type ListServicesResponse = ListResponse<Service>;

// GET /registry/services/options
export type ListServiceOptionsRequest = string | undefined;
export type ListServiceOptionsResponse = ServicePreview[];

// POST /registry/services
export type CreateServiceRequest = Omit<Service, 'id'>;
export type CreateServiceResponse = Service;

// GET /registry/services/:id
export type ServiceDetailsRequest = Service['id'];
export type ServiceDetailsResponse = Service;

// PUT /registry/services/:id
export type UpdateServiceRequest = Pick<Service, 'id'> & DeepPartial<Service>;

// DELETE /registry/services/:id — xoá kèm domain/resource/action con. Service
// còn mapping với App → 409 SERVICE_HAS_MAPPINGS.
export type RemoveServiceRequest = Service['id'];

// GET /registry/services/:id/delete-impact
export type ServiceDeleteImpactRequest = Service['id'];
export type ServiceDeleteImpactResponse = ServiceDeleteImpact;
