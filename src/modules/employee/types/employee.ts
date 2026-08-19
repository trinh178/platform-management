import { EmployeeContact } from './employee-contact';
import { EmployeeJobInfo } from './employee-job-info';
import { EmployeeQualification } from './employee-qualification';
import { JobPosition, OrganizationUnit } from './organization';
import type { AuditFields } from '@/shared/types/audit';

export type GenderType = 'Male' | 'Female';

export type MaritalStatusType = 'Single' | 'Married' | 'Divorced';

export type Employee = AuditFields & {
  id: string;

  /* Thông tin chung */
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: Date;
  gender: GenderType;
  avatarFileId?: string;
  avatar?: string;
  placeOfBirth?: string;
  placeOfOrigin?: string;
  maritalStatus?: MaritalStatusType;
  ethnicity?: string;
  religion?: string;
  nationality?: string;

  /* CCCD */
  idNumber?: string;
  idDateOfIssue?: Date;
  idPlaceOfIssue?: string;
  idDateOfExpiry?: Date;

  /* Trình độ, bằng cấp */
  educationLevel?: string;
  qualificationLevel?: string;
  institution?: string;
  major?: string;
  graduationYear?: number;
  classification?: string;

  /* Thông tin tài khoản */
  userId?: string;

  /* Relations */
  contact?: EmployeeContact;
  qualifications?: EmployeeQualification[];
  jobInfo?: EmployeeJobInfo;
};

export type EmployeePreview = Pick<
  Employee,
  | 'id'
  | 'employeeCode'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'avatar'
  | 'gender'
  | 'dateOfBirth'
  | 'userId'
  | 'createdBy'
  | 'createdOnUtc'
  | 'modifiedBy'
  | 'modifiedOnUtc'
> & {
  contact?: Pick<EmployeeContact, 'personalPhoneNumber'>;
  jobInfo?: Pick<
    EmployeeJobInfo,
    'hireDate' | 'probationDate' | 'officialDate' | 'status'
  > & {
    organizationUnit: Pick<OrganizationUnit, 'code' | 'name'>;
    jobPosition: Pick<JobPosition, 'code' | 'name'>;
  };
};
