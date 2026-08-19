import type {
  CreateServiceRequest,
  CreateServiceResponse,
  ListServiceOptionsRequest,
  ListServiceOptionsResponse,
  ListServicesRequest,
  ListServicesResponse,
  RemoveServiceRequest,
  ServiceDetailsRequest,
  ServiceDetailsResponse,
  UpdateServiceRequest,
} from './service.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields, transformAuditFieldsList } from '@/shared/utils';

const serviceApi = {
  list,
  create,
  details,
  update,
  remove,
  listOptions,
};

export default serviceApi;

function list(data: ListServicesRequest) {
  return plmHttpRequest.request<ListServicesResponse>({
    method: 'GET',
    url: '/registry/services',
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

function details(id: ServiceDetailsRequest) {
  return plmHttpRequest.request<ServiceDetailsResponse>({
    method: 'GET',
    url: `/registry/services/${id}`,
    transformSuccessResponse: transformAuditFields,
  });
}

function create(data: CreateServiceRequest) {
  return plmHttpRequest.request<CreateServiceResponse>({
    method: 'POST',
    url: '/registry/services',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateServiceRequest) {
  return plmHttpRequest.request({
    method: 'PUT',
    url: `/registry/services/${data.id}`,
    data,
  });
}

function remove(id: RemoveServiceRequest) {
  return plmHttpRequest.request({
    method: 'DELETE',
    url: `/registry/services/${id}`,
  });
}

function listOptions(keyword?: ListServiceOptionsRequest) {
  return plmHttpRequest.request<ListServiceOptionsResponse>({
    method: 'GET',
    url: '/registry/services/options',
    params: { keyword },
  });
}
