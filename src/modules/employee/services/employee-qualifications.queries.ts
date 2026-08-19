import employeeQualificationsApi from './employee-qualifications.api';
import employeeQualificationsKeys from './employee-qualifications.query-keys';
import { createUseQueryHrmEm } from '@/core/query/factories';

export const useEmployeeQualifications = createUseQueryHrmEm<string>()(
  employeeId => ({
    queryKey: employeeQualificationsKeys.list(employeeId),
    queryFn: () => employeeQualificationsApi.list(employeeId),
  }),
);

export const useEmployeeQualificationDetails = createUseQueryHrmEm<{
  employeeId: string;
  id: string;
}>()(data => ({
  queryKey: employeeQualificationsKeys.details(data.employeeId, data.id),
  queryFn: () => employeeQualificationsApi.details(data),
}));
