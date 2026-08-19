import usersApi from './users.api';
import type { ListUsersRequest } from './users.api';
import usersKeys from './users.query-keys';
import { createUseQueryIam } from '@/core/query/factories';

export const useMe = createUseQueryIam<undefined>()(() => ({
  queryKey: usersKeys.me,
  queryFn: usersApi.me,
}));

export const useUsers = createUseQueryIam<ListUsersRequest>()(params => ({
  queryKey: usersKeys.list(params),
  queryFn: () => usersApi.list(params),
}));

export const useUserDetails = createUseQueryIam<string>()(id => ({
  queryKey: usersKeys.details(id),
  queryFn: () => usersApi.details(id),
}));
