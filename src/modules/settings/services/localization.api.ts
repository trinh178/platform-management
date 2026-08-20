import type {
  GetLocalizationSettingResponse,
  UpdateLocalizationSettingRequest,
  UpdateLocalizationSettingResponse,
} from './localization.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';
import { transformAuditFields } from '@/shared/utils';

const localizationSettingApi = {
  details,
  update,
};

export default localizationSettingApi;

function details() {
  return plmHttpRequest.request<GetLocalizationSettingResponse>({
    method: 'GET',
    url: '/settings/localization',
    transformSuccessResponse: transformAuditFields,
  });
}

function update(data: UpdateLocalizationSettingRequest) {
  return plmHttpRequest.request<UpdateLocalizationSettingResponse>({
    method: 'PUT',
    url: '/settings/localization',
    data,
    transformSuccessResponse: transformAuditFields,
  });
}
