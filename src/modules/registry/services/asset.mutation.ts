import assetApi from './asset.api';
import { createUseMutationPlm } from '@/core/query/factories';

export const useAssetUpload = createUseMutationPlm({
  mutationFn: assetApi.upload,
});
