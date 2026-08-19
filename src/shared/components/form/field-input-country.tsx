import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import FieldInputSelect from './field-input-select';
import countries from '@/shared/constants/countries.json';

export default function FieldInputCountry<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: Omit<
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
  >,
) {
  return <FieldInputSelect {...props} options={countries} searchable />;
}
