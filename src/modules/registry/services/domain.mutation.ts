import domainApi from './domain.api';
import domainKeys from './domain.query-keys';
import permissionCatalogKeys from './permission-catalog.query-keys';
import resourceKeys from './resource.query-keys';
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
    queryClient.invalidateQueries({ queryKey: permissionCatalogKeys.all });
  },
});

// Xoá Domain kéo theo Resource/Action con → làm mới cả cache resource.
export const useDomainDelete = createUseMutationPlm({
  mutationFn: domainApi.remove,
  onSuccess(_, id) {
    queryClient.setQueryData(domainKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: domainKeys.list() });
    queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    queryClient.invalidateQueries({ queryKey: permissionCatalogKeys.all });
  },
});
