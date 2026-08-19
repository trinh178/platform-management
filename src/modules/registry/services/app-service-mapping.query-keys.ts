import { ListRequest } from '@/shared/types/pagination';

const appServiceMappingKeys = {
  all: ['app-service-mapping'],
  list: (params?: ListRequest) =>
    params
      ? (['app-service-mapping', 'list', params] as const)
      : (['app-service-mapping', 'list'] as const),
};

export default appServiceMappingKeys;
