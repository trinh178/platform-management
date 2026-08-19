'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type InputProps = Omit<
  React.ComponentProps<typeof InputBase>,
  | 'defaultValue'
  | 'disabled'
  | 'inputPattern'
  | 'isError'
  | 'onChange'
  | 'readOnly'
  | 'value'
>;

type MaskValueMode = 'raw' | 'formatted';

interface FieldInputMaskedExtendsProps {
  inputProps?: InputProps;
  mask: string;
  maskChar?: string;
  valueMode?: MaskValueMode;
  replacementPattern?: RegExp;
}

export type FieldInputMaskedProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputMaskedExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unmaskValue(
  value: string,
  replacementPattern: RegExp,
  maskChar: string,
) {
  const maskCharPattern = new RegExp(escapeRegExp(maskChar), 'g');

  return value
    .replace(maskCharPattern, '')
    .split('')
    .filter(char => replacementPattern.test(char))
    .join('');
}

function formatMask(
  rawValue: string,
  mask: string,
  maskChar: string,
  replacementPattern: RegExp,
) {
  const rawChars = rawValue
    .split('')
    .filter(char => replacementPattern.test(char));
  let rawIndex = 0;
  let result = '';

  for (const char of mask) {
    if (char === maskChar) {
      const rawChar = rawChars[rawIndex];
      if (!rawChar) break;

      result += rawChar;
      rawIndex += 1;
      continue;
    }

    if (rawIndex > 0 && rawIndex < rawChars.length) {
      result += char;
    }
  }

  return result;
}

export default function FieldInputMasked<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputMaskedProps<
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

  const p = {
    ...props,
    clearValue,
    RenderComponent: FieldInputMaskedRender,
  } as FieldInputBaseProps<
    FieldInputMaskedExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputMaskedRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    disabled,
    inputProps,
    mask,
    maskChar = '#',
    placeholder,
    replacementPattern = /[0-9]/,
    valueMode = 'raw',
  },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
}: FieldInputRenderProps<
  FieldInputMaskedExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  const rawValue = React.useMemo(() => {
    const value = (currentValue as string | undefined) ?? '';

    return valueMode === 'formatted'
      ? unmaskValue(value, replacementPattern, maskChar)
      : value;
  }, [currentValue, maskChar, replacementPattern, valueMode]);

  const displayValue = React.useMemo(
    () => formatMask(rawValue, mask, maskChar, replacementPattern),
    [mask, maskChar, rawValue, replacementPattern],
  );

  return (
    <InputBase
      ref={inputRef}
      type="text"
      {...inputProps}
      placeholder={placeholder ?? inputProps?.placeholder}
      value={displayValue}
      onChange={e => {
        const nextRawValue = unmaskValue(
          e.target.value,
          replacementPattern,
          maskChar,
        );
        const nextFormattedValue = formatMask(
          nextRawValue,
          mask,
          maskChar,
          replacementPattern,
        );

        handleValueChange(
          (valueMode === 'formatted'
            ? nextFormattedValue
            : nextRawValue) as TFieldPathValue,
        );
      }}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName(inputProps?.className)}
      disabled={disabled}
    />
  );
}
