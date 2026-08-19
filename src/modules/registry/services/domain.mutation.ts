import domainApi from './domain.api';
import domainKeys from './domain.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useDomainCreate = createUseMutationPlm({
  mutationFn: domainApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: domainKeys.list() });
  },
});

export const useDomainUpdate = createUseMutationPlm({
  mutationFn: domainApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({ queryKey: domainKeys.list() });
    queryClient.invalidateQueries({
      queryKey: domainKeys.details(variables.id),
    });
  },
});

export const useDomainDelete = createUseMutationPlm({
  mutationFn: domainApi.remove,
  onSuccess(_, id) {
    queryClient.setQueryData(domainKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: domainKeys.list() });
  },
});
