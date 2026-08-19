import employeeQualificationsKeys from './employee-qualifications.query-keys';
import employeeApi from './employee.api';
import employeeKeys from './employee.query-keys';
import { createUseMutationHrmEm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useEmployeeCreate = createUseMutationHrmEm({
  mutationFn: employeeApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
  },
});

export const useEmployeeUpdate = createUseMutationHrmEm({
  mutationFn: employeeApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({
      queryKey: employeeKeys.details(variables.id),
    });
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });

    // Qualifications
    queryClient.invalidateQueries({
      queryKey: employeeQualificationsKeys.list(variables.id),
    });
  },
});

export const useEmployeeDelete = createUseMutationHrmEm({
  mutationFn: employeeApi.remove,
  onSuccess(_, variables) {
    queryClient.setQueryData(employeeKeys.details(variables), undefined);
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });

    // Qualifications
    queryClient.invalidateQueries({
      queryKey: employeeQualificationsKeys.list(variables),
    });
  },
});
