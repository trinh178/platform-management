import { createFormValidateResolverWithTranslations } from '@/core/form';
import type { EmployeeQualification } from '@/modules/employee/types/employee-qualification';
import { stringRequired } from '@/modules/foundation/validation/rules';

const formValidateResolver =
  createFormValidateResolverWithTranslations<EmployeeQualification>(t => ({
    type: stringRequired(t),
    institution: stringRequired(t),
  }));

export default formValidateResolver;
