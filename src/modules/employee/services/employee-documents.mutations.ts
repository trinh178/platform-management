import employeeDocumentsApi from './employee-documents.api';
import employeeDocumentKeys from './employee-documents.query-keys';
import employeeKeys from './employee.query-keys';
import { createUseMutationHrmEm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useEmployeeDocumentCreate = createUseMutationHrmEm({
  mutationFn: employeeDocumentsApi.create,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({
      queryKey: employeeDocumentKeys.list(variables.employeeId),
    });
    queryClient.invalidateQueries({
      queryKey: employeeKeys.details(variables.employeeId),
    });
  },
});

export const useEmployeeDocumentUpdate = createUseMutationHrmEm({
  mutationFn: employeeDocumentsApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({
      queryKey: employeeDocumentKeys.list(variables.employeeId),
    });
    queryClient.invalidateQueries({
      queryKey: employeeDocumentKeys.details(
        variables.employeeId,
        variables.id,
      ),
    });
  },
});

export const useEmployeeDocumentRemove = createUseMutationHrmEm({
  mutationFn: employeeDocumentsApi.remove,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({
      queryKey: employeeDocumentKeys.list(variables.employeeId),
    });
    queryClient.invalidateQueries({
      queryKey: employeeKeys.details(variables.employeeId),
    });
  },
});
