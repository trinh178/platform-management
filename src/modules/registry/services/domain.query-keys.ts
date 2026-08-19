import { ListDomainOptionsRequest } from './domain.api-types';
import { ListRequest } from '@/shared/types/pagination';

const domainKeys = {
  all: ['domain'],
  list: (params?: ListRequest) =>
    params
      ? (['domain', 'list', params] as const)
      : (['domain', 'list'] as const),
  details: (id?: string) => ['domain', 'details', id] as const,
  options: (params?: ListDomainOptionsRequest) =>
    ['domain', 'options', params] as const,
};

export default domainKeys;
