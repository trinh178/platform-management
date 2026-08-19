import { normalizeEmployeeUserIds } from './employee-user.utils';
import type {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeDetailsRequest,
  EmployeeDetailsResponse,
  EmployeeFilterOptionsResponse,
  EmployeeMeResponse,
  GenerateEmployeeCodeResponse,
  GetEmployeeManagerRequest,
  GetEmployeeManagerResponse,
  GetEmployeePreviewRequest,
  GetEmployeePreviewResponse,
  GetEmployeePreviewsByUserIdsRequest,
  GetEmployeePreviewsByUserIdsResponse,
  ListEmployeePreviewsRequest,
  ListEmployeePreviewsResponse,
  ListEmployeesByOrgAndPositionRequest,
  ListEmployeesByOrgAndPositionResponse,
  ListEmployeesRequest,
  ListEmployeesResponse,
  RemoveEmployeeRequest,
  UpdateEmployeeRequest,
} from './employee.api-types';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';
import {
  getFullName,
  transformAuditFields,
  transformAuditFieldsList,
} from '@/shared/utils';

const employeeApi = {
  list,
  create,
  details,
  update,
  remove,
  me,
  generateEmployeeCode,
  listPreviews,
  getPreview,
  getPreviewsByUserIds,
  listByOrganizationAndPosition,
  getManager,
  getFilterOptions,
};
export default employeeApi;

function list(data: ListEmployeesRequest) {
  return hrmemHttpRequest.request<ListEmployeesResponse>({
    method: 'GET',
    url: '/profiles/employees',
    params: {
      ...data,
      pageIndex: (data.pageIndex ?? 0) + 1,
    },
    transformSuccessResponse(response) {
      response.items = response.items.map(e => ({
        ...transformAuditFields(e),
        fullName: getFullName(e.firstName, e.lastName),
      }));

      response.pageIndex -= 1;
      if (data.searchTerm) response.searchTerm = data.searchTerm;
      if (data.filters) response.filters = data.filters;
      if (data.sorts) response.sorts = data.sorts;
      return response;
    },
  });
}

function create(data: CreateEmployeeRequest) {
  return hrmemHttpRequest.request<CreateEmployeeResponse>({
    method: 'POST',
    url: `/profiles/employee`,
    data,
    transformSuccessResponse(response) {
      transformAuditFields(response);
      response.fullName = getFullName(response.firstName, response.lastName);
      return response;
    },
  });
}

function transformEmployeeResponse(response: EmployeeDetailsResponse) {
  transformAuditFields(response);
  response.fullName = getFullName(response.firstName, response.lastName);
  response.dateOfBirth = new Date(response.dateOfBirth);
  response.idDateOfIssue =
    response.idDateOfIssue && new Date(response.idDateOfIssue);
  response.idDateOfExpiry =
    response.idDateOfExpiry && new Date(response.idDateOfExpiry);

  // Contact
  if (response.contact) {
    if (
      response.contact.permanentProvinceCode &&
      response.contact.permanentDistrictCode &&
      response.contact.permanentWardCode
    )
      response.contact.permanentAddress = {
        provinceCode: response.contact.permanentProvinceCode,
        districtCode: response.contact.permanentDistrictCode,
        wardCode: response.contact.permanentWardCode,
      };

    if (
      response.contact.currentProvinceCode &&
      response.contact.currentDistrictCode &&
      response.contact.currentWardCode
    )
      response.contact.currentAddress = {
        provinceCode: response.contact.currentProvinceCode,
        districtCode: response.contact.currentDistrictCode,
        wardCode: response.contact.currentWardCode,
      };
  }

  // Qualification
  if (response.qualifications) {
    response.qualifications = response.qualifications.map(q => ({
      ...q,
      employeeId: response.id,
      issueDate: q.issueDate && new Date(q.issueDate),
      expiryDate: q.expiryDate && new Date(q.expiryDate),
    }));
  }

  return response;
}
function details(id: EmployeeDetailsRequest) {
  return hrmemHttpRequest.request<EmployeeDetailsResponse>({
    method: 'GET',
    url: `/profiles/employee/${id}`,
    transformSuccessResponse: transformEmployeeResponse,
  });
}

function update(data: UpdateEmployeeRequest) {
  return hrmemHttpRequest.request({
    method: 'PUT',
    url: `/profiles/employee/${data.id}`,
    data,
  });
}

function remove(id: RemoveEmployeeRequest) {
  return hrmemHttpRequest.request({
    method: 'DELETE',
    url: `/profiles/employee/${id}`,
  });
}

function me() {
  return hrmemHttpRequest.request<EmployeeMeResponse>({
    method: 'GET',
    url: `/profiles/me`,
    transformSuccessResponse: transformEmployeeResponse,
  });
}

function generateEmployeeCode() {
  return hrmemHttpRequest.request<GenerateEmployeeCodeResponse>({
    method: 'GET',
    url: '/profiles/employee/generate-employee-code',
  });
}

function listPreviews(data: ListEmployeePreviewsRequest) {
  return hrmemHttpRequest.request<ListEmployeePreviewsResponse>({
    method: 'GET',
    url: '/profiles/employee/preview',
    params: { ...data, pageIndex: (data.pageIndex ?? 0) + 1 },
    transformSuccessResponse(response) {
      response.items = transformAuditFieldsList(response.items);
      response.pageIndex -= 1;
      if (data.searchTerm) response.searchTerm = data.searchTerm;
      if (data.filters) response.filters = data.filters;
      if (data.sorts) response.sorts = data.sorts;
      return response;
    },
  });
}

function getPreview(id: GetEmployeePreviewRequest) {
  return hrmemHttpRequest.request<GetEmployeePreviewResponse>({
    method: 'GET',
    url: `/profiles/employee/${id}/preview`,
  });
}

function getPreviewsByUserIds({
  userIds,
}: GetEmployeePreviewsByUserIdsRequest) {
  const normalizedUserIds = normalizeEmployeeUserIds(userIds);
  if (normalizedUserIds.length === 0) {
    return Promise.resolve([]);
  }

  const sp = new URLSearchParams();
  normalizedUserIds.forEach(userId => sp.append('userIds', userId));

  return hrmemHttpRequest.request<GetEmployeePreviewsByUserIdsResponse>({
    method: 'GET',
    url: `/profiles/employee/by-users?${sp.toString()}`,
  });
}

function listByOrganizationAndPosition(
  data: ListEmployeesByOrgAndPositionRequest,
) {
  return hrmemHttpRequest.request<ListEmployeesByOrgAndPositionResponse>({
    method: 'GET',
    url: '/profiles/employees/by-organization-and-position',
    params: data,
  });
}

function getManager(id: GetEmployeeManagerRequest) {
  return hrmemHttpRequest.request<GetEmployeeManagerResponse>({
    method: 'GET',
    url: `/profiles/employee/${id}/managers`,
  });
}

function getFilterOptions() {
  return hrmemHttpRequest.request<EmployeeFilterOptionsResponse>({
    method: 'GET',
    url: '/profiles/employees/filter-options',
  });
}
