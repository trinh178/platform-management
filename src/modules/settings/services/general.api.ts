import type {
  GetGeneralSettingResponse,
  UpdateGeneralSettingRequest,
  UpdateGeneralSettingResponse,
} from './general.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields } from '@/shared/utils';

const generalSettingApi = {
  details,
  update,
};

export default generalSettingApi;

function details() {
  return plmHttpRequest.request<GetGeneralSettingResponse>({
    method: 'GET',
    url: '/settings/general',
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateGeneralSettingRequest) {
  return plmHttpRequest.request<UpdateGeneralSettingResponse>({
    method: 'PUT',
    url: '/settings/general',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}
