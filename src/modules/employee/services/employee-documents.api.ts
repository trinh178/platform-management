import type {
  CreateEmployeeDocumentRequest,
  CreateEmployeeDocumentResponse,
  EmployeeDocumentDetailsRequest,
  EmployeeDocumentDetailsResponse,
  ListEmployeeDocumentsEmployeeIdRequest,
  ListEmployeeDocumentsRequest,
  ListEmployeeDocumentsResponse,
  RemoveEmployeeDocumentRequest,
  UpdateEmployeeDocumentRequest,
  UpdateEmployeeDocumentResponse,
} from './employee-documents.api-types';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';
import type { FilterCondition } from '@/shared/types/pagination';

const employeeDocumentsApi = {
  list,
  create,
  details,
  update,
  remove,
};
export default employeeDocumentsApi;

function list(
  employeeId: ListEmployeeDocumentsEmployeeIdRequest,
  data: ListEmployeeDocumentsRequest,
) {
  const employeeFilter = {
    field: 'employeeId',
    operator: 'Equal',
    value: employeeId,
  } satisfies FilterCondition;
  const filters = [
    ...(data.filters ?? []).filter(filter => filter.field !== 'employeeId'),
    employeeFilter,
  ];

  return hrmemHttpRequest.request<ListEmployeeDocumentsResponse>({
    method: 'GET',
    url: '/documents',
    params: {
      ...data,
      filters,
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

function create(data: CreateEmployeeDocumentRequest) {
  return hrmemHttpRequest.request<CreateEmployeeDocumentResponse>({
    method: 'POST',
    url: `/profiles/employee/${data.employeeId}/documents`,
    data,
  });
}

function details(data: EmployeeDocumentDetailsRequest) {
  return hrmemHttpRequest.request<EmployeeDocumentDetailsResponse>({
    method: 'GET',
    url: `/profiles/employee/${data.employeeId}/documents/${data.id}`,
  });
}

function update(data: UpdateEmployeeDocumentRequest) {
  return hrmemHttpRequest.request<UpdateEmployeeDocumentResponse>({
    method: 'PUT',
    url: `/profiles/employee/${data.employeeId}/documents/${data.id}`,
    data,
  });
}

function remove(data: RemoveEmployeeDocumentRequest) {
  return hrmemHttpRequest.request({
    method: 'DELETE',
    url: `/profiles/employee/${data.employeeId}/documents/${data.id}`,
  });
}
