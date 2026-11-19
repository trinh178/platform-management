import type { AppServiceMapping } from '../../types/app-service-mapping';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import {
  guidRequired,
  stringRequired,
} from '@/modules/foundation/validation/rules';

export type AssignFormValues = Pick<
  AppServiceMapping,
  'appId' | 'serviceId' | 'role'
>;

const formValidateResolver =
  createFormValidateResolverWithTranslations<AssignFormValues>(t => ({
    appId: guidRequired(t),
    serviceId: guidRequired(t),
    role: stringRequired(t),
  }));

export default formValidateResolver;
