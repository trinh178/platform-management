'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type InputProps = Omit<
  React.ComponentProps<typeof InputBase>,
  'defaultValue' | 'disabled' | 'isError' | 'onChange' | 'readOnly' | 'value'
>;

interface FieldInputTextExtendsProps {
  inputProps?: InputProps;
}

export type FieldInputTextProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputTextExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputText<
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
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : ('' as TFieldPathValue);

  return (
    <FieldInputBase
      {...props}
      clearValue={clearValue}
      RenderComponent={FieldInputTextRender}
    />
  );
}

function FieldInputTextRender<
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
  FieldInputTextExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  return (
    <InputBase
      ref={inputRef}
      type="text"
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
