import type {
  UploadAssetRequest,
  UploadAssetResponse,
} from './asset.api-types';
import plmHttpRequest from '@/core/network/plm-http-request';

const assetApi = {
  upload,
};

export default assetApi;

function upload({ file, category }: UploadAssetRequest) {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);

  return plmHttpRequest.request<UploadAssetResponse>({
    method: 'POST',
    url: '/registry/assets/upload',
    data: formData,
  });
}
