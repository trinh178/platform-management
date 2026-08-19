import { QualificationType } from '../types/employee-qualification';
import { ConstantBase } from '@/core/constants';

export const CONST_QUALIFICATION_TYPE: ConstantBase<QualificationType>[] = [
  {
    label: 'employee.constants.qualification.education',
    value: 'Education',
  },
  {
    label: 'employee.constants.qualification.certification',
    value: 'Certification',
  },
] as const;
