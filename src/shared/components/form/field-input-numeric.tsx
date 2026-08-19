'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import { InputGroup, InputGroupAddon, InputGroupText } from '../ui/input-group';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';
import { cn } from '@/shared/lib/utils';

type InputProps = Omit<
  React.ComponentProps<typeof InputBase>,
  | 'defaultValue'
  | 'disabled'
  | 'inputMode'
  | 'inputPattern'
  | 'isError'
  | 'maxLength'
  | 'onChange'
  | 'readOnly'
  | 'type'
  | 'value'
>;

interface FieldInputNumericExtendsProps {
  inputProps?: InputProps;
  maxLength?: number;
  prefix?: React.ReactNode;
  stripNonDigits?: boolean;
  suffix?: React.ReactNode;
}

export type FieldInputNumericProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputNumericExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputNumeric<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputNumericProps<
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
      RenderComponent={FieldInputNumericRender}
    />
  );
}

function formatNumeric(value: unknown) {
  if (value === undefined || value === null) return '';

  return String(value);
}

function normalizeNumericValue(
  value: string,
  {
    maxLength,
    stripNonDigits = true,
  }: Pick<FieldInputNumericExtendsProps, 'maxLength' | 'stripNonDigits'>,
) {
  const normalizedValue = stripNonDigits ? value.replace(/\D/g, '') : value;

  return maxLength === undefined
    ? normalizedValue
    : normalizedValue.slice(0, maxLength);
}

function FieldInputNumericRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    disabled,
    inputProps,
    maxLength,
    placeholder,
    prefix,
    stripNonDigits,
    suffix,
  },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
  isEditButton,
  editButtonEditing,
  valueSyncKey,
}: FieldInputRenderProps<
  FieldInputNumericExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = React.useState('');

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  const value = React.useMemo(
    () => formatNumeric(currentValue),
    [currentValue],
  );
  const valueRef = React.useRef(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    if (document.activeElement === inputRef.current) return;

    setDisplayValue(value);
  }, [value]);

  React.useEffect(() => {
    setDisplayValue(valueRef.current);
  }, [valueSyncKey]);

  const normalizeOptions = React.useMemo(
    () => ({ maxLength, stripNonDigits }),
    [maxLength, stripNonDigits],
  );

  const hasAddon = prefix !== undefined || suffix !== undefined;
  const inputGroupClassName = cn(
    getInputClassName(inputProps?.className),
    isEditButton && !editButtonEditing && 'pe-0 group-hover:pe-10',
    {
      'border-destructive': isError,
    },
  );
  const inputElement = (
    <InputBase
      data-slot={hasAddon ? 'input-group-control' : undefined}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      {...inputProps}
      placeholder={placeholder ?? inputProps?.placeholder}
      value={displayValue}
      onChange={e => {
        const nextValue = normalizeNumericValue(
          e.target.value,
          normalizeOptions,
        );

        setDisplayValue(nextValue);
        handleValueChange(nextValue as TFieldPathValue);
      }}
      readOnly={readOnly}
      isError={isError}
      className={
        hasAddon
          ? 'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent'
          : getInputClassName(inputProps?.className)
      }
      disabled={disabled}
      maxLength={maxLength}
    />
  );

  if (!hasAddon) return inputElement;

  return (
    <InputGroup className={inputGroupClassName}>
      {prefix !== undefined && (
        <InputGroupAddon align="inline-start">
          <InputGroupText>{prefix}</InputGroupText>
        </InputGroupAddon>
      )}
      {inputElement}
      {suffix !== undefined && (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{suffix}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
