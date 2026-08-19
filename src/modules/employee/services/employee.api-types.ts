import type { DeepPartial } from 'react-hook-form';
import type { Employee, EmployeePreview } from '../types/employee';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /profiles/employees
export type ListEmployeesRequest = ListRequest;
export type ListEmployeesResponse = ListResponse<EmployeePreview>;

// POST /profiles/employee
export type CreateEmployeeRequest = Omit<Employee, 'id'>;
export type CreateEmployeeResponse = EmployeePreview;

// GET /profiles/employee/:id
export type EmployeeDetailsRequest = Employee['id'];
export type EmployeeDetailsResponse = Employee;

// PUT /profiles/employee/:id
export type UpdateEmployeeRequest = Pick<Employee, 'id'> &
  DeepPartial<Employee>;

// DELETE /profiles/employee/:id
export type RemoveEmployeeRequest = Employee['id'];

// GET /profiles/me
export type EmployeeMeResponse = Employee;

// GET /profiles/employee/generate-employee-code
export type GenerateEmployeeCodeResponse = {
  employeeCode: string;
};

// GET /profiles/employee/preview
export type ListEmployeePreviewsRequest = ListRequest;
export type ListEmployeePreviewsResponse = ListResponse<EmployeePreview>;

// GET /profiles/employee/:id/preview
export type GetEmployeePreviewRequest = Employee['id'];
export type GetEmployeePreviewResponse = EmployeePreview;

// GET /profiles/employee/by-users?userIds=a&userIds=b
export type GetEmployeePreviewsByUserIdsRequest = { userIds: string[] };
export type GetEmployeePreviewsByUserIdsResponse = EmployeePreview[];

// GET /profiles/employees/by-organization-and-position
export type ListEmployeesByOrgAndPositionRequest = {
  organizationUnitCode?: string;
  jobPositionCode?: string;
};
export type ListEmployeesByOrgAndPositionResponse = EmployeePreview[];

// GET /profiles/employee/:id/managers
export type GetEmployeeManagerRequest = Employee['id'];
export type GetEmployeeManagerResponse = EmployeePreview | null;

// GET /profiles/employees/filter-options
// Options động cho các filter `type: 'select'` của bảng nhân viên,
// gom từ 1 API multi-column.
export type EmployeeFilterOption = { code: string; name: string };
export type EmployeeFilterOptionsResponse = {
  organizationUnits: EmployeeFilterOption[];
  jobPositions: EmployeeFilterOption[];
};
