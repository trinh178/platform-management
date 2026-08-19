import resourceApi from './resource.api';
import resourceKeys from './resource.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useResourceCreate = createUseMutationPlm({
  mutationFn: resourceApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: resourceKeys.list() });
  },
});

export const useResourceUpdate = createUseMutationPlm({
  mutationFn: resourceApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({ queryKey: resourceKeys.list() });
    queryClient.invalidateQueries({
      queryKey: resourceKeys.details(variables.id),
    });
  },
});

export const useResourceDelete = createUseMutationPlm({
  mutationFn: resourceApi.remove,
  onSuccess(_, id) {
    queryClient.setQueryData(resourceKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: resourceKeys.list() });
  },
});
