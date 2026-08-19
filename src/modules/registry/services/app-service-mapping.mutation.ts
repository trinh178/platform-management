import appServiceMappingApi from './app-service-mapping.api';
import appServiceMappingKeys from './app-service-mapping.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useAppServiceMappingAssign = createUseMutationPlm({
  mutationFn: appServiceMappingApi.assign,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: appServiceMappingKeys.list() });
  },
});

export const useAppServiceMappingUnassign = createUseMutationPlm({
  mutationFn: appServiceMappingApi.unassign,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: appServiceMappingKeys.list() });
  },
});
