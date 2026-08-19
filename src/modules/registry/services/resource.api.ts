import type {
  CreateResourceRequest,
  CreateResourceResponse,
  ListResourcesRequest,
  ListResourcesResponse,
  RemoveResourceRequest,
  ResourceDetailsRequest,
  ResourceDetailsResponse,
  UpdateResourceRequest,
} from './resource.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields, transformAuditFieldsList } from '@/shared/utils';

const resourceApi = {
  list,
  create,
  details,
  update,
  remove,
};

export default resourceApi;

function list(data: ListResourcesRequest) {
  return plmHttpRequest.request<ListResourcesResponse>({
    method: 'GET',
    url: '/registry/resources',
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

function details(id: ResourceDetailsRequest) {
  return plmHttpRequest.request<ResourceDetailsResponse>({
    method: 'GET',
    url: `/registry/resources/${id}`,
    transformSuccessResponse: transformAuditFields,
  });
}

function create(data: CreateResourceRequest) {
  return plmHttpRequest.request<CreateResourceResponse>({
    method: 'POST',
    url: '/registry/resources',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateResourceRequest) {
  return plmHttpRequest.request({
    method: 'PUT',
    url: `/registry/resources/${data.id}`,
    data,
  });
}

function remove(id: RemoveResourceRequest) {
  return plmHttpRequest.request({
    method: 'DELETE',
    url: `/registry/resources/${id}`,
  });
}
