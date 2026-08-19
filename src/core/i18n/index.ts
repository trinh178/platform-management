/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';
import { TranslationsFn } from './types';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';

export const globalTranslations: TranslationsFn = Object.assign(
  (key: any, ...args: any): string => {
    return useAppShellStore.getState()?.translations?.(key, ...args) || key;
  },
  {
    rich(key: any, ...args: any): ReactNode {
      return (
        useAppShellStore.getState()?.translations?.rich?.(key, ...args) ||
        `${String(key)}`
      );
    },

    markup(key: any, ...args: any): string {
      return (
        useAppShellStore.getState()?.translations?.markup?.(key, ...args) ||
        `<b>${String(key)}</b>`
      );
    },

    raw(key: any) {
      return useAppShellStore.getState()?.translations?.raw?.(key) || { key };
    },

    has(key: any): boolean {
      return useAppShellStore.getState()?.translations?.has?.(key) || true;
    },
  },
);

export const gT = globalTranslations;
