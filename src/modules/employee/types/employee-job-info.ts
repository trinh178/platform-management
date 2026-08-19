import { JobPosition, OrganizationUnit } from './organization';

export type EmployeeJobInfoStatus = 'Active' | 'InActive' | 'OnProbation';

export type EmployeeJobInfo = {
  id: string;

  hireDate?: Date;
  probationDate?: Date;
  officialDate?: Date;
  status?: EmployeeJobInfoStatus;

  /* Relations */
  employeeId: string;
  organizationUnit?: OrganizationUnit;
  jobPosition?: JobPosition;
};
