/* eslint-disable no-restricted-imports */
import React from 'react';
import { toast } from 'sonner';
import { gT } from '../i18n';
import { TranslationsKey } from '../i18n/types';

type MessageType =
  | (() => React.ReactNode)
  | Exclude<React.ReactNode, string>
  | TranslationsKey
  | (string & {});

type DataType = Parameters<typeof toast.success>[1];

export const notify = {
  ...toast,

  success(message: MessageType, data?: DataType) {
    if (typeof message === 'string') message = gT(message as TranslationsKey);
    return toast.success(message, data);
  },

  error: (message: MessageType, data?: DataType) => {
    if (typeof message === 'string') message = gT(message as TranslationsKey);
    return toast.error(message, data);
  },

  warning: (message: MessageType, data?: DataType) => {
    if (typeof message === 'string') message = gT(message as TranslationsKey);
    return toast.warning(message, data);
  },

  info: (message: MessageType, data?: DataType) => {
    if (typeof message === 'string') message = gT(message as TranslationsKey);
    return toast.info(message, data);
  },

  loading: (message: MessageType, data?: DataType) => {
    if (typeof message === 'string') message = gT(message as TranslationsKey);
    return toast.loading(message, data);
  },
};
