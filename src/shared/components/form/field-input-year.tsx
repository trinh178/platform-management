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

interface FieldInputYearExtendsProps {
  inputProps?: InputProps;
  maxYear?: number;
  minYear?: number;
}

export type FieldInputYearProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputYearExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputYear<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputYearProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return <FieldInputBase {...props} RenderComponent={FieldInputYearRender} />;
}

function formatYear(value: unknown) {
  if (value === undefined || value === null || value === '') return '';

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? String(Math.trunc(numberValue)) : '';
}

function parseYear(value: string) {
  if (value === '') return undefined;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? Math.trunc(numberValue) : undefined;
}

function clampYear(
  value: number | undefined,
  minYear?: number,
  maxYear?: number,
) {
  if (value === undefined) return undefined;
  if (minYear !== undefined && value < minYear) return minYear;
  if (maxYear !== undefined && value > maxYear) return maxYear;

  return value;
}

function FieldInputYearRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { disabled, inputProps, maxYear, minYear, placeholder },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
  valueSyncKey,
}: FieldInputRenderProps<
  FieldInputYearExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = React.useState('');

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  const value = React.useMemo(() => formatYear(currentValue), [currentValue]);
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

  return (
    <InputBase
      ref={inputRef}
      type="text"
      inputMode="numeric"
      {...inputProps}
      placeholder={placeholder ?? inputProps?.placeholder}
      value={displayValue}
      onChange={e => {
        const nextValue = e.target.value;

        setDisplayValue(nextValue);
        handleValueChange(parseYear(nextValue) as TFieldPathValue);
      }}
      onBlur={e => {
        inputProps?.onBlur?.(e);
        const parsedValue = clampYear(
          parseYear(displayValue),
          minYear,
          maxYear,
        );

        handleValueChange(parsedValue as TFieldPathValue);
        setDisplayValue(formatYear(parsedValue));
      }}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName(inputProps?.className)}
      disabled={disabled}
      maxLength={4}
      inputPattern={/^[0-9]{0,4}$/}
    />
  );
}
