import { GeneralSetting } from '../../types/general';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import { stringRequired } from '@/modules/foundation/validation/rules';

const formValidateResolver =
  createFormValidateResolverWithTranslations<GeneralSetting>(t => ({
    defaultTimezone: stringRequired(t),
    defaultCurrency: stringRequired(t),
  }));

export default formValidateResolver;
