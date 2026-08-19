import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import FieldInputSelect from './field-input-select';
import { ConstantBase, useConstWithTranslations } from '@/core/constants';

export default function FieldInputConstant<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  V extends string,
  E extends Record<string, unknown>,
  T extends ConstantBase<V, E>,
>({
  constOptions,
  ...props
}: Omit<
  React.ComponentProps<
    typeof FieldInputSelect<
      TFieldValues,
      TContext,
      TTransformedValues,
      TName,
      TFieldPathValue
    >
  >,
  'options'
> & {
  constOptions: T[];
}) {
  const options = useConstWithTranslations<V, E, T>(constOptions);
  return <FieldInputSelect {...props} options={options} />;
}
