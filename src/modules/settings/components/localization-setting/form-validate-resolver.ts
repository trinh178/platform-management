import z from 'zod';
import { LocalizationSetting } from '../../types/localization';
import { createFormValidateResolverWithTranslations } from '@/core/form';
import { stringRequired } from '@/modules/foundation/validation/rules';

// Cross-field: defaultLanguage phải nằm trong supportedLanguages (xem
// docs.business/domains/settings/domain.yaml#default_language_must_be_supported).
// Dùng schemaFn (không phải strictSchemaFn) để có thể gắn .superRefine ở cấp object.
const formValidateResolver =
  createFormValidateResolverWithTranslations<LocalizationSetting>(
    undefined,
    t =>
      z
        .looseObject({
          supportedLanguages: z
            .array(z.string())
            .min(1, t('validation.required')),
          defaultLanguage: stringRequired(t),
          dateFormat: stringRequired(t),
          timeFormat: stringRequired(t),
          numberFormat: stringRequired(t),
          currencyFormat: stringRequired(t),
        })
        .superRefine((data, ctx) => {
          if (!data.supportedLanguages.includes(data.defaultLanguage)) {
            ctx.addIssue({
              code: 'custom',
              path: ['defaultLanguage'],
              message: t(
                'settings.localization.validation.defaultLanguageNotSupported',
              ),
            });
          }
        }),
  );

export default formValidateResolver;
