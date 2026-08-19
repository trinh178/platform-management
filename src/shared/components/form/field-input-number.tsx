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
  | 'onChange'
  | 'readOnly'
  | 'type'
  | 'value'
>;

interface FieldInputNumberExtendsProps {
  inputProps?: InputProps;
  allowNegative?: boolean;
  decimalSeparator?: string;
  fractionDigits?: number;
  groupSeparator?: string;
  locale?: string;
  max?: number;
  maxFractionDigits?: number;
  min?: number;
  minFractionDigits?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  useGrouping?: boolean;
}

export type FieldInputNumberProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputNumberExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputNumber<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputNumberProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return <FieldInputBase {...props} RenderComponent={FieldInputNumberRender} />;
}

function getFractionRange({
  fractionDigits,
  maxFractionDigits,
  minFractionDigits,
}: Pick<
  FieldInputNumberExtendsProps,
  'fractionDigits' | 'maxFractionDigits' | 'minFractionDigits'
>) {
  return {
    minimumFractionDigits: fractionDigits ?? minFractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? maxFractionDigits ?? 20,
  };
}

function formatNumber(
  value: unknown,
  options: Pick<
    FieldInputNumberExtendsProps,
    | 'fractionDigits'
    | 'locale'
    | 'maxFractionDigits'
    | 'minFractionDigits'
    | 'useGrouping'
  >,
) {
  if (value === undefined || value === null || value === '') return '';

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '';

  return new Intl.NumberFormat(options.locale ?? 'en-US', {
    ...getFractionRange(options),
    useGrouping: options.useGrouping ?? true,
  }).format(numberValue);
}

function formatEditableNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return '';

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '';

  return String(numberValue);
}

function normalizeNumberInput(
  value: string,
  {
    allowNegative,
    decimalSeparator = '.',
    groupSeparator = ',',
  }: Pick<
    FieldInputNumberExtendsProps,
    'allowNegative' | 'decimalSeparator' | 'groupSeparator'
  >,
) {
  let normalizedValue = value.trim();

  if (!normalizedValue) return '';

  normalizedValue = normalizedValue.replace(/\s/g, '');

  if (groupSeparator) {
    normalizedValue = normalizedValue.replaceAll(groupSeparator, '');
  }

  if (decimalSeparator && decimalSeparator !== '.') {
    normalizedValue = normalizedValue.replaceAll(decimalSeparator, '.');
  }

  normalizedValue = normalizedValue.replace(/,/g, '');
  normalizedValue = normalizedValue.replace(
    allowNegative ? /[^0-9.-]/g : /[^0-9.]/g,
    '',
  );

  const negative = allowNegative && normalizedValue.startsWith('-');
  normalizedValue = normalizedValue.replace(/-/g, '');

  const [integerPart, ...fractionParts] = normalizedValue.split('.');
  const fractionPart = fractionParts.join('');

  return `${negative ? '-' : ''}${integerPart}${
    normalizedValue.includes('.') ? `.${fractionPart}` : ''
  }`;
}

function clampNumber(
  value: number,
  { max, min }: Pick<FieldInputNumberExtendsProps, 'max' | 'min'>,
) {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;

  return value;
}

function roundNumber(value: number, fractionDigits?: number) {
  if (fractionDigits === undefined) return value;

  const multiplier = 10 ** fractionDigits;

  return Math.round(value * multiplier) / multiplier;
}

function parseNumberValue(
  value: string,
  options: Pick<
    FieldInputNumberExtendsProps,
    | 'allowNegative'
    | 'decimalSeparator'
    | 'fractionDigits'
    | 'groupSeparator'
    | 'max'
    | 'min'
  >,
) {
  const normalizedValue = normalizeNumberInput(value, options);

  if (
    normalizedValue === '' ||
    normalizedValue === '-' ||
    normalizedValue === '.' ||
    normalizedValue === '-.'
  ) {
    return undefined;
  }

  const numberValue = Number(normalizedValue);

  return Number.isFinite(numberValue)
    ? clampNumber(roundNumber(numberValue, options.fractionDigits), options)
    : undefined;
}

function isIntermediateInput(value: string, decimalSeparator = '.') {
  return (
    value === '-' ||
    value === decimalSeparator ||
    value === `-${decimalSeparator}` ||
    value.endsWith(decimalSeparator)
  );
}

function FieldInputNumberRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    allowNegative,
    decimalSeparator,
    disabled,
    fractionDigits,
    groupSeparator,
    inputProps,
    locale,
    max,
    maxFractionDigits,
    min,
    minFractionDigits,
    placeholder,
    prefix,
    suffix,
    useGrouping,
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
  FieldInputNumberExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = React.useState('');

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  const formattedValue = React.useMemo(
    () =>
      formatNumber(currentValue, {
        fractionDigits,
        locale,
        maxFractionDigits,
        minFractionDigits,
        useGrouping,
      }),
    [
      currentValue,
      fractionDigits,
      locale,
      maxFractionDigits,
      minFractionDigits,
      useGrouping,
    ],
  );
  const formattedValueRef = React.useRef(formattedValue);

  React.useEffect(() => {
    formattedValueRef.current = formattedValue;
  }, [formattedValue]);

  React.useEffect(() => {
    if (document.activeElement === inputRef.current) return;

    setDisplayValue(formattedValue);
  }, [formattedValue]);

  React.useEffect(() => {
    setDisplayValue(formattedValueRef.current);
  }, [valueSyncKey]);

  const parseOptions = React.useMemo(
    () => ({
      allowNegative,
      decimalSeparator,
      fractionDigits,
      groupSeparator,
      max,
      min,
    }),
    [allowNegative, decimalSeparator, fractionDigits, groupSeparator, max, min],
  );

  const formatOptions = React.useMemo(
    () => ({
      fractionDigits,
      locale,
      maxFractionDigits,
      minFractionDigits,
      useGrouping,
    }),
    [fractionDigits, locale, maxFractionDigits, minFractionDigits, useGrouping],
  );

  const handleCommitValue = React.useCallback(
    (nextDisplayValue: string) => {
      const parsedValue = parseNumberValue(nextDisplayValue, parseOptions);

      handleValueChange(parsedValue as TFieldPathValue);
      setDisplayValue(formatNumber(parsedValue, formatOptions));
    },
    [formatOptions, handleValueChange, parseOptions],
  );

  const inputClassName =
    'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent';
  const inputPattern = allowNegative ? /^-?[0-9.,\s]*$/ : /^[0-9.,\s]*$/;
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
      inputMode="decimal"
      {...inputProps}
      placeholder={placeholder ?? inputProps?.placeholder}
      value={displayValue}
      onFocus={e => {
        inputProps?.onFocus?.(e);
        setDisplayValue(formatEditableNumber(currentValue));
      }}
      onChange={e => {
        const nextValue = e.target.value;

        setDisplayValue(nextValue);

        if (isIntermediateInput(nextValue, decimalSeparator)) return;

        handleValueChange(
          parseNumberValue(nextValue, parseOptions) as TFieldPathValue,
        );
      }}
      onBlur={e => {
        inputProps?.onBlur?.(e);
        handleCommitValue(displayValue);
      }}
      readOnly={readOnly}
      isError={isError}
      className={
        hasAddon ? inputClassName : getInputClassName(inputProps?.className)
      }
      disabled={disabled}
      inputPattern={inputPattern}
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
