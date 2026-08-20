import type {
  GetBrandingSettingResponse,
  UpdateBrandingSettingRequest,
  UpdateBrandingSettingResponse,
} from './branding.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields } from '@/shared/utils';

const brandingSettingApi = {
  details,
  update,
};

export default brandingSettingApi;

function details() {
  return plmHttpRequest.request<GetBrandingSettingResponse>({
    method: 'GET',
    url: '/settings/branding',
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateBrandingSettingRequest) {
  return plmHttpRequest.request<UpdateBrandingSettingResponse>({
    method: 'PUT',
    url: '/settings/branding',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}
