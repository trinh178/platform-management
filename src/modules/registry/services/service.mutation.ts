import serviceApi from './service.api';
import serviceKeys from './service.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useServiceCreate = createUseMutationPlm({
  mutationFn: serviceApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: serviceKeys.list() });
  },
});

export const useServiceUpdate = createUseMutationPlm({
  mutationFn: serviceApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({ queryKey: serviceKeys.list() });
    queryClient.invalidateQueries({
      queryKey: serviceKeys.details(variables.id),
    });
  },
});

export const useServiceDelete = createUseMutationPlm({
  mutationFn: serviceApi.remove,
  onSuccess(_, id) {
    queryClient.setQueryData(serviceKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: serviceKeys.list() });
  },
});
