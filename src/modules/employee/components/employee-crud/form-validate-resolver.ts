import z from 'zod';
import { Employee } from '../../types/employee';
import { EmployeeContact } from '../../types/employee-contact';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import {
  dateRequired,
  emailFormat,
  stringRequired,
} from '@/modules/foundation/validation/rules';

const formValidateResolver =
  createFormValidateResolverWithTranslations<Employee>(t => ({
    employeeCode: stringRequired(t),
    firstName: stringRequired(t),
    lastName: stringRequired(t),
    dateOfBirth: dateRequired(t),
    gender: stringRequired(t),
    contact: z
      .looseObject({
        personalEmail: emailFormat(t).optional(),
        officeEmail: emailFormat(t).optional(),
      } as Record<keyof EmployeeContact, unknown>)
      .optional(),
  }));

export default formValidateResolver;
