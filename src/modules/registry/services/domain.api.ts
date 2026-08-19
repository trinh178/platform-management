import type {
  CreateDomainRequest,
  CreateDomainResponse,
  DomainDetailsRequest,
  DomainDetailsResponse,
  ListDomainOptionsRequest,
  ListDomainOptionsResponse,
  ListDomainsRequest,
  ListDomainsResponse,
  RemoveDomainRequest,
  UpdateDomainRequest,
} from './domain.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields, transformAuditFieldsList } from '@/shared/utils';

const domainApi = {
  list,
  create,
  details,
  update,
  remove,
  listOptions,
};

export default domainApi;

function list(data: ListDomainsRequest) {
  return plmHttpRequest.request<ListDomainsResponse>({
    method: 'GET',
    url: '/registry/domains',
    params: {
      ...data,
      pageIndex: (data.pageIndex ?? 0) + 1, // Client 0-based → API 1-based
    },
    transformSuccessResponse(response) {
      response.items = transformAuditFieldsList(response.items);
      response.pageIndex -= 1; // API 1-based → Client 0-based
      // Inject lại client-side state để DataTable restore khi remount từ cache
      if (data.searchTerm) response.searchTerm = data.searchTerm;
      if (data.filters) response.filters = data.filters;
      if (data.sorts) response.sorts = data.sorts;
      return response;
    },
  });
}

function details(id: DomainDetailsRequest) {
  return plmHttpRequest.request<DomainDetailsResponse>({
    method: 'GET',
    url: `/registry/domains/${id}`,
    transformSuccessResponse: transformAuditFields,
  });
}

function create(data: CreateDomainRequest) {
  return plmHttpRequest.request<CreateDomainResponse>({
    method: 'POST',
    url: '/registry/domains',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateDomainRequest) {
  return plmHttpRequest.request({
    method: 'PUT',
    url: `/registry/domains/${data.id}`,
    data,
  });
}

function remove(id: RemoveDomainRequest) {
  return plmHttpRequest.request({
    method: 'DELETE',
    url: `/registry/domains/${id}`,
  });
}

function listOptions(params: ListDomainOptionsRequest = {}) {
  return plmHttpRequest.request<ListDomainOptionsResponse>({
    method: 'GET',
    url: '/registry/domains/options',
    params,
  });
}
