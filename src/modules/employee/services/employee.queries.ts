import type { EmployeeUserId } from './employee-user.utils';
import { normalizeEmployeeUserIds } from './employee-user.utils';
import employeeApi from './employee.api';
import type { ListEmployeesByOrgAndPositionRequest } from './employee.api-types';
import employeeKeys from './employee.query-keys';
import { createQueryHrmEm, createUseQueryHrmEm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useEmployees = createUseQueryHrmEm<ListRequest>()(listRequest => ({
  queryKey: employeeKeys.list(listRequest),
  queryFn: () => employeeApi.list(listRequest),
}));

export const useEmployeeDetails = createUseQueryHrmEm<string>()(id => ({
  queryKey: employeeKeys.details(id),
  queryFn: () => employeeApi.details(id),
}));

export const useEmployeeMe = createUseQueryHrmEm()(() => ({
  queryKey: employeeKeys.me,
  queryFn: () => employeeApi.me(),
}));

export const useGenerateEmployeeCode = createUseQueryHrmEm()(() => ({
  queryKey: employeeKeys.generateEmployeeCode,
  queryFn: employeeApi.generateEmployeeCode,
  staleTime: 0,
}));

export const useEmployeePreviews = createUseQueryHrmEm<ListRequest>()(
  params => ({
    queryKey: employeeKeys.listPreviews(params),
    queryFn: () => employeeApi.listPreviews(params),
  }),
);

export const useEmployeePreview = createUseQueryHrmEm<string>()(id => ({
  queryKey: employeeKeys.preview(id),
  queryFn: () => employeeApi.getPreview(id),
}));

export const useEmployeesByOrgAndPosition =
  createUseQueryHrmEm<ListEmployeesByOrgAndPositionRequest>()(params => ({
    queryKey: employeeKeys.listByOrganizationAndPosition(params),
    queryFn: () => employeeApi.listByOrganizationAndPosition(params),
  }));

export const useEmployeePreviewsByUserIds = createUseQueryHrmEm<
  readonly EmployeeUserId[]
>()(userIds => {
  const normalizedUserIds = normalizeEmployeeUserIds(userIds);
  return {
    queryKey: employeeKeys.previewsByUserIds(normalizedUserIds),
    queryFn: () =>
      employeeApi.getPreviewsByUserIds({ userIds: normalizedUserIds }),
    staleTime: 5 * 60 * 1000,
    enabled: normalizedUserIds.length > 0,
  };
});

export const useEmployeeManager = createUseQueryHrmEm<string>()(id => ({
  queryKey: employeeKeys.manager(id),
  queryFn: () => employeeApi.getManager(id),
}));

export const queryEmployeeDetails = createQueryHrmEm<string>()(id => ({
  queryKey: employeeKeys.details(id),
  queryFn: () => employeeApi.details(id),
}));

export const useEmployeeFilterOptions = createUseQueryHrmEm()(() => ({
  queryKey: employeeKeys.filterOptions,
  queryFn: employeeApi.getFilterOptions,
  staleTime: 5 * 60 * 1000,
}));
