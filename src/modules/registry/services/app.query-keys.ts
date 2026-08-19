import { ListRequest } from '@/shared/types/pagination';

const appKeys = {
  all: ['app'],
  list: (params?: ListRequest) =>
    params ? (['app', 'list', params] as const) : (['app', 'list'] as const),
  details: (id?: string) => ['app', 'details', id] as const,
  options: (keyword?: string) => ['app', 'options', keyword] as const,
};

export default appKeys;
