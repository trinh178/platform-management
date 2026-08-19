import { ListRequest } from '@/shared/types/pagination';

const employeeDocumentKeys = {
  list: (employeeId?: string, params?: ListRequest) =>
    params
      ? (['employee', 'document', 'list', employeeId, params] as const)
      : (['employee', 'document', 'list', employeeId] as const),
  details: (employeeId?: string, id?: string) =>
    ['employee', 'document', 'details', employeeId, id] as const,
};

export default employeeDocumentKeys;
