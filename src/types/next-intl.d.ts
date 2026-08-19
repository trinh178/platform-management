import { I18nMessagesType } from '@/modules/i18n.types';
// import { formats } from '@/i18n/request';
// import { routing } from '@/i18n/routing';

declare module 'next-intl' {
  interface AppConfig {
    // Locale: (typeof routing.locales)[number];
    Messages: I18nMessagesType;
    // Formats: typeof formats;
  }
}
