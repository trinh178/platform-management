import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FieldValues, Resolver } from 'react-hook-form';
import z from 'zod';
import { TranslationsFn } from '../i18n/types';

export function createFormValidateResolverWithTranslations<
  TFieldValues extends FieldValues = FieldValues,
  T extends z.core.$ZodLooseShape = z.core.$ZodLooseShape,
>(
  strictSchemaFn?: (
    t: TranslationsFn,
  ) => Partial<Record<keyof TFieldValues, unknown>>,
  schemaFn?: (t: TranslationsFn) => z.ZodObject<T, z.core.$loose>,
) {
  return (t: TranslationsFn) =>
    zodResolver(
      schemaFn ? schemaFn(t) : z.looseObject(strictSchemaFn?.(t) || {}),
    ) as unknown as Resolver<TFieldValues, unknown, TFieldValues>;
}

export function useFormValidateResolver<
  TFieldValues extends FieldValues = FieldValues,
>(
  resolverFn: (
    t: TranslationsFn,
  ) => Resolver<TFieldValues, unknown, TFieldValues>,
) {
  const t = useTranslations();
  const formValidateResolver = React.useMemo(
    () => resolverFn(t),
    [resolverFn, t],
  );
  return formValidateResolver;
}

// export function createFormValidateResolver<
//   TFieldValues extends FieldValues = FieldValues,
// >(schema: Partial<Record<keyof TFieldValues, unknown>>) {
//   return zodResolver(z.looseObject(schema)) as unknown as Resolver<
//     TFieldValues,
//     unknown,
//     TFieldValues
//   >;
// }
