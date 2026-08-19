import resourceApi from './resource.api';
import resourceKeys from './resource.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useResources = createUseQueryPlm<ListRequest>()(listRequest => ({
  queryKey: resourceKeys.list(listRequest),
  queryFn: () => resourceApi.list(listRequest),
}));

export const useResourceDetails = createUseQueryPlm<string>()(id => ({
  queryKey: resourceKeys.details(id),
  queryFn: () => resourceApi.details(id),
}));
