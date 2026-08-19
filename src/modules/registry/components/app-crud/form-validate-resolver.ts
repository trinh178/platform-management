import { App } from '../../types/app';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import { stringRequired } from '@/modules/foundation/validation/rules';

const APP_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const formValidateResolver = createFormValidateResolverWithTranslations<App>(
  t => ({
    appCode: stringRequired(t).regex(
      APP_CODE_PATTERN,
      t('registry.app.validation.appCodeFormat'),
    ),
    name: stringRequired(t),
    status: stringRequired(t),
  }),
);

export default formValidateResolver;
