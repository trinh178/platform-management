import type {
  GetOrganizationSettingResponse,
  UpdateOrganizationSettingRequest,
  UpdateOrganizationSettingResponse,
} from './organization.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields } from '@/shared/utils';

const organizationSettingApi = {
  details,
  update,
};

export default organizationSettingApi;

function details() {
  return plmHttpRequest.request<GetOrganizationSettingResponse>({
    method: 'GET',
    url: '/settings/organization',
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateOrganizationSettingRequest) {
  return plmHttpRequest.request<UpdateOrganizationSettingResponse>({
    method: 'PUT',
    url: '/settings/organization',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}
