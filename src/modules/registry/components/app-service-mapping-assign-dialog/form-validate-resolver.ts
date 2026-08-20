import type { AppServiceMapping } from '../../types/app-service-mapping';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import { guidRequired } from '@/modules/foundation/validation/rules';

export type AssignFormValues = Pick<AppServiceMapping, 'appId' | 'serviceId'>;

const formValidateResolver =
  createFormValidateResolverWithTranslations<AssignFormValues>(t => ({
    appId: guidRequired(t),
    serviceId: guidRequired(t),
  }));

export default formValidateResolver;
