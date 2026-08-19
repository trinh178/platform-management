import type { DeepPartial } from 'react-hook-form';
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

// DELETE /registry/services/:id
export type RemoveServiceRequest = Service['id'];
