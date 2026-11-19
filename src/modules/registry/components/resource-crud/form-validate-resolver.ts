import z from 'zod';
import { RESOURCE_ACTION_PATTERN } from '../../constants/resource';
import { Resource } from '../../types/resource';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import {
  guidRequired,
  stringRequired,
} from '@/modules/foundation/validation/rules';

const RESOURCE_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const formValidateResolver =
  createFormValidateResolverWithTranslations<Resource>(t => ({
    domainId: guidRequired(t),
    resourceCode: stringRequired(t).regex(
      RESOURCE_CODE_PATTERN,
      t('registry.resource.validation.resourceCodeFormat'),
    ),
    name: stringRequired(t),
    actions: z
      .array(
        z
          .string()
          .regex(
            RESOURCE_ACTION_PATTERN,
            t('registry.resource.validation.actionFormat'),
          ),
      )
      .optional(),
  }));

export default formValidateResolver;
