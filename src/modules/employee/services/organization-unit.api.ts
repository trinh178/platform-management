import type { GetOrganizationUnitHierarchyResponse } from './organization-unit.api-types';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';

const organizationUnitApi = {
  hierarchy,
};
export default organizationUnitApi;

function hierarchy() {
  return hrmemHttpRequest.request<GetOrganizationUnitHierarchyResponse>({
    method: 'GET',
    url: '/organizations/unit/hierarchy',
  });
}
