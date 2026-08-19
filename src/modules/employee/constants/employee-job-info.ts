import { EmployeeJobInfoStatus } from '../types/employee-job-info';
import { ConstantBase } from '@/core/constants';

export const CONST_JOB_INFO_STATUS: ConstantBase<EmployeeJobInfoStatus>[] = [
  {
    label: 'employee.constants.jobStatus.active',
    value: 'Active',
  },
  {
    label: 'employee.constants.jobStatus.onProbation',
    value: 'OnProbation',
  },
  {
    label: 'employee.constants.jobStatus.inactive',
    value: 'InActive',
  },
];
