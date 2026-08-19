import { createFormValidateResolverWithTranslations } from '@/core/form';
import { EmployeeDocument } from '@/modules/employee/types/employee-document';
import { stringRequired } from '@/modules/foundation/validation/rules';

const formValidateResolver =
  createFormValidateResolverWithTranslations<EmployeeDocument>(t => ({
    name: stringRequired(t),
  }));

export default formValidateResolver;
