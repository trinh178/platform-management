import type { DeepPartial } from 'react-hook-form';
import type { Domain, DomainPreview } from '../types/domain';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /registry/domains
export type ListDomainsRequest = ListRequest;
export type ListDomainsResponse = ListResponse<Domain>;

// GET /registry/domains/options
export type ListDomainOptionsRequest = { serviceId?: string; keyword?: string };
export type ListDomainOptionsResponse = DomainPreview[];

// POST /registry/domains
export type CreateDomainRequest = Omit<Domain, 'id' | 'service'>;
export type CreateDomainResponse = Domain;

// GET /registry/domains/:id
export type DomainDetailsRequest = Domain['id'];
export type DomainDetailsResponse = Domain;

// PUT /registry/domains/:id
export type UpdateDomainRequest = Pick<Domain, 'id'> & DeepPartial<Domain>;

// DELETE /registry/domains/:id
export type RemoveDomainRequest = Domain['id'];
