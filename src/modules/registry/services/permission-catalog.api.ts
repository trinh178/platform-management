import type {
  ExportPermissionsRequest,
  ExportPermissionsResponse,
  ImportPermissionsRequest,
  ImportPermissionsResponse,
  PermissionCatalogRequest,
  PermissionCatalogResponse,
} from './permission-catalog.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';

const permissionCatalogApi = {
  catalog,
  importCodeList,
  exportCodeList,
};

export default permissionCatalogApi;

function catalog(params: PermissionCatalogRequest = {}) {
  return plmHttpRequest.request<PermissionCatalogResponse>({
    method: 'GET',
    url: '/registry/permission-catalog',
    params,
  });
}

function importCodeList({ file }: ImportPermissionsRequest) {
  const formData = new FormData();
  formData.append('file', file);

  return plmHttpRequest.request<ImportPermissionsResponse>({
    method: 'POST',
    url: '/registry/permissions/import',
    data: formData,
  });
}

// Endpoint trả `text/plain` — HttpRequest mặc định parse JSON nên dùng
// `responseType: 'text'` (data = Response gốc) rồi tự đọc text.
async function exportCodeList(
  params: ExportPermissionsRequest = {},
): Promise<ExportPermissionsResponse> {
  const response = await plmHttpRequest.request<Response>({
    method: 'GET',
    url: '/registry/permissions/export',
    params,
    responseType: 'text',
  });
  return response.text();
}
