import type {
  AssignServiceToAppRequest,
  AssignServiceToAppResponse,
  ListAppServiceMappingsRequest,
  ListAppServiceMappingsResponse,
  UnassignServiceFromAppRequest,
} from './app-service-mapping.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFieldsList } from '@/shared/utils';

const appServiceMappingApi = {
  list,
  assign,
  unassign,
};

export default appServiceMappingApi;

function list(data: ListAppServiceMappingsRequest) {
  return plmHttpRequest.request<ListAppServiceMappingsResponse>({
    method: 'GET',
    url: '/registry/app-service-mappings',
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

function assign(data: AssignServiceToAppRequest) {
  return plmHttpRequest.request<AssignServiceToAppResponse>({
    method: 'POST',
    url: '/registry/app-service-mappings',
    data,
  });
}

function unassign(id: UnassignServiceFromAppRequest) {
  return plmHttpRequest.request({
    method: 'DELETE',
    url: `/registry/app-service-mappings/${id}`,
  });
}
