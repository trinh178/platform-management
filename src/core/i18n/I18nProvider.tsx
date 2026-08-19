import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import InjectStore from './inject-store';

export interface I18nProviderProps {
  locale: string;
  i18n: object;
}

export default function I18nProvider({
  children,
  locale,
  i18n,
}: { children: React.ReactNode } & I18nProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={i18n}
      timeZone="Asia/Ho_Chi_Minh"
      onError={error => {
        if (error.code === 'MISSING_MESSAGE') {
          // console.error('error');
          return;
        }
        console.error(error);
      }}
      getMessageFallback={({ key }) => key}
    >
      <InjectStore>{children}</InjectStore>
    </NextIntlClientProvider>
  );
}
