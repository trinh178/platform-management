import type { EmployeeQualification } from '../types/employee-qualification';
import type { DeepPartial } from '@/shared/types/utils';

// GET /profiles/employee/:employeeId/qualifications
export type ListEmployeeQualificationsRequest =
  EmployeeQualification['employeeId'];
export type ListEmployeeQualificationsResponse = EmployeeQualification[];

// GET /profiles/employee/:employeeId/qualifications/:id
export type EmployeeQualificationDetailsRequest = Pick<
  EmployeeQualification,
  'id' | 'employeeId'
>;
export type EmployeeQualificationDetailsResponse = EmployeeQualification;

// POST /profiles/employee/:employeeId/qualifications
export type CreateEmployeeQualificationRequest = Pick<
  EmployeeQualification,
  'employeeId'
> &
  DeepPartial<EmployeeQualification>;

// PUT /profiles/employee/:employeeId/qualifications/:id
export type UpdateEmployeeQualificationRequest = Pick<
  EmployeeQualification,
  'id' | 'employeeId'
> &
  DeepPartial<EmployeeQualification>;

// DELETE /profiles/employee/:employeeId/qualifications/:id
export type RemoveEmployeeQualificationRequest = Pick<
  EmployeeQualification,
  'id' | 'employeeId'
>;
