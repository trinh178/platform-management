import { GenderType, MaritalStatusType } from '../types/employee';
import { ConstantBase } from '@/core/constants';

export const CONST_MARITAL_STATUS: ConstantBase<MaritalStatusType>[] = [
  {
    label: 'employee.constants.marital.single',
    value: 'Single',
  },
  {
    label: 'employee.constants.marital.married',
    value: 'Married',
  },
  {
    label: 'employee.constants.marital.divorced',
    value: 'Divorced',
  },
] as const;

export const CONST_GENDER: ConstantBase<GenderType>[] = [
  {
    label: 'employee.constants.gender.male',
    value: 'Male',
  },
  {
    label: 'employee.constants.gender.female',
    value: 'Female',
  },
] as const;
