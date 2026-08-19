import type { ListEmployeesByOrgAndPositionRequest } from './employee.api-types';
import { ListRequest } from '@/shared/types/pagination';

const employeeKeys = {
  all: ['employee'],
  list: (params?: ListRequest) =>
    params
      ? (['employee', 'list', params] as const)
      : (['employee', 'list'] as const),
  details: (id?: string) => ['employee', 'details', id] as const,
  me: ['employee', 'details', 'me'] as const,
  generateEmployeeCode: ['employee', 'generate-employee-code'] as const,
  listPreviews: (params?: ListRequest) =>
    params
      ? (['employee', 'preview', 'list', params] as const)
      : (['employee', 'preview', 'list'] as const),
  preview: (id?: string) => ['employee', 'preview', id] as const,
  listByOrganizationAndPosition: (
    params?: ListEmployeesByOrgAndPositionRequest,
  ) =>
    params
      ? (['employee', 'by-org-position', params] as const)
      : (['employee', 'by-org-position'] as const),
  previewsByUserIds: (userIds: string[]) =>
    ['employee', 'preview', 'by-user-ids', userIds] as const,
  manager: (id?: string) => ['employee', 'manager', id] as const,
  filterOptions: ['employee', 'filter-options'] as const,
};

export default employeeKeys;
