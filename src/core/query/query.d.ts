import { TranslationsKey } from '@/core/i18n/types';

interface QueryMeta extends Record<string, unknown> {
  key?: string;
  showLoading?: boolean | 'SPINNER' | TranslationsKey;
  notifySuccess?: TranslationsKey | boolean;
  notifyError?: TranslationsKey | boolean;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: QueryMeta;
    mutationMeta: QueryMeta;
  }
}
