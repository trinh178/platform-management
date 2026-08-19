import type { DeepPartial } from 'react-hook-form';
import type { EmployeeDocument } from '../types/employee-document';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// Shared route params for /profiles/employee/:employeeId/documents/:id
export type EmployeeDocumentResourceRequest = Pick<
  EmployeeDocument,
  'employeeId' | 'id'
>;

// GET /documents?filters[...].field=employeeId
export type ListEmployeeDocumentsEmployeeIdRequest =
  EmployeeDocument['employeeId'];
export type ListEmployeeDocumentsRequest = ListRequest;
export type ListEmployeeDocumentsResponse = ListResponse<EmployeeDocument>;

// GET /profiles/employee/:employeeId/documents/:id
export type EmployeeDocumentDetailsRequest = EmployeeDocumentResourceRequest;
export type EmployeeDocumentDetailsResponse = EmployeeDocument;

// POST /profiles/employee/:employeeId/documents
export type CreateEmployeeDocumentRequest = Pick<
  EmployeeDocument,
  'employeeId'
> &
  DeepPartial<EmployeeDocument>;
export type CreateEmployeeDocumentResponse = EmployeeDocument;

// PUT /profiles/employee/:employeeId/documents/:id
export type UpdateEmployeeDocumentRequest = EmployeeDocumentResourceRequest &
  DeepPartial<EmployeeDocument>;
export type UpdateEmployeeDocumentResponse = EmployeeDocument;

// DELETE /profiles/employee/:employeeId/documents/:id
export type RemoveEmployeeDocumentRequest = EmployeeDocumentResourceRequest;
