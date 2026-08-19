import employeeQualificationsApi from './employee-qualifications.api';
import employeeQualificationsKeys from './employee-qualifications.query-keys';
import employeeKeys from './employee.query-keys';
import { createUseMutationHrmEm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useEmployeeQualificationCreate = createUseMutationHrmEm({
  mutationFn: employeeQualificationsApi.create,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({
      queryKey: employeeKeys.details(variables.employeeId),
    });
    queryClient.invalidateQueries({
      queryKey: employeeQualificationsKeys.list(variables.employeeId),
    });
  },
});

export const useEmployeeQualificationUpdate = createUseMutationHrmEm({
  mutationFn: employeeQualificationsApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({
      queryKey: employeeKeys.details(variables.employeeId),
    });
    queryClient.invalidateQueries({
      queryKey: employeeQualificationsKeys.list(variables.employeeId),
    });
  },
});

export const useEmployeeQualificationRemove = createUseMutationHrmEm({
  mutationFn: employeeQualificationsApi.remove,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({
      queryKey: employeeKeys.details(variables.employeeId),
    });
    queryClient.invalidateQueries({
      queryKey: employeeQualificationsKeys.list(variables.employeeId),
    });
  },
});
