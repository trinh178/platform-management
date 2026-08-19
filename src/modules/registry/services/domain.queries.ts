import domainApi from './domain.api';
import { ListDomainOptionsRequest } from './domain.api-types';
import domainKeys from './domain.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useDomains = createUseQueryPlm<ListRequest>()(listRequest => ({
  queryKey: domainKeys.list(listRequest),
  queryFn: () => domainApi.list(listRequest),
}));

export const useDomainDetails = createUseQueryPlm<string>()(id => ({
  queryKey: domainKeys.details(id),
  queryFn: () => domainApi.details(id),
}));

export const useDomainOptions = createUseQueryPlm<
  ListDomainOptionsRequest | undefined
>()(params => ({
  queryKey: domainKeys.options(params),
  queryFn: () => domainApi.listOptions(params),
}));
