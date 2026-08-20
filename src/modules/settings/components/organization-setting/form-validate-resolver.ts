import { OrganizationSetting } from '../../types/organization';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import { stringRequired } from '@/modules/foundation/validation/rules';

const formValidateResolver =
  createFormValidateResolverWithTranslations<OrganizationSetting>(t => ({
    name: stringRequired(t),
  }));

export default formValidateResolver;
