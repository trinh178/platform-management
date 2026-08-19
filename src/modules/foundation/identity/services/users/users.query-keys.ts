import { ListRequest } from '@/shared/types/pagination';

const usersKeys = {
  me: ['users', 'me'] as const,
  list: (params?: ListRequest) =>
    params
      ? (['users', 'list', params] as const)
      : (['users', 'list'] as const),
  details: (id: string) => ['users', 'details', id] as const,
} as const;

export default usersKeys;
