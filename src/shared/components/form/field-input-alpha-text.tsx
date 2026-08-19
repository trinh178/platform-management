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

interface FieldInputAlphaTextExtendsProps {
  inputProps?: InputProps;
}

export type FieldInputAlphaTextProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputAlphaTextExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputAlphaText<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputAlphaTextProps<
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
      RenderComponent={FieldInputAlphaTextRender}
    />
  );
}

function FieldInputAlphaTextRender<
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
  FieldInputAlphaTextExtendsProps,
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
      onChange={e =>
        handleValueChange(e.target.value.replace(/\d/g, '') as TFieldPathValue)
      }
      onKeyDown={e => {
        if (/\d/.test(e.key)) e.preventDefault();
        inputProps?.onKeyDown?.(e);
      }}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName(inputProps?.className)}
      disabled={disabled}
    />
  );
}
