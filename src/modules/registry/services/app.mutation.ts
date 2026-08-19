import appApi from './app.api';
import appKeys from './app.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useAppCreate = createUseMutationPlm({
  mutationFn: appApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: appKeys.list() });
  },
});

export const useAppUpdate = createUseMutationPlm({
  mutationFn: appApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({ queryKey: appKeys.list() });
    queryClient.invalidateQueries({ queryKey: appKeys.details(variables.id) });
  },
});

export const useAppDelete = createUseMutationPlm({
  mutationFn: appApi.remove,
  onSuccess(_, id) {
    queryClient.setQueryData(appKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: appKeys.list() });
  },
});
