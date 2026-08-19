import { _Translator } from 'next-intl';
import { I18nMessagesType } from '@/modules/i18n.types';

export type TranslationsFn = _Translator<I18nMessagesType, never>;

export type TranslationsKey = Parameters<TranslationsFn>[0];

export type TranslationsKeyOrString = TranslationsKey | (string & {});
