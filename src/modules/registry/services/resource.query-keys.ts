import { ListRequest } from '@/shared/types/pagination';

const resourceKeys = {
  all: ['resource'],
  list: (params?: ListRequest) =>
    params
      ? (['resource', 'list', params] as const)
      : (['resource', 'list'] as const),
  details: (id?: string) => ['resource', 'details', id] as const,
};

export default resourceKeys;
