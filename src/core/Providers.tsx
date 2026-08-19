'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import z from 'zod';
import { vi } from 'zod/locales';
import AppInitializer from './AppInitializer';
import { ConfirmProvider } from './confirmation/confirm-provider';
import I18nProvider, { I18nProviderProps } from './i18n/I18nProvider';
import AppLoadingContainer from './loading/app-loading-container';
import GlobalAppLoadingContainer from './loading/GlobalAppLoadingContainer';
import AppContextProvider from '@/core/context/AppContextProvider';
import NotificationContainer from '@/core/notification/NotificationContainer';
import queryClient from '@/core/query/query-client';
import AppThemeProvider from '@/core/theme/AppThemeProvider';

z.config(vi());

type ProvidersProps = I18nProviderProps;

export default function Providers({
  children,
  ...props
}: { children: React.ReactNode } & ProvidersProps) {
  return (
    <AppContextProvider>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <I18nProvider locale={props.locale} i18n={props.i18n}>
            <ConfirmProvider>
              <AppInitializer>{children}</AppInitializer>
              <AppLoadingContainer />
              <GlobalAppLoadingContainer />
            </ConfirmProvider>
          </I18nProvider>
        </AppThemeProvider>
        <NotificationContainer />
      </QueryClientProvider>
    </AppContextProvider>
  );
}
