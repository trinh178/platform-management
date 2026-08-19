import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import FieldInputText, { FieldInputTextProps } from './field-input-text';

export default function FieldInputEmail<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputTextProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return (
    <FieldInputText
      {...props}
      inputProps={{
        ...props.inputProps,
        type: 'email',
        inputMode: 'email',
        // inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      }}
    />
  );
}
