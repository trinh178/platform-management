import iamHttpRequest from '@/core/network/iam-http-request';
import { RoleType } from '@/modules/foundation/identity/constants/roles';
import { PERMISSIONS, PermissionType } from '@/modules/permissions';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

const usersApi = {
  me,
  list,
  details,
};
export default usersApi;

export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  roles: RoleType[];
  permissions: PermissionType[];
}

export type UserPreview = Omit<User, 'permissions'> & {
  lockoutEnabled?: boolean;
  createdOnUtc?: string;
  modifiedOnUtc?: string | null;
};

export type ListUsersRequest = ListRequest;
export type ListUsersResponse = ListResponse<UserPreview>;

// function me() {
//   return iamHttpRequest.request<User>('GET', '/users/me');
// }
function me() {
  return iamHttpRequest.request<User>({
    method: 'GET',
    url: '/users/me',
    transformSuccessResponse(response) {
      if (process.env.NEXT_PUBLIC_MOCK_API === 'true') {
        response.permissions = Object.values(PERMISSIONS);
      }
      return response;
    },
  });
}

function list(data: ListUsersRequest) {
  return iamHttpRequest.request<ListUsersResponse>({
    method: 'GET',
    url: '/users',
    params: {
      ...data,
      pageIndex: (data.pageIndex ?? 0) + 1,
    },
    transformSuccessResponse(response) {
      response.pageIndex -= 1;
      if (data.searchTerm) response.searchTerm = data.searchTerm;
      if (data.filters) response.filters = data.filters;
      if (data.sorts) response.sorts = data.sorts;
      return response;
    },
  });
}

function details(id: string) {
  return iamHttpRequest.request<User>({
    method: 'GET',
    url: `/users/${id}`,
  });
}
