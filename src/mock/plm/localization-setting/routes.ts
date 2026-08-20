import { mergeLocalizationSetting } from './helpers';
import { localizationSettingStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { parseBody } from '@/core/network/mock-utils';
import plmHttpRequest from '@/core/network/plm-http-request';

// ─── GET /settings/localization ────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/settings\/localization$/,
  method: 'GET',
  handler: () => appfetch.json(localizationSettingStore),
});

// ─── PUT /settings/localization ────────────────────────────────────────────
// Singleton — không có POST/DELETE, chỉ view/update.
plmHttpRequest.addMockRoute({
  url: /\/settings\/localization$/,
  method: 'PUT',
  handler: async (input, init) => {
    const body = await parseBody(input, init);

    const nextSupportedLanguages = Array.isArray(body.supportedLanguages)
      ? body.supportedLanguages
      : localizationSettingStore.supportedLanguages;
    const nextDefaultLanguage =
      typeof body.defaultLanguage === 'string'
        ? body.defaultLanguage
        : localizationSettingStore.defaultLanguage;

    if (!nextSupportedLanguages.includes(nextDefaultLanguage)) {
      return appfetch.error(
        {
          code: 'DEFAULT_LANGUAGE_NOT_SUPPORTED',
          message: 'defaultLanguage phải nằm trong supportedLanguages',
        },
        400,
      );
    }

    mergeLocalizationSetting(localizationSettingStore, body);
    return appfetch.json(localizationSettingStore);
  },
});
