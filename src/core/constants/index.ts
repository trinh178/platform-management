import React from 'react';
import { useTranslations } from 'next-intl';
import { FieldPath, FieldPathValue } from 'react-hook-form';
import { TranslationsKey } from '@/core/i18n/types';

export type ConstantBase<
  V extends string,
  E extends Record<string, unknown> = Record<string, unknown>,
> = {
  label: TranslationsKey;
  value: V;
} & E;

export function constGet<
  V extends string,
  E extends Record<string, unknown>,
  TFieldValues extends ConstantBase<V, E>,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  constant: TFieldValues[],
  value: V | undefined,
  property: TName,
): TFieldPathValue {
  const item = constant?.find(c => c.value === value);
  return item?.[property]
    ? (item?.[property] as unknown as TFieldPathValue)
    : (value as TFieldPathValue) || ('-' as unknown as TFieldPathValue);
}

export function useConstWithTranslations<
  V extends string,
  E extends Record<string, unknown>,
  T extends ConstantBase<V, E>,
>(constList: T[]) {
  const t = useTranslations();
  return React.useMemo(
    () =>
      constList.map(item => ({
        ...item,
        label: t(item.label),
      })),
    [t, constList],
  );
}
