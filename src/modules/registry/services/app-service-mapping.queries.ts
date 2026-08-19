import appServiceMappingApi from './app-service-mapping.api';
import appServiceMappingKeys from './app-service-mapping.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useAppServiceMappings = createUseQueryPlm<ListRequest>()(
  listRequest => ({
    queryKey: appServiceMappingKeys.list(listRequest),
    queryFn: () => appServiceMappingApi.list(listRequest),
  }),
);
