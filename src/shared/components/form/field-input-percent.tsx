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
  | 'inputPattern'
  | 'isError'
  | 'onChange'
  | 'readOnly'
  | 'type'
  | 'value'
>;

interface FieldInputPercentExtendsProps {
  inputProps?: InputProps;
  fractionDigits?: number;
  percentSymbol?: React.ReactNode;
}

export type FieldInputPercentProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputPercentExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputPercent<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputPercentProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return (
    <FieldInputBase {...props} RenderComponent={FieldInputPercentRender} />
  );
}

function formatPercent(value: unknown, fractionDigits?: number) {
  if (value === undefined || value === null || value === '') return '';

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '';

  return fractionDigits === undefined
    ? String(numberValue)
    : numberValue.toFixed(fractionDigits);
}

function parsePercent(value: string) {
  if (value === '') return undefined;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function FieldInputPercentRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    disabled,
    fractionDigits,
    inputProps,
    percentSymbol = '%',
    placeholder,
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
  FieldInputPercentExtendsProps,
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
    () => formatPercent(currentValue, fractionDigits),
    [currentValue, fractionDigits],
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

  const inputGroupClassName = cn(
    getInputClassName(inputProps?.className),
    isEditButton && !editButtonEditing && 'pe-0 group-hover:pe-10',
    {
      'border-destructive': isError,
    },
  );

  return (
    <InputGroup className={inputGroupClassName}>
      <InputBase
        data-slot="input-group-control"
        ref={inputRef}
        type="text"
        inputMode="decimal"
        {...inputProps}
        placeholder={placeholder ?? inputProps?.placeholder}
        value={displayValue}
        onChange={e => {
          const nextValue = e.target.value;

          setDisplayValue(nextValue);

          if (nextValue === '.' || nextValue.endsWith('.')) return;

          handleValueChange(parsePercent(nextValue) as TFieldPathValue);
        }}
        onBlur={e => {
          inputProps?.onBlur?.(e);
          const parsedValue = parsePercent(displayValue);

          handleValueChange(parsedValue as TFieldPathValue);
          setDisplayValue(formatPercent(parsedValue, fractionDigits));
        }}
        readOnly={readOnly}
        isError={isError}
        className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
        disabled={disabled}
        inputPattern={/^[0-9]*\.?[0-9]*$/}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>{percentSymbol}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
