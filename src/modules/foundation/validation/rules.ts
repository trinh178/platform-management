import z from 'zod';
import { TranslationsFn } from '@/core/i18n/types';

export const stringRequired = (t: TranslationsFn) =>
  z.string(t('validation.required')).min(1, t('validation.required'));

export const dateRequired = (t: TranslationsFn) =>
  z.date(t('validation.required'));

export const emailFormat = (t: TranslationsFn) =>
  z.email(t('validation.email_format_invalid'));

export const numberRequired = (t: TranslationsFn) =>
  z.number(t('validation.required'));

export const guidRequired = (t: TranslationsFn) =>
  z.uuid(t('validation.required'));

export const objectRequired = (t: TranslationsFn) =>
  z.looseObject({}, t('validation.required'));

export const stringMinLength = (t: TranslationsFn, min: number) =>
  z.string().min(min, t('validation.minLength', { min }));

export const stringMaxLength = (t: TranslationsFn, max: number) =>
  z.string().max(max, t('validation.maxLength', { max }));

export const numberMin = (t: TranslationsFn, min: number) =>
  z.number().min(min, t('validation.min', { min }));

export const numberMax = (t: TranslationsFn, max: number) =>
  z.number().max(max, t('validation.max', { max }));
