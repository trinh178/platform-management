import permissionCatalogKeys from './permission-catalog.query-keys';
import resourceApi from './resource.api';
import resourceKeys from './resource.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useResourceCreate = createUseMutationPlm({
  mutationFn: resourceApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: resourceKeys.list() });
    queryClient.invalidateQueries({ queryKey: permissionCatalogKeys.all });
  },
});

export const useResourceUpdate = createUseMutationPlm({
  mutationFn: resourceApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({ queryKey: resourceKeys.list() });
    queryClient.invalidateQueries({
      queryKey: resourceKeys.details(variables.id),
    });
    queryClient.invalidateQueries({ queryKey: permissionCatalogKeys.all });
  },
});

export const useResourceDelete = createUseMutationPlm({
  mutationFn: resourceApi.remove,
  onSuccess(_, id) {
    queryClient.setQueryData(resourceKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: resourceKeys.list() });
    queryClient.invalidateQueries({ queryKey: permissionCatalogKeys.all });
  },
});
