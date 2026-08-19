'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type InputProps = Omit<
  React.ComponentProps<typeof Textarea>,
  'defaultValue' | 'disabled' | 'isError' | 'onChange' | 'readOnly' | 'value'
>;

interface FieldInputTextAreaExtendsProps {
  inputProps?: InputProps;
}

export type FieldInputTextAreaProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputTextAreaExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputTextArea<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputTextAreaProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : ('' as TFieldPathValue);

  return (
    <FieldInputBase
      {...props}
      clearValue={clearValue}
      RenderComponent={FieldInputTextAreaRender}
    />
  );
}

function FieldInputTextAreaRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { inputProps, disabled, placeholder },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
}: FieldInputRenderProps<
  FieldInputTextAreaExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  return (
    <Textarea
      ref={inputRef}
      {...inputProps}
      placeholder={placeholder ?? inputProps?.placeholder}
      value={(currentValue as string | undefined) ?? ''}
      onChange={e => handleValueChange(e.target.value as TFieldPathValue)}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName(inputProps?.className)}
      disabled={disabled}
    />
  );
}
