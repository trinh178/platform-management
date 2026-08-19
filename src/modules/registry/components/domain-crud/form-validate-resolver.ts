import { Domain } from '../../types/domain';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import {
  guidRequired,
  stringRequired,
} from '@/modules/foundation/validation/rules';

const DOMAIN_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const formValidateResolver = createFormValidateResolverWithTranslations<Domain>(
  t => ({
    serviceId: guidRequired(t),
    domainCode: stringRequired(t).regex(
      DOMAIN_CODE_PATTERN,
      t('registry.domain.validation.domainCodeFormat'),
    ),
    name: stringRequired(t),
    status: stringRequired(t),
  }),
);

export default formValidateResolver;
