import type {
  CreateEmployeeQualificationRequest,
  EmployeeQualificationDetailsRequest,
  EmployeeQualificationDetailsResponse,
  ListEmployeeQualificationsRequest,
  ListEmployeeQualificationsResponse,
  RemoveEmployeeQualificationRequest,
  UpdateEmployeeQualificationRequest,
} from './employee-qualifications.api-types';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';

const employeeQualificationsApi = {
  list,
  create,
  details,
  update,
  remove,
};
export default employeeQualificationsApi;

function transformQualification(q: EmployeeQualificationDetailsResponse) {
  if (q.issueDate) q.issueDate = new Date(q.issueDate);
  if (q.expiryDate) q.expiryDate = new Date(q.expiryDate);
  return q;
}

function list(employeeId: ListEmployeeQualificationsRequest) {
  return hrmemHttpRequest.request<ListEmployeeQualificationsResponse>({
    method: 'GET',
    url: `/profiles/employee/${employeeId}/qualifications`,
    transformSuccessResponse: response => response.map(transformQualification),
  });
}

function create(data: CreateEmployeeQualificationRequest) {
  return hrmemHttpRequest.request({
    method: 'POST',
    url: `/profiles/employee/${data.employeeId}/qualifications`,
    data,
  });
}

function details(data: EmployeeQualificationDetailsRequest) {
  return hrmemHttpRequest.request<EmployeeQualificationDetailsResponse>({
    method: 'GET',
    url: `/profiles/employee/${data.employeeId}/qualifications/${data.id}`,
    transformSuccessResponse: transformQualification,
  });
}

function update(data: UpdateEmployeeQualificationRequest) {
  return hrmemHttpRequest.request({
    method: 'PUT',
    url: `/profiles/employee/${data.employeeId}/qualifications/${data.id}`,
    data,
  });
}

function remove(data: RemoveEmployeeQualificationRequest) {
  return hrmemHttpRequest.request({
    method: 'DELETE',
    url: `/profiles/employee/${data.employeeId}/qualifications/${data.id}`,
  });
}
