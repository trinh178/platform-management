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

interface FieldInputCurrencyExtendsProps {
  inputProps?: InputProps;
  currencySymbol?: React.ReactNode;
  symbolPosition?: 'prefix' | 'suffix';
  locale?: string;
  fractionDigits?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  allowNegative?: boolean;
  min?: number;
  max?: number;
  groupSeparator?: string;
  decimalSeparator?: string;
}

export type FieldInputCurrencyProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputCurrencyExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputCurrency<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputCurrencyProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return (
    <FieldInputBase {...props} RenderComponent={FieldInputCurrencyRender} />
  );
}

function getFractionRange({
  fractionDigits,
  minFractionDigits,
  maxFractionDigits,
}: Pick<
  FieldInputCurrencyExtendsProps,
  'fractionDigits' | 'maxFractionDigits' | 'minFractionDigits'
>) {
  return {
    minimumFractionDigits: fractionDigits ?? minFractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? maxFractionDigits ?? 0,
  };
}

function formatCurrencyNumber(
  value: unknown,
  options: Pick<
    FieldInputCurrencyExtendsProps,
    'fractionDigits' | 'locale' | 'maxFractionDigits' | 'minFractionDigits'
  >,
) {
  if (value === undefined || value === null || value === '') return '';

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '';

  return new Intl.NumberFormat(
    options.locale ?? 'en-US',
    getFractionRange(options),
  ).format(numberValue);
}

function formatEditableNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return '';

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '';

  return String(numberValue);
}

function normalizeCurrencyInput(
  value: string,
  {
    allowNegative,
    decimalSeparator = '.',
    groupSeparator = ',',
  }: Pick<
    FieldInputCurrencyExtendsProps,
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
  const nextValue = `${negative ? '-' : ''}${integerPart}${
    normalizedValue.includes('.') ? `.${fractionPart}` : ''
  }`;

  return nextValue;
}

function clampNumber(
  value: number,
  { max, min }: Pick<FieldInputCurrencyExtendsProps, 'max' | 'min'>,
) {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;

  return value;
}

function parseCurrencyValue(
  value: string,
  options: Pick<
    FieldInputCurrencyExtendsProps,
    'allowNegative' | 'decimalSeparator' | 'groupSeparator' | 'max' | 'min'
  >,
) {
  const normalizedValue = normalizeCurrencyInput(value, options);

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
    ? clampNumber(numberValue, options)
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

function FieldInputCurrencyRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    allowNegative,
    currencySymbol = 'VND',
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
    symbolPosition = 'prefix',
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
  FieldInputCurrencyExtendsProps,
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
      formatCurrencyNumber(currentValue, {
        fractionDigits,
        locale,
        maxFractionDigits,
        minFractionDigits,
      }),
    [
      currentValue,
      fractionDigits,
      locale,
      maxFractionDigits,
      minFractionDigits,
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
      groupSeparator,
      max,
      min,
    }),
    [allowNegative, decimalSeparator, groupSeparator, max, min],
  );

  const handleCommitValue = React.useCallback(
    (nextDisplayValue: string) => {
      const parsedValue = parseCurrencyValue(nextDisplayValue, parseOptions);

      handleValueChange(parsedValue as TFieldPathValue);
      setDisplayValue(
        formatCurrencyNumber(parsedValue, {
          fractionDigits,
          locale,
          maxFractionDigits,
          minFractionDigits,
        }),
      );
    },
    [
      fractionDigits,
      handleValueChange,
      locale,
      maxFractionDigits,
      minFractionDigits,
      parseOptions,
    ],
  );

  const inputGroupClassName = cn(
    getInputClassName(inputProps?.className),
    isEditButton && !editButtonEditing && 'pe-0 group-hover:pe-10',
    {
      'border-destructive': isError,
    },
  );
  const symbolAddon = (
    <InputGroupAddon
      align={symbolPosition === 'prefix' ? 'inline-start' : 'inline-end'}
    >
      <InputGroupText>{currencySymbol}</InputGroupText>
    </InputGroupAddon>
  );

  return (
    <InputGroup className={inputGroupClassName}>
      {symbolPosition === 'prefix' && symbolAddon}
      <InputBase
        data-slot="input-group-control"
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
            parseCurrencyValue(nextValue, parseOptions) as TFieldPathValue,
          );
        }}
        onBlur={e => {
          inputProps?.onBlur?.(e);
          handleCommitValue(displayValue);
        }}
        readOnly={readOnly}
        isError={isError}
        className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
        disabled={disabled}
        inputPattern={allowNegative ? /^-?[0-9.,\s]*$/ : /^[0-9.,\s]*$/}
      />
      {symbolPosition === 'suffix' && symbolAddon}
    </InputGroup>
  );
}
