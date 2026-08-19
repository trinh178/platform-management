import { Service } from '../../types/service';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import { stringRequired } from '@/modules/foundation/validation/rules';

const SERVICE_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const formValidateResolver =
  createFormValidateResolverWithTranslations<Service>(t => ({
    serviceCode: stringRequired(t).regex(
      SERVICE_CODE_PATTERN,
      t('registry.service.validation.serviceCodeFormat'),
    ),
    name: stringRequired(t),
    status: stringRequired(t),
  }));

export default formValidateResolver;
