import { BrandingSetting } from '../../types/branding';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import { stringRequired } from '@/modules/foundation/validation/rules';

const formValidateResolver =
  createFormValidateResolverWithTranslations<BrandingSetting>(t => ({
    platformName: stringRequired(t),
  }));

export default formValidateResolver;
