import employeeDocumentsApi from './employee-documents.api';
import employeeDocumentKeys from './employee-documents.query-keys';
import { createUseQueryHrmEm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useEmployeeDocuments = createUseQueryHrmEm<{
  employeeId: string;
  listRequest: ListRequest;
}>()(({ employeeId, listRequest }) => ({
  queryKey: employeeDocumentKeys.list(employeeId, listRequest),
  queryFn: () => employeeDocumentsApi.list(employeeId, listRequest),
}));

export const useEmployeeDocumentDetails = createUseQueryHrmEm<{
  employeeId: string;
  id: string;
}>()(({ employeeId, id }) => ({
  queryKey: employeeDocumentKeys.details(employeeId, id),
  queryFn: () => employeeDocumentsApi.details({ employeeId, id }),
}));
