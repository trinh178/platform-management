import { ListRequest } from '@/shared/types/pagination';

const serviceKeys = {
  all: ['service'],
  list: (params?: ListRequest) =>
    params
      ? (['service', 'list', params] as const)
      : (['service', 'list'] as const),
  details: (id?: string) => ['service', 'details', id] as const,
  options: (keyword?: string) => ['service', 'options', keyword] as const,
};

export default serviceKeys;
