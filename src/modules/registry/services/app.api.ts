import type {
  AppDetailsRequest,
  AppDetailsResponse,
  CreateAppRequest,
  CreateAppResponse,
  ListAppsRequest,
  ListAppsResponse,
  RemoveAppRequest,
  UpdateAppRequest,
} from './app.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields, transformAuditFieldsList } from '@/shared/utils';

const appApi = {
  list,
  create,
  details,
  update,
  remove,
};

export default appApi;

function list(data: ListAppsRequest) {
  return plmHttpRequest.request<ListAppsResponse>({
    method: 'GET',
    url: '/registry/apps',
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

function details(id: AppDetailsRequest) {
  return plmHttpRequest.request<AppDetailsResponse>({
    method: 'GET',
    url: `/registry/apps/${id}`,
    transformSuccessResponse: transformAuditFields,
  });
}

function create(data: CreateAppRequest) {
  return plmHttpRequest.request<CreateAppResponse>({
    method: 'POST',
    url: '/registry/apps',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateAppRequest) {
  return plmHttpRequest.request({
    method: 'PUT',
    url: `/registry/apps/${data.id}`,
    data,
  });
}

function remove(id: RemoveAppRequest) {
  return plmHttpRequest.request({
    method: 'DELETE',
    url: `/registry/apps/${id}`,
  });
}
